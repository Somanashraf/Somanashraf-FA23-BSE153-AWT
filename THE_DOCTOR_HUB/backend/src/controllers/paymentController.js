import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

// Helper: get file URL from multer file object (works for both Cloudinary and local disk)
const getFileUrl = (file, req) => {
  if (!file) return null;
  // Cloudinary gives file.path as the CDN URL
  if (isCloudinaryConfigured() && file.path && file.path.startsWith('http')) {
    return file.path;
  }
  // Local disk storage — build URL from server
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const relativePath = file.path?.replace(/\\/g, '/').split('uploads/')[1];
  return relativePath ? `${baseUrl}/uploads/${relativePath}` : file.path;
};

const getFilePublicId = (file) => {
  if (!file) return null;
  return file.filename || file.originalname || 'local-file';
};

// @POST /api/payments/:appointmentId/upload
export const uploadPaymentProof = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Payment screenshot is required. Please select an image or PDF file.');
    }

    const { appointmentId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'doctor', populate: { path: 'user', select: '_id firstName lastName' } });

    if (!appointment) throw new ApiError(404, 'Appointment not found');

    if (appointment.patient.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Unauthorized — this is not your appointment');
    }

    if (!['payment_pending'].includes(appointment.status)) {
      throw new ApiError(400, `Cannot upload payment. Current status: ${appointment.status}`);
    }

    // Find or create payment record
    let payment = appointment.payment
      ? await Payment.findById(appointment.payment)
      : null;

    if (!payment) {
      payment = await Payment.create({
        appointment: appointment._id,
        patient: req.user._id,
        doctor: appointment.doctor._id,
        amount: appointment.consultationFee,
        status: 'pending',
      });
      appointment.payment = payment._id;
    }

    const fileUrl = getFileUrl(req.file, req);
    const filePublicId = getFilePublicId(req.file);

    payment.screenshot = {
      url: fileUrl,
      publicId: filePublicId,
      uploadedAt: new Date(),
    };
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    payment.status = 'uploaded';
    await payment.save();

    appointment.status = 'payment_uploaded';
    await appointment.save();

    // Notify assistants
    const User = (await import('../models/User.js')).default;
    const assistants = await User.find({ role: 'assistant', isActive: true }).select('_id');

    if (assistants.length > 0) {
      await Promise.all(
        assistants.map((a) =>
          Notification.create({
            recipient: a._id,
            title: 'New Payment Uploaded',
            message: `Patient ${req.user.firstName} ${req.user.lastName} uploaded a payment screenshot`,
            type: 'payment',
            link: `/assistant/payments/${payment._id}`,
            data: { paymentId: payment._id, appointmentId },
          })
        )
      );
    }

    // Also notify admins if no assistants
    if (assistants.length === 0) {
      const admins = await User.find({ role: { $in: ['admin', 'super_admin'] }, isActive: true }).select('_id');
      await Promise.all(
        admins.map((a) =>
          Notification.create({
            recipient: a._id,
            title: 'New Payment Uploaded',
            message: `Payment screenshot uploaded for appointment`,
            type: 'payment',
            link: `/admin/payments`,
          })
        )
      );
    }

    createAuditLog({
      userId: req.user._id,
      action: 'PAYMENT_UPLOAD',
      resource: 'Payment',
      resourceId: payment._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'Payment proof uploaded successfully. Awaiting verification.', {
      payment: {
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        screenshot: payment.screenshot,
        paymentMethod: payment.paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/payments/:id/verify (Assistant+)
export const verifyPayment = async (req, res, next) => {
  try {
    const { status, verificationNote, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Status must be "verified" or "rejected"');
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: 'appointment',
      populate: [
        { path: 'patient', select: '_id firstName lastName email' },
        { path: 'doctor', populate: { path: 'user', select: '_id firstName lastName' } },
      ],
    });

    if (!payment) throw new ApiError(404, 'Payment not found');
    if (payment.status !== 'uploaded') {
      throw new ApiError(400, `Payment cannot be verified. Current status: ${payment.status}`);
    }

    if (status === 'verified') {
      payment.status = 'verified';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      payment.verificationNote = verificationNote || 'Payment verified';

      const appointment = await Appointment.findById(payment.appointment._id);
      if (appointment) {
        appointment.status = 'payment_verified';
        await appointment.save();
      }

      // Notify patient
      await Notification.create({
        recipient: payment.appointment.patient._id,
        title: '✅ Payment Verified',
        message: 'Your payment has been verified. The doctor will confirm your appointment shortly.',
        type: 'payment',
        link: `/patient/appointments/${payment.appointment._id}`,
      });

      // Notify doctor
      if (payment.appointment.doctor?.user?._id) {
        await Notification.create({
          recipient: payment.appointment.doctor.user._id,
          title: 'Payment Verified — Action Required',
          message: `Payment verified for appointment on ${new Date(payment.appointment.appointmentDate).toDateString()}. Please confirm.`,
          type: 'appointment',
          link: `/doctor/appointments/${payment.appointment._id}`,
        });
      }
    } else {
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason || 'Payment rejected by assistant';
      payment.rejectedBy = req.user._id;
      payment.rejectedAt = new Date();

      const appointment = await Appointment.findById(payment.appointment._id);
      if (appointment) {
        appointment.status = 'payment_pending';
        await appointment.save();
      }

      await Notification.create({
        recipient: payment.appointment.patient._id,
        title: '❌ Payment Rejected',
        message: `Your payment was rejected: ${rejectionReason || 'Please re-upload a clear payment screenshot'}`,
        type: 'payment',
        link: `/patient/appointments/${payment.appointment._id}`,
      });
    }

    await payment.save();

    createAuditLog({
      userId: req.user._id,
      action: `PAYMENT_${status.toUpperCase()}`,
      resource: 'Payment',
      resourceId: payment._id,
      details: { status, verificationNote, rejectionReason },
      ipAddress: req.ip,
    });

    return successResponse(res, 200, `Payment ${status} successfully`, { payment });
  } catch (error) {
    next(error);
  }
};

// @GET /api/payments
export const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const Doctor = (await import('../models/Doctor.js')).default;
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) query.doctor = doctor._id;
    }
    // admin, super_admin, assistant see all

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({ path: 'patient', select: 'firstName lastName email profilePicture' })
        .populate({ path: 'appointment', select: 'appointmentDate appointmentTime status consultationFee' })
        .populate({ path: 'verifiedBy', select: 'firstName lastName' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    return paginatedResponse(res, 200, 'Payments retrieved', payments, {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/payments/pending (Assistant+)
export const getPendingPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'uploaded' })
      .populate({ path: 'patient', select: 'firstName lastName email profilePicture phone' })
      .populate({
        path: 'appointment',
        select: 'appointmentDate appointmentTime consultationFee type status',
        populate: {
          path: 'doctor',
          populate: { path: 'user', select: 'firstName lastName' },
          select: 'user specialization',
        },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Pending payments retrieved', { payments });
  } catch (error) {
    next(error);
  }
};

// @GET /api/payments/:id
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'patient', select: 'firstName lastName email profilePicture' })
      .populate({
        path: 'appointment',
        select: 'appointmentDate appointmentTime consultationFee type status',
        populate: {
          path: 'doctor',
          populate: { path: 'user', select: 'firstName lastName' },
          select: 'user specialization',
        },
      })
      .populate({ path: 'verifiedBy', select: 'firstName lastName' })
      .populate({ path: 'rejectedBy', select: 'firstName lastName' });

    if (!payment) throw new ApiError(404, 'Payment not found');

    const isOwner = payment.patient?._id?.toString() === req.user._id.toString();
    const isAuthorized = ['assistant', 'admin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAuthorized) throw new ApiError(403, 'Access denied');

    return successResponse(res, 200, 'Payment retrieved', { payment });
  } catch (error) {
    next(error);
  }
};

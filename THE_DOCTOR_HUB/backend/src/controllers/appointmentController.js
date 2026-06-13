import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { sendEmail } from '../utils/emailService.js';

const notify = async ({ recipient, title, message, type, link, data }) => {
  try {
    await Notification.create({ recipient, title, message, type, link, data });
  } catch (e) { /* non-blocking */ }
};

// @POST /api/appointments
export const bookAppointment = async (req, res, next) => {
  try {
    const {
      doctorId, clinicId, appointmentDate, appointmentTime,
      type = 'in-person', symptoms, notes,
    } = req.body;

    if (!doctorId) throw new ApiError(400, 'Doctor ID is required');
    if (!appointmentDate) throw new ApiError(400, 'Appointment date is required');
    if (!appointmentTime) throw new ApiError(400, 'Appointment time is required');

    const doctor = await Doctor.findById(doctorId).populate('user', 'firstName lastName email _id');
    if (!doctor) throw new ApiError(404, 'Doctor not found');
    if (!doctor.isApproved) throw new ApiError(400, 'Doctor is not yet approved');
    if (!doctor.isAvailable) throw new ApiError(400, 'Doctor is not available for appointments');

    // Check for time slot conflict
    const conflicting = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $nin: ['cancelled', 'rejected', 'no_show'] },
    });
    if (conflicting) throw new ApiError(409, 'This time slot is already booked. Please choose another time.');

    const fee = type === 'online' ? doctor.consultationFeeOnline : doctor.consultationFee;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      clinic: clinicId || undefined,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      type,
      symptoms: symptoms || '',
      notes: notes || '',
      consultationFee: fee || 0,
      status: 'payment_pending',
    });

    // Create payment record
    const payment = await Payment.create({
      appointment: appointment._id,
      patient: req.user._id,
      doctor: doctorId,
      amount: fee || 0,
      status: 'pending',
    });

    appointment.payment = payment._id;
    await appointment.save();

    // Notify doctor
    await notify({
      recipient: doctor.user._id,
      title: '📅 New Appointment Request',
      message: `${req.user.firstName} ${req.user.lastName} booked an appointment for ${new Date(appointmentDate).toDateString()} at ${appointmentTime}`,
      type: 'appointment',
      link: `/doctor/appointments/${appointment._id}`,
      data: { appointmentId: appointment._id },
    });

    createAuditLog({
      userId: req.user._id,
      action: 'APPOINTMENT_BOOK',
      resource: 'Appointment',
      resourceId: appointment._id,
      ipAddress: req.ip,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName profilePicture' }, select: 'user specialization consultationFee doctorType' })
      .populate('payment', 'status amount');

    return successResponse(res, 201, 'Appointment booked successfully. Please upload payment screenshot.', {
      appointment: populated,
      paymentId: payment._id,
      nextStep: 'Upload payment screenshot to confirm your appointment.',
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/appointments
export const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, doctorId, patientId } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return paginatedResponse(res, 200, 'No doctor profile', [], { page: 1, limit: 10, total: 0, pages: 0 });
      query.doctor = doctor._id;
    } else {
      // admin, super_admin, assistant
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (status) query.status = status;
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate({ path: 'patient', select: 'firstName lastName email profilePicture phone dateOfBirth gender' })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName profilePicture phone' }, select: 'user specialization consultationFee doctorType licenseNumber' })
        .populate('clinic', 'name address contact')
        .populate('payment', 'status amount screenshot paymentMethod transactionId verifiedBy verifiedAt verificationNote rejectionReason')
        .populate('prescription', 'diagnosis medicines prescriptionDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    return paginatedResponse(res, 200, 'Appointments retrieved', appointments, {
      page: Number(page), limit: Number(limit), total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/appointments/:id
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', select: 'firstName lastName email profilePicture phone dateOfBirth gender address' })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName profilePicture phone address' }, select: 'user specialization consultationFee doctorType licenseNumber qualifications rating' })
      .populate('clinic')
      .populate('payment')
      .populate({ path: 'prescription', populate: { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } } })
      .populate('medicalHistory');

    if (!appointment) throw new ApiError(404, 'Appointment not found');

    // Access control
    const isPatient = appointment.patient?._id?.toString() === req.user._id.toString();
    const doctor = await Doctor.findById(appointment.doctor?._id);
    const isDoctor = doctor?.user?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin', 'assistant'].includes(req.user.role);

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ApiError(403, 'Access denied to this appointment');
    }

    return successResponse(res, 200, 'Appointment retrieved', { appointment });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/appointments/:id
export const updateAppointment = async (req, res, next) => {
  try {
    const { status, rejectionReason, cancellationReason, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', select: 'firstName lastName email _id' })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName email _id' } });

    if (!appointment) throw new ApiError(404, 'Appointment not found');

    const doctor = await Doctor.findById(appointment.doctor._id);
    const isDoctor = doctor?.user?.toString() === req.user._id.toString();
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    switch (status) {
      case 'cancelled':
        if (!isPatient && !isAdmin) throw new ApiError(403, 'Only patient or admin can cancel');
        if (!['pending', 'payment_pending', 'payment_uploaded'].includes(appointment.status)) {
          throw new ApiError(400, 'Cannot cancel — appointment is already confirmed or completed');
        }
        appointment.status = 'cancelled';
        appointment.cancellationReason = cancellationReason || 'Cancelled by patient';
        appointment.cancelledBy = req.user._id;
        appointment.cancelledAt = new Date();
        await notify({
          recipient: appointment.doctor.user._id,
          title: 'Appointment Cancelled',
          message: `${appointment.patient.firstName} cancelled the appointment on ${appointment.appointmentDate.toDateString()}`,
          type: 'appointment',
          link: `/doctor/appointments`,
        });
        break;

      case 'confirmed':
        if (!isDoctor && !isAdmin) throw new ApiError(403, 'Only doctor or admin can confirm');
        if (appointment.status !== 'payment_verified') {
          throw new ApiError(400, 'Payment must be verified before confirming appointment');
        }
        appointment.status = 'confirmed';
        appointment.confirmedBy = req.user._id;
        appointment.confirmedAt = new Date();
        await notify({
          recipient: appointment.patient._id,
          title: '✅ Appointment Confirmed',
          message: `Your appointment with Dr. ${appointment.doctor.user.firstName} is confirmed for ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}`,
          type: 'appointment',
          link: `/patient/appointments/${appointment._id}`,
        });
        break;

      case 'rejected':
        if (!isDoctor && !isAdmin) throw new ApiError(403, 'Only doctor or admin can reject');
        appointment.status = 'rejected';
        appointment.rejectionReason = rejectionReason || 'Appointment rejected by doctor';
        appointment.rejectedBy = req.user._id;
        appointment.rejectedAt = new Date();
        await notify({
          recipient: appointment.patient._id,
          title: '❌ Appointment Rejected',
          message: `Your appointment was rejected. Reason: ${rejectionReason || 'Not specified'}`,
          type: 'appointment',
          link: `/patient/appointments/${appointment._id}`,
        });
        break;

      case 'in_progress':
        if (!isDoctor && !isAdmin) throw new ApiError(403, 'Only doctor can start consultation');
        if (appointment.status !== 'confirmed') {
          throw new ApiError(400, 'Appointment must be confirmed before starting');
        }
        appointment.status = 'in_progress';
        break;

      case 'completed':
        if (!isDoctor && !isAdmin) throw new ApiError(403, 'Only doctor or admin can complete');
        if (!['confirmed', 'in_progress'].includes(appointment.status)) {
          throw new ApiError(400, 'Appointment must be confirmed or in progress to complete');
        }
        appointment.status = 'completed';
        appointment.completedAt = new Date();
        if (doctor) {
          await Doctor.findByIdAndUpdate(doctor._id, {
            $inc: { totalAppointments: 1, totalPatients: 1 },
          });
        }
        await notify({
          recipient: appointment.patient._id,
          title: '✅ Consultation Completed',
          message: `Your consultation with Dr. ${appointment.doctor.user.firstName} is completed. Check your prescription if available.`,
          type: 'appointment',
          link: `/patient/appointments/${appointment._id}`,
        });
        break;

      default:
        throw new ApiError(400, `Invalid status: ${status}`);
    }

    if (notes) appointment.notes = notes;
    await appointment.save();

    createAuditLog({
      userId: req.user._id,
      action: `APPOINTMENT_${status.toUpperCase()}`,
      resource: 'Appointment',
      resourceId: appointment._id,
      details: { status, rejectionReason, cancellationReason },
      ipAddress: req.ip,
    });

    return successResponse(res, 200, `Appointment ${status} successfully`, { appointment });
  } catch (error) {
    next(error);
  }
};

// @POST /api/appointments/:id/rate
export const rateAppointment = async (req, res, next) => {
  try {
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) throw new ApiError(400, 'Score must be between 1 and 5');

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, 'Appointment not found');

    if (appointment.patient.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only the patient can rate this appointment');
    }
    if (appointment.status !== 'completed') {
      throw new ApiError(400, 'Can only rate completed appointments');
    }
    if (appointment.rating?.score) {
      throw new ApiError(400, 'This appointment has already been rated');
    }

    appointment.rating = { score: Number(score), review: review || '', ratedAt: new Date() };
    await appointment.save();

    // Recalculate doctor rating
    const ratedAppointments = await Appointment.find({
      doctor: appointment.doctor,
      'rating.score': { $exists: true, $ne: null },
    }).select('rating.score');

    if (ratedAppointments.length > 0) {
      const avg = ratedAppointments.reduce((sum, a) => sum + a.rating.score, 0) / ratedAppointments.length;
      await Doctor.findByIdAndUpdate(appointment.doctor, {
        'rating.average': Math.round(avg * 10) / 10,
        'rating.count': ratedAppointments.length,
      });
    }

    return successResponse(res, 200, 'Rating submitted successfully', { appointment });
  } catch (error) {
    next(error);
  }
};

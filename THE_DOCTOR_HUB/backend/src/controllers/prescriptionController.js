import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import MedicalHistory from '../models/MedicalHistory.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { sendEmail } from '../utils/emailService.js';

// @POST /api/prescriptions
export const createPrescription = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') throw new ApiError(403, 'Only doctors can create prescriptions');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !doctor.isApproved) throw new ApiError(403, 'Doctor not approved');

    const {
      appointmentId, diagnosis, chiefComplaint, medicines, labTests,
      advice, followUpDate, followUpInstructions, notes,
    } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'patient', select: 'firstName lastName email _id' });

    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      throw new ApiError(403, 'Not your appointment');
    }
    if (!['confirmed', 'in_progress', 'completed'].includes(appointment.status)) {
      throw new ApiError(400, 'Appointment must be confirmed before creating prescription');
    }

    // Check if prescription already exists
    if (appointment.prescription) {
      throw new ApiError(400, 'Prescription already exists for this appointment');
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: doctor._id,
      diagnosis,
      chiefComplaint,
      medicines: medicines || [],
      labTests: labTests || [],
      advice,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      followUpInstructions,
      notes,
    });

    // Link prescription to appointment
    appointment.prescription = prescription._id;
    if (appointment.status === 'confirmed') appointment.status = 'completed';
    appointment.completedAt = new Date();
    await appointment.save();

    // Append to medical history
    let history = await MedicalHistory.findOne({ patient: appointment.patient._id });
    if (!history) {
      history = await MedicalHistory.create({ patient: appointment.patient._id });
    }

    // Update prescription field on the most recent record for this appointment
    const recordIndex = history.records.findIndex(
      (r) => r.appointment?.toString() === appointmentId
    );
    if (recordIndex !== -1) {
      history.records[recordIndex].prescription = prescription._id;
      history.records[recordIndex].medications = medicines || [];
      await history.save();
    }

    // Notify patient
    await Notification.create({
      recipient: appointment.patient._id,
      title: 'Prescription Ready',
      message: `Dr. ${req.user.firstName} ${req.user.lastName} has added your prescription`,
      type: 'prescription',
      link: `/patient/prescriptions/${prescription._id}`,
    });

    await sendEmail({
      to: appointment.patient.email,
      template: 'prescriptionReady',
      data: [appointment.patient.firstName, `${req.user.firstName} ${req.user.lastName}`],
    });

    createAuditLog({
      userId: req.user._id,
      action: 'PRESCRIPTION_CREATE',
      resource: 'Prescription',
      resourceId: prescription._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 201, 'Prescription created', { prescription });
  } catch (error) {
    next(error);
  }
};

// @GET /api/prescriptions
export const getPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) query.doctor = doctor._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate({ path: 'patient', select: 'firstName lastName email' })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'firstName lastName profilePicture' },
          select: 'user specialization',
        })
        .populate('appointment', 'appointmentDate appointmentTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Prescription.countDocuments(query),
    ]);

    return paginatedResponse(res, 200, 'Prescriptions retrieved', prescriptions, {
      page: Number(page), limit: Number(limit), total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'patient', select: 'firstName lastName email dateOfBirth gender' })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName profilePicture phone' },
        select: 'user specialization qualifications licenseNumber',
      })
      .populate('appointment', 'appointmentDate appointmentTime');

    if (!prescription) throw new ApiError(404, 'Prescription not found');

    // Access control
    const isPatient = prescription.patient._id.toString() === req.user._id.toString();
    const doctor = await Doctor.findById(prescription.doctor._id);
    const isDoctor = doctor?.user.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isPatient && !isDoctor && !isAdmin) throw new ApiError(403, 'Access denied');

    return successResponse(res, 200, 'Prescription retrieved', { prescription });
  } catch (error) {
    next(error);
  }
};

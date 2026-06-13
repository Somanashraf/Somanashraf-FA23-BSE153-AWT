import MedicalHistory from '../models/MedicalHistory.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLogger.js';

// @GET /api/history/:patientId or /api/history/me
export const getMedicalHistory = async (req, res, next) => {
  try {
    let patientId = req.params.patientId || req.user._id;

    // Patients can only see their own
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    }

    // Doctor can only see their patients
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      const Appointment = (await import('../models/Appointment.js')).default;
      const hasAppointment = await Appointment.findOne({
        doctor: doctor._id,
        patient: patientId,
        status: { $in: ['confirmed', 'in_progress', 'completed'] },
      });
      if (!hasAppointment) {
        throw new ApiError(403, 'You can only view history of your patients');
      }
    }

    const history = await MedicalHistory.findOne({ patient: patientId })
      .populate({ path: 'records.doctor', populate: { path: 'user', select: 'firstName lastName profilePicture' } })
      .populate({ path: 'records.prescription' })
      .populate({ path: 'patient', select: 'firstName lastName email dateOfBirth gender' });

    if (!history) throw new ApiError(404, 'Medical history not found');

    return successResponse(res, 200, 'Medical history retrieved', { history });
  } catch (error) {
    next(error);
  }
};

// @POST /api/history/:patientId/records — Doctor appends a new record
export const addMedicalRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') throw new ApiError(403, 'Only doctors can add medical records');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found');
    if (!doctor.isApproved) throw new ApiError(403, 'Doctor account not approved');

    const { patientId } = req.params;
    const {
      appointmentId, chiefComplaint, diagnosis, symptoms, physicalExamination,
      vitalSigns, labResults, treatmentGiven, treatmentNotes, medications,
      followUpRequired, followUpDate, additionalNotes,
    } = req.body;

    let history = await MedicalHistory.findOne({ patient: patientId });
    if (!history) {
      history = await MedicalHistory.create({ patient: patientId });
    }

    const newRecord = {
      appointment: appointmentId,
      doctor: doctor._id,
      recordDate: new Date(),
      chiefComplaint,
      diagnosis,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      physicalExamination,
      vitalSigns,
      labResults,
      treatmentGiven,
      treatmentNotes,
      medications: medications || [],
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      additionalNotes,
    };

    // Handle uploaded documents
    if (req.files && req.files.length > 0) {
      newRecord.documents = req.files.map((f) => ({
        name: f.originalname,
        url: f.path,
        publicId: f.filename,
      }));
    }

    history.records.push(newRecord);
    history.totalVisits = (history.totalVisits || 0) + 1;
    history.lastVisit = new Date();
    await history.save();

    // Notify patient
    await Notification.create({
      recipient: patientId,
      title: 'Medical Record Added',
      message: `Dr. ${req.user.firstName} ${req.user.lastName} has added a new medical record`,
      type: 'prescription',
      link: `/patient/medical-history`,
    });

    createAuditLog({
      userId: req.user._id,
      action: 'MEDICAL_RECORD_ADD',
      resource: 'MedicalHistory',
      resourceId: history._id,
      details: { patientId, appointmentId },
      ipAddress: req.ip,
    });

    return successResponse(res, 201, 'Medical record added', {
      record: history.records[history.records.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/history/:patientId/profile — Update base profile info (allergies, blood group etc)
export const updateHistoryProfile = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Only patient themselves or doctor with appointment
    let authorized = false;
    if (req.user.role === 'patient' && req.user._id.toString() === patientId) {
      authorized = true;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      const Appointment = (await import('../models/Appointment.js')).default;
      const appt = await Appointment.findOne({
        doctor: doctor._id, patient: patientId,
        status: { $in: ['confirmed', 'in_progress', 'completed'] },
      });
      if (appt) authorized = true;
    } else if (['admin', 'super_admin'].includes(req.user.role)) {
      authorized = true;
    }

    if (!authorized) throw new ApiError(403, 'Access denied');

    const { bloodGroup, allergies, chronicConditions, currentMedications, pastSurgeries, familyHistory } = req.body;

    const history = await MedicalHistory.findOneAndUpdate(
      { patient: patientId },
      { $set: { bloodGroup, allergies, chronicConditions, currentMedications, pastSurgeries, familyHistory } },
      { new: true, upsert: true }
    );

    return successResponse(res, 200, 'Medical profile updated', { history });
  } catch (error) {
    next(error);
  }
};

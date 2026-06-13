import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';

// @POST /api/clinics
export const createClinic = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found');

    const { name, address, contact, workingDays, openingTime, closingTime, mapLocation, description } = req.body;

    const clinic = await Clinic.create({
      doctor: doctor._id,
      name, address, contact, workingDays, openingTime, closingTime, mapLocation, description,
    });

    // Add clinic to doctor's clinics array
    await Doctor.findByIdAndUpdate(doctor._id, { $push: { clinics: clinic._id } });

    return successResponse(res, 201, 'Clinic created', { clinic });
  } catch (error) {
    next(error);
  }
};

// @GET /api/clinics/my-clinics
export const getMyClinics = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found');

    const clinics = await Clinic.find({ doctor: doctor._id });
    return successResponse(res, 200, 'Clinics retrieved', { clinics });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/clinics/:id
export const updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) throw new ApiError(404, 'Clinic not found');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || clinic.doctor.toString() !== doctor._id.toString()) {
      if (!['admin', 'super_admin'].includes(req.user.role)) {
        throw new ApiError(403, 'Unauthorized to update this clinic');
      }
    }

    const allowed = ['name', 'address', 'contact', 'workingDays', 'openingTime', 'closingTime', 'mapLocation', 'isActive', 'description'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) clinic[field] = req.body[field];
    });

    await clinic.save();
    return successResponse(res, 200, 'Clinic updated', { clinic });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/clinics/:id
export const deleteClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) throw new ApiError(404, 'Clinic not found');

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || clinic.doctor.toString() !== doctor._id.toString()) {
      if (!['admin', 'super_admin'].includes(req.user.role)) {
        throw new ApiError(403, 'Unauthorized');
      }
    }

    clinic.isActive = false;
    await clinic.save();

    return successResponse(res, 200, 'Clinic deactivated');
  } catch (error) {
    next(error);
  }
};

// @GET /api/clinics/:id
export const getClinicById = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName profilePicture' } });

    if (!clinic) throw new ApiError(404, 'Clinic not found');
    return successResponse(res, 200, 'Clinic retrieved', { clinic });
  } catch (error) {
    next(error);
  }
};

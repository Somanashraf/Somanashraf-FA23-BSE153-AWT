import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import { successResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLogger.js';

// @GET /api/doctors — public search with filters
export const getDoctors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      specialization,
      disease,
      treatmentType,
      doctorType,
      city,
      minFee,
      maxFee,
      minExperience,
      minRating,
      availability,
      search,
      sortBy = 'rating',
      order = 'desc',
    } = req.query;

    const doctorQuery = { isApproved: true, isAvailable: true };
    const userQuery = {};

    if (specialization) doctorQuery.specialization = new RegExp(specialization, 'i');
    if (disease) doctorQuery.diseases = new RegExp(disease, 'i');
    if (treatmentType) doctorQuery.treatmentTypes = new RegExp(treatmentType, 'i');
    if (doctorType) doctorQuery.doctorType = doctorType;
    if (minFee || maxFee) {
      doctorQuery.consultationFee = {};
      if (minFee) doctorQuery.consultationFee.$gte = Number(minFee);
      if (maxFee) doctorQuery.consultationFee.$lte = Number(maxFee);
    }
    if (minExperience) doctorQuery.experience = { $gte: Number(minExperience) };
    if (minRating) doctorQuery['rating.average'] = { $gte: Number(minRating) };

    const sortMap = {
      rating: { 'rating.average': -1 },
      fee: { consultationFee: order === 'asc' ? 1 : -1 },
      experience: { experience: -1 },
      patients: { totalPatients: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.rating;

    const skip = (Number(page) - 1) * Number(limit);

    // If city or name search, find users first
    let userIds;
    if (city || search) {
      if (city) userQuery['address.city'] = new RegExp(city, 'i');
      if (search) {
        userQuery.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
        ];
      }
      const users = await User.find({ ...userQuery, role: 'doctor' }).select('_id');
      doctorQuery.user = { $in: users.map((u) => u._id) };
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(doctorQuery)
        .populate({
          path: 'user',
          select: 'firstName lastName email profilePicture address phone',
        })
        .populate('clinics', 'name address workingDays openingTime closingTime')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Doctor.countDocuments(doctorQuery),
    ]);

    return paginatedResponse(res, 200, 'Doctors retrieved', doctors, {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email profilePicture address phone gender')
      .populate('clinics');

    if (!doctor) throw new ApiError(404, 'Doctor not found');

    return successResponse(res, 200, 'Doctor retrieved', { doctor });
  } catch (error) {
    next(error);
  }
};

// @POST /api/doctors — register doctor profile
export const createDoctorProfile = async (req, res, next) => {
  try {
    const existing = await Doctor.findOne({ user: req.user._id });
    if (existing) throw new ApiError(400, 'Doctor profile already exists');

    const {
      licenseNumber, specialization, qualifications, experience,
      doctorType, treatmentTypes, diseases, consultationFee,
      consultationFeeOnline, about, languages, availability,
    } = req.body;

    const doctor = await Doctor.create({
      user: req.user._id,
      licenseNumber,
      specialization: Array.isArray(specialization) ? specialization : [specialization],
      qualifications: qualifications || [],
      experience: Number(experience) || 0,
      doctorType,
      treatmentTypes: Array.isArray(treatmentTypes) ? treatmentTypes : [treatmentTypes],
      diseases: Array.isArray(diseases) ? diseases : [diseases],
      consultationFee: Number(consultationFee) || 0,
      consultationFeeOnline: Number(consultationFeeOnline) || 0,
      about,
      languages: languages || [],
      availability,
    });

    return successResponse(res, 201, 'Doctor profile created. Pending admin approval.', { doctor });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/doctors/:id
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    // Only the doctor themselves or admin can update
    if (
      doctor.user.toString() !== req.user._id.toString() &&
      !['admin', 'super_admin'].includes(req.user.role)
    ) {
      throw new ApiError(403, 'Unauthorized to update this profile');
    }

    const allowedUpdates = [
      'specialization', 'qualifications', 'experience', 'treatmentTypes',
      'diseases', 'consultationFee', 'consultationFeeOnline', 'about',
      'languages', 'availability', 'isAvailable',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    return successResponse(res, 200, 'Doctor profile updated', { doctor });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/doctors/:id/approve (Admin+)
export const approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    doctor.isApproved = true;
    doctor.approvedBy = req.user._id;
    doctor.approvedAt = new Date();
    await doctor.save();

    createAuditLog({
      userId: req.user._id,
      action: 'DOCTOR_APPROVE',
      resource: 'Doctor',
      resourceId: doctor._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'Doctor approved');
  } catch (error) {
    next(error);
  }
};

// @GET /api/doctors/my-profile (for logged-in doctor)
export const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('clinics')
      .populate('user', 'firstName lastName email profilePicture phone address');

    if (!doctor) throw new ApiError(404, 'Doctor profile not found');

    return successResponse(res, 200, 'Doctor profile retrieved', { doctor });
  } catch (error) {
    next(error);
  }
};

// @GET /api/doctors/pending (Admin+)
export const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isApproved: false })
      .populate('user', 'firstName lastName email profilePicture createdAt')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Pending doctors retrieved', { doctors });
  } catch (error) {
    next(error);
  }
};

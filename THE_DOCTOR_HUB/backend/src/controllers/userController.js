import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { successResponse, errorResponse, ApiError, paginatedResponse } from '../utils/apiResponse.js';
import { cloudinary } from '../config/cloudinary.js';
import { createAuditLog } from '../middleware/auditLogger.js';

// @GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = { user };

    if (user.role === 'doctor') {
      profile.doctor = await Doctor.findOne({ user: user._id }).populate('clinics');
    }

    return successResponse(res, 200, 'Profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'gender', 'dateOfBirth',
      'address', 'preferences',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};

// @POST /api/users/profile-picture
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No image file provided');

    const user = await User.findById(req.user._id);

    // Delete old image from cloudinary if configured
    if (user.profilePicture?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      } catch { /* ignore cloudinary cleanup errors */ }
    }

    // Handle both Cloudinary and local storage
    const isCloud = req.file.path && req.file.path.startsWith('http');
    const fileUrl = isCloud
      ? req.file.path
      : `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/profiles/${req.file.filename}`;

    user.profilePicture = {
      url: fileUrl,
      publicId: req.file.filename || req.file.public_id || 'local',
    };
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Profile picture updated', {
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      isActive,
      isSuspended,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    return paginatedResponse(res, 200, 'Users retrieved', users, {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/:id/suspend (Admin+)
export const suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'super_admin') throw new ApiError(403, 'Cannot suspend super admin');

    user.isSuspended = true;
    user.suspensionReason = reason || 'Suspended by admin';
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    createAuditLog({
      userId: req.user._id,
      action: 'USER_SUSPEND',
      resource: 'User',
      resourceId: user._id,
      details: { reason },
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'User suspended');
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/:id/activate (Admin+)
export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.isSuspended = false;
    user.suspensionReason = undefined;
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    createAuditLog({
      userId: req.user._id,
      action: 'USER_ACTIVATE',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'User activated');
  } catch (error) {
    next(error);
  }
};

// @GET /api/users/:id (Admin+)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    let extra = {};
    if (user.role === 'doctor') {
      extra.doctor = await Doctor.findOne({ user: user._id }).populate('clinics');
    }

    return successResponse(res, 200, 'User retrieved', { user, ...extra });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/users/:id (Super Admin only — soft delete)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'super_admin') throw new ApiError(403, 'Cannot delete super admin');

    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save({ validateBeforeSave: false });

    createAuditLog({
      userId: req.user._id,
      action: 'USER_DELETE',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'User account deactivated');
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/:id/role (Super Admin only)
export const assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['patient', 'doctor', 'assistant', 'admin'];
    if (!validRoles.includes(role)) throw new ApiError(400, 'Invalid role');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) throw new ApiError(404, 'User not found');

    createAuditLog({
      userId: req.user._id,
      action: 'ROLE_ASSIGN',
      resource: 'User',
      resourceId: user._id,
      details: { newRole: role },
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'Role updated', { user });
  } catch (error) {
    next(error);
  }
};

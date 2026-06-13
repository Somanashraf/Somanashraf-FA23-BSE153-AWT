import crypto from 'crypto';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import MedicalHistory from '../models/MedicalHistory.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateEmailToken,
  generatePasswordResetToken,
} from '../utils/jwtHelper.js';
import { successResponse, errorResponse, ApiError } from '../utils/apiResponse.js';
import { sendEmail } from '../utils/emailService.js';
import { createAuditLog } from '../middleware/auditLogger.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role, gender, dateOfBirth } = req.body;

    const allowedRoles = ['patient', 'doctor', 'assistant'];
    const userRole = allowedRoles.includes(role) ? role : 'patient';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role: userRole,
      gender,
      dateOfBirth,
    });

    // If patient, create empty medical history
    if (userRole === 'patient') {
      await MedicalHistory.create({ patient: user._id });
    }

    // Generate email verification token
    const verificationToken = generateEmailToken({ id: user._id, purpose: 'email-verify' });
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      template: 'verification',
      data: [user.firstName, verifyUrl],
    });

    createAuditLog({
      userId: user._id,
      action: 'USER_REGISTER',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, 201, 'Registration successful. Please verify your email.', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +refreshToken +loginAttempts +lockUntil'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.isLocked()) {
      throw new ApiError(
        423,
        'Account temporarily locked due to too many failed attempts. Try again in 2 hours.'
      );
    }

    if (user.isSuspended) {
      throw new ApiError(403, `Account suspended: ${user.suspensionReason || 'Contact support'}`);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'Invalid email or password');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    const tokenPayload = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    createAuditLog({
      userId: user._id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
    };

    return successResponse(res, 200, 'Login successful', {
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/refresh-token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw new ApiError(401, 'Refresh token required');
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokenPayload = { id: user._id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    return successResponse(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @GET /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) throw new ApiError(400, 'Verification token required');

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('+emailVerificationToken +emailVerificationExpires');
    if (!user) throw new ApiError(404, 'User not found');

    if (user.isEmailVerified) {
      return successResponse(res, 200, 'Email already verified');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/resend-verification
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) throw new ApiError(404, 'User not found');
    if (user.isEmailVerified) {
      return successResponse(res, 200, 'Email already verified');
    }

    const verificationToken = generateEmailToken({ id: user._id, purpose: 'email-verify' });
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({ to: user.email, template: 'verification', data: [user.firstName, verifyUrl] });

    return successResponse(res, 200, 'Verification email sent');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(res, 200, 'If this email exists, a reset link has been sent.');
    }

    const resetToken = generatePasswordResetToken({ id: user._id, purpose: 'password-reset' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({ to: user.email, template: 'passwordReset', data: [user.firstName, resetUrl] });

    return successResponse(res, 200, 'If this email exists, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw new ApiError(400, 'Token and new password required');

    const decoded = verifyAccessToken(token);

    if (decoded.purpose !== 'password-reset') {
      throw new ApiError(400, 'Invalid reset token');
    }

    const user = await User.findById(decoded.id).select('+passwordResetToken +passwordResetExpires');
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
      throw new ApiError(400, 'Password reset token has expired');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    createAuditLog({
      userId: user._id,
      action: 'PASSWORD_RESET',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'Password reset successfully. Please login.');
  } catch (error) {
    next(error);
  }
};

// @GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    let extraData = {};
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id }).populate('clinics');
      extraData.doctorProfile = doctor;
    }

    return successResponse(res, 200, 'User retrieved', { user, ...extraData });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new ApiError(400, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    createAuditLog({
      userId: user._id,
      action: 'PASSWORD_CHANGE',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.ip,
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

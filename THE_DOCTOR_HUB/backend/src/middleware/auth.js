import { verifyAccessToken } from '../utils/jwtHelper.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Authenticate: verify JWT and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please login.');
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select(
      '-password -passwordResetToken -emailVerificationToken -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated');
    }

    if (user.isSuspended) {
      throw new ApiError(403, `Account suspended: ${user.suspensionReason || 'Contact support'}`);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize: check role permissions
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required roles: ${roles.join(', ')}`
        )
      );
    }
    next();
  };
};

/**
 * Optional authentication: attach user if token exists, but don't fail
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive && !user.isSuspended) {
        req.user = user;
      }
    }
    next();
  } catch {
    next(); // Ignore auth errors for optional auth
  }
};

/**
 * Require email verification
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new ApiError(403, 'Please verify your email to access this resource'));
  }
  next();
};

/**
 * Doctor approval check
 */
export const requireApprovedDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') return next();
    const Doctor = (await import('../models/Doctor.js')).default;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !doctor.isApproved) {
      return next(new ApiError(403, 'Doctor account pending approval'));
    }
    req.doctor = doctor;
    next();
  } catch (error) {
    next(error);
  }
};

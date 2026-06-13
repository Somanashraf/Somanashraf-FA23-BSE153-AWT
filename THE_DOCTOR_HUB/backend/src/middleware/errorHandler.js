import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
  } else {
    logger.warn(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(404, 'Resource not found');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field] || '';
    error = new ApiError(400, `${field} '${value}' already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join('. '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(400, 'File size too large');
    } else {
      error = new ApiError(400, err.message);
    }
  }

  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  };

  if (error.errors) response.errors = error.errors;
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;

  return res.status(error.statusCode).json(response);
};

export default errorHandler;

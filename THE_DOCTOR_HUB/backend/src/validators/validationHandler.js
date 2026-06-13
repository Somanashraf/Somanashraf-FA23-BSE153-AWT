import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiResponse.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages[0], errors.array()));
  }
  next();
};

const { validationResult } = require('express-validator');
const { AppException } = require('../exceptions');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppException('Validation failed', 422, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = validate;

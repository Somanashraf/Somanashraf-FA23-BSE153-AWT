class AppException extends Error {
  constructor(message, statusCode = 500, code = 'APP_EXCEPTION') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidAccountException extends AppException {
  constructor(message = 'Invalid account credentials or inactive account') {
    super(message, 401, 'INVALID_ACCOUNT');
  }
}

class AppointmentNotFoundException extends AppException {
  constructor(message = 'Appointment not found') {
    super(message, 404, 'APPOINTMENT_NOT_FOUND');
  }
}

class PaymentVerificationException extends AppException {
  constructor(message = 'Payment could not be verified') {
    super(message, 422, 'PAYMENT_VERIFICATION_FAILED');
  }
}

class UnauthorizedAccessException extends AppException {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 403, 'UNAUTHORIZED_ACCESS');
  }
}

class PrescriptionLockedException extends AppException {
  constructor(message = 'Previous prescriptions are locked and cannot be edited') {
    super(message, 409, 'PRESCRIPTION_LOCKED');
  }
}

module.exports = {
  AppException,
  InvalidAccountException,
  AppointmentNotFoundException,
  PaymentVerificationException,
  UnauthorizedAccessException,
  PrescriptionLockedException
};

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedAccessException } = require('../exceptions');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new UnauthorizedAccessException('Authentication token is required');
  try {
    req.user = jwt.verify(token, config.jwt.accessSecret);
    next();
  } catch (error) {
    throw new UnauthorizedAccessException('Session expired or invalid token');
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new UnauthorizedAccessException();
    }
    next();
  };
}

module.exports = { authenticate, authorize };

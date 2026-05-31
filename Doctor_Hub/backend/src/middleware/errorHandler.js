const logger = require('../utils/logger');

function errorHandler(error, req, res, next) {
  logger.error({ message: error.message, code: error.code, stack: error.stack, path: req.originalUrl });
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: status === 500 ? 'Something went wrong on Doctor Hub' : error.message
    }
  });
}

module.exports = errorHandler;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

function security(app) {
  app.use(helmet());
  app.use(compression());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 250, standardHeaders: true, legacyHeaders: false }));
}

module.exports = security;

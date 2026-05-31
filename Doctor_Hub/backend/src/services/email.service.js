const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transport = config.email.host ? nodemailer.createTransport({ host: config.email.host, port: config.email.port, auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined }) : null;
  }

  async send(to, subject, html) {
    if (!this.transport) {
      logger.info({ message: 'Email skipped; SMTP not configured', to, subject });
      return { skipped: true };
    }
    return this.transport.sendMail({ from: config.email.from, to, subject, html });
  }
}

module.exports = new EmailService();

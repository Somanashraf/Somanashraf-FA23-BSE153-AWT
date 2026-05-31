const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const security = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRoutes = require('./routes/medical.routes');
const adminRoutes = require('./routes/admin.routes');

function createApp(io) {
  const app = express();
  app.set('io', io || { emit: () => {}, to: () => ({ emit: () => {} }) });
  security(app);
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use('/uploads', express.static(path.resolve(config.uploadDir)));

  app.get('/api/health', (req, res) => res.json({ success: true, service: 'Doctor Hub API', timestamp: new Date().toISOString() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/medical', medicalRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;

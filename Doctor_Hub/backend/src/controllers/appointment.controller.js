const { body } = require('express-validator');
const appointmentService = require('../services/appointment.service');
const asyncHandler = require('../middleware/asyncHandler');

exports.bookValidation = [body('patientId').isInt(), body('doctorId').isInt(), body('clinicId').isInt(), body('scheduleId').isInt(), body('date').isISO8601(), body('time').matches(/^\d{2}:\d{2}/), body('reason').isLength({ min: 4 })];

exports.book = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.book(req.body);
  req.app.get('io').to(`doctor:${appointment.doctor_id}`).emit('appointment:new', appointment);
  res.status(201).json({ success: true, data: appointment });
});

exports.list = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.list(req.user);
  res.json({ success: true, data: appointments });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateStatus(req.params.id, req.body.status, req.user.id);
  req.app.get('io').emit('appointment:updated', appointment);
  res.json({ success: true, data: appointment });
});

exports.uploadPayment = asyncHandler(async (req, res) => {
  const result = await appointmentService.uploadPayment(req.params.id, req.file, req.body.amount);
  req.app.get('io').emit('payment:uploaded', result);
  res.status(201).json({ success: true, data: result });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const result = await appointmentService.verifyPayment(req.params.paymentId, req.body.status, req.user.id, req.body.remarks);
  req.app.get('io').emit('payment:verified', result);
  res.json({ success: true, data: result });
});

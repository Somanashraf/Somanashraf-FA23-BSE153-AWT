const { body } = require('express-validator');
const medicalService = require('../services/medical.service');
const pdfService = require('../services/prescriptionPdf.service');
const asyncHandler = require('../middleware/asyncHandler');

exports.prescriptionValidation = [body('appointmentId').isInt(), body('patientId').isInt(), body('diagnosis').isLength({ min: 3 }), body('items').isArray({ min: 1 })];

exports.history = asyncHandler(async (req, res) => {
  const history = await medicalService.historyForPatient(req.params.patientId);
  res.json({ success: true, data: history });
});

exports.uploadLabReport = asyncHandler(async (req, res) => {
  const history = await medicalService.appendLabReport(req.params.patientId, req.file, req.body.title || 'Lab Report');
  res.status(201).json({ success: true, data: history });
});

exports.createPrescription = asyncHandler(async (req, res) => {
  const result = await medicalService.createPrescription(req.user, req.body);
  req.app.get('io').emit('prescription:created', result);
  res.status(201).json({ success: true, data: result });
});

exports.prescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await medicalService.prescriptions(req.params.patientId);
  res.json({ success: true, data: prescriptions });
});

exports.downloadPrescription = asyncHandler(async (req, res) => {
  await pdfService.streamPrescription(req.params.prescriptionId, res);
});

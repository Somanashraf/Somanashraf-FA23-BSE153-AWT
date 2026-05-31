const { Router } = require('express');
const controller = require('../controllers/medical.controller');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();
router.get('/patients/:patientId/history', authenticate, controller.history);
router.post('/patients/:patientId/lab-reports', authenticate, authorize('PATIENT'), upload.single('report'), controller.uploadLabReport);
router.get('/patients/:patientId/prescriptions', authenticate, controller.prescriptions);
router.post('/prescriptions', authenticate, authorize('DOCTOR'), controller.prescriptionValidation, validate, controller.createPrescription);
router.get('/prescriptions/:prescriptionId/download', authenticate, controller.downloadPrescription);
module.exports = router;

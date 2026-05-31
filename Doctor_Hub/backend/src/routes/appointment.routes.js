const { Router } = require('express');
const controller = require('../controllers/appointment.controller');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();
router.get('/', authenticate, controller.list);
router.post('/', authenticate, authorize('PATIENT', 'ADMIN', 'SUPER_ADMIN'), controller.bookValidation, validate, controller.book);
router.patch('/:id/status', authenticate, authorize('DOCTOR', 'ASSISTANT', 'ADMIN', 'SUPER_ADMIN'), controller.updateStatus);
router.post('/:id/payment', authenticate, authorize('PATIENT'), upload.single('screenshot'), controller.uploadPayment);
router.patch('/payments/:paymentId/verify', authenticate, authorize('ASSISTANT', 'ADMIN', 'SUPER_ADMIN'), controller.verifyPayment);
module.exports = router;

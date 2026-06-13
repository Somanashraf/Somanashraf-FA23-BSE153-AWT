import express from 'express';
import {
  uploadPaymentProof, verifyPayment, getPayments, getPendingPayments, getPaymentById,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadPayment } from '../config/cloudinary.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPayments);
router.get('/pending', authorize('assistant', 'admin', 'super_admin'), getPendingPayments);
router.get('/:id', getPaymentById);
router.post('/:appointmentId/upload', authorize('patient'), uploadLimiter, uploadPayment.single('screenshot'), uploadPaymentProof);
router.put('/:id/verify', authorize('assistant', 'admin', 'super_admin'), verifyPayment);

export default router;

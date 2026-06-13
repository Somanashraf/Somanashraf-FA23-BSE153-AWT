import express from 'express';
import {
  createPrescription, getPrescriptions, getPrescriptionById,
} from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('doctor'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);

export default router;

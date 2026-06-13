import express from 'express';
import {
  createClinic, getMyClinics, updateClinic, deleteClinic, getClinicById,
} from '../controllers/clinicController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('doctor'), createClinic);
router.get('/my-clinics', authorize('doctor'), getMyClinics);
router.get('/:id', getClinicById);
router.put('/:id', authorize('doctor', 'admin', 'super_admin'), updateClinic);
router.delete('/:id', authorize('doctor', 'admin', 'super_admin'), deleteClinic);

export default router;

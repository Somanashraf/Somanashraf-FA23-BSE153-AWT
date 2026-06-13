import express from 'express';
import {
  getMedicalHistory, addMedicalRecord, updateHistoryProfile,
} from '../controllers/medicalHistoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadMedicalDoc } from '../config/cloudinary.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', (req, res, next) => {
  req.params.patientId = req.user._id;
  getMedicalHistory(req, res, next);
});
router.get('/:patientId', getMedicalHistory);
router.post('/:patientId/records', authorize('doctor'), uploadMedicalDoc.array('documents', 5), addMedicalRecord);
router.put('/:patientId/profile', updateHistoryProfile);

export default router;

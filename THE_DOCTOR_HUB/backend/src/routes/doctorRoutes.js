import express from 'express';
import {
  getDoctors, getDoctorById, createDoctorProfile, updateDoctorProfile,
  approveDoctor, getMyDoctorProfile, getPendingDoctors,
} from '../controllers/doctorController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getDoctors);
router.get('/pending', authenticate, authorize('admin', 'super_admin'), getPendingDoctors);
router.get('/my-profile', authenticate, authorize('doctor'), getMyDoctorProfile);
router.get('/:id', optionalAuth, getDoctorById);

// Protected routes
router.post('/', authenticate, authorize('doctor'), createDoctorProfile);
router.put('/my-profile', authenticate, authorize('doctor'), async (req, res, next) => {
  try {
    const Doctor = (await import('../models/Doctor.js')).default;
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      const { ApiError } = await import('../utils/apiResponse.js');
      throw new ApiError(404, 'Doctor profile not found');
    }
    req.params.id = doctor._id.toString();
    const { updateDoctorProfile } = await import('../controllers/doctorController.js');
    return updateDoctorProfile(req, res, next);
  } catch (e) {
    next(e);
  }
});
router.put('/:id', authenticate, authorize('doctor', 'admin', 'super_admin'), updateDoctorProfile);
router.put('/:id/approve', authenticate, authorize('admin', 'super_admin'), approveDoctor);

export default router;

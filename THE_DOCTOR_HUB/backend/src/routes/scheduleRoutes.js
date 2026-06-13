import express from 'express';
import { updateAvailability, getAvailableSlots, getDoctorCalendar } from '../controllers/scheduleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots/:doctorId', getAvailableSlots);
router.get('/calendar/:doctorId', authenticate, getDoctorCalendar);
router.put('/availability', authenticate, authorize('doctor'), updateAvailability);

export default router;

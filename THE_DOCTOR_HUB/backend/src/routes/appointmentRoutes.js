import express from 'express';
import {
  bookAppointment, getAppointments, getAppointmentById,
  updateAppointment, rateAppointment,
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('patient'), bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.post('/:id/rate', authorize('patient'), rateAppointment);

export default router;

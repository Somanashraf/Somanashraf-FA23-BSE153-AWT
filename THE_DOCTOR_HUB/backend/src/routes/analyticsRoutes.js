import express from 'express';
import {
  getOverview, getAppointmentsTrend, getRevenueTrend, getUserGrowth,
  getDoctorStats, getAuditLogs,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', authorize('admin', 'super_admin'), getOverview);
router.get('/appointments-trend', authorize('admin', 'super_admin'), getAppointmentsTrend);
router.get('/revenue-trend', authorize('admin', 'super_admin'), getRevenueTrend);
router.get('/user-growth', authorize('admin', 'super_admin'), getUserGrowth);
router.get('/doctor-stats', authorize('doctor'), getDoctorStats);
router.get('/audit-logs', authorize('super_admin'), getAuditLogs);

export default router;

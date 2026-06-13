import express from 'express';
import {
  getNotifications, markNotificationRead, markAllRead, deleteNotification,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;

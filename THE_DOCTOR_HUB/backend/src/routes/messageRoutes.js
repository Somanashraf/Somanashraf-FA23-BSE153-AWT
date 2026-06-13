import express from 'express';
import {
  sendMessage, getConversation, getConversations, markAsRead,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { messageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/:userId', getConversation);
router.post('/', messageLimiter, sendMessage);
router.put('/:messageId/read', markAsRead);

export default router;

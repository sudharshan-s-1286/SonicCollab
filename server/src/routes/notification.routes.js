import express from 'express';
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  getUnreadNotificationCount
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadNotificationCount);
router.put('/read-all', protect, readAllNotifications);
router.put('/:id/read', protect, readNotification);

export default router;

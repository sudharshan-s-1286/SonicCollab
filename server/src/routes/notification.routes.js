import express from 'express';
import {
  getNotifications,
  readNotification,
  readAllNotifications
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, readAllNotifications);
router.put('/:id/read', protect, readNotification);

export default router;

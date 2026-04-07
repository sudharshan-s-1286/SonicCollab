import express from 'express';
import {
  getUserProfile,
  updateProfile,
  toggleFollow
} from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .put(protect, updateProfile);

router.route('/:id')
  .get(getUserProfile);

router.route('/:id/follow')
  .post(protect, toggleFollow)
  .delete(protect, toggleFollow); // Both POST and DELETE to toggle

export default router;

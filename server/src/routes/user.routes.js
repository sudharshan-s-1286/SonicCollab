import express from 'express';
import {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getLikedProjects,
  getBookmarkedProjects
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

router.route('/me/liked-projects').get(protect, getLikedProjects);
router.route('/me/bookmarked-projects').get(protect, getBookmarkedProjects);

export default router;

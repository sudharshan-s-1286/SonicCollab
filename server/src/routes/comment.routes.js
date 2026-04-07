import express from 'express';
import {
  addComment,
  getCommentsByProject,
  replyToComment
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:id/comments')
  .get(protect, getCommentsByProject)
  .post(protect, addComment);

router.post('/:id/reply', protect, replyToComment);

export default router;

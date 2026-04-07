import express from 'express';
import {
  deleteTrack,
  updateTrack,
  downloadTrack
} from '../controllers/track.controller.js';
import { protect } from '../middleware/authMiddleware.js';

// Note: Upload track is in project routes because it needs project context
const router = express.Router();

router.delete('/:trackId', protect, deleteTrack);
router.put('/:trackId', protect, updateTrack);
router.get('/:id/download', protect, downloadTrack);

export default router;

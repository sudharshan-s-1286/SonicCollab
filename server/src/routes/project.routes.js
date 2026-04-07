import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLikeProject,
  downloadProjectZip
} from '../controllers/project.controller.js';
import { uploadTrack } from '../controllers/track.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkProjectRole } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/like', protect, toggleLikeProject);
router.get('/:id/download/zip', protect, downloadProjectZip);

// Track upload route is nested under project for context
router.post('/:projectId/tracks', protect, checkProjectRole(['owner', 'collaborator']), upload.single('audio'), uploadTrack);

export default router;

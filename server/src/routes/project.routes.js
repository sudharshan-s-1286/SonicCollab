import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleLikeProject,
  downloadProjectZip,
  toggleBookmarkProject
} from '../controllers/project.controller.js';
import { uploadTrack } from '../controllers/track.controller.js';
import {
  getProjectVersions,
  createProjectVersion
} from '../controllers/version.controller.js';
import {
  sendProjectInvite,
  acceptProjectInvite,
  declineProjectInvite
} from '../controllers/invitation.controller.js';
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
router.post('/:id/bookmark', protect, toggleBookmarkProject);
router.get('/:id/download/zip', protect, downloadProjectZip);

// Track upload route is nested under project for context
router.post('/:projectId/tracks', protect, checkProjectRole(['owner', 'collaborator']), upload.single('audio'), uploadTrack);

// Versioning
router.route('/:id/versions')
  .get(protect, checkProjectRole(['owner', 'collaborator', 'viewer']), getProjectVersions)
  .post(protect, checkProjectRole(['owner', 'collaborator']), createProjectVersion);

// Invite system (no email integration; token link is returned by API)
router.post('/:id/invite', protect, checkProjectRole(['owner']), sendProjectInvite);
router.put('/:id/invite/:token/accept', protect, acceptProjectInvite);
router.put('/:id/invite/:token/decline', protect, declineProjectInvite);

export default router;

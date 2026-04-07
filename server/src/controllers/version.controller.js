import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

export const getProjectVersions = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate({
      path: 'versions.tracks',
      model: 'Track',
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // `checkProjectRole` already enforces access; for safety if middleware isn't attached:
    // treat missing req.user as unauthenticated.
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    return res.json({ success: true, data: project.versions || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProjectVersion = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only allow mutation if middleware allowed it; still double-check.
    const isOwner = project.owner.toString() === req.user._id.toString();
    const collaborator = project.collaborators.find(
      (c) => c.user && c.user.toString() === req.user._id.toString()
    );
    const role = isOwner ? 'owner' : collaborator?.role;
    if (!['owner', 'collaborator'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const currentVersionEntry = project.versions.find(
      (v) => v.versionNumber === project.currentVersion
    );

    const copiedTracks = currentVersionEntry?.tracks ? [...currentVersionEntry.tracks] : [];
    const nextVersionNumber = (project.currentVersion || 0) + 1;

    const label =
      typeof req.body.label === 'string' && req.body.label.trim()
        ? req.body.label.trim()
        : `v${nextVersionNumber} - New version`;

    project.versions.push({
      versionNumber: nextVersionNumber,
      label,
      tracks: copiedTracks,
      createdBy: req.user._id,
    });
    project.currentVersion = nextVersionNumber;

    await project.save();

    // Notifications (pull-based UI; no sockets for now)
    if (project.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: project.owner,
        sender: req.user._id,
        type: 'new_version',
        project: projectId,
        message: `${req.user.username} created a new version for your project: "${project.title}".`,
      });
    }

    return res.status(201).json({
      success: true,
      data: project.versions.find((v) => v.versionNumber === nextVersionNumber),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


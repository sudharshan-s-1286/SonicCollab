import Project from '../models/Project.js';

// Middleware to check if user has required role on a project
export const checkProjectRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // If user is the owner
      if (project.owner.toString() === req.user._id.toString()) {
        req.projectRole = 'owner';
        req.project = project;
        return next();
      }

      // Check collaborators array
      const collaborator = project.collaborators.find(
        (c) => c.user && c.user.toString() === req.user._id.toString()
      );

      if (collaborator && allowedRoles.includes(collaborator.role)) {
        req.projectRole = collaborator.role;
        req.project = project; // Pass project context
        return next();
      }

      res.status(403).json({ success: false, message: 'Not authorized to perform this action on this project' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error in role authorization' });
    }
  };
};

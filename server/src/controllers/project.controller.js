import Project from '../models/Project.js';
import User from '../models/User.js';
import { buildZip } from '../utils/zipBuilder.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  const { title, description, genre, tags, isPublic } = req.body;

  try {
    const project = await Project.create({
      title,
      description,
      genre,
      tags,
      isPublic,
      owner: req.user._id,
      collaborators: [{ user: req.user._id, role: 'owner' }],
      versions: [{
        versionNumber: 1,
        label: 'v1 - Initial',
        tracks: [],
        createdBy: req.user._id
      }],
      currentVersion: 1,
      coverColor: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects (public or own)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { isPublic: true },
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    }).populate('owner', 'username profilePicUrl')
      .populate('collaborators.user', 'username profilePicUrl')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private/Public (depends on isPublic)
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username bio profilePicUrl')
      .populate('collaborators.user', 'username profilePicUrl')
      .populate({
        path: 'versions.tracks',
        model: 'Track'
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access check
    const isCollaborator = project.collaborators.some(c => c.user._id.toString() === req.user?._id?.toString());
    if (!project.isPublic && !isCollaborator) {
      return res.status(403).json({ success: false, message: 'Private project' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project info
// @route   PUT /api/projects/:id
// @access  Private (Owner only)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, genre, tags, isPublic, githubUrl } = req.body;
    project.title = title || project.title;
    project.description = description || project.description;
    project.genre = genre || project.genre;
    project.tags = tags || project.tags;
    project.isPublic = isPublic !== undefined ? isPublic : project.isPublic;

    const updatedProject = await project.save();
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Like project
// @route   POST /api/projects/:id/like
// @access  Private
export const toggleLikeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const user = await User.findById(req.user._id);
    const likeIndex = project.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      project.likes.push(req.user._id);
      user.likedProjects.push(project._id);
    } else {
      project.likes.splice(likeIndex, 1);
      user.likedProjects = user.likedProjects.filter(p => p.toString() !== project._id.toString());
    }

    await project.save();
    await user.save();
    res.json({ success: true, likesCount: project.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download current version as ZIP
// @route   GET /api/projects/:id/download/zip
// @access  Private
export const downloadProjectZip = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate({
      path: 'versions.tracks',
      model: 'Track'
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const currentVersion = project.versions.find(v => v.versionNumber === project.currentVersion);
    if (!currentVersion || currentVersion.tracks.length === 0) {
      return res.status(400).json({ success: false, message: 'No tracks to download' });
    }

    const zipStream = await buildZip(currentVersion.tracks);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.title.replace(/ /g, '_')}_v${project.currentVersion}.zip"`);
    
    zipStream.pipe(res);
  } catch (error) {
    console.error('ZIP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate ZIP' });
  }
};

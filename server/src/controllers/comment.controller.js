import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';

// @desc    Add a comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  const { text, timestampRef } = req.body;
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const comment = await Comment.create({
      project: projectId,
      author: req.user._id,
      text,
      // Preserve `0` as a valid timestamp.
      timestampRef: timestampRef ?? null
    });

    // Notify project owner if not commenter
    if (project.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: project.owner,
        sender: req.user._id,
        type: 'comment',
        project: projectId,
        message: `${req.user.username} commented on your project: "${project.title}"`
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all comments for project
// @route   GET /api/projects/:id/comments
// @access  Private
export const getCommentsByProject = async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.id, parentComment: null })
      .populate('author', 'username profilePicUrl')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username profilePicUrl' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
export const replyToComment = async (req, res) => {
  const { text } = req.body;
  const parentId = req.params.id;

  try {
    const parentComment = await Comment.findById(parentId).populate('project');
    if (!parentComment) return res.status(404).json({ success: false, message: 'Parent comment not found' });

    const reply = await Comment.create({
      project: parentComment.project._id,
      author: req.user._id,
      text,
      parentComment: parentId
    });

    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Notify parent author
    if (parentComment.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: parentComment.author,
        sender: req.user._id,
        type: 'reply',
        project: parentComment.project._id,
        message: `${req.user.username} replied to your comment.`
      });
    }

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

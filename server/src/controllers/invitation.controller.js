import crypto from 'crypto';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import Notification from '../models/Notification.js';

const buildInviteToken = () => crypto.randomBytes(20).toString('hex');

export const sendProjectInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { invitedEmail, role } = req.body;

    if (!invitedEmail || typeof invitedEmail !== 'string') {
      return res.status(400).json({ success: false, message: 'invitedEmail is required' });
    }
    const normalizedEmail = invitedEmail.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const inviteRole = role === 'collaborator' || role === 'viewer' ? role : 'viewer';

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Only owner can invite (middleware should enforce, but keep safe)
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If user exists by email, we tie the invite to them.
    const invitedUser = await User.findOne({ email: normalizedEmail }).select('_id email username');

    const token = buildInviteToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      project: projectId,
      invitedEmail: normalizedEmail,
      invitedUser: invitedUser?._id,
      role: inviteRole,
      token,
      status: 'pending',
      expiresAt,
    });

    // Create notification immediately if user exists already.
    if (invitedUser) {
      await Notification.create({
        recipient: invitedUser._id,
        sender: req.user._id,
        type: 'invite',
        project: projectId,
        message: `${req.user.username} invited you to collaborate on "${project.title}".`,
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl.replace(/\/$/, '')}/invite/${invitation.token}`;

    return res.status(201).json({
      success: true,
      data: {
        invitation,
        inviteLink,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptProjectInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { token } = req.params;

    const invitation = await Invitation.findOne({ project: projectId, token });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation is not pending' });
    }
    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invitation expired' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Ensure the logged-in user is the invited user.
    if (invitation.invitedUser) {
      if (invitation.invitedUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this invite' });
      }
    } else {
      if (invitation.invitedEmail !== req.user.email?.toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this invite' });
      }
    }

    const roleToAdd = invitation.role === 'collaborator' || invitation.role === 'viewer' ? invitation.role : 'viewer';

    const already = project.collaborators.find(
      (c) => c.user && c.user.toString() === req.user._id.toString()
    );

    if (!already) {
      project.collaborators.push({ user: req.user._id, role: roleToAdd });
    } else {
      already.role = roleToAdd;
    }

    invitation.status = 'accepted';
    await invitation.save();
    await project.save();

    return res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const declineProjectInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { token } = req.params;

    const invitation = await Invitation.findOne({ project: projectId, token });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invitation is not pending' });
    }
    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invitation expired' });
    }

    // Ensure the logged-in user is the invited user.
    if (invitation.invitedUser) {
      if (invitation.invitedUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this invite' });
      }
    } else {
      if (invitation.invitedEmail !== req.user.email?.toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this invite' });
      }
    }

    invitation.status = 'declined';
    await invitation.save();

    return res.status(200).json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invitation details by token (for invite accept page)
// @route   GET /api/invites/:token
// @access  Public (token may be guessed; we only return non-sensitive project info)
export const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token }).populate('project', 'title genre coverColor isPublic currentVersion owner collaborators');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    const project = invitation.project;
    return res.json({
      success: true,
      data: {
        token: invitation.token,
        projectId: project?._id,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitedEmail: invitation.invitedEmail,
        project: project
          ? {
              _id: project._id,
              title: project.title,
              genre: project.genre,
              coverColor: project.coverColor,
              isPublic: project.isPublic,
              currentVersion: project.currentVersion,
              owner: project.owner,
              collaborators: project.collaborators,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


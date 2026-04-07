import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('followers', 'username profilePicUrl')
      .populate('following', 'username profilePicUrl');
      
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Also get their public projects
    const projects = await Project.find({ owner: user._id, isPublic: true })
      .populate('owner', 'username profilePicUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio || user.bio;
      user.genres = req.body.genres || user.genres;
      
      // If we had file upload for profile pic, we'd handle it here
      if (req.body.profilePicUrl) {
          user.profilePicUrl = req.body.profilePicUrl;
      }

      const updatedUser = await user.save();
      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          genres: updatedUser.genres,
          profilePicUrl: updatedUser.profilePicUrl
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
export const toggleFollow = async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user._id;

        if (targetId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

        const isFollowing = currentUser.following.includes(targetId);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
        } else {
            currentUser.following.push(targetId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({ success: true, isFollowing: !isFollowing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

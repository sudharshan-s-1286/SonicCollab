import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Global Search (Projects and Artists)
// @route   GET /api/search
// @access  Public
export const globalSearch = async (req, res) => {
  const { q, genre, type } = req.query;

  try {
    let projectResults = [];
    let artistResults = [];

    // Search Projects
    if (!type || type === 'project') {
      const pQuery = {};
      if (q) pQuery.$text = { $search: q };
      if (genre && genre !== 'All') pQuery.genre = genre;
      pQuery.isPublic = true;

      projectResults = await Project.find(pQuery)
        .populate('owner', 'username profilePicUrl')
        .limit(20);
    }

    // Search Artists (Users)
    if (!type || type === 'artist') {
      const uQuery = {};
      if (q) uQuery.$or = [
        { username: { $regex: q, $options: i } },
        { bio: { $regex: q, $options: i } }
      ];
      if (genre && genre !== 'All') uQuery.genres = genre;

      artistResults = await User.find(uQuery)
        .select('username bio profilePicUrl genres followers')
        .limit(20);
    }

    res.json({
      success: true,
      data: {
        projects: projectResults,
        artists: artistResults
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

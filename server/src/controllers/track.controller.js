import Track from '../models/Track.js';
import Project from '../models/Project.js';
import cloudinary from '../config/cloudinary.js';

// Helper to stream upload to Cloudinary
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    // Write buffer directly to stream and end
    stream.end(buffer);
  });
};

// @desc    Upload track/stem to project
// @route   POST /api/projects/:projectId/tracks
// @access  Private (Owner/Collaborator)
export const uploadTrack = async (req, res) => {
  const { projectId } = req.params;
  const { name, stemType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No audio file provided' });
  }

  try {
    const project = req.project; // From roleMiddleware
    
    // Use resource_type: "video" for audio uploads on Cloudinary
    const options = {
      resource_type: 'video',
      folder: `soniccollab/projects/${projectId}/v${project.currentVersion}`
    };

    const uploadResult = await streamUpload(file.buffer, options);

    const newTrack = await Track.create({
      project: projectId,
      versionNumber: project.currentVersion,
      name: name || file.originalname,
      stemType: stemType || 'other',
      audioUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      duration: uploadResult.duration,
      uploadedBy: req.user._id
    });

    // Add track to current version
    const versionIndex = project.versions.findIndex(v => v.versionNumber === project.currentVersion);
    if (versionIndex !== -1) {
      project.versions[versionIndex].tracks.push(newTrack._id);
      await project.save();
    }

    res.status(201).json({ success: true, data: newTrack });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload track' });
  }
};

// @desc    Delete a track
// @route   DELETE /api/tracks/:trackId
// @access  Private (Owner/Uploader)
export const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    // Auth check: must be owner of project or person who uploaded it
    const project = await Project.findById(track.project);
    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    if (project.owner.toString() !== req.user._id.toString() && track.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this track' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(track.cloudinaryPublicId, { resource_type: 'video' });

    // Remove reference from project version
    const versionIndex = project.versions.findIndex(v => v.versionNumber === track.versionNumber);
    if (versionIndex !== -1) {
      project.versions[versionIndex].tracks = project.versions[versionIndex].tracks.filter(
        t => t.toString() !== track._id.toString()
      );
      await project.save();
    }

    await Track.deleteOne({ _id: track._id });

    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update track details (rename/stemType)
// @route   PUT /api/tracks/:trackId
// @access  Private
export const updateTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.trackId);
        if (!track) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }

        const project = await Project.findById(track.project);
        if (project.owner.toString() !== req.user._id.toString() && track.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this track' });
        }

        track.name = req.body.name || track.name;
        track.stemType = req.body.stemType || track.stemType;
        
        const updatedTrack = await track.save();

        res.json({ success: true, data: updatedTrack });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Redirect to individual stem download
// @route   GET /api/tracks/:id/download
// @access  Private
export const downloadTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);
        if (!track) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }
        res.redirect(track.audioUrl);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

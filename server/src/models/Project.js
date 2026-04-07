import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  genre: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['owner', 'collaborator', 'viewer'], default: 'viewer' }
    }
  ],
  isPublic: { type: Boolean, default: true },
  versions: [
    {
      versionNumber: { type: Number },
      label: { type: String },
      tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  currentVersion: { type: Number, default: 1 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  coverColor: { type: String },
}, {
  timestamps: true
});

projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Project', projectSchema);

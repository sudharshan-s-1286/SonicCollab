import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  versionNumber: { type: Number, required: true },
  name: { type: String, required: true },
  stemType: { 
    type: String, 
    enum: ['vocals', 'drums', 'bass', 'guitar', 'keys', 'synth', 'other'],
    default: 'other'
  },
  audioUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  duration: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isMuted: { type: Boolean, default: false },
  volume: { type: Number, default: 1.0 }
}, {
  timestamps: true
});

trackSchema.index({ project: 1 });

export default mongoose.model('Track', trackSchema);

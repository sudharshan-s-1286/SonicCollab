import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  invitedEmail: { type: String, required: true },
  invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['collaborator', 'viewer'], default: 'viewer' },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Invitation', invitationSchema);

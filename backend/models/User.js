import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  enrollmentNumber: { type: String }
}, { timestamps: true });

// Prevent overwrite model compilation error during dev restarts
export default mongoose.models.User || mongoose.model('User', UserSchema);

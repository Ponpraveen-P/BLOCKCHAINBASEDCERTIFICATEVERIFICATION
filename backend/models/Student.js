import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }]
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);

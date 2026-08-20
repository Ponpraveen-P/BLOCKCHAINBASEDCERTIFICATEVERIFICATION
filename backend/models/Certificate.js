import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true }, // Store as string to support both Mongo ObjectIds and JSON UUIDs
  studentName: { type: String, required: true },
  enrollmentNumber: { type: String, required: true },
  course: { type: String, required: true },
  college: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  grade: { type: String, required: true },
  hash: { type: String, required: true, unique: true }, // SHA-256 hash of PDF file
  pdfPath: { type: String, required: true },
  qrPath: { type: String, required: true },
  blockIndex: { type: Number, default: -1 },
  txHash: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);

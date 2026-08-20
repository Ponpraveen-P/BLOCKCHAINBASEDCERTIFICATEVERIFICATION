import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: String, required: true },
  data: { type: Array, default: [] }, // Array containing certificate metadata or transaction hashes
  previousHash: { type: String, required: true },
  hash: { type: String, required: true },
  nonce: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Block || mongoose.model('Block', BlockSchema);

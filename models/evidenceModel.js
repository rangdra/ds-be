import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    oldId: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Evidence', EvidenceSchema);

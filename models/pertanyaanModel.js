import mongoose from 'mongoose';

const PertanyaanSchema = new mongoose.Schema(
  {
    pertanyaan: {
      type: String,
      required: true,
    },
    id_evidence: {
      type: mongoose.Types.ObjectId,
      ref: 'Evidence',
    },
    // rule: {
    //   type: mongoose.Types.ObjectId,
    //   ref: 'Rule',
    // },
  },
  { timestamps: true }
);

export default mongoose.model('Pertanyaan', PertanyaanSchema);

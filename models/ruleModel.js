import mongoose from 'mongoose';

const RuleSchema = new mongoose.Schema(
  {
    id_problem: {
      type: mongoose.Types.ObjectId,
      ref: 'Problem',
    },
    id_evidence: {
      type: mongoose.Types.ObjectId,
      ref: 'Evidence',
    },
    cf: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Rule', RuleSchema);

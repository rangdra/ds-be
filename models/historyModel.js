import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    // user: {
    //   type: Object,
    // },
    payload: {
      type: String,
    },
    percentage: {
      type: Number,
    },
    result: {
      type: Object,
    },
    proses: {
      type: [Object],
    },
    evidences: {
      type: [Object],
    },
    // problem: {
    //   type: [
    //     {
    //       type: mongoose.Types.ObjectId,
    //       ref: 'Problem',
    //     },
    //   ],
    // },
    problem: {
      type: [Object],
    },
  },
  { timestamps: true }
);

export default mongoose.model('History', HistorySchema);

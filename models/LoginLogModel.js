import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LoginLog', LoginLogSchema);

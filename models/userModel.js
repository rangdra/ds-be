import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    nim: {
      type: String,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      default:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=robohash&f=y',
    },
    // isAdmin: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
    role: {
      type: String,
      enum: ['mahasiswa', 'admin', 'super_admin'],
      default: 'mahasiswa',
    },
    fromGoogle: {
      type: Boolean,
      default: false,
    },
    mahasiswa: {
      type: mongoose.Types.ObjectId,
      ref: 'Mahasiswa',
    },
    isTemporaryPassword: {
      type: Boolean,
    },
    history: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'History',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);

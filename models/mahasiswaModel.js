import mongoose from 'mongoose';

const MahasiswaSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: true,
    // },
    nim: {
      type: String,
      unique: true,
    },
    jurusan: {
      type: String,
    },
    jenjang: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Mahasiswa', MahasiswaSchema);

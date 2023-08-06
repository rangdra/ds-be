import Mahasiswa from '../models/mahasiswaModel.js';
import History from '../models/historyModel.js';
import User from '../models/userModel.js';
import validation from '../utils/validation.js';
import bcrypt from 'bcryptjs';
import { createError } from '../utils/error.js';

export const addMahasiswa = async (req, res, next) => {
  const { fullname, nim, jenjang, jurusan } = req.body;

  try {
    let error = '';

    if (!fullname) {
      error = 'Nama mahasiswa tidak boleh kosong';
    }
    if (error) return next(createError(400, error));

    // let newUsername = username.replace(/ /g, '').toLowerCase();

    const isUsernameExist = await User.findOne({ username: nim });
    if (isUsernameExist)
      return next(createError(400, 'NIM ini sudah tersedia.'));

    const isNIMExist = await Mahasiswa.findOne({ nim });
    if (isNIMExist) return next(createError(400, 'NIM ini sudah tersedia.'));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(nim, salt);

    const newMahasiswa = new Mahasiswa({
      nim,
      jenjang,
      jurusan,
    });
    await newMahasiswa.save();

    const newUser = new User({
      ...req.body,
      password: hash,
      username: nim,
      nim,
      mahasiswa: newMahasiswa._id,
      isTemporaryPassword: true,
    });
    await newUser.save();

    return res.status(201).json({ message: 'Mahasiswa berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getMahasiswas = async (req, res, next) => {
  try {
    const dataMahasiswa = await User.find({ role: 'mahasiswa' })
      .populate('mahasiswa history')
      .select('-password');

    const result = await Promise.all(
      dataMahasiswa.map(async (mhs) => {
        const historyMhs = await History.find({ user: mhs._id })
          .sort({
            createdAt: -1,
          })
          .limit(1);

        if (historyMhs.length > 0) {
          return {
            ...mhs._doc,
            lastIdentification: historyMhs[0],
          };
        } else {
          return {
            ...mhs._doc,
            lastIdentification: {},
          };
        }
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateMahasiswa = async (req, res, next) => {
  const { userId } = req.params;
  const { fullname, nim, jenjang, jurusan } = req.body;

  try {
    const mhs = await User.findOne({ _id: userId }).populate('mahasiswa');
    console.log(mhs);
    let error = '';

    if (!fullname) {
      error = 'Nama mahasiswa tidak boleh kosong';
    }
    if (error) return next(createError(400, error));

    if (nim !== mhs.mahasiswa.nim) {
      const isNIMExist = await Mahasiswa.findOne({ nim });
      if (isNIMExist) return next(createError(400, 'NIM ini sudah tersedia.'));
    }

    await Mahasiswa.findByIdAndUpdate(
      mhs.mahasiswa._id,
      { nim, jenjang, jurusan },
      { new: true }
    );
    await User.findByIdAndUpdate(mhs._id, { fullname, nim }, { new: true });

    return res.status(200).json({ message: 'Mahasiswa berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

export const deleteMahasiswa = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const mhs = await User.findById(userId);

    await User.findByIdAndDelete(mhs._id);
    await Mahasiswa.findByIdAndDelete(mhs.mahasiswa);

    return res.status(200).json({ message: 'Mahasiswa berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};

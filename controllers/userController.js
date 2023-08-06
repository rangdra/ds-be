import User from '../models/userModel.js';
import Mahasiswa from '../models/mahasiswaModel.js';
import { createError } from '../utils/error.js';
import validation from '../utils/validation.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res, next) => {
  const { role } = req.query;
  try {
    let where = {};

    if (role) {
      where = {
        ...where,
        role,
      };
    }
    const users = await User.find(where)
      .select('-password -updatedAt')
      .populate('mahasiswa');

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { fullname, username, role, nim, jenjang, jurusan } = req.body;

  try {
    let error = '';
    if (!fullname) {
      error = 'Fullname tidak boleh kosong';
    }

    if (!username) {
      error = 'Username tidak boleh kosong';
    }

    if (error) return next(createError(400, error));

    let newUsername = username.replace(/ /g, '').toLowerCase();

    const isUsernameExist = await User.findOne({ username: newUsername });
    if (isUsernameExist)
      return next(createError(400, 'Username ini sudah tersedia.'));

    const isNIMExist = await Mahasiswa.findOne({ nim });
    if (isNIMExist) return next(createError(400, 'NIM ini sudah tersedia.'));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUsername, salt);

    let fixUsername = role === 'mahasiswa' ? nim : newUsername;

    let newMhs;

    if (role === 'mahasiswa') {
      newMhs = new Mahasiswa({
        nim,
        jenjang,
        jurusan,
      });

      await newMhs.save();
    }

    const newUser = new User({
      ...req.body,
      password: hash,
      username: fixUsername,
      nim: role === 'mahasiswa' ? nim : null,
      mahasiswa: role === 'mahasiswa' ? newMhs._id : null,
      isTemporaryPassword: true,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User berhasil ditambahkan!' });
  } catch (error) {
    next(error);
  }
};

export const getUsersLength = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -updatedAt');

    return res.status(200).json(users.length);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { fullname, username, role, nim, jenjang, jurusan } = req.body;
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id }).populate('mahasiswa');
    let error = '';
    if (!fullname) {
      error = 'Fullname tidak boleh kosong';
    }

    if (!username) {
      error = 'Username tidak boleh kosong';
    }

    if (error) return next(createError(400, error));

    if (username !== user.username) {
      const isUsernameExist = await User.findOne({ username });
      if (isUsernameExist)
        return next(createError(400, 'Username ini sudah tersedia.'));
    }

    if (role === 'mahasiswa' && nim !== user.mahasiswa.nim) {
      const isNIMExist = await Mahasiswa.findOne({ nim });
      if (isNIMExist) return next(createError(400, 'NIM ini sudah tersedia.'));
    }

    if (role === 'mahasiswa') {
      await Mahasiswa.findByIdAndUpdate(
        user.mahasiswa._id,
        { nim, jenjang, jurusan },
        { new: true }
      );
    }

    await User.findByIdAndUpdate(
      user._id,
      { fullname, username, role, nim: user.role === 'mahasiswa' ? nim : null },
      { new: true }
    );

    return res.status(200).json({ message: 'User berhasil diubah!' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    await User.findByIdAndDelete(user._id);
    await Mahasiswa.findByIdAndDelete(user.mahasiswa);

    return res.status(200).json({ message: 'User berhasil dihapus!' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.newPassword, salt);

    await User.findByIdAndUpdate(
      req.params.id,
      { password: hash, isTemporaryPassword: false },
      { new: true }
    );

    return res.status(200).json({ message: 'Password berhasil diubah!' });
  } catch (error) {
    next(error);
  }
};

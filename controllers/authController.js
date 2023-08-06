import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import User from '../models/userModel.js';
import Mahasiswa from '../models/mahasiswaModel.js';
import LoginLog from '../models/LoginLogModel.js';
import { createError } from '../utils/error.js';
import validation from '../utils/validation.js';
import userModel from '../models/userModel.js';
import mahasiswaModel from '../models/mahasiswaModel.js';

export const register = async (req, res, next) => {
  const { fullname, username, password, role } = req.body;
  const { isRecord } = req.query;
  try {
    const error = validation(fullname, username, password);
    if (error) return next(createError(400, error));

    let newUsername = username.replace(/ /g, '').toLowerCase();

    const isUsernameExist = await User.findOne({ username: newUsername });
    if (isUsernameExist)
      return next(createError(400, 'Username ini sudah tersedia'));

    const isNimExist = await User.findOne({ nim: newUsername });

    if (isNimExist) return next(createError(400, 'NIM ini sudah tersedia'));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    let newMhs;

    if (role === 'mahasiswa') {
      const newMhs = new mahasiswaModel({
        nim: '',
        jenjang: '',
        jurusan: '',
      });
      await newMhs.save();
    }

    const newUser = new User({
      ...req.body,
      username: newUsername,
      password: hash,
      mahasiswa: newMhs ? newMhs._id : null,
      isTemporaryPassword: false,
    });

    await newUser.save();

    const { password: passBody, createdAt, updatedAt, __v, ...other } = newUser;

    const token = generateToken(other);

    if (isRecord) {
      const loginLog = new LoginLog({
        user: newUser._id,
      });
      await loginLog.save();
    }

    return res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ username: req.body.username }, { nim: req.body.username }],
    });

    if (!user) return next(createError(404, 'User tidak ditemukan!'));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) return next(createError(400, 'Password salah!'));

    const { password, createdAt, updatedAt, __v, ...other } = user._doc;

    const token = generateToken(other);

    const loginLog = new LoginLog({
      user: user._id,
    });
    await loginLog.save();

    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      const { password, createdAt, updatedAt, __v, ...other } = user._doc;

      const token = generateToken(other);

      return res.status(200).json({ token });
    } else {
      let newUsername = req.body.username.replace(/ /g, '').toLowerCase();
      const newUser = new User({
        ...req.body,
        username: newUsername,
        fromGoogle: true,
      });
      const savedUser = await newUser.save();
      const { password, createdAt, updatedAt, __v, ...other } = savedUser;

      const token = generateToken(other);

      const loginLog = new LoginLog({
        user: user._id,
      });
      await loginLog.save();

      return res.status(200).json({ token });
    }
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('access_token');
    return res.json({ message: 'Logged out.' });
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

export const getLoginLog = async (req, res) => {
  try {
    const dataLog = await LoginLog.find()
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(200).json(dataLog);
  } catch (error) {
    next(error);
  }
};

export const getUserLoginByDate = async (req, res, next) => {
  const today = moment().format('YYYY-MM-DD');
  const month = moment().format('YYYY-MM');
  const year = moment().format('YYYY');

  try {
    const dataLog = await LoginLog.find()
      .populate('user', '_id fullname username')
      .sort({ createdAt: -1 });

    const dataHariIni = dataLog.filter(
      (item) => moment(item.createdAt).format('YYYY-MM-DD') === today
    ).length;

    const dataBulanIni = dataLog.filter(
      (item) => moment(item.createdAt).format('YYYY-MM') === month
    ).length;

    const dataTahunIni = dataLog.filter(
      (item) => moment(item.createdAt).format('YYYY') === year
    ).length;

    return res.status(200).json({ dataHariIni, dataBulanIni, dataTahunIni });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const { userId } = req.params;
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    await userModel.findByIdAndUpdate(
      userId,
      { password: hash, isTemporaryPassword: false },
      { new: true }
    );

    return res.status(200).json({ message: 'Password berhasil diupdate!' });
  } catch (error) {
    next(error);
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
};

import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(
        decoded._id ? decoded._id : decoded._doc._id
      ).select('-password');

      next();
    } catch (error) {
      next(createError(403, 'Not authorized, token failed'));
    }
  }

  if (!token) {
    next(createError(401, 'Not authorized, no token'));
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    next(createError(401, 'Not authorized as an admin'));
  }
};

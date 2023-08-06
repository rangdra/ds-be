import express from 'express';
import {
  changePassword,
  currentUser,
  getLoginLog,
  getUserLoginByDate,
  googleAuth,
  login,
  logout,
  register,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/current-user', protect, currentUser);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);

router.get('/login-log', getLoginLog);
router.get('/data-login', getUserLoginByDate);

router.put('/:userId/change-password', changePassword);

export default router;

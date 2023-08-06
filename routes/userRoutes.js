import express from 'express';
import {
  createUser,
  deleteUser,
  getUsers,
  getUsersLength,
  updateUser,
} from '../controllers/userController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/', getUsersLength);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

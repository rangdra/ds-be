import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addMahasiswa,
  deleteMahasiswa,
  getMahasiswas,
  updateMahasiswa,
} from '../controllers/mahasiswaController.js';

const router = express.Router();

router.post('/', addMahasiswa);
router.get('/', getMahasiswas);
router.put('/:userId', updateMahasiswa);
router.delete('/:userId', deleteMahasiswa);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addPertanyaan,
  deletePertanyaan,
  getPertanyaans,
  updatePertanyaan,
} from '../controllers/pertanyaanController.js';

const router = express.Router();

router.post('/', addPertanyaan);
router.get('/', getPertanyaans);
router.put('/:pertanyaanId', updatePertanyaan);
router.delete('/:pertanyaanId', deletePertanyaan);

export default router;

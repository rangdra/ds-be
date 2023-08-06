import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addEvidence,
  deleteEvidence,
  getEvidences,
  updateEvidence,
} from '../controllers/evidenceController.js';

const router = express.Router();

router.post('/', addEvidence);
router.get('/', getEvidences);
router.put('/:evidenceId', updateEvidence);
router.delete('/:evidenceId', deleteEvidence);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addProblem,
  deleteProblem,
  getProblems,
  updateProblem,
} from '../controllers/problemController.js';

const router = express.Router();

router.post('/', addProblem);
router.get('/', getProblems);
router.put('/:problemId', updateProblem);
router.delete('/:problemId', deleteProblem);

export default router;

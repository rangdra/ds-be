import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addRule,
  deleteRule,
  getRules,
  updateRule,
} from '../controllers/ruleController.js';

const router = express.Router();

router.post('/', addRule);
router.get('/', protect, getRules);
router.put('/:ruleId', updateRule);
router.delete('/:ruleId', deleteRule);

export default router;

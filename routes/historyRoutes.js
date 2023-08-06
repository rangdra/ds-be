import express from 'express';
import {
  deleteHistory,
  getHistories,
  getHistory,
} from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getHistories);

router.get('/:historyId', getHistory);

router.delete('/:historyId', deleteHistory);

export default router;

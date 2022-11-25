import express from 'express';
import {
  createSolution,
  findAll,
  findAllSolutionsFromUserId,
  findWeeklyProgressSolutions,
  present,
  presentAll
} from './resources';

import { authenticateToken } from '../user/resources';

const router = express.Router();

router.param('userId', findAllSolutionsFromUserId);

router.get('/all', findAll, presentAll);

router.get(
  '/weekly-progress',
  authenticateToken,
  findWeeklyProgressSolutions,
  presentAll
);
router.post('/create', createSolution, present);

export default router;

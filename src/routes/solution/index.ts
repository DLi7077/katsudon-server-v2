import express from 'express';
import {
  createSolution,
  findAllSolutionsFromUserId,
  present,
  presentAll
} from './resources';

const router = express.Router();

router.param('userId', findAllSolutionsFromUserId);

router.post('/create', createSolution, present);

router.get('/:userId', presentAll);

export default router;

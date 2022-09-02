import express from 'express';
import {
  createSolution,
  findAll,
  findAllSolutionsFromUserId,
  present,
  presentAll
} from './resources';

const router = express.Router();

router.param('userId', findAllSolutionsFromUserId);

router.get('/all', findAll, presentAll);
router.post('/create', createSolution, present);

router.get('/:userId', presentAll);

export default router;

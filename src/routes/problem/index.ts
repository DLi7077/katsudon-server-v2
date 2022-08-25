import express from 'express';
import {
  createProblem,
  findById,
  findProblems,
  present,
  presentAll
} from './resources';

const router = express.Router();

router.param('problem_id', findById);
router.post('/create', createProblem, present);
router.get('/all', findProblems, presentAll);

router.get('/:problem_id', present);
export default router;

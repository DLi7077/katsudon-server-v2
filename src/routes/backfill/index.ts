import express from 'express';
import { backfillProblemID, backfillSolutionLength } from './resources';

const router = express.Router();

router.post('/solution-problem-id', backfillProblemID);
router.post('/solution-code-length', backfillSolutionLength);
export default router;

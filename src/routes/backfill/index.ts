import express from 'express';
import { backfillProblemID } from './resources';

const router = express.Router();

router.post('/solution-problem-id', backfillProblemID);
export default router;

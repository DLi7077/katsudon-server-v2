import express from 'express';
import { createSolution, present } from './resources';

const router = express.Router();

router.post('/create', createSolution, present);

export default router;

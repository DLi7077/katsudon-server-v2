import mongoose from 'mongoose';
import { Database } from '../types/db';
import models from './models';

const db: Database = {
  mongoose,
  User: models.UserModel,
  Problem: models.ProblemModel,
  Solution: models.SolutionModel
};

export default db;

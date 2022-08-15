import { DatabaseModels } from "../../types/db";
import UserModel from "./user";
import ProblemModel from "./Problem";
import SolutionModel from "./Solution";

const db: DatabaseModels = {
  UserModel,
  ProblemModel,
  SolutionModel,
};

export default db;

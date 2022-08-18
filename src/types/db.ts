import { Model, Mongoose } from "mongoose";
import { UserAttributes } from "../database/models/User";
import { ProblemAttributes } from "../database/models/Problem";
import { SolutionAttributes } from "../database/models/Solution";

/**
 * @description Database model interface deinition used to define database object
 */
export interface DatabaseModels {
  [key: string]: Model<any>;
}

/**
 * @description Database Model definition interface
 */
export interface Database {
  mongoose: Mongoose;
  User: Model<UserAttributes>;
  Problem: Model<ProblemAttributes>;
  Solution: Model<SolutionAttributes>;
}

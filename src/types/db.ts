import { Model, Mongoose } from "mongoose";
import { UserAttributes } from "../database/models/user";

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
}

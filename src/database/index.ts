import { Database } from "../types/db";
import mongoose from "mongoose";
import models from "./models";

const db: Database = {
  mongoose,
  User: models.UserModel,
};

export default db;

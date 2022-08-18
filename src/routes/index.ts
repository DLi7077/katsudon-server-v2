import { Express } from "express";
import Models from "../database";
import githubAPI from "./github";
import userAPI from "./user";
import problemAPI from "./problem";
import solutionAPI from "./solution";
import listEndpoints from "express-list-endpoints";
import * as dotenv from "dotenv";
dotenv.config();

export default async function routes(app: Express) {
  app.use("/api/github", githubAPI);
  app.use("/api/user", userAPI);
  app.use("/api/problem", problemAPI);
  app.use("/api/solution", solutionAPI);

  const MONGODB_URI: any = process.env.MONGODB_URI;
  Models.mongoose.connect(MONGODB_URI).then(
    () => {
      console.log("Connected to MongoDB!");
    },
    (err: any) => {
      console.log(`Couldnt connect to MongoDB...${err}`);
    }
  );
  //display all endpoints
  console.table(listEndpoints(app));
}

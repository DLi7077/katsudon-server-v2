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

  const mongo_url: any = process.env.MONGO_URL;
  Models.mongoose
    .connect(mongo_url)
    .then(() => {
      console.log("Connected to MongoDB!");
    })
    .catch(() => {
      console.log("couldnt connect");
    });

  //display all endpoints
  console.table(listEndpoints(app));
}

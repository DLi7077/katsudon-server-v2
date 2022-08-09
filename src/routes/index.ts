import { Express } from "express";
import Models from "../database";
import githubAPI from "./github";
import userAPI from "./user";
import listEndpoints from "express-list-endpoints";
import * as dotenv from "dotenv";
dotenv.config();

export default async function routes(app: Express) {
  app.use("/api/github", githubAPI);
  app.use("/api/user", userAPI);

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

import { Express } from "express";
import githubAPI from "./github";
import listEndpoints from "express-list-endpoints";

export default async function routes(app: Express) {
  app.use("/api", githubAPI);

  //display all endpoints
  console.table(listEndpoints(app));
}

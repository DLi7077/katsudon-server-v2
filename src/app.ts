import _ from "lodash";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import routes from "./routes";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

const port: any = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`Express listening at port ${port}`);
  console.log(`Test apis with http://localhost:${port}/api`);
});

routes(app);

export default app;
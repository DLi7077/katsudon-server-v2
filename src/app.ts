import _ from "lodash";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import routes from "./routes";
dotenv.config();

const app = express();
app.use(cors());

const port: any = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Express listening at port ${port}`);
  console.log(`Test apis with http://localhost:${port}/api`);
});

routes(app);

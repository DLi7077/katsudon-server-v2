import { Express } from 'express';
import listEndpoints from 'express-list-endpoints';
import * as dotenv from 'dotenv';
import Models from '../database';
import backfillDev from './backfill';
import userAPI from './user';
import problemAPI from './problem';
import solutionAPI from './solution';

dotenv.config();

export default async function routes(app: Express) {
  app.use('/api/user', userAPI);
  app.use('/api/problem', problemAPI);
  app.use('/api/solution', solutionAPI);
  app.use('/dev/backfill', backfillDev);

  const uri: any = process.env.MONGODB_URI;
  Models.mongoose.connect(uri).then(
    () => {
      console.log('Connected to MongoDB!');
    },
    (err: any) => {
      console.log(`Couldnt connect to MongoDB...${err}`);
    }
  );
  // display all endpoints
  console.table(listEndpoints(app));
}

import { UserAttributes } from '../../database/models/User';
import { Document, ObjectId } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser: Document<UserAttributes>;
  }
}

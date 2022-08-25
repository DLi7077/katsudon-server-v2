/* eslint-disable camelcase */
import mongoose, { Schema, Model, ObjectId } from 'mongoose';

export interface UserAttributes {
  _id: ObjectId;
  username: string;
  password: string;
  email: string;
  verified: boolean;
  biography?: string;
  following: ObjectId[];
  followers: ObjectId[];
  solved: ObjectId[];
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export type UserModelDefinition = Model<UserAttributes>;

export const userSchema: Schema<UserAttributes> = new Schema<UserAttributes>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    partialFilterExpression: { verified: true }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profile_picture_url: {
    type: String,
    required: false
  },
  biography: {
    type: String,
    required: false
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'User'
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'User'
  },
  solved: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Problem'
  },
  verified: {
    type: Boolean,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  updated_at: {
    type: Date,
    required: false
  },
  deleted_at: {
    type: Date,
    required: false
  }
});

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { verified: true } }
);

const UserModel: Model<UserAttributes> = mongoose.model('User', userSchema);

export default UserModel;

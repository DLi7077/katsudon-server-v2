/* eslint-disable camelcase */
import mongoose, { Schema, Model, ObjectId } from 'mongoose';
import ProblemDifficulties from '../../constants/ProblemDifficulty';

export interface ProblemAttributes {
  _id: ObjectId;
  id: number;
  title: string;
  url: string;
  difficulty?: string;
  description: string;
  tags?: string[];
  solved_by?: ObjectId[];
}

export type ProblemModelDefinition = Model<ProblemAttributes>;

export const ProblemSchema: Schema<ProblemAttributes> =
  new Schema<ProblemAttributes>({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      auto: true
    },
    id: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    url: {
      type: String,
      required: true,
      unique: true
    },
    difficulty: {
      type: String,
      enum: ProblemDifficulties,
      required: false
    },
    description: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: false
    },
    solved_by: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: 'User'
    }
  });

ProblemSchema.index({ id: 1 });
ProblemSchema.index({ title: 1 });
ProblemSchema.index({ difficulty: 1 });

const ProblemModel: Model<ProblemAttributes> = mongoose.model(
  'Problem',
  ProblemSchema
);

export default ProblemModel;

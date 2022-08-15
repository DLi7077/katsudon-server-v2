import mongoose, { Schema, Model, ObjectId, mongo } from "mongoose";
import _ from "lodash";

export interface SolutionAttributes {
  _id: ObjectId;
  user_id: ObjectId;
  problem_id: number;
  solution_language: string;
  solution_code: string;
  runtime_ms: number;
  memory_usage_mb: number;
  created_at: Date;
}

export type SolutionModelDefintition = Model<SolutionAttributes>;

export const SolutionSchema: Schema<SolutionAttributes> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  problem_id: {
    type: Number,
    required: true,
  },
  solution_language: {
    type: String,
    required: true,
  },
  solution_code: {
    type: String,
    required: true,
  },
  runtime_ms: {
    type: Number,
    required: true,
  },
  memory_usage_mb: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

SolutionSchema.index({
  solution_language: 1,
});

const SolutionModel: Model<SolutionAttributes> = mongoose.model(
  "Solution",
  SolutionSchema
);

export default SolutionModel;

import _ from "lodash";
import Models from "../database";
import { SolutionAttributes } from "../database/models/Solution";

/**
 * @description Creates a submission, upserts the problem solved
 * @param {SolutionAttributes} attributes - the solution attribute object
 * @returns {Promise<any>} Promise of created solution
 */
async function create(attributes: SolutionAttributes): Promise<any> {
  //upsert the solved problem
  const updatedProblemAttributes = {
    id: _.get(attributes, "problem_id"),
    title: _.get(attributes, "problem_title"),
    difficulty: _.get(attributes, "problem_difficulty"),
    description: _.get(attributes, "problem_description"),
    tags: _.get(attributes, "problem_tags"),
  };
  await Models.Problem.findOneAndUpdate(
    {
      id: updatedProblemAttributes.id,
    },
    updatedProblemAttributes,
    { upsert: true }
  );

  //create the solution
  const createdSolution = await Models.Solution.create({
    ...attributes,
    created_at: new Date(),
  });

  //add solution to 

  return createdSolution;
}

export default {
  create,
};
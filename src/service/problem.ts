import Models from '../database';
import { ProblemAttributes } from '../database/models/Problem';

/**
 * @description Creates a Problem
 * @param {SolutionAttributes} attributes - the problem attribute object
 * @returns {Promise<any>} Promise of created problem
 */
async function create(attributes: ProblemAttributes): Promise<any> {
  return Models.Problem.findOneAndUpdate({ id: attributes.id }, attributes, {
    upsert: true,
    new: true
  });
}

/**
 * @description Adds a solver to the solved_by field for a problem
 * @param {ObjectId} problemId the problem's id in mongoDB
 * @param {ObjectId} userId the solver's id
 * @returns {Promise<any>} Promise of updated problem
 */
async function addSolver(problemId: any, userId: any): Promise<any> {
  const updatedProblem = await Models.Problem.findOneAndUpdate(
    { _id: problemId },
    { $addToSet: { solved_by: userId } },
    { upsert: true, new: true }
  );

  return updatedProblem;
}

/**
 * @description Retrieves all questions that match a query
 * @param {SolutionAttributes} queryParams - the queries
 * @returns {Promise<any>} Promise of problems that match the query
 */
async function findAll(queryParams: any): Promise<any> {
  const problems = await Models.Problem.find(queryParams);

  return {
    count: problems.length,
    rows: problems
  };
}

export default {
  create,
  addSolver,
  findAll
};

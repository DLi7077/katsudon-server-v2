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
  findAll
};

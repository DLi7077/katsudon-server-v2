/* eslint-disable camelcase */
import _ from 'lodash';
import Models from '../database';
import { SolutionAttributes } from '../database/models/Solution';

/**
 * @description Creates a submission, upserts the problem solved
 * @param {SolutionAttributes} attributes - the solution attribute object
 * @returns {Promise<any>} Promise of created solution
 */
async function create(attributes: SolutionAttributes): Promise<any> {
  // upsert the solved problem
  const updatedProblemAttributes: any = {
    id: _.get(attributes, 'problem_id'),
    title: _.get(attributes, 'problem_title'),
    url: _.get(attributes, 'problem_url'),
    difficulty: _.get(attributes, 'problem_difficulty'),
    description: _.get(attributes, 'problem_description'),
    tags: _.get(attributes, 'problem_tags')
  };

  const updatedProblem = await Models.Problem.findOneAndUpdate(
    { id: updatedProblemAttributes.id },
    updatedProblemAttributes,
    { upsert: true, new: true }
  );

  // create the solution
  const createdSolution = await Models.Solution.create({
    ...attributes,
    created_at: new Date()
  });

  return {
    problem: updatedProblem,
    solution: createdSolution
  };
}

export default {
  create
};

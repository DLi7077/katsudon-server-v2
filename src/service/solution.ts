/* eslint-disable camelcase */
import _ from 'lodash';
import { Types } from 'mongoose';
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
    //deal with empty alt names and embed css
    description: _.get(attributes, 'problem_description').replaceAll(
      'alt=""',
      'alt="visual" style ="height:auto width:100%;"'
    ),
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

/**
 * @description Finds the most recent solutions for each problem a given user solved
 * @param {any} userId
 * @returns All latest solutions solved for each problem by the user
 */
async function findAllFromUserId(userId: any): Promise<any> {
  const solutions: any[] = await Models.Solution.aggregate([
    { $match: { user_id: new Types.ObjectId(userId) } },
    { $sort: { created_at: -1 } },
    {
      $group: {
        _id: {
          field_1: '$problem_id',
          field_2: '$solution_language'
        },
        solution: { $first: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'solution.problem_id',
        foreignField: 'id',
        as: 'problem'
      }
    },
    {
      $project: {
        _id: false,
        solution: true,
        problem: { $first: '$problem' }
      }
    }
  ]);

  const questionSet = new Set();
  // splits solutions into grouped by problem
  const cleanedSolutions: any = _.reduce(
    solutions,
    (accumulator: any, currSolution: any) => {
      const { problem_id, solution_language } = _.get(currSolution, 'solution');
      const problemDifficulty = _.get(currSolution, 'problem.difficulty');

      if (!questionSet.has(problem_id)) {
        accumulator.difficulty_distribution[problemDifficulty] += 1;
        questionSet.add(problem_id);
      }

      const solutionDetails = {
        [solution_language]: _.omit(_.get(currSolution, 'solution'), '_id')
      };
      const incomingDate = _.get(currSolution, 'solution.created_at');

      if (accumulator[problem_id]) {
        _.assign(accumulator[problem_id].solutions, solutionDetails);
        const recentDate = accumulator[problem_id].solutions.recent;
        if (recentDate < incomingDate)
          accumulator[problem_id].solutions.recent = incomingDate;

        return accumulator;
      }

      accumulator[problem_id] = {
        problem: _.omit(currSolution.problem, '_id'),
        solutions: {
          recent: incomingDate,
          ...solutionDetails
        }
      };

      return accumulator;
    },
    {
      difficulty_distribution: {
        Easy: 0,
        Medium: 0,
        Hard: 0
      }
    }
  );

  return cleanedSolutions;
}

export default {
  create,
  findAllFromUserId
};

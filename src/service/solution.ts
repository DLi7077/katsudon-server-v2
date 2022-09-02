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
      'alt="visual" style ="height:auto; max-width:100%;"'
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
    problem_id: updatedProblem._id,
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

function defaultQueryParams(queryParams: any): any {
  return {
    sortBy: 'problem_id',
    sortDir: 'asc',
    ...queryParams
  };
}

/**
 * @description sets the queryParams
 * @param {object} queryParams an object containing query keys and values
 */
function setQueryParams(queryParams: any, queryKeys: string[]): any {
  const validKeys = _.filter(queryKeys, (key: string) => {
    return !_.isUndefined(queryParams[key]);
  });

  const filterQuery = _.reduce(
    validKeys,
    (builtQuery: any, key: any) => {
      if (key === 'problem_id') {
        builtQuery[key] = parseInt(queryParams[key]) ?? 0;
        return builtQuery;
      }
      builtQuery[key] = queryParams[key];
      return builtQuery;
    },
    {}
  );

  return filterQuery;
}

function getUserSolutionQuery(queryParams: any): any[] {
  return [
    {
      $match: queryParams.user_id
        ? { user_id: new Types.ObjectId(queryParams.user_id) }
        : {}
    },
    { $sort: { created_at: -1 } },
    {
      $group: {
        _id: {
          problem: '$problem_id',
          language: '$solution_language'
        },
        solution: { $first: '$$ROOT' }
      }
    },
    // {
    //   $lookup: {
    //     from: 'problems',
    //     localField: 'solution.problem_id',
    //     foreignField: 'id',
    //     as: 'problem'
    //   }
    // },
    {
      $project: {
        _id: false,
        solution: true
        // problem: { $first: '$problem' }
      }
    }
  ];
}

function solutionProjectionQuery(): any {
  const solutionFields = [
    '_id',
    'user_id',
    'problem_id',
    'solution_language',
    'solution_code',
    'runtime_ms',
    'memory_usage_mb',
    'created_at'
  ];
  const problemFields = [];
  const projection = {
    _id: false,
    solution: true
  };
}

/**
 * @description
 * @param queryParams
 * @returns
 */
async function findAll(queryParams: any): Promise<any> {
  const validQueryKeys = ['user_id', 'problem_id', 'created_at'];

  const baseQuery = defaultQueryParams(queryParams);
  const { sortBy, sortDir } = baseQuery;

  const builtQuery = setQueryParams(baseQuery, validQueryKeys);

  console.log(builtQuery);
  const embeddedBuiltQuery = _.map(builtQuery, (value: any, key: string) => {
    if (key === 'user_id') {
      const userObjectId = new Types.ObjectId(builtQuery.user_id);
      return { [key]: userObjectId };
    }
    return { [key]: value };
  });

  console.log(embeddedBuiltQuery);

  const userSolutionsQuery = getUserSolutionQuery(queryParams);
  const result = await Models.Solution.aggregate([
    {
      $match: embeddedBuiltQuery.length ? { $and: embeddedBuiltQuery } : {}
    },
    ...userSolutionsQuery
  ]).then(async (res: any) => {
    return Models.User.populate(res, 'solution.user_id');
  });
  // .then((res: any[]) => {
  //   return _.groupBy(res, (solution: any) => {
  //     return _.get(solution, 'problem.id');
  //   });
  // });

  return {
    count: result.length,
    rows: result
  };
}

export default {
  create,
  findAll,
  findAllFromUserId
};

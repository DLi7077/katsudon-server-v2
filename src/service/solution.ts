/* eslint-disable camelcase */
import _ from 'lodash';
import { ObjectId, Types } from 'mongoose';
import getCodeLength from '../utils/CodeLength';
import Models from '../database';
import { SolutionAttributes } from '../database/models/Solution';
import { UserAttributes } from '../database/models/User';
import groupSolutionsByDate from '../utils/Problem';
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
    // deal with empty alt names and embed css
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
    solution_length: getCodeLength(_.get(attributes, 'solution_code')),
    problem_id: _.get(updatedProblem, '_id'),
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
 * @return {any} the updated base query params
 */
function validateQueryParams(queryParams: any, queryKeys: string[]): any {
  const validKeys = _.filter(queryKeys, (key: string) => {
    return !_.isUndefined(queryParams[key]);
  });

  return _.pick(queryParams, validKeys);
}

/**
 * @description Expands and validates the search params
 * @param {any} queryParams query params provided
 * @returns {any} the validated and updated search queries
 */
function getSortParams(queryParams: any[]): any {
  const sortMapping: any = {
    problem_id: 'problem.id',
    created_at: 'last_solved_at'
  };

  const baseQuery: any = defaultQueryParams(queryParams);
  if (sortMapping[baseQuery.sortBy]) {
    return {
      sortBy: sortMapping[baseQuery.sortBy],
      sortDir: baseQuery.sortDir
    };
  }

  return _.pick(queryParams, ['sortBy', 'sortDir']);
}

/**
 * @description Generates the solution lookup query
 * @returns {any[]} a list of aggregate functions
 */
function getUserSolutionQuery(): any[] {
  return [
    { $sort: { created_at: -1 } },
    {
      $set: {
        created_at: {
          $dateToString: {
            date: '$created_at',
            timezone: 'America/New_York'
          }
        }
      }
    },
    {
      $group: {
        _id: {
          user_id: '$user_id',
          problem: '$problem_id'
        },
        problem: { $first: '$problem_id' },
        solutions: {
          $push: '$$ROOT'
        }
      }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problem'
      }
    },
    { $unwind: '$problem' },
    {
      $project: {
        _id: false,
        problem: true,
        solutions: true
      }
    }
  ];
}

/**
 * @description Finds all solutions that match the query
 * @param {any} queryParams query params provided
 * @returns {Promise <any>} Promise of solutions
 */
async function findAll(queryParams: any): Promise<any> {
  const validQueryKeys = ['user_id', 'problem_id', 'created_at', 'tags'];

  const builtQuery = validateQueryParams(queryParams, validQueryKeys);
  const { sortBy, sortDir } = getSortParams(queryParams);

  // translate problem number to database id for filter if requested
  const problemNumber: Types.ObjectId = builtQuery.problem_id
    ? await Models.Problem.findOne({
        id: builtQuery.problem_id
      }).then((problem: any) => _.get(problem, '_id'))
    : null;

  const preQueryParams = _.map(
    _.omit(builtQuery, ['tags']),
    (value: any, key: string) => {
      let updatedQuery: any = value;
      if (key === 'user_id') {
        const userObjectId = new Types.ObjectId(builtQuery.user_id);
        updatedQuery = userObjectId;
      }
      if (key === 'problem_id') {
        updatedQuery = problemNumber;
      }

      return { [key]: updatedQuery };
    }
  );

  const postQueryParams = _.map(
    _.pick(builtQuery, ['tags']),
    (value: any, key: string) => {
      if (key === 'tags') {
        return { 'problem.tags': { $all: value } };
      }

      return { [key]: value };
    }
  );

  const userSolutionsQuery = getUserSolutionQuery();

  const userSolutions: any = await Models.Solution.aggregate([
    { $match: preQueryParams.length ? { $and: preQueryParams } : {} },
    ...userSolutionsQuery,
    { $match: postQueryParams.length ? { $and: postQueryParams } : {} }
  ]).then((solutions: any[]) => {
    const groupedSolutions = groupSolutionsByDate(solutions);
    return _.orderBy(groupedSolutions, [sortBy], [sortDir]);
  });

  return {
    count: userSolutions.length,
    rows: userSolutions
  };
}

/**
 * @description Finds weekly progress of current user and users they follow
 * @param {ObjectId} currentUserId ID of the current user
 * @returns {Promise<any>} Promise of weekly progress solutions
 */
async function weeklyProgress(currentUserId: ObjectId): Promise<any> {
  // no longer used, will be changed to past 7 days instead of current week

  // const currentYearWeek: number = computeTrueWeek();
  // const currentYear: number = new Date().getFullYear();
  // const matchWeek = {
  //   $expr: {
  //     $eq: [
  //       currentYearWeek,
  //       { $week: { date: '$created_at', timezone: 'America/New_York' } }
  //     ]
  //   }
  // };
  // const matchYear = {
  //   $expr: {
  //     $eq: [
  //       currentYear,
  //       { $year: { date: '$created_at', timezone: 'America/New_York' } }
  //     ]
  //   }
  // };

  // match all documents within previous N days
  function previousNdays(n: number): any {
    return {
      created_at: {
        $gte: new Date(new Date().getTime() - n * 24 * 60 * 60 * 1000)
      }
    };
  }

  const userFollowing: ObjectId[] = await Models.User.findById(
    currentUserId
  ).then((user: any) => [...user.following, currentUserId]);

  const RANDOM_USER_COUNT = 10;
  const randomUserIds: ObjectId[] = await Models.User.aggregate([
    { $match: { _id: { $nin: userFollowing } } },
    { $sample: { size: RANDOM_USER_COUNT } }
  ]).then((users: UserAttributes[]) => users.map((user) => _.get(user, '_id')));

  const weeklySolutions: any = await Models.Solution.aggregate([
    {
      $match: {
        $and: [
          { user_id: { $in: [...userFollowing, ...randomUserIds] } },
          previousNdays(7)
        ]
      }
    },
    {
      $sort: { created_at: -1 }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem_id',
        foreignField: '_id',
        as: 'problem'
      }
    },
    { $unwind: '$problem' },
    // group by user and problem
    {
      $group: {
        _id: { user_id: '$user_id', problem_id: '$problem.id' },
        solution: { $first: '$$ROOT' }
      }
    },
    {
      $project: {
        solution: true,
        weekday: {
          $add: [
            { $dayOfYear: '$solution.created_at' },
            { $multiply: [366, { $year: '$solution.created_at' }] }
          ]
        },
        date: {
          $dateToString: {
            date: '$solution.created_at',
            timezone: 'America/New_York'
          }
        }
      }
    },
    { $sort: { date: -1 } },
    // group by user and day
    {
      $group: {
        _id: {
          user_id: '$_id.user_id',
          weekday: '$weekday'
        },
        solutions: { $push: '$$ROOT' },
        date: { $first: '$date' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        user_id: '$user._id',
        username: '$user.username',
        profile_picture_url: '$user.profile_picture_url',
        _id: false,
        date: true,
        solutions: true
      }
    }
  ]);

  const weeklySolutionsByDate = _.chain(weeklySolutions)
    .map((userSolutions: any) => {
      const updatedSolutionDetails = userSolutions;
      // determine most recent date for each user
      updatedSolutionDetails.last_solved = _.reduce(
        updatedSolutionDetails.solutions,
        (mostRecentSolved: any, solutionDetail: any) => {
          const incomingDate = _.get(solutionDetail, 'solution.created_at');

          return !mostRecentSolved || incomingDate > mostRecentSolved
            ? incomingDate
            : mostRecentSolved;
        },
        null
      );

      updatedSolutionDetails.solutions = _.chain(
        updatedSolutionDetails.solutions
      )
        .map((solution) => _.omit(solution, '_id'))
        .orderBy(['solution.created_at'], ['desc']);

      return updatedSolutionDetails;
    })
    .orderBy(['last_solved'], ['desc'])
    .value();

  return {
    count: weeklySolutionsByDate.length,
    rows: weeklySolutionsByDate
  };
}

export default {
  create,
  findAll,
  findAllFromUserId,
  weeklyProgress
};

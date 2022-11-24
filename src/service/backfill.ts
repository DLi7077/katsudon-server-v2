/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import async from 'async';
import _ from 'lodash';
import getCodeLength from '../utils/CodeLength';
import Models from '../database';
import { SolutionAttributes } from '../database/models/Solution';

async function addProblemIDtoSolutions() {
  while (true) {
    const allSolutions = await Models.Solution.aggregate([
      { $match: { problem_id: { $type: 'number' } } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problem_id',
          foreignField: 'id',
          as: 'problem'
        }
      },
      {
        $project: {
          _id: true,
          problem: { $first: '$problem' }
        }
      },
      { $limit: 10 }
    ]);

    if (allSolutions.length === 0) break;
    const appendFieldTasks = _.map(
      allSolutions,
      (solution) => async (next: any) => {
        const solutionId = solution._id;
        const problemId = solution.problem._id;
        console.log('updated and linked to ', solution.problem.title);

        await Models.Solution.findByIdAndUpdate(
          solutionId,
          {
            problem_id: problemId
          },
          { upsert: true }
        ).catch(next);

        return next();
      }
    );

    await async.parallelLimit(appendFieldTasks, 10);
  }

  return {
    msg: 'done'
  };
}

/**
 * Back fill to add solution length field
 */
async function addCodeLengthFieldToSolution() {
  while (true) {
    const allSolutions = await Models.Solution.find({
      solution_length: null
    })
      .limit(10)
      .then((solutions: SolutionAttributes[]) =>
        _.map(solutions, (solution) => ({
          solution_id: _.get(solution, '_id'),
          solution_length: getCodeLength(_.get(solution, 'solution_code'))
        }))
      );

    if (allSolutions.length === 0) break;

    const addFieldTasks = _.map(
      allSolutions,
      (updatedSolutions) => async (next: any) => {
        const { solution_id, solution_length } = updatedSolutions;
        await Models.Solution.findByIdAndUpdate(
          solution_id,
          { solution_length },
          { upsert: true }
        )
          .then((updatedSolution: SolutionAttributes | null) => {
            console.log(
              `updated ${_.get(updatedSolution, 'user_id')}'s solution`
            );
          })
          .catch(next);
      }
    );

    async.parallelLimit(addFieldTasks, 10);
  }

  const missedDocuments = await Models.Solution.find({
    solution_length: null
  });

  return {
    missed_documents: missedDocuments
  };
}

export default {
  addProblemIDtoSolutions,
  addCodeLengthFieldToSolution
};

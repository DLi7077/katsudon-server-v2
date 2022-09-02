/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import async from 'async';
import _ from 'lodash';
import Models from '../database';

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

export default {
  addProblemIDtoSolutions
};

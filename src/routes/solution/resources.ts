/* eslint-disable camelcase */
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { ObjectId } from 'mongoose';
import SolutionService from '../../service/solution';
import SolutionPresenter from '../../presenters/solution';
import UserService from '../../service/user';
import ProblemService from '../../service/problem';
import Models from '../../database';

/**
 * @description Creates a solution
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function createSolution(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // start transaction - create solution and problem
  // add solution to user's solved list
  const session = await Models.mongoose.startSession();
  session.startTransaction();

  try {
    const { problem, solution } = await SolutionService.create(req.body)
      .then((result: any) => {
        req.body.solution = result.solution.toJSON();
        return result;
      })
      .catch(next);

    const solver_id = _.get(solution, 'user_id');
    const problem_id = _.get(problem, '_id');

    await UserService.addProblemToSolved(solver_id, problem_id).catch(next);
    await ProblemService.addSolver(problem_id, solver_id).catch(next);

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return next(err);
  }

  return next();
}

/**
 * @description finds all solutions from a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @param {ObjectId} userId
 * @returns {Promise<void>} Returns next function to execute
 */
export async function findAllSolutionsFromUserId(
  req: Request,
  res: Response,
  next: NextFunction,
  userId: ObjectId
): Promise<void> {
  await UserService.findById(userId).catch(next);

  await SolutionService.findAllFromUserId(userId)
    .then((result: any) => {
      req.body = result;
    })
    .catch(next);

  return next();
}

/**
 * @description Presents a solution
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @returns {void}
 */
export function present(req: Request, res: Response): void {
  res.status(200);
  res.json({
    solution: SolutionPresenter.present(req.body.solution)
  });
}

export function presentAll(req: Request, res: Response): void {
  res.status(200);
  res.json({ ...req.body });
}

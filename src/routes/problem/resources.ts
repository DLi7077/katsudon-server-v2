/* eslint-disable camelcase */
import { Request, Response, NextFunction } from 'express';
import ProblemService from '../../service/problem';
import ProblemPresenter from '../../presenters/problem';

/**
 * @description Creates a problem
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function createProblem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await ProblemService.create(req.body)
    .then((problem: any) => {
      req.body.problem = problem;
    })
    .catch(next);

  return next();
}

export async function findById(
  req: Request,
  res: Response,
  next: NextFunction,
  problemId: number
): Promise<any> {
  await ProblemService.findById(problemId)
    .then((problem: any) => {
      req.body.problem = problem;
    })
    .catch(next);

  return next();
}

/**
 * @description finds all problems that satisfy a query
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {void} Returns next function to execute
 */
export async function findProblems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await ProblemService.findAll(req.query)
    .then((problems: any) => {
      req.body.count = problems.count;
      req.body.rows = problems.rows;
    })
    .catch(next);

  return next();
}

export function present(req: Request, res: Response): void {
  res.status(200);
  res.json({
    problem: ProblemPresenter.present(req.body.problem),
  });
}

export function presentAll(req: Request, res: Response): void {
  res.status(200);
  res.json({
    count: req.body.count,
    problems: ProblemPresenter.presentAll(req.body.rows),
  });
}

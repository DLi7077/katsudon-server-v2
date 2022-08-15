import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import SolutionService from "../../service/solution";
import SolutionPresenter from "../../presenters/solution";

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
  await SolutionService.create(req.body)
    .then((solution: any) => {
      req.body.solution = solution.toJSON();
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
    solution: SolutionPresenter.present(req.body.solution),
  });
}

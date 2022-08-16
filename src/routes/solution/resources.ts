import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import SolutionService from "../../service/solution";
import SolutionPresenter from "../../presenters/solution";
import UserService from "../../service/user";
import Models from "../../database";

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
  //start transaction - create solution and problem
  //add solution to user's solved list
  const session = await Models.mongoose.startSession();
  session.startTransaction();

  try {
    const createdSolution = await SolutionService.create(req.body)
      .then((solution: any) => {
        req.body.solution = solution.toJSON();
        return solution;
      })
      .catch(next);

    const solver_id = _.get(createdSolution, "user_id");
    const question_id = _.get(createdSolution, "problem_id");
    await UserService.addProblemToSolved(solver_id, question_id);

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

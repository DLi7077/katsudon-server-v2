import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import githubService from "../../service/github";
import githubPresenter from "../../presenters/github";

/**
 * @description Gets all the files in a github repositiory, then converts kebab-case to Title Case
 * @param {Request} req - HTTP Request Object
 * @param {Response} res - HTTP Response Object
 * @param {NextFunction} next - callback to the next route function
 */
export async function getRepositoryContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { name, repository }: any = req.query;
  await githubService
    .getRepositoryContent(name, repository)
    .then((result: any) => {
      req.body.count = result.count;
      req.body.rows = result.rows;
    })
    .catch(next);
  return next();
}

/**
 * @description Gets the code solution from a repository and file
 * @param {Request} req - HTTP Request Object
 * @param {Response} res - HTTP Response Object
 */
export async function getSolutions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { url } = req.query;
  await githubService
    .getSolutions(url)
    .then((result: any) => {
      req.body.count = result.count;
      req.body.rows = result.rows;
    })
    .catch(next);

  return next();
}

export function presentFiles(req: Request, res: Response) {
  res.status(200);
  res.json({
    count: req.body.count,
    rows: githubPresenter.presentAll(req.body.rows),
  });
}

import { Request, Response } from "express";
import _ from "lodash";
import githubService from "../../service/github";

/**
 * @description Gets all the files in a github repositiory, then converts kebab-case to Title Case
 * @param {Request} req - HTTP Request Object
 * @param {Response} res - HTTP Response Object
 */
export async function getRepositoryFiles(
  req: Request,
  res: Response
): Promise<any> {
  const repository: any = _.get(req.query, "repository") ?? "";
  await githubService
    .getRepositoryFiles(repository)
    .then((result: any) => {
      res.status(200);
      res.json({
        ...result,
      });
    })
    .catch(() => {
      res.status(404);
      res.json({
        error: "unknown repository",
        count: 0,
        rows: [],
      });
    });
}

/**
 * @description Gets the code solution from a repository and file
 * @param {Request} req - HTTP Request Object
 * @param {Response} res - HTTP Response Object
 */
export async function getSolution(req: Request, res: Response): Promise<any> {
  const repository: any = _.get(req.query, "repository");
  const fileName: any = _.get(req.query, "file_name");
  await githubService
    .getSolution(repository, fileName)
    .then((result: any) => {
      res.status(200);
      res.json({ solution: result.data });
    })
    .catch(() => {
      res.status(404);
      res.json({
        error: `unknown repository or file. Be sure to have 'repository' and 'file_name' as Query Params`,
        count: 0,
        rows: [],
      });
    });

}

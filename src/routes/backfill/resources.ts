/* eslint-disable camelcase */
import { Request, Response, NextFunction } from 'express';
import BackfillService from '../../service/backfill';

/**
 * @description Creates a problem
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function backfillProblemID(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await BackfillService.addProblemIDtoSolutions()
    .then((result: any) => {
      res.status(200);
      res.json(result);
    })
    .catch(() => {
      console.log('something went wrong');
    });
}

/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import BackfillService from '../../service/backfill';

/**
 * @description updates problem id
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @returns {Promise<void>} Returns next function to execute
 */
export async function backfillProblemID(
  req: Request,
  res: Response
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

/**
 * @description Creates a problem
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @returns {Promise<void>} Returns next function to execute
 */
export async function backfillSolutionLength(
  req: Request,
  res: Response
): Promise<void> {
  await BackfillService.addCodeLengthFieldToSolution()
    .then((result: any) => {
      res.status(200);
      res.json(result);
    })
    .catch(() => {
      console.log('something went wrong');
    });
}

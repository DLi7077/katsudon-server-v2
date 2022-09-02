/* eslint-disable camelcase  */
/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import {
  ConflictResponse,
  NotFoundResponse
} from 'http-errors-response-ts/lib';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import UserService from '../../service/user';
import UserPresenter from '../../presenters/user';
import Models from '../../database';

// -----------------POST----------------------
/**
 * @description Creates a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const existingEmail = await UserService.findByEmail(req.body.email);
  if (existingEmail) {
    const error = new ConflictResponse(
      'This email already has an associated account'
    );
    return next(error);
  }

  await UserService.create(req.body)
    .then((user: any) => {
      req.body = user;
    })
    .catch(next);

  return next();
}

/**
 * @description Updates a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user_id = req.body._id;
  if (!user_id) {
    const error = new ConflictResponse('No _id detected');
    return next(error);
  }
  await UserService.update(req.body)
    .then((user: any) => {
      req.body = user;
    })
    .catch(next);

  return next();
}

/**
 * @description Follows a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function followUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { follower } = req.body;
  const { following } = req.body;

  const followerModel = await UserService.findById(follower);
  const followingModel = await UserService.findById(following);

  const userNotFound = (user_id: any) => {
    const error = new NotFoundResponse(`${user_id} does not exist`);
    return error;
  };

  if (!followerModel) {
    return next(userNotFound(follower));
  }
  if (!followingModel) {
    return next(userNotFound(following));
  }

  await UserService.follow(req.body)
    .then((users: any) => {
      req.body.message = `${users[0].username} followed ${users[1].username}`;
      req.body.count = users.length;
      req.body.rows = users;
    })
    .catch(next);

  return next();
}

/**
 * @description Follows a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function unfollowUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { follower } = req.body;
  const { following } = req.body;

  const followerModel = await UserService.findById(follower);
  const followingModel = await UserService.findById(following);

  const userNotFound = (user_id: any) => {
    const error = new NotFoundResponse(`${user_id} does not exist`);
    return error;
  };

  if (!followerModel) {
    return next(userNotFound(follower));
  }
  if (!followingModel) {
    return next(userNotFound(following));
  }

  await UserService.unfollow(req.body)
    .then((users: any) => {
      req.body.message = `${users[0].username} unfollowed ${users[1].username}`;
      req.body.count = users.length;
      req.body.rows = users;
    })
    .catch(next);

  return next();
}

/**
 * @description logs in user using email and password
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const email: any = _.get(req.body, 'email');
  const user: any = await UserService.findByEmail(email).catch(next);

  const incoming_password: any = _.get(req.body, 'password');
  const expected_password: any = _.get(user, 'password');

  bcrypt.compare(incoming_password, expected_password, (err, result) => {
    if (err || !result) {
      req.body = {
        status: 'incorrect password',
        user_id: null
      };
      return next(err);
    }
    req.body = {
      status: 'Successfully logged in!',
      user
    };

    return next();
  });
}

// --------------------GET---------------------
/**
 * @description Finds a user's profile info by username
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function findUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
  username: string
): Promise<void> {
  const userExists = await Models.User.exists({ username });
  if (!userExists) {
    const error = new NotFoundResponse(`${username} is not a user`);
    return next(error);
  }
  await UserService.publicProfile(username)
    .then((result: any) => {
      req.body = result;
    })
    .catch(next);

  return next();
}

/**
 * @description Finds a user by email
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function findUserByEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const email: any = _.get(req.query, 'email') ?? '';
  const foundUser = await UserService.findByEmail(email).catch(next);
  if (!foundUser) {
    const noUserError = new NotFoundResponse('No associated account');
    return next(noUserError);
  }
  req.body = foundUser;

  return next();
}

/**
 * @description Finds a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @param {NextFunction} next - callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function findAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await UserService.findAll({})
    .then((users: any[]) => {
      req.body = users;
    })
    .catch(next);

  return next();
}

/**
 * @description Presents a user
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @returns {void} present
 */
export function presentUser(req: Request, res: Response): void {
  res.status(200);
  res.json({
    user: UserPresenter.presentProfile(req.body)
  });
}

/**
 * @description Presents users
 * @param {Request} req - the HTTP request object
 * @param {Response} res - the HTTP response object
 * @returns {void} present
 */
export function presentAll(req: Request, res: Response): void {
  res.status(200);
  res.json({
    message: req.body.message ?? '',
    count: req.body.count,
    users: UserPresenter.presentAll(req.body.rows)
  });
}

export function presentLogin(req: Request, res: Response): void {
  res.status(200);
  res.json({
    user: UserPresenter.present(req.body.user)
  });
}

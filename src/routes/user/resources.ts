/* eslint-disable camelcase  */
/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';
import {
  ConflictResponse,
  NotFoundResponse
} from 'http-errors-response-ts/lib';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import UserService from '../../service/user';
import UserPresenter from '../../presenters/user';
import Models from '../../database';
import { UserLoginAttribute } from '../../types/Interface';
import storage from '../../utils/GoogleCloudStorage';
dotenv.config();
// -----------------POST----------------------

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
  const user: any = await UserService.findByEmail(email).catch(console.error);
  const userExists = await Models.User.exists({ email });
  if (!userExists) {
    res.status(401).send('User not found');
    return;
  }

  const incoming_password: any = _.get(req.body, 'password');
  const expected_password: any = _.get(user, 'password');

  bcrypt.compare(incoming_password, expected_password, (err, result) => {
    if (err || !result) {
      res.status(401).send('Incorrect Password');
      return;
    }

    const userObject: UserLoginAttribute = _.pick(req.body, [
      'email',
      'password'
    ]);

    const accessToken = jwt.sign(userObject, process.env.AUTH_SECRET ?? '');

    req.body = {
      status: 'Successfully logged in!',
      access_token: accessToken,
      email
    };

    req.headers.authorization = `Bearer ${accessToken}`;

    next();
  });
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) ?? '';

  if (!token) {
    res.status(401).send('Forbidden');
    return;
  }

  // verify user, if verfied, provide the current user attributes
  jwt.verify(token, process.env.AUTH_SECRET ?? '', async (err, user) => {
    if (err) {
      res.status(403).send('Invalid Token');
      return;
    }

    const userEmail = _.get(user, 'email');
    const foundUser = await UserService.findByEmail(userEmail);

    if (!foundUser) {
      res.status(404).send('No user found with associated email');
      return;
    }

    req.currentUser = foundUser;
    next();
  });
}

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
  const currentUserId: any = _.get(req.currentUser, '_id');
  const toFollowId: any = _.get(req.body, 'follow');

  const toFollowExists = await Models.User.exists({ _id: toFollowId })
    .then((exists) => exists)
    .catch(() => false);

  const userNotFound = (user_id: any) => {
    const error = new NotFoundResponse(`${user_id} does not exist`);
    return error;
  };

  if (!toFollowExists) return next(userNotFound(toFollowId));

  await UserService.follow(currentUserId, toFollowId)
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
  const currentUserId: any = _.get(req.currentUser, '_id');
  const toUnfollowId: any = _.get(req.body, 'unfollow') ?? '';

  const toUnfollowExists = await Models.User.exists({ _id: toUnfollowId })
    .then((exists) => exists)
    .catch(() => false);

  const userNotFound = (user_id: any) => {
    const error = new NotFoundResponse(`${user_id} does not exist`);
    return error;
  };

  if (!toUnfollowExists) {
    return next(userNotFound(toUnfollowId));
  }

  await UserService.unfollow(currentUserId, toUnfollowId)
    .then((users: any) => {
      req.body.message = `${users[0].username} unfollowed ${users[1].username}`;
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
export async function editBiography(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await UserService.editBiography(
    _.get(req.currentUser, '_id') as any,
    _.get(req.body, 'biography')
  )
    .then((user: any) => {
      req.body = user;
    })
    .catch(next);

  return next();
}

/**
 * @description Uploads profile picture to google cloud
 */
export async function uploadProfilePicture(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file: any = req.file;
  if (!file) {
    res.status(404);
    res.send('No file found');
    return;
  }

  const baseUrl =
    'https://storage.cloud.google.com/katsudon-assets/user-profiles';

  const currentUserId: any = _.get(req.currentUser, '_id');

  await storage
    .bucket('katsudon-assets')
    .file(`user-profiles/${currentUserId}/pfp.jpg`)
    .save(file.buffer, {
      metadata: { cacheControl: 'no-cache' }
    })
    .then(async () => {
      const updatedProfileUrl = `${baseUrl}/${currentUserId}/pfp.jpg`;

      await UserService.updateProfilePicture(
        currentUserId,
        updatedProfileUrl
      ).then((updatedUser) => {
        req.body = updatedUser;
      });
    })
    .catch(console.error);

  return next();
}

/**
 * @description Uploads profile picture to google cloud
 */
export async function uploadProfileBanner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const file: any = req.file;
  if (!file) {
    res.status(404);
    res.send('No file found');
    return;
  }

  const baseUrl =
    'https://storage.cloud.google.com/katsudon-assets/user-profiles';

  const currentUserId: any = _.get(req.currentUser, '_id');

  await storage
    .bucket('katsudon-assets')
    .file(`user-profiles/${currentUserId}/banner.jpg`)
    .save(file.buffer, {
      metadata: { cacheControl: 'no-cache' }
    })
    .then(async () => {
      const updatedProfileUrl = `${baseUrl}/${currentUserId}/banner.jpg`;

      await UserService.updateProfileBanner(
        currentUserId,
        updatedProfileUrl
      ).then((updatedUser) => {
        req.body = updatedUser;
      });
    })
    .catch(console.error);

  return next();
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
  next: NextFunction
): Promise<void> {
  const userExists = await Models.User.exists(req.query);
  if (!userExists) {
    const error = new NotFoundResponse(`No user found`);
    return next(error);
  }
  await UserService.publicProfile(req.query)
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
    user: UserPresenter.present(req.body)
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
    ...req.body,
    currentUser: _.omit(req.currentUser.toJSON(), 'password')
  });
}

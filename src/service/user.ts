/* eslint-disable camelcase */
import _ from 'lodash';
import { ObjectId } from 'mongoose';
import { NotFoundResponse } from 'http-errors-response-ts/lib';
import Models from '../database';
import { UserAttributes } from '../database/models/User';
import Auth from '../utils/Auth';

/**
 * @description Creates a new user
 * @param {UserAttributes} attributes - Attributes containing a password
 * @returns {Promise<any>} Promise of a created document
 */
async function create(attributes: UserAttributes): Promise<any> {
  const hashedPassword = await Auth.hashPassword(attributes.password);

  return Models.User.create({
    ...attributes,
    password: hashedPassword,
    followers: [],
    following: [],
    verified: false,
    created_at: new Date()
  });
}

/**
 * @description updates User fields
 * @param {UserAttributes} attributes - The fields to update with
 * @returns {Promise<any>} Promise of an updated document
 */
async function update(attributes: UserAttributes): Promise<any> {
  const { _id } = attributes;

  const updateAttributes = {
    ..._.omit(attributes, '_id'),
    updated_at: new Date()
  };

  return Models.User.findByIdAndUpdate({ _id }, updateAttributes, {
    runValidators: true,
    new: true
  });
}

/**
 * @description updates follow list for users due to a follow
 * @param {UserAttributes} attributes - The fields to update with
 * @returns {Promise<any>} Promise of an updated document
 */
async function follow(attributes: UserAttributes): Promise<any> {
  const follower = _.get(attributes, 'follower');
  const following = _.get(attributes, 'following');
  // safety logic, prevent follow if already following
  // add following to following list
  // add follower to follower list
  const follow_success = await Models.User.findByIdAndUpdate(
    { _id: follower },
    { $addToSet: { following } },
    { new: true, upsert: true }
  )
    .then(async (addedFollowing: any) => {
      const addedToFollowers = await Models.User.findByIdAndUpdate(
        { _id: following },
        { $addToSet: { followers: follower } },
        { new: true, upsert: true }
      );

      return [addedFollowing, addedToFollowers];
    })
    .catch();

  return follow_success;
}

/**
 * @description updates follow list for users due to a follow
 * @param {UserAttributes} attributes - The fields to update with
 * @returns {Promise<any>} Promise of an updated document
 */
async function unfollow(attributes: UserAttributes): Promise<any> {
  const follower = _.get(attributes, 'follower');
  const following = _.get(attributes, 'following');

  // safety logic, prevent follow if already following
  // add following to following list
  // add follower to follower list
  const unfollow_success = await Models.User.findByIdAndUpdate(
    { _id: follower },
    { $pull: { following } },
    { new: true, upsert: true }
  )
    .then(async (addedFollowing: any) => {
      const addedToFollowers = await Models.User.findByIdAndUpdate(
        { _id: following },
        { $pull: { followers: follower } },
        { new: true, upsert: true }
      );

      return [addedFollowing, addedToFollowers];
    })
    .catch();

  return unfollow_success;
}

async function addProblemToSolved(
  user_id: ObjectId,
  problem_id: ObjectId
): Promise<any> {
  const problemExists = await Models.Problem.exists(problem_id);
  if (!problemExists) {
    return new NotFoundResponse(`problem #${problem_id} does not exist`);
  }

  return Models.User.findByIdAndUpdate(
    { _id: user_id },
    { $addToSet: { solved: problem_id } }
  );
}

/**
 * @description generates details for a user's public profile
 * @param {any} queryParams querys to filter for a user
 * @return {any} the user's details
 */
async function publicProfile(queryParams: any): Promise<any> {
  const validKeys = ['user_id', 'username'];

  const compiledQuery = _.reduce(
    _.pick(queryParams, validKeys),
    (accumulator: any, value: any, key: string) => {
      if (key === 'user_id') {
        return { _id: value };
      }
      accumulator[key] = value;
      return accumulator;
    },
    {}
  );

  const userDetails = await Models.User.findOne({
    ...compiledQuery
  })
    .populate({ path: 'solved' })
    .populate({
      path: 'following',
      select: ['username', 'profile_picture_url']
    });

  return userDetails;
}

/**
 * @description finds a user by email
 * @param {string} email - The email to look for
 * @returns {Promise<any>} Promise of a user document
 */
async function findByEmail(email: string): Promise<any> {
  return Models.User.findOne({ email, deleted_at: null });
}

async function findById(user_id: ObjectId): Promise<any> {
  return Models.User.findOne({ _id: user_id });
}

/**
 * @description finds all users that match a  a user by email
 * @param {any} queryParams - queries to filter by
 * @returns {Promise<any>} Promise of a user document
 */
async function findAll(queryParams: any): Promise<any> {
  const users = await Models.User.find(queryParams);

  return {
    count: users.length,
    rows: users
  };
}

export default {
  create,
  update,
  follow,
  unfollow,
  addProblemToSolved,
  publicProfile,
  findByEmail,
  findById,
  findAll
};

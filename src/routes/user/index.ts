import express from 'express';
import {
  createUser,
  updateUser,
  followUser,
  unfollowUser,
  login,
  findUserProfile,
  findUserByEmail,
  findAllUsers,
  presentUser,
  presentAll,
  presentLogin
} from './resources';

const router = express.Router();

router.get('/all', findAllUsers, presentAll);
router.get('/profile', findUserProfile, presentUser);
router.get('/find-by-email', findUserByEmail, presentUser);

router.post('/login', login, presentLogin);
router.post('/create', createUser, presentUser);
router.post('/update', updateUser, presentUser);
router.post('/follow', followUser, presentAll);
router.post('/unfollow', unfollowUser, presentAll);

export default router;

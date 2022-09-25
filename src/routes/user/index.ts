import express from 'express';
import {
  createUser,
  followUser,
  unfollowUser,
  login,
  authenticateToken,
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

router.post('/login', login, authenticateToken, presentLogin);
router.post('/create', createUser, presentUser);
router.post('/follow', authenticateToken, followUser, presentAll);
router.post('/unfollow', authenticateToken, unfollowUser, presentAll);

export default router;

import express from 'express';
import Multer from 'multer';
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
  presentLogin,
  editBiography,
  uploadProfilePicture,
  uploadProfileBanner
} from './resources';

const router = express.Router();

const MB = 1024 * 1024;

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 5 * MB }
});

router.get('/all', findAllUsers, presentAll);
router.get('/profile', findUserProfile, presentUser);
router.get('/find-by-email', findUserByEmail, presentUser);

router.post('/create', createUser, presentUser);
router.post('/login', login, authenticateToken, presentLogin);
router.post('/follow', authenticateToken, followUser, presentAll);
router.post('/unfollow', authenticateToken, unfollowUser, presentAll);
router.post('/edit-bio', authenticateToken, editBiography, presentUser);
router.post(
  '/upload-pfp',
  authenticateToken,
  multer.single('imgfile'),
  uploadProfilePicture,
  presentUser
);

router.post(
  '/upload-banner',
  authenticateToken,
  multer.single('imgfile'),
  uploadProfileBanner,
  presentUser
);

export default router;

import express from "express";
import {
  createUser,
  updateUser,
  followUser,
  unfollowUser,
  findUserByEmail,
  findAllUsers,
  presentUser,
  presentAll,
} from "./resources";

const router = express.Router();

router.get("/find-by-email", findUserByEmail, presentUser);
router.get("/all", findAllUsers, presentAll);

router.post("/create", createUser, presentUser);
router.post("/update", updateUser, presentUser);
router.post("/follow", followUser, presentAll);
router.post("/unfollow", unfollowUser, presentAll);

export default router;

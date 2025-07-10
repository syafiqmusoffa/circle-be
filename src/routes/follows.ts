import express from "express";
import { followUser, getFollowers, getFollowing, unfollowUser } from "../controllers/follows";
import { authenticate } from "../midlewares/Auth";

const router = express.Router();

router.get("/following", authenticate, getFollowing)
router.get("/follower", authenticate, getFollowers)
router.post("/follow", authenticate, followUser);
router.delete("/unfollow", authenticate, unfollowUser);

export {router as routerFollows}
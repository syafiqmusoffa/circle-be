import express from "express";
import { getLikeThread, likeThread, unLike } from "../controllers/like";
import { authenticate } from "../midlewares/Auth";

const router = express.Router();

router.post("/like", authenticate, likeThread);
router.delete("/unlike", authenticate, unLike);
router.get("/postLike", authenticate, getLikeThread);

export { router as routerLikes };

import express from "express";
import {
  getMyProfile,
  getProfiles,
  getUserProfile,
  updateProfiles,
  updateUsername,
} from "../controllers/profile";
import { authenticate } from "../midlewares/Auth";
import upload from "../midlewares/upload";

const router = express.Router();

router.get("/profiles", authenticate,getProfiles);
router.get("/my-profile", authenticate, getMyProfile);
router.get("/user-profile/:username", authenticate, getUserProfile);

router.put(
  "/update-profile",
  authenticate,
  upload.fields([
    { name: "avatarUrl", maxCount: 1 },
    { name: "backgroundUrl", maxCount: 1 },
  ]),
  updateProfiles
);
router.patch("/username/:id", updateUsername);

export { router as profileRoutes };

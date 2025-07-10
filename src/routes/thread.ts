import express, { RequestHandler } from "express";
import {
  addThread,
  
  deletedThread,
  
  editThread,
  
  getThreadById,
  
  getThreads,
  myThread,
  OtherThread,
} from "../controllers/thread";
import { authenticate } from "../midlewares/Auth";
import upload from "../midlewares/upload";
// import upload from "../utils/multer";
// import { uploadImage } from "../utils/multer";

const router = express.Router();

router.get("/threads",authenticate, getThreads);
router.get("/my-threads", authenticate, myThread);
router.get("/user-thread/:username", authenticate, OtherThread);
router.get("/thread/:id", authenticate, getThreadById);
router.delete("/delete-thread/:id", authenticate, deletedThread);
router.post("/thread", authenticate, upload.single("imageUrl"), addThread);
router.put("/edit-thread/:id", authenticate, upload.single("imageUrl"), editThread);

export { router as threadRoute };

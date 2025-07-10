import express from "express";
import { addComment, deleteComment, editComment, getComments } from "../controllers/comment";
import { authenticate } from "../midlewares/Auth";

const router = express.Router()

router.get("/comments/:id", authenticate, getComments)
router.post("/reply/:id", authenticate, addComment )
router.patch("/update-reply/:id", authenticate, editComment )
router.delete("/delete-reply/:id", authenticate, deleteComment )

export {router as routerComments}

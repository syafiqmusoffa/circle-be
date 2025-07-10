import { Router } from "express";
import {
  deleteUser,
  editEmailUser,
  editPasswordUser,
  getSuggestedUsers,
  getUser,
  getUserById,
} from "../controllers/user";
import { authenticate } from "../midlewares/Auth";
import { searchUser } from "../controllers/profile";

const router = Router();

router.get("/user/:id", getUserById);
router.patch("/useremail/:id", editEmailUser);
router.patch("/userpassword/:id", editPasswordUser);
router.get("/users", authenticate,getUser);
router.get("/suggested", authenticate, getSuggestedUsers);
router.delete("/delete/:id", deleteUser);
router.get("/search", authenticate,  searchUser);


export default router;

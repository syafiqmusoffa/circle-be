import express from "express";
import { getMe, handleLogin, handleRegister, requestReset, resetPassword } from "../controllers/auth";
import { authenticate } from "../midlewares/Auth";


const router = express.Router();

router.post("/register", handleRegister)
router.post("/request-reset", requestReset);
router.post("/reset-password", resetPassword);
router.post("/login", handleLogin)
router.get("/me", authenticate, (req, res)=>{res.json({message: "Aman broo"})})
router.get("/api/me", authenticate,getMe)

export {router as AuthRouter}
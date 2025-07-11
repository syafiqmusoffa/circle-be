"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const Auth_1 = require("../midlewares/Auth");
const router = express_1.default.Router();
exports.AuthRouter = router;
router.post("/register", auth_1.handleRegister);
router.post("/request-reset", auth_1.requestReset);
router.post("/reset-password", auth_1.resetPassword);
router.post("/login", auth_1.handleLogin);
router.get("/me", Auth_1.authenticate, (req, res) => { res.json({ message: "Aman broo" }); });
router.get("/api/me", Auth_1.authenticate, auth_1.getMe);

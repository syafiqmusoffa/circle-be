"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerLikes = void 0;
const express_1 = __importDefault(require("express"));
const like_1 = require("../controllers/like");
const Auth_1 = require("../midlewares/Auth");
const router = express_1.default.Router();
exports.routerLikes = router;
router.post("/like", Auth_1.authenticate, like_1.likeThread);
router.delete("/unlike", Auth_1.authenticate, like_1.unLike);
router.get("/postLike", Auth_1.authenticate, like_1.getLikeThread);

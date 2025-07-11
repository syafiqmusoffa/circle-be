"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerFollows = void 0;
const express_1 = __importDefault(require("express"));
const follows_1 = require("../controllers/follows");
const Auth_1 = require("../midlewares/Auth");
const router = express_1.default.Router();
exports.routerFollows = router;
router.get("/following", Auth_1.authenticate, follows_1.getFollowing);
router.get("/follower", Auth_1.authenticate, follows_1.getFollowers);
router.post("/follow", Auth_1.authenticate, follows_1.followUser);
router.delete("/unfollow", Auth_1.authenticate, follows_1.unfollowUser);

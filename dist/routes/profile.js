"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const express_1 = __importDefault(require("express"));
const profile_1 = require("../controllers/profile");
const Auth_1 = require("../midlewares/Auth");
const upload_1 = __importDefault(require("../midlewares/upload"));
const router = express_1.default.Router();
exports.profileRoutes = router;
router.get("/profiles", Auth_1.authenticate, profile_1.getProfiles);
router.get("/my-profile", Auth_1.authenticate, profile_1.getMyProfile);
router.get("/user-profile/:username", Auth_1.authenticate, profile_1.getUserProfile);
router.put("/update-profile", Auth_1.authenticate, upload_1.default.fields([
    { name: "avatarUrl", maxCount: 1 },
    { name: "backgroundUrl", maxCount: 1 },
]), profile_1.updateProfiles);
router.patch("/username/:id", profile_1.updateUsername);

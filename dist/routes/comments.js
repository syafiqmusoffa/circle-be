"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerComments = void 0;
const express_1 = __importDefault(require("express"));
const comment_1 = require("../controllers/comment");
const Auth_1 = require("../midlewares/Auth");
const router = express_1.default.Router();
exports.routerComments = router;
router.get("/comments/:id", Auth_1.authenticate, comment_1.getComments);
router.post("/reply/:id", Auth_1.authenticate, comment_1.addComment);
router.patch("/update-reply/:id", Auth_1.authenticate, comment_1.editComment);
router.delete("/delete-reply/:id", Auth_1.authenticate, comment_1.deleteComment);

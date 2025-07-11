"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikeThread = exports.unLike = exports.likeThread = void 0;
const client_1 = require("../prisma/client");
const likeThread = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const userId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { postId } = req.body;
        const existingLike = yield client_1.prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId, userId
                }
            },
        });
        if (existingLike) {
            res.status(400).json({ message: "You already liked this thread." });
            return;
        }
        const like = yield client_1.prisma.postLike.create({ data: { userId, postId } });
        res.status(200).json({ message: "Successfully like thread.", like });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to like thread", error });
    }
});
exports.likeThread = likeThread;
const unLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const userId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { postId } = req.body;
        const data = yield client_1.prisma.postLike.delete({
            where: {
                postId_userId: { postId, userId }
            },
        });
        res.status(200).json({ message: "Successfully unlike thread", data });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to unlike thread", error });
    }
});
exports.unLike = unLike;
const getLikeThread = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const userId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const postId = req.body;
        const thread = yield client_1.prisma.post.findMany({
            where: { authorId: userId }
        });
        res.status(200).json(thread);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getLikeThread = getLikeThread;

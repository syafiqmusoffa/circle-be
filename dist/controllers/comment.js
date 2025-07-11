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
exports.getComments = void 0;
exports.addComment = addComment;
exports.editComment = editComment;
exports.deleteComment = deleteComment;
const client_1 = require("../prisma/client");
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const authorId = user === null || user === void 0 ? void 0 : user.id;
    if (!authorId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
    }
    try {
        const commentById = yield client_1.prisma.comment.findMany({
            where: { postId },
            include: {
                author: { select: { profile: true } },
            }, orderBy: { createdAt: "desc" }
        });
        res.status(200).json(commentById);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getComments = getComments;
function addComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            const postId = parseInt(req.params.id);
            const { content } = req.body;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const post = yield client_1.prisma.post.findUnique({ where: { id: postId } });
            if (!post) {
                res.status(404).json({ message: "thread not found" });
                return;
            }
            const comments = yield client_1.prisma.comment.create({
                data: {
                    content,
                    authorId,
                    postId,
                },
            });
            res.status(201).json({ message: "comment created", comments });
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    });
}
function editComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            const id = parseInt(req.params.id);
            const { content } = req.body;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const comment = yield client_1.prisma.comment.findUnique({ where: { id } });
            if (!comment) {
                res.status(404).json({ message: "comment not found" });
                return;
            }
            if (comment.authorId !== user.id) {
                res.status(403).json({ message: "Tidak memiliki akses" });
                return;
            }
            const update = yield client_1.prisma.comment.update({
                where: { id },
                data: { content },
            });
            res.status(201).json({ message: "comment updated", update });
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    });
}
function deleteComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const id = parseInt(req.params.id);
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const comment = yield client_1.prisma.comment.findUnique({ where: { id } });
            if (!comment) {
                res.status(404).json({ message: "comment not found" });
                return;
            }
            if (comment.authorId !== user.id) {
                res.status(403).json({ message: "Tidak memiliki akses" });
                return;
            }
            const deleted = yield client_1.prisma.comment.delete({ where: { id } });
            res.status(200).json({ message: "Deleted comment", deleted });
        }
        catch (error) {
            res.status(500).json({ message: "failed to delete", error });
        }
    });
}

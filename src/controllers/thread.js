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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThreadById = exports.getThreads = void 0;
exports.addThread = addThread;
exports.editThread = editThread;
exports.deletedThread = deletedThread;
exports.myThread = myThread;
exports.OtherThread = OtherThread;
const client_1 = require("../prisma/client");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getThreads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const authorId = user === null || user === void 0 ? void 0 : user.id;
        const threads = yield client_1.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: {
                        profile: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: {
                    where: {
                        userId: authorId,
                    },
                    select: {
                        id: true,
                    },
                },
            },
            take: 10,
        });
        const result = threads.map((thread) => ({
            id: thread.id,
            content: thread.content,
            imageUrl: thread.imageUrl,
            createdAt: thread.createdAt,
            likeCount: thread._count.likes,
            likeComment: thread._count.comments,
            liked: thread.likes.length > 0,
            author: thread.author,
        }));
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getThreads = getThreads;
const getThreadById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
        res.status(400).json({ message: "Invalid thread ID" });
        return;
    }
    const user = req.user;
    try {
        const thread = yield client_1.prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        profile: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!thread) {
            res.status(404).json({ message: "Thread not found" });
            return;
        }
        const liked = user
            ? thread.likes.some((like) => like.userId === user.id)
            : false;
        res.status(200).json(Object.assign(Object.assign({}, thread), { liked, likeCount: thread._count.likes }));
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.getThreadById = getThreadById;
function addThread(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            const { content } = req.body;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            let imageUrl = undefined;
            if (req.file) {
                const result = yield new Promise((resolve, reject) => {
                    var _a;
                    const stream = cloudinary_1.default.uploader.upload_stream({ folder: "circle-upload-file" }, (error, result) => {
                        if (error || !result)
                            return reject(error);
                        resolve(result);
                    });
                    stream.end((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer);
                });
                imageUrl = result.secure_url;
            }
            const thread = yield client_1.prisma.post.create({
                data: {
                    content,
                    authorId,
                    imageUrl,
                },
            });
            res.status(201).json({ message: "Thread created", thread });
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    });
}
function editThread(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const user = req.user;
            const id = parseInt(req.params.id);
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            const { content, imageDeleted } = req.body;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const post = yield client_1.prisma.post.findUnique({ where: { id } });
            if (!post) {
                res.status(404).json({ message: "thread not found" });
                return;
            }
            if (post.authorId !== user.id) {
                res.status(403).json({ message: "Tidak memiliki akses" });
                return;
            }
            let imageUrl = undefined;
            if (imageDeleted === "true" && post.imageUrl) {
                const publicId = `circle-upload-file/${(_a = post.imageUrl.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]}`;
                yield cloudinary_1.default.uploader.destroy(publicId);
                imageUrl = null;
            }
            if (req.file) {
                if (post.imageUrl) {
                    const oldPublicId = `circle-upload-file/${(_b = post.imageUrl.split("/").pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0]}`;
                    yield cloudinary_1.default.uploader.destroy(oldPublicId);
                }
                const result = yield new Promise((resolve, reject) => {
                    var _a;
                    const stream = cloudinary_1.default.uploader.upload_stream({
                        folder: "circle-upload-file",
                    }, (error, result) => {
                        if (error || !result)
                            return reject(error);
                        resolve(result);
                    });
                    stream.end((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer);
                });
                imageUrl = result.secure_url;
            }
            const updateData = {};
            if (content !== undefined)
                updateData.content = content;
            if (typeof imageUrl !== "undefined")
                updateData.imageUrl = imageUrl;
            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ message: "Tidak ada perubahan data." });
                return;
            }
            const updateThread = yield client_1.prisma.post.update({
                where: { id },
                data: updateData,
            });
            res.status(200).json({ message: "Updated thread", updateThread });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to update thread" });
        }
    });
}
function deletedThread(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const id = parseInt(req.params.id);
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const post = yield client_1.prisma.post.findUnique({ where: { id } });
            if (!post) {
                res.status(404).json({ message: "thread not found" });
                return;
            }
            if (post.authorId !== user.id) {
                res.status(403).json({ message: "Tidak memiliki akses" });
                return;
            }
            const result = yield client_1.prisma.post.delete({
                where: { id },
            });
            res.status(200).json({ message: "Deleted thread", result });
        }
        catch (error) {
            res.status(500).json({ message: "failed to delete", error });
        }
    });
}
function myThread(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const threads = yield client_1.prisma.post.findMany({ where: { authorId },
                include: {
                    author: { select: { profile: true, } },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: authorId,
                        },
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            if (!threads) {
                res.status(404).json({ message: "thread not found" });
                return;
            }
            const result = threads.map((thread) => ({
                id: thread.id,
                content: thread.content,
                imageUrl: thread.imageUrl,
                createdAt: thread.createdAt,
                likeCount: thread._count.likes,
                countComment: thread._count.comments,
                liked: thread.likes.length > 0,
                author: thread.author,
            }));
            res.status(200).json({ message: "thread :", result });
        }
        catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
}
function OtherThread(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const authorId = user === null || user === void 0 ? void 0 : user.id;
            if (!authorId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { username } = req.params;
            const isSelfProfile = yield client_1.prisma.profile.findFirst({
                where: {
                    userId: authorId,
                    username,
                },
            });
            if (isSelfProfile) {
                res.status(400).json({
                    message: "You cannot access your own profile from this endpoint",
                });
                return;
            }
            const threads = yield client_1.prisma.post.findMany({ where: { author: { profile: { username } } },
                include: {
                    author: { select: { profile: true, } },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                    likes: {
                        where: {
                            userId: authorId,
                        },
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            if (!threads) {
                res.status(404).json({ message: "thread not found" });
                return;
            }
            const result = threads.map((thread) => ({
                id: thread.id,
                content: thread.content,
                imageUrl: thread.imageUrl,
                createdAt: thread.createdAt,
                likeCount: thread._count.likes,
                countComment: thread._count.comments,
                liked: thread.likes.length > 0,
                author: thread.author,
            }));
            res.status(200).json({ message: "thread :", result });
        }
        catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
}

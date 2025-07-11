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
exports.getUserProfile = exports.searchUser = exports.getMyProfile = exports.updateUsername = exports.updateProfiles = exports.getProfiles = void 0;
const client_1 = require("../prisma/client");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const profile_1 = require("../validations/profile");
const getProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const userId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const profileUser = yield client_1.prisma.profile.findMany({
            where: {
                userId: { not: userId },
            },
            include: {
                user: {
                    omit: { password: true },
                },
            },
        });
        res.status(200).json(profileUser);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getProfiles = getProfiles;
const updateProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const user = req.user;
        const userId = user === null || user === void 0 ? void 0 : user.id;
        const files = req.files;
        const avatarFile = (_a = files.avatarUrl) === null || _a === void 0 ? void 0 : _a[0];
        const backgroundFile = (_b = files.backgroundUrl) === null || _b === void 0 ? void 0 : _b[0];
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { name, bio, username, avatarDeleted, bannerDeleted } = req.body;
        const normalizedUsername = username === null || username === void 0 ? void 0 : username.toLowerCase().trim();
        const profile = yield client_1.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        const { error } = profile_1.profileSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        if (normalizedUsername && normalizedUsername !== profile.username) {
            const existing = yield client_1.prisma.profile.findUnique({
                where: { username: normalizedUsername },
            });
            if (existing && existing.userId !== userId) {
                res.status(400).json({ message: "Username sudah digunakan" });
                return;
            }
        }
        let avatarUrl = undefined;
        let backgroundUrl = undefined;
        if (avatarDeleted === "true" && profile.avatarUrl) {
            const publicId = `circle-upload-file/${(_c = profile.avatarUrl.split("/").pop()) === null || _c === void 0 ? void 0 : _c.split(".")[0]}`;
            yield cloudinary_1.default.uploader.destroy(publicId);
            avatarUrl = null;
        }
        if (bannerDeleted === "true" && profile.backgroundUrl) {
            const publicId = `circle-upload-file/${(_d = profile.backgroundUrl.split("/").pop()) === null || _d === void 0 ? void 0 : _d.split(".")[0]}`;
            yield cloudinary_1.default.uploader.destroy(publicId);
            backgroundUrl = null;
        }
        if ((_e = files === null || files === void 0 ? void 0 : files.avatarUrl) === null || _e === void 0 ? void 0 : _e[0]) {
            if (profile.avatarUrl) {
                const oldPublicId = `circle-upload-file/${(_f = profile.avatarUrl.split("/").pop()) === null || _f === void 0 ? void 0 : _f.split(".")[0]}`;
                yield cloudinary_1.default.uploader.destroy(oldPublicId);
            }
            const result = yield new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({
                    folder: "circle-upload-file",
                    resource_type: "image",
                    public_id: `avatar-${userId}-${Date.now()}`,
                    crop: "thumb",
                    gravity: "face",
                    width: 300,
                    height: 300,
                }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                stream.end(avatarFile.buffer);
            });
            avatarUrl = result.secure_url;
        }
        if ((_g = files === null || files === void 0 ? void 0 : files.backgroundUrl) === null || _g === void 0 ? void 0 : _g[0]) {
            const result = yield new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: "circle-upload-file" }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                stream.end(backgroundFile === null || backgroundFile === void 0 ? void 0 : backgroundFile.buffer);
            });
            backgroundUrl = result.secure_url;
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (bio !== undefined)
            updateData.bio = bio;
        if (normalizedUsername !== undefined)
            updateData.username = normalizedUsername;
        if (typeof avatarUrl !== "undefined")
            updateData.avatarUrl = avatarUrl;
        if (typeof backgroundUrl !== "undefined")
            updateData.backgroundUrl = backgroundUrl;
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "Tidak ada perubahan data." });
            return;
        }
        const updatedProfile = yield client_1.prisma.profile.update({
            where: { userId },
            data: updateData,
        });
        res
            .status(200)
            .json({ message: "Updated profile", newProfile: updatedProfile });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});
exports.updateProfiles = updateProfiles;
const updateUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { username } = req.body;
        const result = yield client_1.prisma.profile.update({
            where: { id },
            data: { username },
        });
        res.status(200).json({ message: `berhasil update ${username}`, result });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update username" });
    }
});
exports.updateUsername = updateUsername;
const getMyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const loggedId = user === null || user === void 0 ? void 0 : user.id;
        if (!loggedId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const profile = yield client_1.prisma.profile.findUnique({
            where: { userId: loggedId },
            include: {
                user: {
                    omit: { password: true },
                    include: {
                        _count: {
                            select: {
                                followers: true,
                                following: true,
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        const result = Object.assign(Object.assign({}, profile), { user: Object.assign({}, profile.user) });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMyProfile = getMyProfile;
const searchUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = req.query.q;
    const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!loggedInUserId) {
        res.status(401).json({ message: "Unauthorized: User not found" });
        return;
    }
    if (!query)
        res.status(400).json({ message: "Missing search query" });
    const users = yield client_1.prisma.user.findMany({
        where: {
            AND: [
                { id: { not: loggedInUserId } },
                {
                    OR: [
                        { profile: { name: { contains: query, mode: "insensitive" } } },
                        { profile: { username: { contains: query, mode: "insensitive" } } },
                    ],
                },
            ],
        },
        select: {
            id: true,
            email: true,
            profile: {
                select: {
                    userId: true,
                    username: true,
                    name: true,
                    bio: true,
                    avatarUrl: true,
                },
            },
            followers: {
                where: { followerId: loggedInUserId },
                select: { id: true },
            },
        },
    });
    const result = users.map((user) => (Object.assign(Object.assign({}, user), { isFollowed: user.followers.length > 0 })));
    res.json(result);
});
exports.searchUser = searchUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        const loggedId = user === null || user === void 0 ? void 0 : user.id;
        if (!loggedId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { username } = req.params;
        const isSelfProfile = yield client_1.prisma.profile.findFirst({
            where: {
                userId: loggedId,
                username,
            },
        });
        if (isSelfProfile) {
            res.status(400).json({
                message: "You cannot access your own profile from this endpoint",
            });
            return;
        }
        const profile = yield client_1.prisma.profile.findUnique({
            where: { username },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                userId: true,
                                username: true,
                                name: true,
                                bio: true,
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        const count = yield client_1.prisma.user.findUnique({
            where: { id: profile.user.id },
            select: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        const isFollowed = yield client_1.prisma.follow.findFirst({
            where: {
                followerId: loggedId,
                followingId: profile.user.id,
            },
        });
        const result = Object.assign(Object.assign({}, profile), { user: Object.assign(Object.assign({}, profile.user), { _count: (_a = count === null || count === void 0 ? void 0 : count._count) !== null && _a !== void 0 ? _a : { followers: 0, following: 0 }, isFollowed: !!isFollowed }) });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserProfile = getUserProfile;

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
exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = void 0;
const client_1 = require("../prisma/client");
// Follow a user
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const followerId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!followerId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { followingId } = req.body;
        if (followerId === followingId) {
            res.status(400).json({ message: "You cannot follow yourself." });
            return;
        }
        const existingFollow = yield client_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (existingFollow) {
            res.status(400).json({ message: "You already followed this user." });
            return;
        }
        const data = yield client_1.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
        res.status(201).json({ message: "Successfully followed user.", data });
    }
    catch (error) {
        res.status(501).json({ message: "Failed to follow user", error });
    }
});
exports.followUser = followUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const followerId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!followerId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const { followingId } = req.body;
        const data = yield client_1.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        res.status(200).json({ message: "Successfully unfollowed user.", data });
    }
    catch (error) {
        res.status(501).json({ message: "Failed to unfollow user", error });
    }
});
exports.unfollowUser = unfollowUser;
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const loggedId = userId === null || userId === void 0 ? void 0 : userId.id;
        if (!loggedId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const user = yield client_1.prisma.user.findUnique({
            where: { id: loggedId },
            select: {
                email: true,
                followers: {
                    select: {
                        followerId: true,
                        follower: {
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
                                    where: { followerId: loggedId },
                                    select: { id: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        const formatted = user === null || user === void 0 ? void 0 : user.followers.map((f) => ({
            id: f.follower.id,
            email: f.follower.email,
            profile: f.follower.profile,
            isFollowed: f.follower.followers.length > 0,
        }));
        res.status(200).json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch followers", error });
    }
});
exports.getFollowers = getFollowers;
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const loggedId = userId === null || userId === void 0 ? void 0 : userId.id;
        if (!loggedId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const user = yield client_1.prisma.user.findUnique({
            where: { id: loggedId },
            select: {
                following: {
                    select: {
                        followingId: true,
                        following: {
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
                                    where: { followerId: loggedId },
                                    select: { id: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        const formatted = user === null || user === void 0 ? void 0 : user.following.map((f) => ({
            id: f.following.id,
            email: f.following.email,
            profile: f.following.profile,
            isFollowed: f.following.followers.length > 0,
        }));
        res.status(200).json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch following", error });
    }
});
exports.getFollowing = getFollowing;

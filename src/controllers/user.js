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
exports.getSuggestedUsers = exports.deleteUser = exports.editPasswordUser = exports.editEmailUser = exports.getUserById = exports.getUser = void 0;
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const loggedId = user === null || user === void 0 ? void 0 : user.id;
        if (!loggedId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const users = yield client_1.prisma.user.findMany({
            where: {
                id: { not: loggedId },
            }, omit: { password: true },
            include: { profile: { omit: { id: true } } },
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getUser = getUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const user = yield client_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
            },
        });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getUserById = getUserById;
const editEmailUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { email } = req.body;
        yield client_1.prisma.user.update({
            where: { id },
            data: { email },
        });
        res.status(200).json({ message: `User updated successfully ${email}` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update User" });
    }
});
exports.editEmailUser = editEmailUser;
const editPasswordUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { password } = req.body;
        const hashed = yield bcrypt_1.default.hash(password, 10);
        yield client_1.prisma.user.update({
            where: { id },
            data: { password: hashed },
        });
        res.status(200).json({ message: `User updated successfully ${password}` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update User" });
    }
});
exports.editPasswordUser = editPasswordUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield client_1.prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: `user deleted` });
    }
    catch (error) {
        res.status(500).json({ error: `Failed to delete User` });
    }
});
exports.deleteUser = deleteUser;
const getSuggestedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const userId = currentUserId === null || currentUserId === void 0 ? void 0 : currentUserId.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }
        const suggested = yield client_1.prisma.user.findMany({
            where: {
                id: { not: userId },
                followers: {
                    none: {
                        followerId: userId,
                    },
                },
            }, omit: { password: true },
            include: { profile: { omit: { id: true } } },
            take: 4,
        });
        res.status(200).json({ message: `user suggested`, suggested });
    }
    catch (error) {
        res.status(500).json({ error: `Failed to suggested User` });
    }
});
exports.getSuggestedUsers = getSuggestedUsers;

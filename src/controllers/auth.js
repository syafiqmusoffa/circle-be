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
exports.resetPassword = exports.requestReset = exports.getMe = void 0;
exports.handleRegister = handleRegister;
exports.handleLogin = handleLogin;
const auth_1 = require("../validations/auth");
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_2 = require("../sevices/auth");
const transporter_1 = require("../utils/transporter");
const crypto_1 = __importDefault(require("crypto"));
function handleRegister(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { error } = auth_1.registerSchema.validate(req.body);
            if (error) {
                res.status(400).json({ error: error.details[0].message });
                return;
            }
            const rawEmail = req.body.email || "";
            const rawUsername = req.body.username || "";
            const password = req.body.password;
            const email = rawEmail.toLowerCase().trim();
            const username = rawUsername.toLowerCase().trim();
            const existing = yield client_1.prisma.user.findUnique({
                where: { email },
            });
            if (existing) {
                res.status(400).json({ error: "Email sudah digunakan" });
                return;
            }
            const userName = yield client_1.prisma.profile.findUnique({
                where: { username },
            });
            if (userName) {
                res.status(400).json({ error: "Username sudah digunakan" });
                return;
            }
            const hashed = yield bcrypt_1.default.hash(password, 10);
            const newUser = yield client_1.prisma.user.create({
                data: {
                    email,
                    password: hashed,
                    profile: {
                        create: {
                            username,
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    profile: {
                        select: {
                            username: true,
                        },
                    },
                },
            });
            res.status(201).json({ message: `${username} registered`, user: newUser });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to add user" });
        }
    });
}
function handleLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { error } = auth_1.loginSchema.validate(req.body);
            if (error) {
                res.status(400).json({ message: error.message });
                return;
            }
            const { password } = req.body;
            const email = (_a = req.body.email) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            const result = yield (0, auth_2.loginUser)(email, password);
            res.status(200).json(Object.assign({ message: "Login success" }, result));
        }
        catch (err) {
            res.status(401).json({ message: err.message });
        }
    });
}
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const id = user.id;
    const foundUser = yield client_1.prisma.user.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!foundUser) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json(foundUser);
});
exports.getMe = getMe;
const requestReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield client_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        res.status(404).json({ message: "User not found" });
    const id = user === null || user === void 0 ? void 0 : user.id;
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
    yield client_1.prisma.user.update({
        where: { id },
        data: { resetToken: token, resetTokenExp: exp },
    });
    const baseUrl = process.env.BASE_URL;
    const link = `${baseUrl}/reset?token=${token}`;
    yield transporter_1.transporter.sendMail({
        to: email,
        subject: "Reset Password",
        html: `<p>Klik link berikut untuk reset password: <a href="${link}">Reset</a></p>`,
    });
    res.json({ message: "Link reset terkirim ke email" });
});
exports.requestReset = requestReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword, confirmPassword } = req.body;
    const { error } = auth_1.resetSchema.validate({ newPassword, confirmPassword });
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = yield client_1.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExp: { gte: new Date() },
        },
    });
    const id = user === null || user === void 0 ? void 0 : user.id;
    if (!user)
        res.status(400).json({ message: "Token invalid atau expired" });
    const hashed = yield bcrypt_1.default.hash(newPassword, 10);
    yield client_1.prisma.user.update({
        where: { id },
        data: {
            password: hashed,
            resetToken: null,
            resetTokenExp: null,
        },
    });
    res.json({ message: "Password berhasil direset" });
});
exports.resetPassword = resetPassword;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Format email tidak valid",
        "any.required": "Email wajib diisi",
    }),
    password: joi_1.default.string().min(6).required(),
    confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required().messages({
        "any.only": "Konfirmasi password tidak sama",
        "any.required": "Konfirmasi password wajib diisi",
    }),
    username: joi_1.default.string().min(5).required()
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required()
});
exports.resetSchema = joi_1.default.object({
    newPassword: joi_1.default.string().min(6).required().messages({
        "string.min": "Password minimal 6 karakter",
        "any.required": "Password wajib diisi",
    }),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref("newPassword"))
        .required()
        .messages({
        "any.only": "Konfirmasi password tidak sama",
        "any.required": "Konfirmasi password wajib diisi",
    }),
});

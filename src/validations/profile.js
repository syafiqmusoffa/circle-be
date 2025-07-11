"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.profileSchema = joi_1.default.object({
    username: joi_1.default.string().allow("").optional().trim().min(5).pattern(/^\S+$/).messages({
        "string.pattern.base": "Username harus 1 kata tanpa spasi",
        "string.min": "Username minimal 5 huruf",
    }),
    name: joi_1.default.string().allow("").optional(),
    bio: joi_1.default.string().allow("").optional(),
    avatarDeleted: joi_1.default.string().optional(),
    bannerDeleted: joi_1.default.string().optional(),
});

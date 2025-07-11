"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newThread = void 0;
const joi_1 = __importDefault(require("joi"));
exports.newThread = joi_1.default.object({
    content: joi_1.default.string().allow(null, ""),
    imageUrl: joi_1.default.string().allow(null, ""),
}).custom((value, helpers) => {
    const hasContent = value.content && value.content.trim() !== "";
    const hasImage = value.imageUrl && value.imageUrl.trim() !== "";
    if (!hasContent && !hasImage) {
        return helpers.error("any.invalid", {
            message: "Minimal salah satu: content atau imageUrl harus diisi",
        });
    }
    return value;
});

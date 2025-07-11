"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const whitelist = ["image/png", "image/jpeg", "image/jpg"];
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter(req, file, cb) {
        if (!whitelist.includes(file.mimetype)) {
            return cb(new Error("file is not allowed"));
        }
        cb(null, true);
    },
});
exports.default = upload;

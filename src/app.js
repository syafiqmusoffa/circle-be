"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = require("./routes/auth");
const profile_1 = require("./routes/profile");
const cors_1 = __importDefault(require("cors"));
const thread_1 = require("./routes/thread");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import fileUpload from "express-fileupload";
// import bodyParser from "body-parser";
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const follows_1 = require("./routes/follows");
const like_1 = require("./routes/like");
const comments_1 = require("./routes/comments");
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// app.use(bodyParser.urlencoded());
app.use(express_1.default.urlencoded());
app.use((0, compression_1.default)());
// app.use(fileUpload());
app.use(express_1.default.static("uploads"));
app.use("/", auth_1.AuthRouter);
app.use("/api", user_1.default);
app.use("/api", profile_1.profileRoutes);
app.use("/api", thread_1.threadRoute);
app.use("/api", follows_1.routerFollows);
app.use("/api", like_1.routerLikes);
app.use("/api", comments_1.routerComments);
const uploadPath = path_1.default.join(__dirname, "src/uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
exports.default = app;

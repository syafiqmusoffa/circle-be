import express from "express";
import router from "./routes/user";
import { AuthRouter } from "./routes/auth";
import { profileRoutes } from "./routes/profile";
import cors from "cors";
import { threadRoute } from "./routes/thread";
import cookieParser from "cookie-parser";
// import fileUpload from "express-fileupload";
// import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import compression from "compression";
import dotenv from "dotenv";
import { routerFollows } from "./routes/follows";
import { routerLikes } from "./routes/like";
import { routerComments } from "./routes/comments";
dotenv.config();

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded());
app.use(express.urlencoded());
app.use(compression())
// app.use(fileUpload());
app.use(express.static("uploads"));

app.use("/", AuthRouter);
app.use("/api", router);
app.use("/api", profileRoutes);
app.use("/api", threadRoute);
app.use("/api", routerFollows);
app.use("/api", routerLikes);
app.use("/api", routerComments);

const uploadPath = path.join(__dirname, "src/uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// });

export default app;

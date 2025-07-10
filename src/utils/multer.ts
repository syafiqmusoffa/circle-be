// import multer from "multer";
// import path from "path";

// const whitelist = ["image/png", "image/jpeg", "image/jpg"];

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "src/uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.filename + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// export const uploadImage = multer({
//   storage: storage,
//   fileFilter(req, file, cb) {
//     if (!whitelist.includes(file.mimetype)) {
//       return cb(new Error("file is not allowed"));
//     }

//     cb(null, true);
//   },
// });

// import multer from "multer";

// const whitelist = ["image/png", "image/jpeg", "image/jpg"];

// const storage = multer.diskStorage({
//   destination: function (
//     req: Express.Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, destination: string) => void
//   ) {
//     cb(null, "./uploads");
//   },
//   filename: function (
//     req: Express.Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, filename: string) => void
//   ) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });
// const upload = multer({
//   storage,
//   fileFilter(req, file, cb) {
//     if (!whitelist.includes(file.mimetype)) {
//       return cb(new Error("file is not allowed"));
//     }

//     cb(null, true);
//   },
// });
// export default upload;

// middlewares/upload.ts
import multer from "multer";

export const uploadProfileFiles = multer().fields([
  { name: "avatar", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

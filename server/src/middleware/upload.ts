import multer from "multer";
import cloudinary from "../config/cloudinary";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "video/mp4",
      "video/mpeg",
      "video/webm",
    ];

    if (file.mimetype.startsWith("image/") || allowed.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only PDF, Video, and Image files are allowed") as any, false);
  },
});

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../../tmp");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "video/mp4",
      "video/mpeg",
      "video/webm",
      "image/png",
      "image/jpeg",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, Video, and Image files are allowed") as any,
        false
      );
    }
    cb(null, true);
  },
});

export { videoUpload };

export const uploadToCloudinaryStream = (
  filePath: string,
  folder: string,
  resourceType: "auto" | "video" | "raw" = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        fs.unlinkSync(filePath);
        if (error) reject(error);
        else resolve(result);
      }
    );

    fs.createReadStream(filePath).pipe(uploadStream);
  });
};

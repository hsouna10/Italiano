const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads", "videos");
const allowedTypes = {
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".ogv": "video/ogg",
  ".webm": "video/webm",
};

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes[extension] !== file.mimetype) {
      const error = new Error("Format vidéo non accepté. Utilisez MP4, M4V, MOV, OGV ou WebM.");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

exports.uploadMiddleware = (req, res, next) => {
  upload.single("video")(req, res, error => {
    if (error instanceof multer.MulterError) {
      error.statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      if (error.code === "LIMIT_FILE_SIZE") {
        error.message = "La vidéo dépasse la limite de 500 Mo.";
      }
    }
    next(error);
  });
};

exports.uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Sélectionnez un fichier vidéo à envoyer." });
  }

  const videoUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;
  return res.status(201).json({ videoUrl });
};

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads", "music");
const allowedTypes = {
  ".aac": ["audio/aac", "audio/x-aac"],
  ".flac": ["audio/flac", "audio/x-flac"],
  ".m4a": ["audio/mp4", "audio/x-m4a", "audio/m4a"],
  ".mp3": ["audio/mpeg", "audio/mp3"],
  ".ogg": ["audio/ogg", "application/ogg"],
  ".opus": ["audio/opus", "audio/ogg"],
  ".wav": ["audio/wav", "audio/x-wav", "audio/wave"],
  ".weba": ["audio/webm"],
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
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[extension]?.includes(file.mimetype)) {
      const error = new Error("Format audio non accepté. Utilisez MP3, M4A, WAV, OGG, OPUS, AAC, FLAC ou WebA.");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

exports.uploadMiddleware = (req, res, next) => {
  upload.single("audio")(req, res, error => {
    if (error instanceof multer.MulterError) {
      error.statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      if (error.code === "LIMIT_FILE_SIZE") {
        error.message = "Le fichier audio dépasse la limite de 100 Mo.";
      }
    }
    next(error);
  });
};

exports.uploadMusic = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Sélectionnez un fichier audio à envoyer." });
  }

  const audioUrl = `${req.protocol}://${req.get("host")}/uploads/music/${req.file.filename}`;
  return res.status(201).json({ audioUrl });
};

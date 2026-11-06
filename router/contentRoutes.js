const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../midelware/authMiddleware");
const contentController = require("../controlleur/contentController");
const videoUploadController = require("../controlleur/videoUploadController");
const musicUploadController = require("../controlleur/musicUploadController");

router.use(protect);
router.post(
  "/videos/upload",
  requireAdmin,
  videoUploadController.uploadMiddleware,
  videoUploadController.uploadVideo
);
router.post(
  "/music/upload",
  requireAdmin,
  musicUploadController.uploadMiddleware,
  musicUploadController.uploadMusic
);
router.get("/:kind", contentController.getContent);
router.post("/:kind", requireAdmin, contentController.createContent);
router.patch("/:kind/:id", requireAdmin, contentController.updateContent);
router.delete("/:kind/:id", requireAdmin, contentController.deleteContent);

module.exports = router;

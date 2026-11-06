
const express = require("express");
const router = express.Router();

const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controlleur/lessonController");

const {
  protect,
  requireAdmin,
} = require("../midelware/authMiddleware");

router.get("/", getLessons);
router.get("/:id", getLessonById);

router.post("/", protect, requireAdmin, createLesson);
router.patch("/:id", protect, requireAdmin, updateLesson);
router.delete("/:id", protect, requireAdmin, deleteLesson);

module.exports = router;

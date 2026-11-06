
const express = require("express");
const router = express.Router();

const {
  getUsers,
  getMe,
  updateMe,
  submitLevelExam,
  updateProgress,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../controlleur/userController");

const { protect, requireAdmin } = require("../midelware/authMiddleware");

router.use(protect);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.post("/level-exam", submitLevelExam);
router.patch("/progress", updateProgress);
router.get("/", requireAdmin, getUsers);
router.patch("/:id", requireAdmin, updateUserByAdmin);
router.delete("/:id", requireAdmin, deleteUserByAdmin);

module.exports = router;

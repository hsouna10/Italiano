
const express = require("express");
const router = express.Router();

const {
  getVocabulary,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getMyVocabularyProgress,
  updateMyVocabularyProgress,
} = require("../controlleur/vocabularyController");

const {
  protect,
  requireAdmin,
} = require("../midelware/authMiddleware");

router.get("/progress", protect, getMyVocabularyProgress);
router.put("/progress/:vocabularyId", protect, updateMyVocabularyProgress);

router.get("/", getVocabulary);
router.get("/:id", getVocabularyById);

router.post("/", protect, requireAdmin, createVocabulary);
router.patch("/:id", protect, requireAdmin, updateVocabulary);
router.delete("/:id", protect, requireAdmin, deleteVocabulary);

module.exports = router;

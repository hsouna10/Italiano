
const express = require("express");
const router = express.Router();

const {
  getPreferences,
  updatePreferences,
} = require("../controlleur/userPreferenceController");

const { protect } = require("../midelware/authMiddleware");

router.use(protect);

router.get("/", getPreferences);
router.patch("/", updatePreferences);

module.exports = router;

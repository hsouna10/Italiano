
const mongoose = require("mongoose");

const userVocabularyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vocabularyId: {
      type: String,
      ref: "Vocabulary",
      required: true,
    },

    srsBox: {
      type: Number,
      default: 1,
      min: 1,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastReviewedAt: {
      type: Date,
      default: null,
    },

    nextReviewAt: {
      type: Date,
      default: Date.now,
    },

    intervalDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userVocabularyProgressSchema.index(
  { userId: 1, vocabularyId: 1 },
  { unique: true }
);

userVocabularyProgressSchema.index({
  userId: 1,
  nextReviewAt: 1,
});

module.exports = mongoose.model(
  "UserVocabularyProgress",
  userVocabularyProgressSchema
);

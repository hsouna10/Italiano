
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    italianLevel: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: "A1",
    },

    preferredLanguage: {
      type: String,
      enum: ["fr", "en", "ar", "it"],
      default: "fr",
    },

    streakDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActivityDate: {
      type: Date,
      default: null,
    },

    xpPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    gems: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedLessons: {
      type: [String],
      default: [],
    },

    studiedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    learningGoals: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);

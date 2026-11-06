
const mongoose = require("mongoose");

const vocabularySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    italian: {
      type: String,
      required: true,
      trim: true,
    },

    french: {
      type: String,
      required: true,
      trim: true,
    },

    genderOrType: {
      type: String,
      default: "",
      trim: true,
    },

    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },

    exampleItalian: {
      type: String,
      default: "",
    },

    exampleFrench: {
      type: String,
      default: "",
    },

    audioHint: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vocabularySchema.index({ level: 1, italian: 1 });

module.exports = mongoose.model("Vocabulary", vocabularySchema);

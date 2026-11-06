const mongoose = require("mongoose");

const dynamicContentSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      required: true,
      enum: ["exercise", "reading", "scenario", "video", "music"],
    },
    key: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

dynamicContentSchema.index({ kind: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("DynamicContent", dynamicContentSchema);

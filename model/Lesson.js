
const mongoose = require("mongoose");

const conjugationRowSchema = new mongoose.Schema(
  {
    pronoun: { type: String, required: true },
    verbForm: { type: String, required: true },
    translation: { type: String, required: true },
    example: { type: String, required: true },
    exampleFr: { type: String, required: true },
  },
  { _id: false }
);

const conjugationTableSchema = new mongoose.Schema(
  {
    verb: { type: String, default: "" },
    tense: { type: String, default: "" },
    rows: {
      type: [conjugationRowSchema],
      default: [],
    },
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    italian: { type: String, required: true },
    french: { type: String, required: true },
  },
  { _id: false }
);

const commonMistakeSchema = new mongoose.Schema(
  {
    incorrect: { type: String, required: true },
    correct: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  contentMarkdown: {
    type: String,
    default: "",
  },

  conjugationTable: {
    type: conjugationTableSchema,
    default: undefined,
  },

  examples: {
    type: [exampleSchema],
    default: [],
  },

  commonMistakes: {
    type: [commonMistakeSchema],
    default: [],
  },
});

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options) => options.length >= 2,
      message: "Le quiz doit contenir au moins deux options.",
    },
  },

  correctIndex: {
    type: Number,
    required: true,
    min: 0,
  },

  explanation: {
    type: String,
    default: "",
  },
});

quizSchema.pre("validate", function () {
  if (
    Array.isArray(this.options) &&
    this.correctIndex >= this.options.length
  ) {
    this.invalidate(
      "correctIndex",
      "L'index doit correspondre à une option existante."
    );
  }
});

const lessonSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },

    unitNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    orderNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    titleFr: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^https?:\/\//i.test(value),
        message: "L'URL de la vidéo doit commencer par http:// ou https://.",
      },
    },

    learningObjectives: {
      type: [String],
      default: [],
    },

    estimatedMinutes: {
      type: Number,
      default: 10,
      min: 1,
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    quiz: {
      type: [quizSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

lessonSchema.index({
  level: 1,
  unitNumber: 1,
  orderNumber: 1,
});

module.exports = mongoose.model("Lesson", lessonSchema);

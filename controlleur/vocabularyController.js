
const Vocabulary = require("../model/Vocabulary");
const UserVocabularyProgress = require("../model/UserVocabularyProgress");

// GET /api/vocabulary?level=A1
exports.getVocabulary = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.level) {
      filter.level = req.query.level.toUpperCase();
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
          { italian: { $regex: escaped, $options: "i" } },
          { french: { $regex: escaped, $options: "i" } },
        ];
      }
    }

    const words = await Vocabulary.find(filter).sort({
      level: 1,
      italian: 1,
    });

    return res.status(200).json({
      count: words.length,
      vocabulary: words,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/vocabulary/:id
exports.getVocabularyById = async (req, res, next) => {
  try {
    const word = await Vocabulary.findById(req.params.id);

    if (!word) {
      return res.status(404).json({
        message: "Mot de vocabulaire introuvable.",
      });
    }

    return res.status(200).json({ word });
  } catch (error) {
    next(error);
  }
};

// POST /api/vocabulary — administrateur uniquement
exports.createVocabulary = async (req, res, next) => {
  try {
    const word = await Vocabulary.create(req.body);

    return res.status(201).json({
      message: "Mot ajouté au vocabulaire.",
      word,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/vocabulary/:id — administrateur uniquement
exports.updateVocabulary = async (req, res, next) => {
  try {
    const word = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!word) {
      return res.status(404).json({
        message: "Mot introuvable.",
      });
    }

    return res.status(200).json({
      message: "Mot mis à jour.",
      word,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vocabulary/:id — administrateur uniquement
exports.deleteVocabulary = async (req, res, next) => {
  try {
    const word = await Vocabulary.findByIdAndDelete(req.params.id);

    if (!word) {
      return res.status(404).json({
        message: "Mot introuvable.",
      });
    }

    await UserVocabularyProgress.deleteMany({ vocabularyId: word._id });

    return res.status(200).json({
      message: "Mot supprimé.",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/vocabulary/progress
exports.getMyVocabularyProgress = async (req, res, next) => {
  try {
    const progress = await UserVocabularyProgress.find({ userId: req.user.id });
    return res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};

// PUT /api/vocabulary/progress/:vocabularyId
exports.updateMyVocabularyProgress = async (req, res, next) => {
  try {
    const boxValues = { today: 1, learning: 2, mastered: 3 };
    const srsBox = req.body.srsBox;

    if (!Object.prototype.hasOwnProperty.call(boxValues, srsBox)) {
      return res.status(400).json({
        message: "srsBox doit être today, learning ou mastered.",
      });
    }

    const vocabularyExists = await Vocabulary.exists({
      _id: req.params.vocabularyId,
    });
    if (!vocabularyExists) {
      return res.status(404).json({
        message: "Mot de vocabulaire introuvable.",
      });
    }

    const now = new Date();
    const intervalDays = { today: 0, learning: 1, mastered: 7 }[srsBox];
    const progress = await UserVocabularyProgress.findOneAndUpdate(
      { userId: req.user.id, vocabularyId: req.params.vocabularyId },
      {
        $set: {
          srsBox: boxValues[srsBox],
          lastReviewedAt: now,
          intervalDays,
          nextReviewAt: new Date(now.getTime() + intervalDays * 86400000),
        },
        $inc: { reviewCount: 1 },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};

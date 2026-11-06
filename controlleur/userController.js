
const User = require("../model/User");
const Lesson = require("../model/Lesson");

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_EXAM_ANSWER_KEYS = {
  A1: [1, 1, 1, 1, 1],
  A2: [1, 1, 1, 1, 1],
  B1: [1, 1, 2, 1, 1],
  B2: [3, 1, 0, 2, 1],
  C1: [1, 2, 1, 1, 1],
  C2: [1, 1, 1, 1, 1],
};

// GET /api/users — administrateur uniquement
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.italianLevel !== undefined) {
      return res.status(403).json({
        message: "Le niveau ne peut être modifié qu'après réussite à l'examen final.",
      });
    }

    const allowedFields = [
      "name",
      "preferredLanguage",
      "learningGoals",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Aucune information valide à modifier.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      message: "Profil mis à jour.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/level-exam
exports.submitLevelExam = async (req, res, next) => {
  try {
    const { level, answers } = req.body;
    const levelIndex = LEVELS.indexOf(level);
    const answerKey = LEVEL_EXAM_ANSWER_KEYS[level];

    if (
      !answerKey ||
      !Array.isArray(answers) ||
      answers.length !== answerKey.length ||
      answers.some(answer => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 3))
    ) {
      return res.status(400).json({ message: "Les réponses de l'examen sont invalides." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    if (user.italianLevel !== level) {
      return res.status(403).json({ message: "Vous devez réussir l'examen de votre niveau actuel." });
    }

    const levelLessons = await Lesson.find({ level }).select("_id");
    if (
      levelLessons.length === 0 ||
      levelLessons.some(lesson => !user.completedLessons.includes(lesson._id))
    ) {
      return res.status(403).json({ message: "Terminez toutes les leçons du niveau avant de passer l'examen." });
    }

    const correctAnswers = answers.reduce(
      (total, answer, index) => total + (answer === answerKey[index] ? 1 : 0),
      0
    );
    const percentage = Math.round((correctAnswers / answerKey.length) * 100);
    const passed = percentage >= 60;

    if (passed) {
      const reward = percentage >= 80 ? 200 : 100;
      user.xpPoints += reward;
      user.gems += Math.floor(reward / 5);
      if (levelIndex < LEVELS.length - 1) {
        user.italianLevel = LEVELS[levelIndex + 1];
      }
      await user.save();
    }

    return res.status(200).json({
      message: passed ? "Examen réussi." : "Examen non validé.",
      passed,
      percentage,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id — administrateur uniquement
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "role",
      "italianLevel",
      "preferredLanguage",
      "learningGoals",
      "streakDays",
      "xpPoints",
      "gems",
      "completedLessons",
      "studiedMinutes",
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Aucune information valide à modifier.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json({ message: "Utilisateur mis à jour.", user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — administrateur uniquement
exports.deleteUserByAdmin = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer votre propre compte.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json({ message: "Utilisateur supprimé." });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { xpPoints, gems, studiedMinutes, lessonId } = req.body;

    const updates = {};

    // Les valeurs envoyées doivent être validées avant modification.
    if (xpPoints !== undefined) {
      if (!Number.isInteger(xpPoints) || xpPoints < 0) {
        return res.status(400).json({
          message: "xpPoints doit être un entier positif ou nul.",
        });
      }
      updates.xpPoints = xpPoints;
    }

    if (gems !== undefined) {
      if (!Number.isInteger(gems) || gems < 0) {
        return res.status(400).json({
          message: "gems doit être un entier positif ou nul.",
        });
      }
      updates.gems = gems;
    }

    if (studiedMinutes !== undefined) {
      if (!Number.isInteger(studiedMinutes) || studiedMinutes < 0) {
        return res.status(400).json({
          message: "studiedMinutes doit être un entier positif ou nul.",
        });
      }
      updates.studiedMinutes = studiedMinutes;
    }

    if (lessonId !== undefined) {
      if (typeof lessonId !== "string" || !lessonId.trim()) {
        return res.status(400).json({
          message: "lessonId doit être une chaîne non vide.",
        });
      }

      updates.$addToSet = {
        completedLessons: lessonId.trim(),
      };
    }

    if (
      xpPoints === undefined &&
      gems === undefined &&
      studiedMinutes === undefined &&
      lessonId === undefined
    ) {
      return res.status(400).json({
        message: "Aucune progression à mettre à jour.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates.$addToSet
        ? { $set: Object.fromEntries(
              Object.entries(updates).filter(([key]) => key !== "$addToSet")
            ),
            $addToSet: updates.$addToSet }
        : { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      message: "Progression mise à jour.",
      user,
    });
  } catch (error) {
    next(error);
  }
};


const Lesson = require("../model/Lesson");

// GET /api/lessons?level=A1
exports.getLessons = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.level) {
      filter.level = req.query.level.toUpperCase();
    }

    if (req.query.unitNumber) {
      const unitNumber = Number(req.query.unitNumber);

      if (!Number.isInteger(unitNumber) || unitNumber < 1) {
        return res.status(400).json({
          message: "unitNumber doit être un entier positif.",
        });
      }

      filter.unitNumber = unitNumber;
    }

    const lessons = await Lesson.find(filter).sort({
      unitNumber: 1,
      orderNumber: 1,
    });

    return res.status(200).json({
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/lessons/:id
exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Cours introuvable.",
      });
    }

    return res.status(200).json({ lesson });
  } catch (error) {
    next(error);
  }
};

// POST /api/lessons — administrateur uniquement
exports.createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);

    return res.status(201).json({
      message: "Cours créé avec succès.",
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/lessons/:id — administrateur uniquement
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        message: "Cours introuvable.",
      });
    }

    return res.status(200).json({
      message: "Cours mis à jour.",
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/lessons/:id — administrateur uniquement
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Cours introuvable.",
      });
    }

    return res.status(200).json({
      message: "Cours supprimé.",
    });
  } catch (error) {
    next(error);
  }
};

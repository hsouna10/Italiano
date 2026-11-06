
const UserPreference = require("../model/UserPreference");

// GET /api/preferences
exports.getPreferences = async (req, res, next) => {
  try {
    let preferences = await UserPreference.findOne({
      userId: req.user.id,
    });

    // Créer les préférences par défaut lors du premier accès
    if (!preferences) {
      preferences = await UserPreference.create({
        userId: req.user.id,
        isDarkMode: false,
      });
    }

    return res.status(200).json({ preferences });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { isDarkMode } = req.body;

    if (typeof isDarkMode !== "boolean") {
      return res.status(400).json({
        message: "isDarkMode doit être true ou false.",
      });
    }

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { isDarkMode } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Préférences mises à jour.",
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

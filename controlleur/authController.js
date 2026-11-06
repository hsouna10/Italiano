
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Générer un token JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas configuré.");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Formater les données publiques de l'utilisateur
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  italianLevel: user.italianLevel,
  preferredLanguage: user.preferredLanguage,
  streakDays: user.streakDays,
  xpPoints: user.xpPoints,
  gems: user.gems,
  completedLessons: user.completedLessons,
  studiedMinutes: user.studiedMinutes,
  learningGoals: user.learningGoals,
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      italianLevel,
      preferredLanguage,
      learningGoals,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Le nom, l'email et le mot de passe sont obligatoires.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      italianLevel,
      preferredLanguage,
      learningGoals,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Compte créé avec succès.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "L'email et le mot de passe sont obligatoires.",
      });
    }

    // Le mot de passe est select:false dans le modèle User.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

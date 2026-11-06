
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("node:path");

const errorMiddleware = require("./midelware/errorMiddleware");
const notFoundMiddleware = require("./midelware/notFoundMiddleware");

const app = express();

// Vérifier la configuration minimale
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI est manquant dans le fichier .env");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET est manquant dans le fichier .env");
}

// Middlewares globaux
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  })
);

// Route d'accueil
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bienvenue sur l'API Italiano AI 🇮🇹",
    status: "OK",
  });
});

// Vérifier l'état du serveur et de MongoDB
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    server: "OK",
    database: connected ? "connected" : "disconnected",
  });
});

// Routes API
app.use("/api/auth", require("./router/authRoutes"));
app.use("/api/users", require("./router/userRoutes"));
app.use("/api/lessons", require("./router/lessonRoutes"));
app.use("/api/vocabulary", require("./router/vocabularyRoutes"));
app.use("/api/ai", require("./router/aiRoutes"));
app.use("/api/content", require("./router/contentRoutes"));
app.use(
  "/api/preferences",
  require("./router/userPreferenceRoutes")
);

// Gestion des routes inconnues et des erreurs
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connecté avec succès.");

    app.listen(PORT, () => {
      console.log(`API disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de démarrage :", error.message);
    process.exit(1);
  }
};

startServer();

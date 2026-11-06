require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../model/User");

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI est manquant dans le fichier .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Aucun contenu pédagogique n'est inséré automatiquement ; créez les cours, le vocabulaire et les exercices depuis l'administration.");

  const adminValues = [
    process.env.ADMIN_NAME,
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
  ];
  if (adminValues.some(Boolean)) {
    if (adminValues.some(value => !value)) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL et ADMIN_PASSWORD doivent tous être définis.");
    }
    if (process.env.ADMIN_PASSWORD.length < 8) {
      throw new Error("ADMIN_PASSWORD doit contenir au moins 8 caractères.");
    }
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log("Le compte configuré a été promu administrateur.");
      } else {
        console.log("Le compte administrateur configuré existe déjà.");
      }
    } else {
      await User.create({
        name: process.env.ADMIN_NAME,
        email,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: "admin",
      });
      console.log("Compte administrateur créé.");
    }
  } else {
    console.log("Aucun administrateur initial créé (variables ADMIN_* absentes).");
  }

  await mongoose.disconnect();
};

seed().catch(async error => {
  console.error("Échec de l'initialisation du backend :", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});

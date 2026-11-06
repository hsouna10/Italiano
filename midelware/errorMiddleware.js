
module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Cette donnée existe déjà.",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides.",
      errors: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Identifiant ou valeur invalide.",
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Une erreur interne est survenue."
        : err.message,
  });
};

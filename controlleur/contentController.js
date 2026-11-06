const crypto = require("node:crypto");
const DynamicContent = require("../model/DynamicContent");

const kinds = {
  exercises: "exercise",
  "reading-texts": "reading",
  "conversation-scenarios": "scenario",
  videos: "video",
  music: "music",
};

const formatRecord = record => ({ ...record.data, id: record.key });

const isString = value => typeof value === "string" && value.trim().length > 0;
const isStringArray = value => Array.isArray(value) && value.every(isString);
const validLevel = value => ["A1", "A2", "B1", "B2", "C1", "C2"].includes(value);
const isHttpUrl = value => {
  if (!isString(value)) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const validateContent = (kind, data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Le contenu doit être un objet JSON.";
  }
  if (kind === "exercise") {
    if (data.part !== undefined && (typeof data.part !== "string" || data.part.length > 80)) {
      return "La partie d’un exercice doit être un texte de 80 caractères maximum.";
    }
    if (!validLevel(data.level) || !isString(data.topic) || !isString(data.prompt) ||
      !isString(data.explanation) || !["facile", "moyen", "avancé"].includes(data.difficulty)) {
      return "Un exercice doit contenir un niveau, un sujet, une consigne, une explication et une difficulté valides.";
    }
    const validByType = {
      multiple_choice: () => isStringArray(data.options) &&
        Number.isInteger(data.correctIndex) && data.correctIndex >= 0 && data.correctIndex < data.options.length,
      fill_blank: () => typeof data.sentenceBefore === "string" && typeof data.sentenceAfter === "string" &&
        isStringArray(data.correctAnswers) && data.correctAnswers.length > 0,
      word_reorder: () => isStringArray(data.scrambledWords) && data.scrambledWords.length > 0 && isString(data.correctSentence),
      translation: () => ["fr", "it"].includes(data.sourceLanguage) &&
        isString(data.targetSentence) && isStringArray(data.acceptableAnswers) && data.acceptableAnswers.length > 0,
      error_correction: () => isString(data.faultySentence) && isString(data.errorPart) &&
        isString(data.correctedSentence) && isString(data.grammarRule),
      free_production: () => isString(data.theme) && isStringArray(data.suggestedVocabulary) &&
        Number.isInteger(data.minWords) && data.minWords > 0 &&
        isStringArray(data.evaluationCriteria) && data.evaluationCriteria.length > 0,
    };
    if (!Object.hasOwn(validByType, data.type) || !validByType[data.type]()) {
      return "Les champs de l’exercice ne correspondent pas à son type.";
    }
  }
  if (kind === "reading") {
    const validQuestions = Array.isArray(data.comprehensionQuestions) &&
      data.comprehensionQuestions.every(question => question && isString(question.question) &&
        isStringArray(question.options) && Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 && question.correctIndex < question.options.length &&
        isString(question.explanation));
    if (!validLevel(data.level) || !isString(data.title) || !isString(data.titleFr) ||
      !isString(data.category) || !isStringArray(data.italianParagraphs) ||
      !isStringArray(data.frenchParagraphs) || !data.vocabularyGlossary ||
      typeof data.vocabularyGlossary !== "object" || Array.isArray(data.vocabularyGlossary) || !validQuestions) {
      return "Le texte doit contenir des traductions, un glossaire et des questions valides.";
    }
  }
  if (kind === "scenario" && (
    !isString(data.title) || !isString(data.theme) || !validLevel(data.level) ||
    !isString(data.scenarioDescription) || !isString(data.initialAiMessage) ||
    !isString(data.initialAiMessageFr) || !isString(data.userRoleDescription) ||
    !isString(data.aiRoleDescription) || !isStringArray(data.sampleReplies) || data.sampleReplies.length === 0
  )) {
    return "Le scénario doit contenir toutes ses informations et au moins une réplique valide.";
  }
  if (kind === "video" && (
    !isString(data.title) || !isString(data.description) || !validLevel(data.level) ||
    !isHttpUrl(data.videoUrl) || (data.thumbnailUrl && !isHttpUrl(data.thumbnailUrl))
  )) {
    return "Une vidéo doit avoir un titre, une description, un niveau et une URL HTTP(S) valide.";
  }
  if (kind === "music" && (
    !isString(data.title) || !isString(data.artist) || !validLevel(data.level) ||
    !isHttpUrl(data.audioUrl) || (data.coverUrl && !isHttpUrl(data.coverUrl)) ||
    (data.italianLyrics !== undefined && typeof data.italianLyrics !== "string") ||
    (data.frenchTranslation !== undefined && typeof data.frenchTranslation !== "string")
  )) {
    return "Un titre musical doit avoir un titre, un artiste, un niveau et une URL audio HTTP(S) valide.";
  }
  return null;
};

exports.getContent = async (req, res, next) => {
  try {
    const kind = kinds[req.params.kind];
    if (!kind) return res.status(404).json({ message: "Type de contenu introuvable." });

    const records = await DynamicContent.find({ kind }).sort({ key: 1 }).lean();
    const items = records.map(formatRecord);
    const property = {
      exercise: "exercises",
      reading: "readingTexts",
      scenario: "conversationScenarios",
      video: "videos",
      music: "musicTracks",
    }[kind];
    return res.status(200).json({ count: items.length, [property]: items });
  } catch (error) {
    return next(error);
  }
};

exports.createContent = async (req, res, next) => {
  try {
    const kind = kinds[req.params.kind];
    if (!kind) return res.status(404).json({ message: "Type de contenu introuvable." });
    const validationError = validateContent(kind, req.body.data);
    if (validationError) return res.status(400).json({ message: validationError });

    const requestedKey = req.body.id;
    const key = typeof requestedKey === "string" && requestedKey.trim()
      ? requestedKey.trim()
      : crypto.randomUUID();
    const record = await DynamicContent.create({ kind, key, data: req.body.data });
    return res.status(201).json({ message: "Contenu créé.", item: formatRecord(record) });
  } catch (error) {
    return next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const kind = kinds[req.params.kind];
    if (!kind) return res.status(404).json({ message: "Type de contenu introuvable." });
    const validationError = validateContent(kind, req.body.data);
    if (validationError) return res.status(400).json({ message: validationError });

    const record = await DynamicContent.findOneAndUpdate(
      { kind, key: req.params.id },
      { $set: { data: req.body.data } },
      { returnDocument: "after", runValidators: true }
    );
    if (!record) return res.status(404).json({ message: "Contenu introuvable." });
    return res.status(200).json({ message: "Contenu modifié.", item: formatRecord(record) });
  } catch (error) {
    return next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const kind = kinds[req.params.kind];
    if (!kind) return res.status(404).json({ message: "Type de contenu introuvable." });
    const record = await DynamicContent.findOneAndDelete({ kind, key: req.params.id });
    if (!record) return res.status(404).json({ message: "Contenu introuvable." });
    return res.status(200).json({ message: "Contenu supprimé." });
  } catch (error) {
    return next(error);
  }
};

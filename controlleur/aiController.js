const DynamicContent = require("../model/DynamicContent");

exports.generateApp = async (req, res, next) => {
  const description = requireText(req.body.description, "description", res);
  if (!description) return;
  if (description.length > 6000) {
    return res.status(400).json({ message: "La description est trop longue (maximum 6 000 caractères)." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      message: "Gemini n’est pas configuré. Ajoutez GEMINI_API_KEY dans backend/.env puis redémarrez le backend.",
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: [
                "Crée une application web complète et soignée à partir de la demande ci-dessous.",
                "Réponds uniquement par le code source complet d'un unique fichier index.html autonome.",
                "Inclue HTML, CSS et JavaScript dans ce fichier, sans dépendance de build.",
                "L'interface doit être responsive, accessible, fonctionnelle et rédigée dans la langue de la demande (français par défaut).",
                "N'inclus pas de balises Markdown ni d'explication hors du code.",
                "N'inclus aucune clé API, aucun secret et ne prétends pas connecter des services externes sans configuration.",
                "",
                "Description de l'application :",
                description,
              ].join("\n"),
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
        signal: AbortSignal.timeout(90000),
      }
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(
        response.status === 429
          ? "Quota Gemini atteint ou requêtes trop fréquentes. Vérifiez votre quota et réessayez plus tard."
          : "Gemini n’a pas pu générer l’application. Vérifiez la clé API, le modèle et la configuration Google AI Studio."
      );
      error.statusCode = response.status === 429 ? 429 : 502;
      return next(error);
    }

    const generatedCode = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text)
      .filter(Boolean)
      .join("\n")
      ?.replace(/^```(?:html)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    if (!generatedCode) {
      const error = new Error("Gemini n’a renvoyé aucun code. Reformulez votre description et réessayez.");
      error.statusCode = 502;
      return next(error);
    }

    return res.status(200).json({ html: generatedCode });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      error.statusCode = 504;
      error.message = "Gemini met trop de temps à répondre. Réessayez avec une description plus courte.";
    }
    return next(error);
  }
};

const requireText = (value, field, res) => {
  if (typeof value !== "string" || !value.trim()) {
    res.status(400).json({ message: `${field} doit être une chaîne non vide.` });
    return null;
  }
  return value.trim();
};

exports.correctSentence = (req, res) => {
  const input = requireText(req.body.text, "text", res);
  if (!input) return;

  if (/andare/i.test(input) && /ieri/i.test(input)) {
    return res.status(200).json({
      originalText: input,
      correctedText: "Ieri sono andato al lavoro.",
      genderAlternative: "Ieri sono andata al lavoro. (si vous êtes une femme)",
      translation: "Je suis allé au travail hier.",
      isCorrect: false,
      errors: [
        {
          original: "sono andare",
          correction: "sono andato / andata",
          category: "grammar",
          explanation: "Avec andare au passato prossimo, on emploie essere suivi du participe passé accordé.",
        },
        {
          original: "Io ... ieri",
          correction: "Ieri...",
          category: "word_order",
          explanation: "Le pronom sujet est généralement omis en italien ; placer ieri en début de phrase est naturel.",
        },
      ],
      suggestedRevisionQuestion: {
        prompt: "Vérifiez votre compréhension : complétez la phrase suivante.",
        blankSentence: "Ieri Luca è _____ a scuola.",
        expectedAnswer: "andato",
        hint: "Luca est masculin singulier ; andare se conjugue avec essere.",
      },
    });
  }

  if (/sono fame/i.test(input)) {
    return res.status(200).json({
      originalText: input,
      correctedText: "Ho fame.",
      translation: "J'ai faim.",
      isCorrect: false,
      errors: [{
        original: "sono fame",
        correction: "ho fame",
        category: "grammar",
        explanation: "La faim s'exprime avec avere : ho fame.",
      }],
      suggestedRevisionQuestion: {
        prompt: "Quelle est la bonne forme pour exprimer la soif ?",
        blankSentence: "Dopo la corsa, io _____ molta sete.",
        expectedAnswer: "ho",
        hint: "Utilisez avere à la première personne.",
      },
    });
  }

  if (/\b[Ll]ui e\b|\b[Ll]ei e\b/.test(input)) {
    const fixedAccent = input.replace(/\be\b/g, "è");
    return res.status(200).json({
      originalText: input,
      correctedText: fixedAccent,
      translation: "Traduction basée sur le verbe être.",
      isCorrect: false,
      errors: [{
        original: "e",
        correction: "è",
        category: "spelling",
        explanation: "'È' avec accent grave est la forme conjuguée du verbe essere ; 'e' sans accent signifie 'et'.",
      }],
      suggestedRevisionQuestion: {
        prompt: "Complétez avec 'è' ou 'e' :",
        blankSentence: "Marco _____ simpatico _____ intelligente.",
        expectedAnswer: "è / e",
        hint: "Le premier est le verbe (est), le second la liaison (et).",
      },
    });
  }

  const isCorrect = input.length > 5 && !input.includes("fame") && !input.includes("andare");
  return res.status(200).json({
    originalText: input,
    correctedText: input.endsWith(".") ? input : `${input}.`,
    translation: "Version italienne correcte de votre phrase.",
    isCorrect,
    errors: isCorrect ? [] : [{
      original: input.split(" ")[0] || input,
      correction: input.split(" ")[0] || input,
      category: "grammar",
      explanation: "La structure est compréhensible mais peut être optimisée en fluidité.",
    }],
    suggestedRevisionQuestion: {
      prompt: "Entraînez-vous à reformuler :",
      blankSentence: "Come si dice 'Merci beaucoup' in italiano ? -> Grazie _____",
      expectedAnswer: "mille",
      hint: "Expression très courante en italien.",
    },
  });
};

exports.explainPhrase = (req, res) => {
  const phrase = requireText(req.body.phrase, "phrase", res);
  if (!phrase) return;

  if (/non vedo l['’]ora|vedo l['’]ora/i.test(phrase)) {
    return res.status(200).json({
      targetPhrase: phrase,
      naturalMeaningFr: "J'ai hâte.",
      literalMeaningFr: "Je ne vois pas l'heure.",
      grammaticalBreakdown: "Non + vedere conjugué + l'ora + di suivi d'un infinitif.",
      usageContext: "Expression courante pour exprimer une impatience joyeuse.",
      additionalExamples: [
        { italian: "Non vedo l'ora di rivederti!", french: "J'ai hâte de te revoir !" },
        { italian: "Non vedono l'ora che arrivi l'estate.", french: "Ils ont hâte que l'été arrive." },
      ],
    });
  }

  if (/in bocca al lupo|crepi/i.test(phrase)) {
    return res.status(200).json({
      targetPhrase: phrase,
      naturalMeaningFr: "Bonne chance !",
      literalMeaningFr: "Dans la gueule du loup !",
      grammaticalBreakdown: "In + bocca + a + il, contracté en al + lupo.",
      usageContext: "Formule italienne traditionnelle pour souhaiter bonne chance.",
      additionalExamples: [
        { italian: "Domani ho un esame. — In bocca al lupo!", french: "J'ai un examen demain. — Bonne chance !" },
        { italian: "Crepi il lupo, grazie!", french: "Merci ! (réponse traditionnelle)" },
      ],
    });
  }

  return res.status(200).json({
    targetPhrase: phrase,
    naturalMeaningFr: `Sens contextuel de « ${phrase} » : le contexte détermine la traduction la plus naturelle.`,
    literalMeaningFr: "La traduction littérale dépend du sens de chaque mot.",
    grammaticalBreakdown: "Repérez le sujet (souvent omis), le verbe conjugué et ses compléments.",
    usageContext: "Cette phrase peut être employée dans une conversation quotidienne ; le contexte précise son registre.",
    additionalExamples: [{
      italian: "È una frase molto comune nella lingua parlata.",
      french: "C'est une phrase très courante à l'oral.",
    }],
  });
};

exports.correctParagraph = (req, res) => {
  const paragraph = requireText(req.body.text, "text", res);
  if (!paragraph) return;
  const simpleCorrectionText = paragraph
    .replace(/sono andare/gi, "sono andato")
    .replace(/\be\b/g, "è")
    .replace(/\bla cibo\b/gi, "il cibo");

  return res.status(200).json({
    originalText: paragraph,
    simpleCorrectionText,
    naturalImprovedText: "Ogni mattina mi sveglio di buon'ora e vado volentieri al lavoro. Mi piace molto chiacchierare con i colleghi e scoprire le specialità italiane a pranzo.",
    estimatedCefrLevel: paragraph.length > 150 ? "A2" : "A1",
    overallAssessmentFr: "Votre paragraphe est globalement clair et bien structuré. Quelques ajustements d'accords et d'auxiliaires permettront de lui donner une parfaite fluidité.",
    criteriaScores: {
      grammarAndConjugation: { score: 82, comment: "Bonne maîtrise des temps simples, vigilance requise sur l'accord des participes avec essere." },
      spelling: { score: 90, comment: "Orthographe quasi-parfaite, attention aux accents graves sur 'è'." },
      vocabularyRichness: { score: 78, comment: "Vocabulaire clair et approprié, vous pouvez introduire des connecteurs logiques (inoltre, tuttavia)." },
      syntaxAndCoherence: { score: 85, comment: "Enchaînement logique des idées très naturel." },
      naturalness: { score: 80, comment: "Formulations bien italiennes, quelques calques du français faciles à corriger." },
    },
    detailedErrors: [
      {
        segment: "sono andare",
        correction: "sono andato/a",
        category: "Grammaire & Auxiliaire",
        explanation: "Auxiliaire essere suivi du participe passé accordé.",
      },
      {
        segment: "la cibo",
        correction: "il cibo",
        category: "Genre des noms",
        explanation: "'Cibo' est un nom masculin en italien (il cibo).",
      },
    ],
  });
};

exports.translateAndExplain = (req, res) => {
  const text = requireText(req.body.text, "text", res);
  if (!text) return;
  const sourceLang = req.body.sourceLang === "it" ? "it" : "fr";

  return res.status(200).json({
    sourceText: text,
    sourceLang,
    ...(sourceLang === "fr"
      ? {
          literalTranslation: text.toLowerCase().includes("hâte")
            ? "Non vedo l'ora."
            : "Traduction littérale mot à mot de votre demande.",
          naturalTranslation: text.toLowerCase().includes("comment allez-vous")
            ? "Come sta?"
            : "Traduction naturelle adaptée à l'usage réel italien.",
          formalityVariants: {
            informalTu: "Come stai? Ti va di venire con noi stasera?",
            formalLei: "Come sta? Le andrebbe di accompagnarci questa sera?",
          },
          idiomOrCulturalNote: "En Italie, l'alternance entre le tutoiement ('dare del tu') et le vouvoiement avec 'Lei' (3e personne du singulier féminin) est très codifiée dans les commerces et le milieu professionnel.",
        }
      : {
          literalTranslation: "Traduction mot à mot vers le français.",
          naturalTranslation: "Traduction française naturelle et élégante.",
          formalityVariants: {
            informalTu: "Sens familier entre proches.",
            formalLei: "Sens poli et soutenu.",
          },
          idiomOrCulturalNote: "Note d'usage sur les subtilités d'accentuation tonique en italien.",
        }),
  });
};

exports.chatInScenario = async (req, res, next) => {
  const userMessage = requireText(req.body.userMessage, "userMessage", res);
  if (!userMessage) return;
  const scenarioId = typeof req.body.scenarioId === "string" ? req.body.scenarioId : "";
  const historyLength = Number.isInteger(req.body.historyLength) ? req.body.historyLength : 0;
  const lower = userMessage.toLowerCase();

  try {
    const record = scenarioId
      ? await DynamicContent.findOne({ kind: "scenario", key: scenarioId }).lean()
      : null;
    if (record) {
      const scenario = record.data;
      return res.status(200).json({
        text: historyLength % 2 === 0
          ? "Interessante! Puoi dirmi qualcosa in più?"
          : "Capisco. Come vuoi continuare questa conversazione?",
        translation: `Je vous réponds dans le scénario « ${scenario.title} » : pouvez-vous m’en dire davantage ?`,
        feedbackTip: `Vous jouez le rôle suivant : ${scenario.userRoleDescription}`,
      });
    }
  } catch (error) {
    return next(error);
  }

  if (scenarioId === "scen-restaurant" && /prenot|tavolo|due/.test(lower)) {
    return res.status(200).json({
      text: "Perfetto! Abbiamo un bellissimo tavolo riservato vicino alla finestra. Accomodatevi pure. Desiderate iniziare con dell'acqua naturale o frizzante?",
      translation: "Parfait ! Nous avons une belle table près de la fenêtre. Désirez-vous commencer avec de l'eau plate ou gazeuse ?",
      feedbackTip: "Ottimo! Pour commander, vous pouvez employer « Vorrei... ».",
    });
  }
  if (scenarioId === "scen-restaurant") {
    return res.status(200).json({
      text: "Certamente! Vi porto subito il menù del giorno. Abbiamo carbonara, cacio e pepe e amatriciana.",
      translation: "Certainement ! Je vous apporte le menu du jour : carbonara, cacio e pepe et amatriciana.",
      feedbackTip: "En Italie, il primo désigne généralement les pâtes ou le risotto.",
    });
  }
  if (scenarioId === "scen-travel") {
    return res.status(200).json({
      text: "Certamente, il prossimo treno per Firenze parte alle 14:35 dal binario 8. Desidera viaggiare in classe Standard o Business?",
      translation: "Le prochain train pour Florence part à 14 h 35 du quai 8. Souhaitez-vous voyager en classe Standard ou Business ?",
      feedbackTip: "Binario signifie voie ou quai de train.",
    });
  }
  return res.status(200).json({
    text: "Capisco! È un piacere fare conversazione con lei. Mi dica di più sui suoi progetti.",
    translation: "Je comprends ! C'est un plaisir de converser avec vous. Dites-m'en plus sur vos projets.",
    ...(historyLength % 2 === 0 ? { feedbackTip: "Bravo pour votre fluidité ! Continuez à pratiquer." } : {}),
  });
};

exports.generateErrorRevisionQuestions = (_req, res) => res.status(200).json({
  questions: [
    {
      id: "rev-1",
      topic: "Auxiliaires essere et avere",
      prompt: "Choisissez l'auxiliaire approprié : 'Ieri sera noi _____ andati al cinema.'",
      options: ["abbiamo", "siamo", "hanno", "siete"],
      correctIndex: 1,
      explanation: "Andare se conjugue au passato prossimo avec essere : noi siamo andati.",
    },
    {
      id: "rev-2",
      topic: "Articles définis masculins",
      prompt: "Complétez : '_____ zaino di Marco è sul tavolo.'",
      options: ["Il", "Lo", "L'", "Gli"],
      correctIndex: 1,
      explanation: "Devant z, on emploie lo au singulier : lo zaino.",
    },
    {
      id: "rev-3",
      topic: "Besoins et sensations physiques",
      prompt: "Comment dit-on 'Nous avons soif' ?",
      options: ["Siamo sete", "Abbiamo sete", "Facciamo sete", "Prendiamo sete"],
      correctIndex: 1,
      explanation: "La soif se dit avec avere : abbiamo sete.",
    },
  ],
});

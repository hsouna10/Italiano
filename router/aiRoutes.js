const express = require("express");
const router = express.Router();
const { protect } = require("../midelware/authMiddleware");
const aiController = require("../controlleur/aiController");

router.use(protect);
router.post("/correct-sentence", aiController.correctSentence);
router.post("/explain-phrase", aiController.explainPhrase);
router.post("/correct-paragraph", aiController.correctParagraph);
router.post("/translate-explain", aiController.translateAndExplain);
router.post("/conversation", aiController.chatInScenario);
router.post("/generate-app", aiController.generateApp);
router.get("/review-questions", aiController.generateErrorRevisionQuestions);

module.exports = router;

import { apiService } from './apiService';

export interface SentenceCorrectionResponse {
  originalText: string;
  correctedText: string;
  genderAlternative?: string;
  translation: string;
  isCorrect: boolean;
  errors: Array<{
    original: string;
    correction: string;
    category: 'grammar' | 'spelling' | 'vocabulary' | 'word_order';
    explanation: string;
  }>;
  suggestedRevisionQuestion: {
    prompt: string;
    blankSentence: string;
    expectedAnswer: string;
    hint: string;
  };
}

export interface PhraseExplanationResponse {
  targetPhrase: string;
  naturalMeaningFr: string;
  literalMeaningFr: string;
  grammaticalBreakdown: string;
  usageContext: string;
  additionalExamples: Array<{ italian: string; french: string }>;
}

export interface ParagraphCorrectionResponse {
  originalText: string;
  simpleCorrectionText: string;
  naturalImprovedText: string;
  estimatedCefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  overallAssessmentFr: string;
  criteriaScores: {
    grammarAndConjugation: { score: number; comment: string };
    spelling: { score: number; comment: string };
    vocabularyRichness: { score: number; comment: string };
    syntaxAndCoherence: { score: number; comment: string };
    naturalness: { score: number; comment: string };
  };
  detailedErrors: Array<{
    segment: string;
    correction: string;
    category: string;
    explanation: string;
  }>;
}

export interface TranslationExplanationResponse {
  sourceText: string;
  sourceLang: 'fr' | 'it';
  literalTranslation: string;
  naturalTranslation: string;
  formalityVariants: { informalTu: string; formalLei: string };
  idiomOrCulturalNote?: string;
}

export interface ErrorRevisionQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

class AiService {
  correctSentence(input: string, userLevel = 'A1'): Promise<SentenceCorrectionResponse> {
    return apiService.aiRequest('correct-sentence', { text: input, userLevel });
  }

  explainPhrase(phrase: string): Promise<PhraseExplanationResponse> {
    return apiService.aiRequest('explain-phrase', { phrase });
  }

  correctParagraph(paragraph: string): Promise<ParagraphCorrectionResponse> {
    return apiService.aiRequest('correct-paragraph', { text: paragraph });
  }

  translateAndExplain(text: string, sourceLang: 'fr' | 'it' = 'fr'): Promise<TranslationExplanationResponse> {
    return apiService.aiRequest('translate-explain', { text, sourceLang });
  }

  chatInScenario(
    userMessage: string,
    scenarioId: string,
    historyLength: number,
  ): Promise<{ text: string; translation: string; feedbackTip?: string }> {
    return apiService.aiRequest('conversation', { userMessage, scenarioId, historyLength });
  }

  generateApp(description: string): Promise<{ html: string }> {
    return apiService.aiRequest('generate-app', { description });
  }

  downloadGeneratedApp(html: string): void {
    const file = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mon-application.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async generateErrorRevisionQuestions(): Promise<ErrorRevisionQuestion[]> {
    const result = await apiService.aiRequest<{ questions: ErrorRevisionQuestion[] }>('review-questions');
    return result.questions;
  }
}

export const aiService = new AiService();

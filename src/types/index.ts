export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type UserRole = 'student' | 'admin' | 'editor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  italianLevel: CefrLevel;
  preferredLanguage: string;
  streakDays: number;
  xpPoints: number;
  gems: number;
  completedLessons: string[];
  studiedMinutes: number;
  learningGoals: string[];
}

export interface ConjugationRow {
  pronoun: string; // io, tu, lui/lei, noi, voi, loro
  verbForm: string; // sono, sei, è, siamo, siete, sono
  translation: string; // je suis, tu es, ...
  example: string; // Sono a Milano
  exampleFr: string; // Je suis à Milan
}

export interface LessonSection {
  id: string;
  title: string;
  contentMarkdown: string;
  conjugationTable?: {
    verbName: string;
    auxiliaryNote?: string;
    rows: ConjugationRow[];
  };
  examples: Array<{
    italian: string;
    french: string;
    audioText?: string;
    note?: string;
  }>;
  commonMistakes: Array<{
    incorrect: string;
    correct: string;
    explanation: string;
  }>;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  level: CefrLevel;
  unitNumber: number;
  orderNumber: number;
  title: string;
  titleFr: string;
  description: string;
  videoUrl?: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  sections: LessonSection[];
  quiz: LessonQuizQuestion[];
  isCompleted?: boolean;
}

export type ExerciseType = 
  | 'multiple_choice' 
  | 'fill_blank' 
  | 'word_reorder' 
  | 'translation' 
  | 'error_correction' 
  | 'free_production';

export interface BaseExercise {
  id: string;
  level: CefrLevel;
  part?: string;
  topic: string;
  type: ExerciseType;
  prompt: string;
  promptFr?: string;
  difficulty: 'facile' | 'moyen' | 'avancé';
  explanation: string;
  audioPhrase?: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  options: string[];
  correctIndex: number;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill_blank';
  sentenceBefore: string;
  sentenceAfter: string;
  correctAnswers: string[]; // Accepts variants e.g. ["andato", "andata"]
  hint?: string;
}

export interface WordReorderExercise extends BaseExercise {
  type: 'word_reorder';
  scrambledWords: string[];
  correctSentence: string;
  alternativeSentences?: string[];
}

export interface TranslationExercise extends BaseExercise {
  type: 'translation';
  sourceLanguage: 'fr' | 'it';
  targetSentence: string;
  acceptableAnswers: string[];
}

export interface ErrorCorrectionExercise extends BaseExercise {
  type: 'error_correction';
  faultySentence: string;
  errorPart: string;
  correctedSentence: string;
  grammarRule: string;
}

export interface FreeProductionExercise extends BaseExercise {
  type: 'free_production';
  theme: string;
  suggestedVocabulary: string[];
  minWords: number;
  evaluationCriteria: string[];
}

export type Exercise = 
  | MultipleChoiceExercise 
  | FillBlankExercise 
  | WordReorderExercise 
  | TranslationExercise 
  | ErrorCorrectionExercise 
  | FreeProductionExercise;

export type SrsBox = 'today' | 'learning' | 'mastered';

export interface VocabularyWord {
  id: string;
  italian: string;
  french: string;
  genderOrType: 's.m.' | 's.f.' | 'v.' | 'adj.' | 'adv.' | 'expr.';
  level: CefrLevel;
  exampleItalian: string;
  exampleFrench: string;
  srsBox: SrsBox;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  audioHint?: string;
}

export interface ReadingText {
  id: string;
  level: CefrLevel;
  title: string;
  titleFr: string;
  category: string;
  italianParagraphs: string[];
  frenchParagraphs: string[];
  vocabularyGlossary: Record<string, string>; // word -> french meaning
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface ConversationScenario {
  id: string;
  title: string;
  theme: string;
  level: CefrLevel;
  scenarioDescription: string;
  initialAiMessage: string;
  initialAiMessageFr: string;
  userRoleDescription: string;
  aiRoleDescription: string;
  sampleReplies: string[];
}

export interface LearningVideo {
  id: string;
  title: string;
  description: string;
  level: CefrLevel;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  level: CefrLevel;
  audioUrl: string;
  coverUrl?: string;
  italianLyrics?: string;
  frenchTranslation?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  translation?: string;
  explanation?: string;
  corrections?: Array<{
    original: string;
    correction: string;
    category: 'grammar' | 'spelling' | 'vocabulary' | 'naturalness';
    explanation: string;
  }>;
  suggestedRevisionQuestion?: {
    question: string;
    blankSentence: string;
    expectedAnswer: string;
  };
  audioAvailable?: boolean;
  timestamp: string;
}

export type AiMode = 
  | 'correct_sentence' 
  | 'explain_phrase' 
  | 'correct_paragraph' 
  | 'translate_explain' 
  | 'conversation' 
  | 'review_errors';

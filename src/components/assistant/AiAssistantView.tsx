import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  MessageSquare, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Languages,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConversationScenario } from '../../types';
import { aiService } from '../../services/aiService';
import { audioService } from '../../services/audioService';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';

export const AiAssistantView: React.FC = () => {
  const { user, addXp, conversationScenarios } = useApp();
  const levelScenarios = conversationScenarios.filter(scenario => scenario.level === user.italianLevel);
  const [selectedMode, setSelectedMode] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Mode 1 state
  const [m1Input, setM1Input] = useState("Io sono andare al lavoro ieri.");
  const [m1Result, setM1Result] = useState<any>(null);
  const [m1RevisionAnswer, setM1RevisionAnswer] = useState("");
  const [m1RevisionFeedback, setM1RevisionFeedback] = useState<string | null>(null);

  // Mode 2 state
  const [m2Input, setM2Input] = useState("Non vedo l'ora di partire.");
  const [m2Result, setM2Result] = useState<any>(null);

  // Mode 3 state
  const [m3Input, setM3Input] = useState("Ogni mattina io svegliare alle sette. Prendo colazione con caffè e vado a lavoro. Mi piace molto imparare l'italiano.");
  const [m3CorrectionType, setM3CorrectionType] = useState<'simple' | 'natural'>('simple');
  const [m3Result, setM3Result] = useState<any>(null);

  // Mode 4 state
  const [m4Input, setM4Input] = useState("Comment allez-vous aujourd'hui ?");
  const [m4Result, setM4Result] = useState<any>(null);

  // Mode 5 state (Conversation)
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const currentScenario: ConversationScenario | undefined =
    levelScenarios.find(scenario => scenario.id === currentScenarioId) || levelScenarios[0];
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; translation?: string; feedbackTip?: string }>>([]);
  const [chatInput, setChatInput] = useState("");

  // Mode 6 state (Error revision)
  const [revisionQuestions, setRevisionQuestions] = useState<any[]>([]);
  const [revAnswers, setRevAnswers] = useState<Record<string, number>>({});
  const [appDescription, setAppDescription] = useState('');
  const [generatedApp, setGeneratedApp] = useState('');
  const [appError, setAppError] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentScenario && currentScenario.id !== currentScenarioId) {
      setCurrentScenarioId(currentScenario.id);
      setChatMessages([{
        sender: 'assistant',
        text: currentScenario.initialAiMessage,
        translation: currentScenario.initialAiMessageFr,
      }]);
    }
  }, [currentScenario, currentScenarioId]);

  // Trigger handlers
  const handleRunMode1 = async () => {
    if (!m1Input.trim()) return;
    setLoading(true);
    setM1RevisionFeedback(null);
    try {
      const res = await aiService.correctSentence(m1Input, user.italianLevel);
      setM1Result(res);
      addXp(10);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateM1Revision = () => {
    if (!m1Result?.suggestedRevisionQuestion) return;
    const clean = m1RevisionAnswer.trim().toLowerCase();
    const exp = m1Result.suggestedRevisionQuestion.expectedAnswer.toLowerCase();
    if (clean === exp || clean.includes(exp)) {
      setM1RevisionFeedback("Bravissimo ! Bonne réponse !");
      triggerSuccessConfetti();
      addXp(15);
    } else {
      setM1RevisionFeedback(`La réponse attendue était : "${m1Result.suggestedRevisionQuestion.expectedAnswer}"`);
    }
  };

  const handleRunMode2 = async () => {
    if (!m2Input.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.explainPhrase(m2Input);
      setM2Result(res);
      addXp(10);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMode3 = async () => {
    if (!m3Input.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.correctParagraph(m3Input);
      setM3Result(res);
      addXp(20);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMode4 = async () => {
    if (!m4Input.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.translateAndExplain(m4Input, 'fr');
      setM4Result(res);
      addXp(10);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (msgToSend?: string) => {
    const text = msgToSend || chatInput;
    if (!text.trim() || loading || !currentScenario) return;

    const newHistory = [...chatMessages, { sender: 'user' as const, text }];
    setChatMessages(newHistory);
    setChatInput("");
    setLoading(true);

    try {
      const reply = await aiService.chatInScenario(text, currentScenario.id, newHistory.length);
      setChatMessages([...newHistory, {
        sender: 'assistant',
        text: reply.text,
        translation: reply.translation,
        feedbackTip: reply.feedbackTip
      }]);
      addXp(15);
      audioService.speak(reply.text);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMode6 = async () => {
    setLoading(true);
    try {
      const list = await aiService.generateErrorRevisionQuestions();
      setRevisionQuestions(list);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApp = async () => {
    if (!appDescription.trim() || loading) return;
    setLoading(true);
    setAppError(null);
    setGeneratedApp('');
    try {
      const result = await aiService.generateApp(appDescription.trim());
      setGeneratedApp(result.html);
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Gemini n’a pas pu générer cette application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bot className="text-emerald-400" size={26} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assistant IA Personnel — 6 Modes d'Apprentissage
          </h1>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Un tuteur intelligent conforme au cahier des charges : correction explicative sans réécriture inutile, gestion des variantes, simulations de dialogue et suivi des points faibles.
        </p>
      </div>

      {/* Mode Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {[
          { num: 1, label: "1. Corriger une phrase" },
          { num: 2, label: "2. Expliquer une phrase" },
          { num: 3, label: "3. Corriger paragraphe" },
          { num: 4, label: "4. Traduire & nuances" },
          { num: 5, label: "5. Conversation réelle" },
          { num: 6, label: "6. Réviser mes erreurs" },
          { num: 7, label: "7. Créer une application" },
        ].map((item) => (
          <button
            key={item.num}
            onClick={() => {
              setSelectedMode(item.num);
              if (item.num === 6 && revisionQuestions.length === 0) {
                handleLoadMode6();
              }
            }}
            className={`p-3 rounded-2xl text-xs font-bold transition-all text-left border ${
              selectedMode === item.num
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-green scale-102'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-850'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mode View Containers */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">

        {/* ================= MODE 1: Corriger une phrase ================= */}
        {selectedMode === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Mode 1 — Corriger une phrase</h3>
              <p className="text-xs text-slate-400">
                L'assistant analyse la syntaxe, les auxiliaires, accords de genre et génère une question de consolidation.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Entrez votre phrase en italien :</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={m1Input}
                  onChange={(e) => setM1Input(e.target.value)}
                  placeholder="Ex: Io sono andare al lavoro ieri."
                  className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
                />
                <button
                  onClick={handleRunMode1}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Analyser</span>
                </button>
              </div>
            </div>

            {m1Result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m1Result.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {m1Result.isCorrect ? '✅ Phrase déjà correcte' : '💡 Corrections suggérées'}
                  </span>
                  <button
                    onClick={() => audioService.speak(m1Result.correctedText)}
                    className="p-2 rounded-lg bg-slate-900 text-emerald-400 hover:text-white"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Phrase recommandée :</div>
                  <div className="text-lg font-extrabold text-emerald-400">{m1Result.correctedText}</div>
                  {m1Result.genderAlternative && (
                    <div className="text-xs text-slate-400 italic">Variante : {m1Result.genderAlternative}</div>
                  )}
                  <div className="text-xs text-slate-300 pt-1">🇫🇷 Sens : {m1Result.translation}</div>
                </div>

                {m1Result.errors?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Points d'explication pédagogique :</span>
                    {m1Result.errors.map((err: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="text-amber-400 font-bold">{err.original} ➔ {err.correction}</div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {m1Result.suggestedRevisionQuestion && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs space-y-3">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> Question de révision immédiate :
                    </div>
                    <p className="text-white text-sm font-semibold">{m1Result.suggestedRevisionQuestion.blankSentence}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={m1RevisionAnswer}
                        onChange={(e) => setM1RevisionAnswer(e.target.value)}
                        placeholder="Complétez le mot..."
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                      <button
                        onClick={handleValidateM1Revision}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Tester
                      </button>
                    </div>
                    {m1RevisionFeedback && (
                      <p className="text-xs font-bold text-emerald-300">{m1RevisionFeedback}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ================= MODE 2: Expliquer une phrase ================= */}
        {selectedMode === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Mode 2 — Expliquer une phrase ou une expression idiomatique</h3>
              <p className="text-xs text-slate-400">
                Comprenez le sens figuré, les origines culturelles et la syntaxe des tournures italiennes réelles.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={m2Input}
                onChange={(e) => setM2Input(e.target.value)}
                placeholder="Ex: Non vedo l'ora di partire. ou In bocca al lupo!"
                className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
              />
              <button
                onClick={handleRunMode2}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>Expliquer</span>
              </button>
            </div>

            {m2Result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{m2Result.targetPhrase}</span>
                  <button
                    onClick={() => audioService.speak(m2Result.targetPhrase)}
                    className="p-2 rounded-lg bg-slate-900 text-emerald-400 hover:text-white"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">Sens naturel :</span>
                    <p className="text-white font-semibold text-sm">{m2Result.naturalMeaningFr}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Traduction mot à mot :</span>
                    <p className="text-slate-300 text-xs">{m2Result.literalMeaningFr}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-200">Décomposition grammaticale :</span>
                  <p>{m2Result.grammaticalBreakdown}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-300/90 italic">
                  💡 Contexte d'usage : {m2Result.usageContext}
                </div>

                {m2Result.additionalExamples?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Autres exemples :</span>
                    {m2Result.additionalExamples.map((ex: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-emerald-300 font-semibold">{ex.italian}</span>
                          <span className="text-slate-400 ml-2">({ex.french})</span>
                        </div>
                        <button onClick={() => audioService.speak(ex.italian)} className="p-1 text-slate-400 hover:text-emerald-400">
                          <Volume2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ================= MODE 3: Corriger un paragraphe ================= */}
        {selectedMode === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">Mode 3 — Corriger et améliorer un paragraphe</h3>
                <p className="text-xs text-slate-400">
                  Analyse multidimensionnelle : grammaire, orthographe, vocabulaire, cohérence et naturel.
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setM3CorrectionType('simple')}
                  className={`px-3 py-1 rounded-lg font-semibold ${m3CorrectionType === 'simple' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Correction simple
                </button>
                <button
                  onClick={() => setM3CorrectionType('natural')}
                  className={`px-3 py-1 rounded-lg font-semibold ${m3CorrectionType === 'natural' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Amélioration complète
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={m3Input}
              onChange={(e) => setM3Input(e.target.value)}
              placeholder="Écrivez votre paragraphe en italien ici..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
            />

            <button
              onClick={handleRunMode3}
              disabled={loading}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Analyser le paragraphe</span>
            </button>

            {m3Result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4 border-t border-slate-800">
                {/* Side by side comparison */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Texte Original</span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{m3Result.originalText}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {m3CorrectionType === 'simple' ? 'Version Corrigée' : 'Version Plus Naturelle'}
                    </span>
                    <p className="text-xs text-emerald-200 leading-relaxed whitespace-pre-line font-medium">
                      {m3CorrectionType === 'simple' ? m3Result.simpleCorrectionText : m3Result.naturalImprovedText}
                    </p>
                  </div>
                </div>

                {/* Criteria Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Grille d'évaluation pédagogique :</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    {Object.entries(m3Result.criteriaScores).map(([key, val]: any) => (
                      <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-base font-extrabold text-emerald-400">{val.score}%</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{key.replace(/([A-Z])/g, ' $1')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors list */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Détails des corrections :</span>
                  {m3Result.detailedErrors.map((err: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-start gap-4">
                      <div>
                        <span className="text-rose-400 line-through mr-2 font-mono">{err.segment}</span>
                        <span className="text-emerald-400 font-bold font-mono">➔ {err.correction}</span>
                        <p className="text-slate-400 text-[11px] mt-1">{err.explanation}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {err.category}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ================= MODE 4: Traduire et expliquer les nuances ================= */}
        {selectedMode === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Mode 4 — Traduire et expliquer les registres de langue</h3>
              <p className="text-xs text-slate-400">
                Distingue la traduction littérale, l'expression naturelle, le tutoiement ('tu') et le vouvoiement formel ('Lei').
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={m4Input}
                onChange={(e) => setM4Input(e.target.value)}
                placeholder="Entrez une phrase en français ou italien..."
                className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
              />
              <button
                onClick={handleRunMode4}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-2"
              >
                <Languages size={16} />
                <span>Traduire</span>
              </button>
            </div>

            {m4Result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Traduction littérale mot à mot :</span>
                    <p className="text-xs text-slate-300 font-mono">{m4Result.literalTranslation}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase">Traduction naturelle en contexte :</span>
                    <p className="text-sm text-emerald-300 font-bold">{m4Result.naturalTranslation}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Variantes selon la politesse & registres :</span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-400 font-semibold">👤 Tutoiement familier (dare del tu) :</div>
                    <p className="text-white font-medium">{m4Result.formalityVariants.informalTu}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="text-amber-400 font-semibold">🎩 Vouvoiement formel (dare del Lei) :</div>
                    <p className="text-white font-medium">{m4Result.formalityVariants.formalLei}</p>
                  </div>
                </div>

                {m4Result.idiomOrCulturalNote && (
                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-blue-300">
                    ℹ️ Note culturelle : {m4Result.idiomOrCulturalNote}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ================= MODE 5: Conversation scénarisée ================= */}
        {selectedMode === 5 && (
          <div className="space-y-6 rounded-3xl border border-[#E2D9CC] border-l-8 border-l-[#CDBFB2] bg-[#FFFDF8] p-5 shadow-parla sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4DA] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F1A17]">Cahier de conversation</h3>
                <p className="text-xs text-[#7A7169]">
                  Pratiquez des mises en situation de niveau {user.italianLevel}.
                </p>
              </div>

              {/* Scenario dropdown */}
              <select
                aria-label="Sélectionner le scénario de conversation"
                value={currentScenario?.id || ''}
                onChange={(e) => {
                  const sc = levelScenarios.find(s => s.id === e.target.value);
                  if (sc) {
                    setCurrentScenarioId(sc.id);
                    setChatInput("");
                    setChatMessages([
                      { sender: 'assistant', text: sc.initialAiMessage, translation: sc.initialAiMessageFr }
                    ]);
                  }
                }}
                disabled={levelScenarios.length === 0}
                className="rounded-xl border border-[#EAE4DA] bg-white px-3 py-2 text-xs font-semibold text-[#2A6F55]"
              >
                {levelScenarios.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.title} ({sc.level})</option>
                ))}
              </select>
            </div>

            {!currentScenario && (
              <p role="status" className="rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] p-4 text-sm text-[#7A7169]">
                Aucun scénario de conversation n’est disponible pour le niveau {user.italianLevel}. Demandez à un administrateur d’en créer un.
              </p>
            )}

            {currentScenario && (
              <div className="space-y-2 rounded-2xl border border-[#F6D9CE] bg-[#FDF4ED] p-4">
                <p className="text-sm font-semibold text-[#1F1A17]">{currentScenario.scenarioDescription}</p>
                <p className="text-xs text-[#68605A]">
                  Votre rôle : {currentScenario.userRoleDescription}
                </p>
                <p className="text-xs text-[#68605A]">
                  Rôle du tuteur : {currentScenario.aiRoleDescription}
                </p>
              </div>
            )}

            {/* Chat Box */}
            <div
              className="h-80 space-y-3 overflow-y-auto rounded-2xl border border-[#EAE4DA] bg-[#FFFDF8] p-4"
              style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, rgba(216, 206, 189, 0.35) 36px)' }}
            >
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    msg.sender === 'user' 
                      ? 'rounded-br-none bg-[#2A6F55] text-white' 
                      : 'rounded-bl-none border border-[#EAE4DA] bg-white text-[#1F1A17] shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{msg.text}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => audioService.speak(msg.text)}
                          className="p-0.5 text-[#2A6F55] hover:text-[#C04A33]"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                    {msg.translation && (
                      <p className="text-[11px] italic text-[#7A7169]">🇫🇷 {msg.translation}</p>
                    )}
                  </div>
                  {msg.feedbackTip && (
                    <div className="mt-1 max-w-[85%] rounded border border-[#CDE3D8] bg-[#EDF6F2] px-2 py-1 text-[10px] text-[#2A6F55]">
                      💡 {msg.feedbackTip}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested replies */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase text-[#7A7169]">Idées de réponses :</span>
              <div className="flex flex-wrap gap-2">
                {currentScenario?.sampleReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChatMessage(reply)}
                    className="rounded-xl border border-[#EAE4DA] bg-white px-3 py-1.5 text-xs text-[#4A423D] transition-colors hover:border-[#C04A33] hover:bg-[#FAF7F2]"
                  >
                    "{reply}"
                  </button>
                ))}
              </div>
            </div>

            {/* Send bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Répondez en italien..."
                disabled={!currentScenario}
                className="flex-1 rounded-xl border border-[#EAE4DA] bg-white p-3.5 text-sm text-[#1F1A17] focus:border-[#2A6F55] focus:outline-none"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={loading || !chatInput.trim() || !currentScenario}
                className="rounded-xl bg-[#2A6F55] px-6 py-3.5 text-xs font-bold text-white hover:bg-[#235b46] disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE 6: Réviser les erreurs fréquentes ================= */}
        {selectedMode === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Mode 6 — Révision ciblée de mes erreurs</h3>
                <p className="text-xs text-slate-400">
                  L'IA génère automatiquement des exercices personnalisés ciblant vos difficultés récurrentes.
                </p>
              </div>
              <button
                onClick={handleLoadMode6}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Régénérer</span>
              </button>
            </div>

            {revisionQuestions.length === 0 && loading && (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Génération de vos exercices ciblés en cours...
              </div>
            )}

            <div className="space-y-4">
              {revisionQuestions.map((q, idx) => {
                const selected = revAnswers[q.id];
                const answered = selected !== undefined;
                const isCorrect = selected === q.correctIndex;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                        {q.topic}
                      </span>
                      {answered && (
                        <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCorrect ? '✅ Validé' : '❌ À revoir'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-white">{q.prompt}</p>

                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          onClick={() => {
                            if (!answered) {
                              setRevAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                              if (optIdx === q.correctIndex) {
                                triggerSuccessConfetti();
                                addXp(15);
                              }
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                            answered
                              ? optIdx === q.correctIndex
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                                : selected === optIdx
                                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                              : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {answered && (
                      <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedMode === 7 && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Décrivez votre application</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Expliquez ce que vous voulez créer. Gemini générera un fichier HTML autonome que vous pourrez télécharger.
              </p>
            </div>
            <label className="block space-y-2 text-xs font-semibold text-slate-300">
              Votre idée
              <textarea
                rows={5}
                maxLength={6000}
                value={appDescription}
                onChange={event => setAppDescription(event.target.value)}
                placeholder="Ex. Crée une application de gestion de tâches en français, avec ajout, catégories, cases à cocher et sauvegarde locale."
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm font-normal text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">{appDescription.length}/6000 caractères</span>
              <button
                type="button"
                onClick={() => void handleGenerateApp()}
                disabled={!appDescription.trim() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={16} />
                {loading ? 'Gemini crée votre application…' : 'Générer avec Gemini'}
              </button>
            </div>
            {appError && <p role="alert" className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">{appError}</p>}
            {generatedApp && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">Votre application est prête</h4>
                    <p className="text-[11px] text-slate-400">Le fichier n’est pas exécuté dans l’application. Ouvrez-le localement après téléchargement.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => aiService.downloadGeneratedApp(generatedApp)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Download size={15} /> Télécharger HTML
                  </button>
                </div>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-300">{generatedApp}</pre>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, Volume2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { audioService } from '../../services/audioService';

export const FloatingAiDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, user } = useApp();
  const [inputText, setInputText] = useState('');
  const [activeQuickMode, setActiveQuickMode] = useState<'correct' | 'explain' | 'chat' | 'app'>('correct');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      if (activeQuickMode === 'correct') {
        const res = await aiService.correctSentence(inputText, user.italianLevel);
        setResult(res);
      } else if (activeQuickMode === 'explain') {
        const res = await aiService.explainPhrase(inputText);
        setResult(res);
      } else if (activeQuickMode === 'chat') {
        const res = await aiService.chatInScenario(inputText, 'scen-restaurant', 1);
        setResult({
          chatReply: res.text,
          chatTranslation: res.translation,
          feedbackTip: res.feedbackTip
        });
      } else {
        const res = await aiService.generateApp(inputText);
        setResult({ generatedApp: res.html });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'L’assistant n’a pas pu traiter votre demande.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = (text: string) => {
    audioService.speak(text);
  };

  return (
    <AnimatePresence>
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-[#FBF9F5] border-l border-[#EAE4DA] shadow-2xl flex flex-col text-[#1F1A17]"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#EAE4DA] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#1F1A17]">Assistant IA Personnel</h3>
                    <p className="text-[11px] text-[#2A6F55]">Accompagnement pédagogique en temps réel</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#8A817A] hover:text-[#1F1A17] hover:bg-[#F5F1EA]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Mode Pills */}
              <div className="p-3 bg-[#F5F1EA] border-b border-[#EAE4DA] flex items-center gap-2">
                <button
                  onClick={() => { setActiveQuickMode('correct'); setResult(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    activeQuickMode === 'correct'
                      ? 'bg-[#C04A33] text-white shadow-xs'
                      : 'bg-white text-[#4A423D] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Corriger
                </button>
                <button
                  onClick={() => { setActiveQuickMode('explain'); setResult(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    activeQuickMode === 'explain'
                      ? 'bg-[#C04A33] text-white shadow-xs'
                      : 'bg-white text-[#4A423D] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Expliquer
                </button>
                <button
                  onClick={() => { setActiveQuickMode('chat'); setResult(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    activeQuickMode === 'chat'
                      ? 'bg-[#C04A33] text-white shadow-xs'
                      : 'bg-white text-[#4A423D] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Parler
                </button>
                <button
                  onClick={() => { setActiveQuickMode('app'); setResult(null); setErrorMessage(null); }}
                  className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors ${
                    activeQuickMode === 'app'
                      ? 'bg-[#C04A33] text-white shadow-xs'
                      : 'bg-white text-[#4A423D] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Créer une app
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A817A]">
                    {activeQuickMode === 'app' ? 'Décrivez votre idée :' : 'Suggestions rapides :'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuickMode === 'correct' && (
                      <>
                        <button
                          onClick={() => setInputText("Io sono andare al lavoro ieri.")}
                          className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-[#F5F1EA] text-[#4A423D] border border-[#EAE4DA] transition-colors"
                        >
                          "Io sono andare al lavoro ieri."
                        </button>
                        <button
                          onClick={() => setInputText("Sono fame adesso.")}
                          className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-[#F5F1EA] text-[#4A423D] border border-[#EAE4DA] transition-colors"
                        >
                          "Sono fame adesso."
                        </button>
                      </>
                    )}
                    {activeQuickMode === 'explain' && (
                      <button
                        onClick={() => setInputText("Non vedo l'ora di partire.")}
                        className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-[#F5F1EA] text-[#4A423D] border border-[#EAE4DA] transition-colors"
                      >
                        "Non vedo l'ora di..."
                      </button>
                    )}
                    {activeQuickMode === 'chat' && (
                      <button
                        onClick={() => setInputText("Buonasera, vorrei un tavolo per due persone.")}
                        className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-[#F5F1EA] text-[#4A423D] border border-[#EAE4DA] transition-colors"
                      >
                        "Buonasera, vorrei un tavolo..."
                      </button>
                    )}
                    {activeQuickMode === 'app' && (
                      <button
                        onClick={() => setInputText('Crée une application de gestion de tâches en français, avec ajout, catégories, cases à cocher et sauvegarde locale.')}
                        className="rounded-xl border border-[#EAE4DA] bg-white px-2.5 py-1 text-xs text-[#4A423D] transition-colors hover:bg-[#F5F1EA]"
                      >
                        Exemple : application de tâches
                      </button>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <p role="alert" className="rounded-xl border border-[#F6D9CE] bg-[#FDF4ED] p-3 text-xs leading-relaxed text-[#A53623]">
                    {errorMessage}
                  </p>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <div className="w-8 h-8 border-2 border-[#C04A33] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-[#7A7169] animate-pulse">L'IA analyse votre phrase...</p>
                  </div>
                )}

                {/* Result Display */}
                {result && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white border border-[#EAE4DA] space-y-3.5 shadow-sm"
                  >
                    {activeQuickMode === 'correct' && (
                      <>
                        <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-2">
                          <span className="text-xs font-bold text-[#8A817A]">Résultat didactique</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${result.isCorrect ? 'text-[#2A6F55]' : 'text-[#C04A33]'}`}>
                            {result.isCorrect ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                            {result.isCorrect ? "Correct !" : "Correction recommandée"}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#8A817A] uppercase font-semibold">Forme naturelle :</div>
                          <div className="flex items-center justify-between mt-1 p-2.5 bg-[#FDF4ED] border border-[#F6D9CE] rounded-xl">
                            <span className="text-sm font-bold text-[#C04A33]">{result.correctedText}</span>
                            <button
                              onClick={() => handlePlayVoice(result.correctedText)}
                              className="p-1 rounded-full text-[#C04A33] hover:bg-[#F5D5C8]"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                          {result.genderAlternative && (
                            <p className="text-xs text-[#7A7169] mt-1 italic">
                              Variante de genre : {result.genderAlternative}
                            </p>
                          )}
                          <p className="text-xs text-[#4A423D] mt-1">
                            🇫🇷 {result.translation}
                          </p>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-[#F2ECE3]">
                            <span className="text-xs font-bold text-[#1F1A17]">Règle expliquée :</span>
                            {result.errors.map((err: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs space-y-1">
                                <div className="text-[#C04A33] font-semibold">{err.original} ➔ {err.correction}</div>
                                <p className="text-[#68605A] text-[11px] leading-relaxed">{err.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {activeQuickMode === 'explain' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1F1A17]">{result.targetPhrase}</span>
                          <button
                            onClick={() => handlePlayVoice(result.targetPhrase)}
                            className="p-1 text-[#C04A33] hover:bg-[#FDF4ED] rounded-full"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FDF4ED] text-xs space-y-1 border border-[#F6D9CE]">
                          <div className="text-[#C04A33] font-bold">Sens naturel : {result.naturalMeaningFr}</div>
                          <div className="text-[#8A817A] text-[11px]">Sens littéral : {result.literalMeaningFr}</div>
                        </div>
                        <p className="text-xs text-[#68605A] leading-relaxed">{result.grammaticalBreakdown}</p>
                      </div>
                    )}

                    {activeQuickMode === 'chat' && (
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#C04A33] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            IA
                          </div>
                          <div className="flex-1 p-2.5 bg-[#FAF7F2] rounded-2xl text-xs space-y-1 border border-[#EAE4DA]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1F1A17]">{result.chatReply}</span>
                              <button
                                onClick={() => handlePlayVoice(result.chatReply)}
                                className="p-1 text-[#C04A33]"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <p className="text-[#8A817A] text-[11px]">🇫🇷 {result.chatTranslation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeQuickMode === 'app' && result.generatedApp && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-[#1F1A17]">Application générée</h4>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#7A7169]">
                            Le code n’est pas exécuté dans l’application. Téléchargez le fichier HTML et ouvrez-le localement.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => aiService.downloadGeneratedApp(result.generatedApp)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#2A6F55] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#235D48]"
                        >
                          <Download size={14} /> Télécharger mon-application.html
                        </button>
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] p-3 text-[10px] leading-relaxed text-[#4A423D]">
                          {result.generatedApp}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Form Input Footer */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-[#EAE4DA] bg-white">
                <div className="relative">
                  {activeQuickMode === 'app' ? (
                    <textarea
                      rows={3}
                      maxLength={6000}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Décrivez l’application que vous souhaitez créer…"
                      aria-label="Description de votre application"
                      className="w-full resize-y rounded-2xl border border-[#EAE4DA] bg-[#FAF7F2] px-4 py-2.5 pr-12 text-xs text-[#1F1A17] placeholder-[#8A817A] focus:border-[#C04A33] focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Tapez en italien..."
                      className="w-full rounded-2xl border border-[#EAE4DA] bg-[#FAF7F2] px-4 py-2.5 pr-10 text-xs text-[#1F1A17] placeholder-[#8A817A] focus:border-[#C04A33] focus:outline-none"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className={`absolute right-1.5 ${activeQuickMode === 'app' ? 'bottom-1.5' : 'top-1.5 bottom-1.5'} flex h-8 w-8 items-center justify-center rounded-full bg-[#C04A33] text-white shadow-xs transition-colors hover:bg-[#AA3E29] disabled:opacity-40`}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

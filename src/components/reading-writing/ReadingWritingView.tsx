import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Volume2, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { aiService } from '../../services/aiService';
import { useApp } from '../../context/AppContext';
import { ReadingText } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';

export const ReadingWritingView: React.FC = () => {
  const { addXp, readingTexts, user } = useApp();
  const levelReadingTexts = readingTexts.filter(text => text.level === user.italianLevel);
  const [subTab, setSubTab] = useState<'reading' | 'writing'>('reading');

  // Reading state
  const [activeText, setActiveText] = useState<ReadingText | null>(null);
  const [showFrenchTranslation, setShowFrenchTranslation] = useState(false);
  const [selectedWordGlossary, setSelectedWordGlossary] = useState<{ word: string; meaning: string } | null>(null);
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
  const [readingQuizDone, setReadingQuizDone] = useState(false);

  // Writing studio state
  const [writingPrompt, setWritingPrompt] = useState("Décrivez votre journée type en Italie (se lever, prendre le petit déjeuner, travail/études, loisirs).");
  const [writingSubmission, setWritingSubmission] = useState("");
  const [writingAnalysis, setWritingAnalysis] = useState<any>(null);
  const [analyzingWriting, setAnalyzingWriting] = useState(false);
  const [writingPenColor, setWritingPenColor] = useState('#2457A6');
  const penOptions = [
    { name: 'Bleu', color: '#2457A6' },
    { name: 'Noir', color: '#252525' },
    { name: 'Rouge', color: '#B33A3A' },
  ];

  useEffect(() => {
    setActiveText(current => levelReadingTexts.find(text => text.id === current?.id) || levelReadingTexts[0] || null);
    setReadingAnswers({});
    setReadingQuizDone(false);
    setSelectedWordGlossary(null);
  }, [readingTexts, user.italianLevel]);

  const handleWordClick = (rawWord: string) => {
    if (!activeText) return;
    const clean = rawWord.replace(/[.,!?;:'"()]/g, '').trim();
    if (!clean) return;

    audioService.speak(clean);

    // Look up in glossary
    const matchKey = Object.keys(activeText.vocabularyGlossary).find(k => 
      k.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().includes(k.toLowerCase())
    );

    if (matchKey) {
      setSelectedWordGlossary({ word: clean, meaning: activeText.vocabularyGlossary[matchKey] });
    } else {
      setSelectedWordGlossary({ word: clean, meaning: "Mot italien courant (cliquez pour écouter)" });
    }
  };

  const handleCheckReadingQuiz = () => {
    if (!activeText) return;
    setReadingQuizDone(true);
    let correct = 0;
    activeText.comprehensionQuestions.forEach((q, idx) => {
      if (readingAnswers[idx] === q.correctIndex) correct++;
    });
    if (correct === activeText.comprehensionQuestions.length) {
      triggerSuccessConfetti();
      addXp(20);
    }
  };

  const handleAnalyzeWriting = async () => {
    if (!writingSubmission.trim()) return;
    setAnalyzingWriting(true);
    try {
      const res = await aiService.correctParagraph(writingSubmission);
      setWritingAnalysis(res);
      triggerSuccessConfetti();
      addXp(30);
    } finally {
      setAnalyzingWriting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#C04A33]" size={26} />
          <h1 className="font-serif text-2xl font-normal tracking-tight text-[#1F1A17] sm:text-3xl">
            Cahier de lecture & d’écriture
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-[#7A7169]">
          Améliorez votre compréhension écrite grâce à la lecture assistée par dictionnaire instantané et perfectionnez votre plume avec l'analyseur de rédaction intelligent.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE4DA] pb-4">
        <button
          onClick={() => setSubTab('reading')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subTab === 'reading'
              ? 'bg-[#C04A33] text-white shadow-sm'
              : 'border border-[#EAE4DA] bg-white text-[#68605A] hover:bg-[#FAF7F2] hover:text-[#1F1A17]'
          }`}
        >
          <BookOpen size={15} />
          <span>Studio de Lecture (Textes bilingues & dictionnaire)</span>
        </button>

        <button
          onClick={() => setSubTab('writing')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subTab === 'writing'
              ? 'bg-[#C04A33] text-white shadow-sm'
              : 'border border-[#EAE4DA] bg-white text-[#68605A] hover:bg-[#FAF7F2] hover:text-[#1F1A17]'
          }`}
        >
          <PenTool size={15} />
          <span>Atelier de Rédaction avec Grille IA</span>
        </button>
      </div>

      {/* ================= READING SUBTAB ================= */}
      {subTab === 'reading' && (
        <div className="space-y-6">
          {!activeText ? (
            <div role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-8 text-center text-sm text-[#7A7169]">
              Aucun texte de lecture n’est disponible pour le niveau {user.italianLevel}.
            </div>
          ) : (
          <>
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EAE4DA] bg-[#F5F1EA] p-4">
            <div className="flex items-center gap-2">
              {levelReadingTexts.map(txt => (
                <button
                  key={txt.id}
                  onClick={() => {
                    setActiveText(txt);
                    setReadingAnswers({});
                    setReadingQuizDone(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    activeText.id === txt.id ? 'bg-[#2A6F55] text-white' : 'border border-[#EAE4DA] bg-white text-[#68605A] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {txt.title} ({txt.level})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFrenchTranslation(!showFrenchTranslation)}
                className="flex items-center gap-1.5 rounded-xl border border-[#EAE4DA] bg-white px-3 py-1.5 text-xs font-semibold text-[#4A423D] hover:bg-[#FAF7F2]"
              >
                {showFrenchTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showFrenchTranslation ? 'Masquer la traduction' : 'Afficher la traduction'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Text Viewer */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Text column (2 spans) */}
            <div
              className="relative space-y-6 overflow-hidden rounded-3xl border border-[#E2D9CC] border-l-8 border-l-[#CDBFB2] bg-[#FFFDF8] p-6 shadow-parla sm:p-8"
              style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, rgba(216, 206, 189, 0.35) 36px)' }}
            >
              <div className="flex items-center justify-between border-b border-[#EAE4DA] bg-[#FFFDF8]/90 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CefrBadge level={activeText.level} size="sm" />
                    <h3 className="font-serif text-xl font-bold text-[#1F1A17]">{activeText.title}</h3>
                  </div>
                  <p className="text-xs text-[#7A7169]">{activeText.titleFr} • Thème : {activeText.category}</p>
                </div>
                <button
                  onClick={() => audioService.speak(activeText.italianParagraphs.join(' '))}
                  className="flex items-center gap-1.5 rounded-xl border border-[#CDE3D8] bg-[#EDF6F2] px-3 py-1.5 text-xs font-bold text-[#2A6F55] hover:bg-[#E3EFE9]"
                >
                  <Volume2 size={15} />
                  <span>Écouter tout</span>
                </button>
              </div>

              <div className="space-y-5 bg-[#FFFDF8]/65 text-sm leading-9 text-[#1F1A17] sm:text-base">
                {activeText.italianParagraphs.map((para, pIdx) => {
                  const words = para.split(' ');
                  return (
                    <div key={pIdx} className="space-y-2 rounded-xl border border-[#EAE4DA]/70 bg-[#FFFDF8]/80 p-3.5">
                      <p className="text-[#1F1A17]">
                        {words.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            onClick={() => handleWordClick(word)}
                            className="mr-1 inline-block cursor-pointer transition-colors hover:text-[#2A6F55] hover:underline"
                          >
                            {word}
                          </span>
                        ))}
                      </p>

                      {showFrenchTranslation && (
                        <p className="border-t border-[#EAE4DA] pt-1 text-xs italic text-[#7A7169]">
                          🇫🇷 {activeText.frenchParagraphs[pIdx]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="bg-[#FFFDF8]/90 text-[11px] italic text-[#7A7169]">
                💡 Conseil : Cliquez sur n'importe quel mot italien pour l'écouter et afficher son sens.
              </p>
            </div>

            {/* Sidebar Glossary & Mini-Quiz (1 span) */}
            <div className="space-y-6">
              
              {/* Selected Word Pop-card */}
              <div className="space-y-2 rounded-2xl border border-[#EAE4DA] bg-[#FFFDF8] p-5 shadow-parla">
                <span className="flex items-center gap-1 text-xs font-bold uppercase text-[#2A6F55]">
                  <Sparkles size={13} /> Dictionnaire au clic :
                </span>
                {selectedWordGlossary ? (
                  <div className="space-y-1 rounded-xl border border-[#CDE3D8] bg-[#EDF6F2] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#1F1A17]">{selectedWordGlossary.word}</span>
                      <button onClick={() => audioService.speak(selectedWordGlossary.word)} className="text-[#2A6F55]">
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-[#2A6F55]">{selectedWordGlossary.meaning}</p>
                  </div>
                ) : (
                  <p className="text-xs italic text-[#7A7169]">
                    Cliquez sur un mot dans le texte pour voir sa traduction instantanée.
                  </p>
                )}
              </div>

              {/* Comprehension Quiz */}
              <div className="space-y-4 rounded-2xl border border-[#EAE4DA] bg-[#FFFDF8] p-5 shadow-parla">
                <h4 className="text-xs font-bold uppercase text-[#4A423D]">Compréhension écrite :</h4>

                {activeText.comprehensionQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2 text-xs">
                    <p className="font-semibold text-[#1F1A17]">{q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, oIdx) => {
                        const selected = readingAnswers[qIdx] === oIdx;
                        let btnStyle = "bg-white text-[#4A423D] border-[#EAE4DA]";
                        if (readingQuizDone) {
                          if (oIdx === q.correctIndex) btnStyle = "bg-[#EDF6F2] border-[#2A6F55] text-[#2A6F55] font-bold";
                          else if (selected) btnStyle = "bg-[#FDF0EB] border-[#C04A33] text-[#C04A33]";
                        } else if (selected) {
                          btnStyle = "bg-[#EDF6F2] border-[#2A6F55] text-[#2A6F55]";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={readingQuizDone}
                            onClick={() => setReadingAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                            className={`w-full rounded-xl border p-2.5 text-left transition-all ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!readingQuizDone ? (
                  <button
                    onClick={handleCheckReadingQuiz}
                    disabled={Object.keys(readingAnswers).length < activeText.comprehensionQuestions.length}
                    className="w-full rounded-xl bg-[#2A6F55] py-2.5 text-xs font-bold text-white hover:bg-[#235b46] disabled:opacity-40"
                  >
                    Valider le test de lecture
                  </button>
                ) : (
                  <p className="text-center text-xs font-bold text-[#2A6F55]">Quiz validé !</p>
                )}
              </div>

            </div>

          </div>
          </>
          )}
        </div>
      )}

      {/* ================= WRITING SUBTAB ================= */}
      {subTab === 'writing' && (
        <div className="space-y-6">
          <div className="space-y-5 rounded-3xl border border-[#EAE4DA] bg-[#F5F1EA] p-5 sm:p-7">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wide text-[#C04A33]">Sujet de rédaction :</span>
              <h3 className="font-serif text-lg font-semibold text-[#1F1A17]">{writingPrompt}</h3>
              <p className="text-xs text-[#7A7169]">
                Rédigez en italien avec vos propres mots. L'assistant évaluera votre production selon les 5 critères CECRL.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir la couleur du stylo">
                <span className="mr-1 text-xs font-semibold text-[#68605A]">Mon stylo :</span>
                {penOptions.map((pen) => (
                  <button
                    key={pen.name}
                    type="button"
                    onClick={() => setWritingPenColor(pen.color)}
                    aria-label={`Stylo ${pen.name.toLowerCase()}`}
                    aria-pressed={writingPenColor === pen.color}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      writingPenColor === pen.color
                        ? 'border-[#C04A33] bg-white text-[#1F1A17] shadow-sm'
                        : 'border-[#EAE4DA] bg-[#FAF7F2] text-[#68605A] hover:bg-white'
                    }`}
                  >
                    <PenTool size={14} style={{ color: pen.color }} />
                    {pen.name}
                  </button>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-xl border border-[#DED5C8] bg-[#FFFEF8] shadow-[0_8px_24px_rgba(74,55,35,0.08)] before:absolute before:inset-y-0 before:left-10 before:z-10 before:border-l before:border-[#D98D87]/70 before:content-[''] sm:before:left-14">
                <textarea
                  rows={7}
                  value={writingSubmission}
                  onChange={(e) => setWritingSubmission(e.target.value)}
                  placeholder="Scrivi qui il tuo testo in italiano..."
                  aria-label="Votre rédaction en italien"
                  style={{
                    color: writingPenColor,
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, #DCE7EC 36px, transparent 37px)',
                    backgroundPosition: '0 10px',
                    backgroundSize: '100% 37px',
                    lineHeight: '37px',
                    fontFamily: '"Segoe Print", "Bradley Hand", cursive',
                  }}
                  className="relative z-0 block min-h-[275px] w-full resize-y bg-transparent py-[10px] pl-14 pr-5 text-base focus:outline-none placeholder:font-sans placeholder:text-[#AAA39A] sm:pl-[4.5rem] sm:pr-8"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[#7A7169]">
                Mots rédigés : {writingSubmission.trim().split(/\s+/).filter(Boolean).length}
              </span>

              <button
                onClick={handleAnalyzeWriting}
                disabled={analyzingWriting || !writingSubmission.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#C04A33] px-6 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#A93D2A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={16} />
                <span>{analyzingWriting ? "Évaluation en cours..." : "Soumettre à l'évaluation CECRL"}</span>
              </button>
            </div>
          </div>

          {/* Analysis Result Card */}
          {writingAnalysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">Bilan Pédagogique de l'IA</h4>
                  <p className="text-xs text-slate-400">Évaluation indicative selon le Cadre Européen CECRL</p>
                </div>
                <CefrBadge level={writingAnalysis.estimatedCefrLevel} size="lg" />
              </div>

              <p className="text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {writingAnalysis.overallAssessmentFr}
              </p>

              {/* Criteria */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300">Critères détaillés :</span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(writingAnalysis.criteriaScores).map(([key, val]: any) => (
                    <div key={key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white uppercase text-[10px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-extrabold text-emerald-400">{val.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{val.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improved version */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase">Version suggérée pour progresser :</span>
                <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                  {writingAnalysis.naturalImprovedText}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FolderOpen,
  ArrowLeft,
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight
} from 'lucide-react';
import { ExerciseType } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { AudioButton } from '../common/AudioButton';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';
import { useApp } from '../../context/AppContext';

export const ExerciseHubView: React.FC = () => {
  const { addXp, exercises, user } = useApp();
  const [activePart, setActivePart] = useState<string | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<ExerciseType | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction states for current exercise
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [translationInput, setTranslationInput] = useState('');
  const [errorCorrectionInput, setErrorCorrectionInput] = useState('');
  const [freeText, setFreeText] = useState('');

  // Status
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const levelExercises = exercises.filter(ex => ex.level === user.italianLevel);
  const getPartName = (part: unknown) =>
    typeof part === 'string' && part.trim() ? part.trim() : 'Exercices généraux';
  const exerciseParts = [...new Set(levelExercises.map(ex => getPartName(ex.part)))]
    .sort((a, b) => a.localeCompare(b, 'fr'));
  const filteredExercises = levelExercises.filter(ex => {
    const part = getPartName(ex.part);
    if (activePart && part !== activePart) return false;
    if (activeTypeFilter === 'ALL') return true;
    return ex.type === activeTypeFilter;
  });

  const currentExercise = filteredExercises[currentIndex] || null;

  // Initialize word reorder when exercise changes
  React.useEffect(() => {
    resetState();
    if (currentExercise?.type === 'word_reorder') {
      setReorderedWords([]);
      setRemainingWords([...currentExercise.scrambledWords]);
    }
  }, [currentIndex, currentExercise]);

  const resetState = () => {
    setMcSelected(null);
    setFillBlankInput('');
    setReorderedWords([]);
    setRemainingWords([]);
    setTranslationInput('');
    setErrorCorrectionInput('');
    setFreeText('');
    setIsAnswered(false);
    setIsCorrect(false);
    setFeedbackMsg('');
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // 1. Check Multiple Choice
  const handleCheckMC = (index: number) => {
    if (!currentExercise || isAnswered || currentExercise.type !== 'multiple_choice') return;
    setMcSelected(index);
    setIsAnswered(true);
    const correct = index === currentExercise.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      addXp(15);
      triggerSuccessConfetti();
    }
  };

  // 2. Check Fill in the blank
  const handleCheckFillBlank = () => {
    if (!currentExercise || currentExercise.type !== 'fill_blank') return;
    const clean = fillBlankInput.trim().toLowerCase();
    const correct = currentExercise.correctAnswers.some(ans => ans.toLowerCase() === clean);
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      addXp(15);
      triggerSuccessConfetti();
    }
  };

  // 3. Word Reorder
  const handleAddWordToOrder = (word: string, index: number) => {
    if (isAnswered) return;
    setReorderedWords(prev => [...prev, word]);
    setRemainingWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWordFromOrder = (word: string, index: number) => {
    if (isAnswered) return;
    setRemainingWords(prev => [...prev, word]);
    setReorderedWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckReorder = () => {
    if (!currentExercise || currentExercise.type !== 'word_reorder') return;
    const constructed = reorderedWords.join(' ').toLowerCase().trim();
    const target = currentExercise.correctSentence.toLowerCase().trim();
    const alts = (currentExercise.alternativeSentences || []).map(s => s.toLowerCase().trim());
    
    const correct = constructed === target || alts.includes(constructed);
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      addXp(20);
      triggerSuccessConfetti();
    }
  };

  // 4. Translation
  const handleCheckTranslation = () => {
    if (!currentExercise || currentExercise.type !== 'translation') return;
    const clean = translationInput.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const correct = currentExercise.acceptableAnswers.some(
      ans => ans.trim().toLowerCase().replace(/[.,!?;:]/g, '') === clean
    );
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      addXp(20);
      triggerSuccessConfetti();
    }
  };

  // 5. Error correction
  const handleCheckErrorCorrection = () => {
    if (!currentExercise || currentExercise.type !== 'error_correction') return;
    const clean = errorCorrectionInput.trim().toLowerCase();
    const target = currentExercise.correctedSentence.trim().toLowerCase();
    const correct = clean.includes(currentExercise.errorPart.toLowerCase()) || clean === target;
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      addXp(20);
      triggerSuccessConfetti();
    }
  };

  // 6. Free production
  const handleCheckFreeProduction = () => {
    if (!currentExercise || currentExercise.type !== 'free_production') return;
    const words = freeText.trim().split(/\s+/).filter(Boolean);
    const validLength = words.length >= currentExercise.minWords;
    setIsAnswered(true);
    setIsCorrect(validLength);
    setFeedbackMsg(
      validLength 
        ? "Excellente production ! L'IA valide vos accords et votre syntaxe générale." 
        : `Veuillez rédiger au moins ${currentExercise.minWords} mots pour valider cet exercice.`
    );
    if (validLength) {
      addXp(25);
      triggerSuccessConfetti();
    }
  };

  const typeTabs: Array<{ id: ExerciseType | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'Tous' },
    { id: 'multiple_choice', label: 'QCM' },
    { id: 'fill_blank', label: 'Texte à trous' },
    { id: 'word_reorder', label: 'Remise en ordre' },
    { id: 'translation', label: 'Traduction' },
    { id: 'error_correction', label: 'Correction d’erreur' },
    { id: 'free_production', label: 'Production libre' },
  ];

  const backToParts = () => {
    setActivePart(null);
    setActiveTypeFilter('ALL');
    setCurrentIndex(0);
    resetState();
  };

  if (!activePart) {
    return (
      <div className="mx-auto max-w-5xl space-y-7 pb-12">
        <header className="space-y-2 border-b border-[#EAE4DA] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FDF4ED] text-[#C04A33]">
              <Sparkles size={20} />
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1F1A17]">Exercices libres</h1>
          </div>
          <p className="text-sm text-[#7A7169]">
            Choisissez une partie pour commencer les exercices de votre niveau {user.italianLevel}.
          </p>
        </header>

        {exerciseParts.length === 0 ? (
          <div role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center text-sm text-[#7A7169]">
            Aucune partie d’exercice libre n’est disponible pour le niveau {user.italianLevel}.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exerciseParts.map(part => {
              const count = levelExercises.filter(ex => getPartName(ex.part) === part).length;
              return (
                <button
                  type="button"
                  key={part}
                  onClick={() => {
                    setActivePart(part);
                    setActiveTypeFilter('ALL');
                    setCurrentIndex(0);
                  }}
                  className="flex items-center gap-4 rounded-3xl border border-[#EAE4DA] bg-white p-5 text-left shadow-parla transition-colors hover:border-[#C04A33]/50 hover:bg-[#FDFBF7]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDF6F2] text-[#2A6F55]">
                    <FolderOpen size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-lg font-bold text-[#1F1A17]">{part}</span>
                    <span className="mt-1 block text-xs text-[#7A7169]">{count} exercice{count > 1 ? 's' : ''}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-[#C04A33]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={backToParts}
          className="flex items-center gap-2 text-sm font-semibold text-[#C04A33] hover:underline"
        >
          <ArrowLeft size={16} />
          Toutes les parties
        </button>
        <div role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-8 text-center text-sm text-[#7A7169]">
          Aucun exercice de ce type dans la partie « {activePart} ».
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={backToParts}
        className="flex items-center gap-2 text-sm font-semibold text-[#C04A33] hover:underline"
      >
        <ArrowLeft size={16} />
        Toutes les parties
      </button>
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FDF4ED] text-[#C04A33] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1F1A17] font-normal tracking-tight">
            {activePart}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#7A7169] leading-relaxed max-w-2xl">
          Exercices libres de votre niveau {user.italianLevel} — QCM, textes à trous, traduction et pratique interactive.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs">
        {typeTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTypeFilter(tab.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTypeFilter === tab.id
                ? 'bg-[#C04A33] text-white shadow-xs'
                : 'text-[#68605A] hover:text-[#1F1A17] hover:bg-[#FAF7F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exercise Card */}
      <motion.div
        key={currentExercise.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-6"
      >
        {/* Meta Bar */}
        <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-4">
          <div className="flex items-center gap-2.5">
            <CefrBadge level={currentExercise.level} size="sm" />
            <span className="text-xs font-bold text-[#C04A33] uppercase tracking-wide">
              {currentExercise.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8A817A] font-medium">
              Exercice {currentIndex + 1} / {filteredExercises.length}
            </span>
            {currentExercise.audioPhrase && (
              <AudioButton text={currentExercise.audioPhrase} size="sm" />
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1F1A17] leading-snug">
            {currentExercise.prompt}
          </h3>
          {currentExercise.promptFr && (
            <p className="text-xs text-[#7A7169] italic">
              {currentExercise.promptFr}
            </p>
          )}
        </div>

        {/* Exercise Body by Type */}
        <div className="pt-2">

          {/* 1. Multiple Choice */}
          {currentExercise.type === 'multiple_choice' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {currentExercise.options.map((opt, i) => {
                const isSelected = mcSelected === i;
                let btnClass = "bg-[#FAF7F2] border-[#EAE4DA] text-[#1F1A17] hover:border-[#C04A33]/40 hover:bg-white";

                if (isAnswered) {
                  if (i === currentExercise.correctIndex) {
                    btnClass = "bg-[#EDF6F2] border-[#CDE3D8] text-[#2A6F55] font-semibold";
                  } else if (isSelected) {
                    btnClass = "bg-[#FDF0EB] border-[#F6D9CE] text-[#C04A33]";
                  }
                } else if (isSelected) {
                  btnClass = "bg-[#FDF4ED] border-[#C04A33] text-[#C04A33] font-semibold";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleCheckMC(i)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${btnClass}`}
                  >
                    <span>{opt}</span>
                    <span className="text-xs text-[#8A817A] font-mono">[{String.fromCharCode(65 + i)}]</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Fill in the blank */}
          {currentExercise.type === 'fill_blank' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DA] flex flex-wrap items-center gap-2 text-base text-[#1F1A17]">
                <span>{currentExercise.sentenceBefore}</span>
                <input
                  type="text"
                  value={fillBlankInput}
                  onChange={(e) => setFillBlankInput(e.target.value)}
                  disabled={isAnswered}
                  placeholder="votre réponse"
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE4DA] text-[#C04A33] font-semibold text-sm focus:outline-none focus:border-[#C04A33] w-36 text-center"
                />
                <span>{currentExercise.sentenceAfter}</span>
              </div>
              {currentExercise.hint && (
                <p className="text-xs text-[#8A817A]">💡 Indice : {currentExercise.hint}</p>
              )}
              {!isAnswered && (
                <button
                  onClick={handleCheckFillBlank}
                  disabled={!fillBlankInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                >
                  Vérifier
                </button>
              )}
            </div>
          )}

          {/* 3. Word Reorder */}
          {currentExercise.type === 'word_reorder' && (
            <div className="space-y-4">
              {/* Construction Zone */}
              <div className="min-h-16 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#EAE4DA] flex flex-wrap gap-2 items-center">
                {reorderedWords.length === 0 ? (
                  <span className="text-xs text-[#8A817A] italic">
                    Cliquez sur les mots ci-dessous pour assembler la phrase...
                  </span>
                ) : (
                  reorderedWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveWordFromOrder(word, i)}
                      disabled={isAnswered}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#C04A33] text-[#C04A33] text-xs font-semibold hover:bg-[#FDF0EB] transition-colors shadow-xs"
                    >
                      {word} ✕
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Words Pool */}
              <div className="flex flex-wrap gap-2 pt-2">
                {remainingWords.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddWordToOrder(word, i)}
                    disabled={isAnswered}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#1F1A17] border border-[#EAE4DA] hover:border-[#C04A33]/40 text-xs font-semibold transition-all transform hover:scale-105 shadow-xs"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {!isAnswered && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCheckReorder}
                    disabled={reorderedWords.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                  >
                    Valider la phrase
                  </button>
                  <button
                    onClick={() => {
                      setReorderedWords([]);
                      setRemainingWords([...currentExercise.scrambledWords]);
                    }}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] text-[#68605A] hover:text-[#1F1A17] border border-[#EAE4DA]"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Translation */}
          {currentExercise.type === 'translation' && (
            <div className="space-y-4">
              <input
                type="text"
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Écrivez la traduction en italien..."
                className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] focus:border-[#C04A33] text-sm text-[#1F1A17] focus:outline-none"
              />
              {!isAnswered && (
                <button
                  onClick={handleCheckTranslation}
                  disabled={!translationInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                >
                  Vérifier la traduction
                </button>
              )}
            </div>
          )}

          {/* 5. Error Correction */}
          {currentExercise.type === 'error_correction' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FDF0EB] border border-[#F6D9CE] text-[#C04A33] text-sm font-mono">
                {currentExercise.faultySentence}
              </div>
              <input
                type="text"
                value={errorCorrectionInput}
                onChange={(e) => setErrorCorrectionInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Entrez le mot corrigé ou la phrase complète..."
                className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] focus:border-[#C04A33] text-sm text-[#1F1A17] focus:outline-none"
              />
              {!isAnswered && (
                <button
                  onClick={handleCheckErrorCorrection}
                  disabled={!errorCorrectionInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                >
                  Valider la correction
                </button>
              )}
            </div>
          )}

          {/* 6. Free Production */}
          {currentExercise.type === 'free_production' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs space-y-1.5">
                <span className="font-semibold text-[#C04A33]">Vocabulaire suggéré à utiliser :</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentExercise.suggestedVocabulary.map((voc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white text-[#4A423D] border border-[#EAE4DA] text-[11px]">
                      {voc}
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                rows={4}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                disabled={isAnswered}
                placeholder="Rédigez votre réponse en italien ici..."
                className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] focus:border-[#C04A33] text-sm text-[#1F1A17] focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-[#7A7169]">
                <span>Mots : {freeText.trim().split(/\s+/).filter(Boolean).length} / {currentExercise.minWords} min</span>
                {!isAnswered && (
                  <button
                    onClick={handleCheckFreeProduction}
                    disabled={!freeText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-40 text-white font-semibold text-xs shadow-xs"
                  >
                    Soumettre à l'analyse IA
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border space-y-2 ${
              isCorrect 
                ? 'bg-[#EDF6F2] border-[#CDE3D8] text-[#2A6F55]' 
                : 'bg-[#FDF0EB] border-[#F6D9CE] text-[#C04A33]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{isCorrect ? 'Bravissimo ! Réponse correcte (+XP)' : 'Erreur identifiée'}</span>
              </div>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-xs shadow-xs"
              >
                <span>Exercice suivant</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <p className="text-xs text-[#1F1A17] leading-relaxed pt-1">
              {currentExercise.explanation}
            </p>
            {feedbackMsg && (
              <p className="text-xs text-[#4A423D] italic pt-1">{feedbackMsg}</p>
            )}
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

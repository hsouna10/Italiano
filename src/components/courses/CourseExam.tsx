import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ChevronRight,
  Clock,
  BookOpen,
  Sparkles,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { CefrLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { CefrBadge } from '../common/CefrBadge';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';

// ─── Exam questions per level ─────────────────────────────────────────────────
const EXAM_DATA: Record<string, Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}>> = {
  A1: [
    {
      topic: 'Verbes Essere / Avere',
      question: 'Quelle phrase est correcte pour exprimer la faim en italien ?',
      options: ['Sono fame', 'Ho fame', 'Faccio fame', 'Prendo fame'],
      correctIndex: 1,
      explanation: 'En italien, on dit « Ho fame » car la faim s\'exprime avec avere (avoir), comme en "j\'ai faim".',
    },
    {
      topic: 'Articles définis',
      question: 'Comment dit-on « l\'étudiant » en italien ?',
      options: ['Il studente', 'Lo studente', 'La studente', 'Un studente'],
      correctIndex: 1,
      explanation: 'Devant un nom masculin commençant par « s impure », on utilise « lo » et non « il ».',
    },
    {
      topic: 'Auxiliaires',
      question: 'Quelle traduction est correcte pour « Io sono andato a Roma » ?',
      options: ['J\'ai allé à Rome', 'Je suis allé à Rome', 'J\'ai été à Rome', 'Je suis parti à Rome'],
      correctIndex: 1,
      explanation: 'Le verbe « andare » (aller) utilise l\'auxiliaire « essere » au passato prossimo : « sono andato ».',
    },
    {
      topic: 'Présentations',
      question: 'Pour demander formellement le nom d\'une personne, on dit :',
      options: ['Come ti chiami?', 'Come si chiama?', 'Qual è il tuo nome?', 'Chi sei?'],
      correctIndex: 1,
      explanation: '« Come si chiama ? » utilise le pronom de politesse « Lei ». La forme « Come ti chiami ? » est informal.',
    },
    {
      topic: 'Vocabulaire quotidien',
      question: 'Que signifie « Ho venticinque anni » ?',
      options: ['Je suis né en 25', 'J\'ai vingt-cinq ans', 'J\'habite depuis 25 ans', 'Il y a 25 ans'],
      correctIndex: 1,
      explanation: 'En italien, pour exprimer l\'âge on utilise « avere » : « Ho … anni » = « J\'ai … ans ».',
    },
  ],
  A2: [
    {
      topic: 'Passato prossimo',
      question: 'Quelle phrase est grammaticalement correcte ?',
      options: ['Ieri ho andato al mare', 'Ieri sono andato al mare', 'Ieri ero andato al mare', 'Ieri andavo al mare'],
      correctIndex: 1,
      explanation: '« Andare » est un verbe de mouvement qui prend « essere » comme auxiliaire au passato prossimo.',
    },
    {
      topic: 'Imparfait',
      question: 'Quand utilise-t-on l\'imperfetto en italien ?',
      options: ['Pour une action ponctuelle dans le passé', 'Pour une habitude ou état passé continu', 'Pour le futur proche', 'Pour exprimer un ordre'],
      correctIndex: 1,
      explanation: 'L\'imperfetto décrit des actions habituelles, des états ou des descriptions dans le passé.',
    },
    {
      topic: 'Pronoms COD',
      question: 'Dans « Lo vedo ogni giorno », que remplace « lo » ?',
      options: ['Un lieu', 'Un objet ou une personne masculin(e)', 'Une action', 'Un temps'],
      correctIndex: 1,
      explanation: '« Lo » est le pronom COD masculin singulier, il remplace un nom masculin défini.',
    },
    {
      topic: 'Comparatif',
      question: 'Comment dit-on « Milan est plus grande que Rome » ?',
      options: ['Milano è più grande che Roma', 'Milano è più grande di Roma', 'Milano è più grande Roma', 'Milano è tanto grande Roma'],
      correctIndex: 1,
      explanation: 'Devant un nom, on utilise « di » pour le comparatif de supériorité : « più … di ».',
    },
    {
      topic: 'Verbes modaux',
      question: 'Quelle phrase exprime une obligation ?',
      options: ['Posso venire', 'Devo venire', 'Voglio venire', 'So venire'],
      correctIndex: 1,
      explanation: '« Dovere » (devoir) exprime l\'obligation. « Potere » = pouvoir, « Volere » = vouloir, « Sapere » = savoir.',
    },
  ],
  B1: [
    {
      topic: 'Subjonctif présent',
      question: 'Quel mode suit le verbe « volere che » ?',
      options: ['L\'indicatif', 'Le subjonctif', 'L\'impératif', 'Le conditionnel'],
      correctIndex: 1,
      explanation: 'Après « volere che », on utilise le subjonctif présent (congiuntivo presente).',
    },
    {
      topic: 'Conditionnel',
      question: 'Comment traduit-on « J\'aimerais un café » ?',
      options: ['Voglio un caffè', 'Vorrei un caffè', 'Volevo un caffè', 'Vorrò un caffè'],
      correctIndex: 1,
      explanation: '« Vorrei » est le conditionnel présent de « volere », équivalent de « je voudrais ».',
    },
    {
      topic: 'Pronoms relatifs',
      question: 'Complétez : « Il film ___ ho visto ieri era bellissimo. »',
      options: ['chi', 'cui', 'che', 'quale'],
      correctIndex: 2,
      explanation: '« Che » est le pronom relatif pour remplacer un COD (objet direct) dans une relative.',
    },
    {
      topic: 'Futur simple',
      question: 'Quelle forme est correcte pour « demain je partirai » ?',
      options: ['Domani parto', 'Domani partirò', 'Domani partivo', 'Domani parta'],
      correctIndex: 1,
      explanation: '« Partirò » est le futur simple (futuro semplice) de « partire » à la 1ère personne.',
    },
    {
      topic: 'Gérondif',
      question: '« Studiando ogni giorno, migliorerai. » — que signifie « studiando » ?',
      options: ['En ayant étudié', 'En étudiant', 'Pour étudier', 'Après avoir étudié'],
      correctIndex: 1,
      explanation: 'Le gérondif en « -ando/-endo » correspond à « en + participe présent » en français.',
    },
  ],
  B2: [
    {
      topic: 'Subjonctif imparfait',
      question: 'Complétez : « Vorrei che tu ___ qui con me. »',
      options: ['sei', 'sia', 'eri', 'fossi'],
      correctIndex: 3,
      explanation: 'Après « vorrei che », on utilise le subjonctif imparfait (congiuntivo imperfetto) : « fossi ».',
    },
    {
      topic: 'Passif',
      question: 'Quelle phrase est au passif ?',
      options: ['Mario ha scritto il libro', 'Il libro è stato scritto da Mario', 'Mario scrive il libro', 'Mario scriverà il libro'],
      correctIndex: 1,
      explanation: 'La construction passive utilise « essere » + participe passé. « da » introduit l\'agent.',
    },
    {
      topic: 'Discours indirect',
      question: 'Transformez : « Mario ha detto: "Vengo domani" » au discours indirect.',
      options: ['Mario ha detto che veniva il giorno dopo', 'Mario ha detto che viene domani', 'Mario ha detto che verrà il giorno dopo', 'Mario ha detto di venire domani'],
      correctIndex: 0,
      explanation: 'Au discours indirect, « vengo » devient « veniva » (imperfetto) et « domani » devient « il giorno dopo ».',
    },
    {
      topic: 'Expressions idiomatiques',
      question: 'Que signifie « Non vedo l\'ora di » ?',
      options: ['Je ne vois pas l\'heure', 'J\'attends depuis longtemps', 'J\'ai hâte de / Je suis impatient de', 'Je refuse de regarder'],
      correctIndex: 2,
      explanation: '« Non vedere l\'ora di » est une locution idiomatique signifiant être très impatient de faire quelque chose.',
    },
    {
      topic: 'Verbes décausatifs',
      question: 'Que signifie « La porta si è aperta » ?',
      options: ['Quelqu\'un ouvre la porte', 'La porte s\'est ouverte (d\'elle-même)', 'La porte est ouverte en permanence', 'On devrait ouvrir la porte'],
      correctIndex: 1,
      explanation: 'La forme pronominale avec « si » peut exprimer un mouvement spontané sans agent explicite.',
    },
  ],
  C1: [
    {
      topic: 'Nuances du subjonctif',
      question: 'Quand utilise-t-on le congiuntivo trapassato ?',
      options: ['Pour une possibilité dans le futur', 'Pour une hypothèse irréelle dans le passé', 'Pour exprimer un ordre', 'Pour le présent habituel'],
      correctIndex: 1,
      explanation: 'Le congiuntivo trapassato (avessi avuto, fossi andato) s\'utilise dans les hypothèses irréelles passées.',
    },
    {
      topic: 'Registres de langue',
      question: 'Laquelle est la formule la plus formelle pour prendre congé ?',
      options: ['Ciao!', 'Arrivederci', 'Arrivederla', 'A presto'],
      correctIndex: 2,
      explanation: '« Arrivederla » est la forme de politesse maximale utilisant le Lei, utilisée en contexte très formel.',
    },
    {
      topic: 'Syntaxe avancée',
      question: 'Que marque « nonostante » dans une phrase ?',
      options: ['La cause', 'La concession (bien que)', 'La conséquence', 'La condition'],
      correctIndex: 1,
      explanation: '« Nonostante » signifie « bien que / malgré » et introduit une proposition de concession avec le subjonctif.',
    },
    {
      topic: 'Phraséologie littéraire',
      question: 'Que signifie « far finta di » ?',
      options: ['Finir par', 'Faire semblant de', 'Finalement faire', 'Prétendre à'],
      correctIndex: 1,
      explanation: '« Far finta di » = faire semblant de. Ex : « Fa finta di non capire » = Il fait semblant de ne pas comprendre.',
    },
    {
      topic: 'Lexique soutenu',
      question: 'Quel mot signifie « malheureusement » sur un registre soutenu ?',
      options: ['Purtroppo', 'Sfortunatamente', 'Per disgrazia', 'Ahi'],
      correctIndex: 1,
      explanation: '« Sfortunatamente » est le terme littéraire/soutenu, tandis que « purtroppo » est l\'usage courant.',
    },
  ],
  C2: [
    {
      topic: 'Maîtrise stylistique',
      question: 'Dans quelle situation utilise-t-on le passato remoto plutôt que le passato prossimo ?',
      options: ['En Italie du Nord pour les événements récents', 'En Italie du Sud pour les événements anciens et historiques', 'Uniquement dans les textes littéraires', 'Pour les états permanents'],
      correctIndex: 1,
      explanation: 'Dans le sud de l\'Italie, le passato remoto est privilégié pour les événements perçus comme définitivement passés, même récents.',
    },
    {
      topic: 'Étymologie',
      question: 'Le mot « ciao » vient à l\'origine de quelle expression vénitienne ?',
      options: ['Caro amico', 'S-ciavo vostro (votre esclave)', 'Chiamo voi', 'Cia vale'],
      correctIndex: 1,
      explanation: '« Ciao » dérive du vénitien « s-ciavo », forme contractée de « s-ciavo vostro » (votre serviteur), formule de politesse.',
    },
    {
      topic: 'Dialectes',
      question: 'Quelle langue régionale italienne est la plus proche du latin classique ?',
      options: ['Le napolitain', 'Le sarde (sardu)', 'Le lombard', 'Le sicilien'],
      correctIndex: 1,
      explanation: 'Le sarde est considéré comme la langue romane la plus conservatrice et la plus proche du latin classique.',
    },
    {
      topic: 'Rhétorique',
      question: 'Quelle figure de style est utilisée dans « Il tempo vola » (Le temps vole) ?',
      options: ['Allitération', 'Personnification / métaphore', 'Oxymore', 'Hyperbole'],
      correctIndex: 1,
      explanation: '« Il tempo vola » est une métaphore (personnification) qui attribue au temps abstrait l\'action concrète de voler.',
    },
    {
      topic: 'Linguistique italienne',
      question: 'Qu\'est-ce que l\'« italiano standard » ?',
      options: ['Le dialecte de Rome', 'La norme écrite basée sur le toscan florentin', 'L\'italien parlé à Milan', 'La langue des médias uniquement'],
      correctIndex: 1,
      explanation: 'L\'italien standard est basé sur le toscan florentin tel que fixé par Dante, Petrarca et Boccaccio au XIVe siècle.',
    },
  ],
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CourseExamProps {
  level: CefrLevel;
  onClose: () => void;
}

type ExamPhase = 'intro' | 'questions' | 'results';

// ─── Component ─────────────────────────────────────────────────────────────────
export const CourseExam: React.FC<CourseExamProps> = ({ level, onClose }) => {
  const { submitLevelExam } = useApp();

  const questions = EXAM_DATA[level] || EXAM_DATA['A1'];
  const PASS_SCORE = 60; // %

  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [examResult, setExamResult] = useState<{ passed: boolean; percentage: number } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionStarted = useRef(false);

  // Timer once questions start
  useEffect(() => {
    if (phase !== 'questions') return;
    const totalSeconds = questions.length * 60; // 1 min per question
    setTimeLeft(totalSeconds);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishExam([...answers]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const startExam = () => {
    submissionStarted.current = false;
    setExamResult(null);
    setSubmissionError(null);
    setIsSubmitting(false);
    setExamStartTime(Date.now());
    setPhase('questions');
    setCurrentQ(0);
    setAnswers(Array(questions.length).fill(null));
    setSelected(null);
    setShowExplanation(false);
  };

  const handleSelectAnswer = (idx: number) => {
    if (answers[currentQ] !== null) return; // already answered
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(answers[currentQ + 1]);
      setShowExplanation(answers[currentQ + 1] !== null);
    } else {
      finishExam(answers);
    }
  };

  const finishExam = async (finalAnswers: (number | null)[]) => {
    if (submissionStarted.current) return;
    submissionStarted.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const result = await submitLevelExam(level, finalAnswers);
      setExamResult(result);
      if (result.passed) triggerSuccessConfetti();
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "L'examen n'a pas pu être enregistré.");
    }
    setIsSubmitting(false);
    setPhase('results');
  };

  const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const pct = examResult?.percentage ?? 0;
  const passed = examResult?.passed ?? false;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1A17] pb-16">

      {/* Top bar */}
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#EAE4DA]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-medium text-[#7A7169] hover:text-[#1F1A17] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour aux leçons</span>
        </button>

        <div className="flex items-center gap-3">
          <CefrBadge level={level} size="sm" />
          <span className="text-xs font-bold text-[#1F1A17]">Examen final — Niveau {level}</span>
        </div>

        {phase === 'questions' && (
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${
            timeLeft < 60 ? 'bg-[#FDF0EB] text-[#C04A33] border border-[#F6D9CE]' : 'bg-[#FAF7F2] text-[#4A423D] border border-[#EAE4DA]'
          }`}>
            <Clock size={13} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10">

        <AnimatePresence mode="wait">

          {/* ─── INTRO PHASE ─── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-[#FDF4ED] border border-[#F6D9CE] flex items-center justify-center mx-auto shadow-xs">
                <Award size={36} className="text-[#C04A33]" />
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl font-bold text-[#1F1A17]">
                  Examen Final — Niveau {level}
                </h1>
                <p className="text-[#7A7169] text-base max-w-xl mx-auto leading-relaxed">
                  Validez vos connaissances acquises et décrochez votre certification de niveau {level}.
                  Cet examen évalue l'ensemble des compétences grammaticales et lexicales du niveau.
                </p>
              </div>

              {/* Exam details */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[
                  { label: 'Questions', value: `${questions.length} QCM`, icon: BookOpen, color: '#C04A33', bg: '#FDF4ED' },
                  { label: 'Durée', value: `${questions.length} min`, icon: Clock, color: '#2A6F55', bg: '#EDF6F2' },
                  { label: 'Seuil', value: `${PASS_SCORE}%`, icon: Target, color: '#1E6B8A', bg: '#E8F4F8' },
                ].map((d, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center" style={{ background: d.bg }}>
                      <d.icon size={18} style={{ color: d.color }} />
                    </div>
                    <div className="font-bold text-base text-[#1F1A17]">{d.value}</div>
                    <div className="text-[10px] text-[#8A817A] font-medium uppercase tracking-wide">{d.label}</div>
                  </div>
                ))}
              </div>

              {/* Topics covered */}
              <div className="p-5 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs text-left max-w-md mx-auto space-y-2.5">
                <p className="text-xs font-bold text-[#1F1A17] uppercase tracking-wide mb-1">Thèmes évalués</p>
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-[#4A423D]">
                    <div className="w-5 h-5 rounded-md bg-[#FDF4ED] flex items-center justify-center text-[#C04A33] font-bold text-[10px] shrink-0">
                      {i + 1}
                    </div>
                    <span>{q.topic}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startExam}
                className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-base shadow-lg shadow-[#C04A33]/20 transition-colors"
              >
                <Sparkles size={18} />
                Commencer l'examen
                <ChevronRight size={18} />
              </motion.button>

              <p className="text-xs text-[#8A817A]">
                Bon courage ! Un score ≥ {PASS_SCORE}% valide votre certification de niveau {level}.
              </p>
            </motion.div>
          )}

          {/* ─── QUESTIONS PHASE ─── */}
          {phase === 'questions' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8A817A]">
                  <span>Question {currentQ + 1} sur {questions.length}</span>
                  <span className="font-semibold text-[#C04A33]">{questions[currentQ].topic}</span>
                </div>
                <div className="h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C04A33] rounded-full"
                    initial={{ width: `${(currentQ / questions.length) * 100}%` }}
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="p-7 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-6">
                <h2 className="font-serif text-2xl font-normal text-[#1F1A17] leading-snug">
                  {questions[currentQ].question}
                </h2>

                {/* Options */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {questions[currentQ].options.map((opt, i) => {
                    const isAnswered = answers[currentQ] !== null;
                    const isCorrect = i === questions[currentQ].correctIndex;
                    const isSelected = answers[currentQ] === i;

                    let btnCls = 'bg-[#FAF7F2] border-[#EAE4DA] text-[#1F1A17] hover:bg-white hover:border-[#C04A33]/40';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnCls = 'bg-[#EDF6F2] border-[#2A6F55] text-[#2A6F55] font-semibold';
                      } else if (isSelected) {
                        btnCls = 'bg-[#FDF0EB] border-[#C04A33] text-[#C04A33] font-semibold';
                      } else {
                        btnCls = 'bg-[#FAF7F2] border-[#EAE4DA] text-[#8A817A] opacity-60';
                      }
                    }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!isAnswered ? { scale: 1.01 } : {}}
                        whileTap={!isAnswered ? { scale: 0.99 } : {}}
                        onClick={() => handleSelectAnswer(i)}
                        disabled={isAnswered}
                        className={`p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between gap-3 group ${btnCls}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-[#2A6F55] shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="text-[#C04A33] shrink-0" />}
                        {!isAnswered && (
                          <span className="text-[10px] text-[#8A817A] font-mono shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showExplanation && answers[currentQ] !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                        answers[currentQ] === questions[currentQ].correctIndex
                          ? 'bg-[#EDF6F2] border-[#CDE3D8] text-[#2A6F55]'
                          : 'bg-[#FDF0EB] border-[#F6D9CE] text-[#C04A33]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {answers[currentQ] === questions[currentQ].correctIndex
                          ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                          : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs uppercase tracking-wide">
                            {answers[currentQ] === questions[currentQ].correctIndex ? 'Bravissimo ! Réponse correcte' : 'Réponse incorrecte'}
                          </p>
                          <p className="text-xs text-[#1F1A17] leading-relaxed">{questions[currentQ].explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next / Finish button */}
              {answers[currentQ] !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <button
                    onClick={handleNextQuestion}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-sm shadow-xs transition-all"
                  >
                    <span>{isSubmitting ? 'Enregistrement...' : currentQ < questions.length - 1 ? 'Question suivante' : 'Terminer l\'examen'}</span>
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── RESULTS PHASE ─── */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center max-w-lg mx-auto"
            >
              {submissionError && (
                <p role="alert" className="rounded-xl border border-[#F6D9CE] bg-[#FDF0EB] p-4 text-sm text-[#C04A33]">
                  {submissionError} Votre niveau ne sera débloqué qu’après validation du résultat par le serveur.
                </p>
              )}

              {/* Score badge */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 ${
                passed
                  ? 'bg-[#EDF6F2] border-[#2A6F55] text-[#2A6F55]'
                  : 'bg-[#FDF0EB] border-[#C04A33] text-[#C04A33]'
              }`}>
                {passed
                  ? <Award size={48} />
                  : <XCircle size={48} />}
              </div>

              <div className="space-y-2">
                <div className="font-serif text-6xl font-bold text-[#1F1A17]">{pct}%</div>
                <h2 className="font-serif text-3xl font-bold text-[#1F1A17]">
                  {submissionError ? 'Résultat non enregistré' : passed ? `Niveau ${level} validé !` : 'Examen non validé'}
                </h2>
                <p className={`text-base font-medium ${passed ? 'text-[#2A6F55]' : 'text-[#C04A33]'}`}>
                  {submissionError
                    ? 'Réessayez une fois la connexion rétablie.'
                    : passed
                    ? `Félicitations ! Vous avez obtenu ${pct}% — vous recevez ${pct >= 80 ? 200 : 100} XP.`
                    : `Vous avez obtenu ${pct}%. Le seuil de réussite est ${PASS_SCORE}%. Continuez à réviser !`}
                </p>
              </div>

              {/* Score grid */}
              <div className="p-5 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs space-y-3 text-left">
                <p className="text-xs font-bold text-[#1F1A17] uppercase tracking-wide">Détail par question</p>
                {questions.map((q, i) => {
                  const answerIdx = answers[i];
                  const correct = answerIdx === q.correctIndex;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${correct ? 'bg-[#F0FAF5]' : 'bg-[#FDF5F3]'}`}>
                      {correct
                        ? <CheckCircle2 size={15} className="text-[#2A6F55] shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-[#C04A33] shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1F1A17] truncate">{q.topic}</p>
                        {!correct && answerIdx !== null && (
                          <p className="text-[10px] text-[#8A817A] mt-0.5">
                            Votre réponse : {q.options[answerIdx]} · Correcte : {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!passed && (
                  <button
                    onClick={startExam}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold shadow-xs transition-all"
                  >
                    <RotateCcw size={16} />
                    Recommencer l'examen
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#EAE4DA] text-[#1F1A17] font-semibold hover:bg-[#FAF7F2] transition-all"
                >
                  <ArrowLeft size={16} />
                  Retour aux leçons
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

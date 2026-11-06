import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Target, 
  Volume2, 
  ChevronRight, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  Award,
  BookOpen,
  Check,
  AlertCircle,
  Languages,
  Video,
  Music2
} from 'lucide-react';
import { Lesson } from '../../types';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { VocabularyView } from '../vocabulary/VocabularyView';
import { ConjugationView } from '../conjugation/ConjugationView';
import { MediaLibraryView } from '../media/MediaLibraryView';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  initialTab?: 'course' | 'quiz';
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onClose, initialTab = 'course' }) => {
  const { user, completeLesson } = useApp();
  const [activeCourseTab, setActiveCourseTab] = useState<'course' | 'quiz' | 'vocabulary' | 'conjugation' | 'videos' | 'music'>(initialTab);

  // Multi-question Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Integrated AI chat state for this lesson
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: `Buongiorno ! Je suis votre tuteur IA pour la leçon « ${lesson.title} » (${lesson.titleFr}).\n\nN'hésitez pas à me poser une question sur le vocabulaire, la grammaire ou un exemple de ce cours !`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  const currentQuestion = lesson.quiz && lesson.quiz.length > 0 
    ? lesson.quiz[currentQuizIndex] 
    : null;

  const isCurrentCorrect = currentQuestion && selectedOptionIndex === currentQuestion.correctIndex;

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null || isAnswerChecked) return;
    setIsAnswerChecked(true);
    if (isCurrentCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!lesson.quiz || lesson.quiz.length === 0) return;

    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
    } else {
      // Quiz finished
      setIsQuizFinished(true);
      completeLesson(lesson.id);
      triggerSuccessConfetti();
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const handleSendQuestion = (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');

    // Generate contextual pedagogy answer
    setTimeout(() => {
      let reply = `Excellente question sur « ${lesson.title} » ! `;
      const qLower = q.toLowerCase();

      if (qLower.includes('exercice') || qLower.includes('test')) {
        reply = `Voici un mini-défi : comment diriez-vous en italien une phrase avec ce que l'on vient de voir ?\nEssayez de me l'écrire et je la corrigerai avec plaisir !`;
      } else if (qLower.includes('pourquoi') || qLower.includes('perché')) {
        reply = `En italien, la nuance provient souvent de la structure grammaticale ou du contexte d'usage. Dans cette leçon (${lesson.titleFr}), retenez bien la règle de base expliquée dans le texte.`;
      } else if (qLower.includes('exemple') || qLower.includes('phrase')) {
        if (lesson.sections[0]?.examples?.[0]) {
          const ex = lesson.sections[0].examples[0];
          reply = `Voici un exemple typique : « ${ex.italian} » (${ex.french}). Répétez-le à voix haute pour fixer votre prononciation !`;
        } else {
          reply = `Pensez à pratiquer régulièrement à l'oral pour ancrer les automatismes.`;
        }
      } else {
        reply += `Dans ce contexte, la règle clé est d'accorder une attention particulière aux terminaisons et à l'intonation naturelle. Continuez comme ça !`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1A17] pb-16">
      
      {/* Top Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#EAE4DA]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-medium text-[#7A7169] hover:text-[#1F1A17] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Parcours {lesson.level}</span>
          <span>›</span>
          <span className="text-[#1F1A17] font-semibold">{lesson.title}</span>
        </button>

        <button
          onClick={() => setActiveCourseTab('quiz')}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#EDF6F2] text-[#2A6F55] border border-[#CDE3D8] hover:bg-[#E3EFE9] transition-colors flex items-center gap-1.5"
        >
          <Award size={15} />
          <span>Valider le QCM (+50 XP)</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        
        {/* Title and Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C04A33] text-white">
              {lesson.level}
            </span>
            <span className="text-xs text-[#7A7169] font-mono">
              {lesson.estimatedMinutes} min estimées
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1A17] font-normal tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7169] font-sans">
            {lesson.titleFr} — {lesson.description}
          </p>
        </div>

        <nav
          aria-label="Rubriques du cours"
          className="sticky top-16 z-20 -mx-2 flex gap-2 overflow-x-auto border-b border-[#EAE4DA] bg-[#FBF9F5] px-2 py-3"
        >
          {([
            { id: 'course', label: 'Cours', icon: BookOpen },
            { id: 'quiz', label: 'Quiz', icon: HelpCircle },
            { id: 'vocabulary', label: 'Vocabulaire', icon: Languages },
            { id: 'conjugation', label: 'Conjugaison', icon: Check },
            { id: 'videos', label: 'Vidéos', icon: Video },
            { id: 'music', label: 'Musique', icon: Music2 },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeCourseTab === id ? 'page' : undefined}
              onClick={() => setActiveCourseTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeCourseTab === id
                  ? 'border-[#C04A33] bg-[#C04A33] text-white'
                  : 'border-[#EAE4DA] bg-white text-[#4A423D] hover:border-[#D8CEBD] hover:bg-[#FAF7F2]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* 2-Columns Layout: Left Lesson Content (8 cols) + Right AI Assistant (4 cols) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {activeCourseTab === 'course' && (
              <>
            {lesson.videoUrl && (
              <div className="overflow-hidden rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
                <video controls preload="metadata" className="aspect-video w-full bg-[#1F1A17]" aria-label={`Vidéo de la leçon ${lesson.title}`}>
                  <source src={lesson.videoUrl} />
                  Votre navigateur ne peut pas lire cette vidéo.
                </video>
              </div>
            )}
            {/* Objective Pill Card */}
            <div className="p-5 rounded-3xl bg-[#FDF4ED] border border-[#F6D9CE] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F5D5C8] text-[#C04A33] flex items-center justify-center shrink-0">
                <Target size={20} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#1F1A17]">
                  Objectifs d'apprentissage
                </h3>
                {lesson.learningObjectives && lesson.learningObjectives.length > 0 ? (
                  <ul className="space-y-1 pt-1">
                    {lesson.learningObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-[#4A423D] flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-[#2A6F55] shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#7A7169]">{lesson.description}</p>
                )}
              </div>
            </div>

            {/* Sections Content */}
            {lesson.sections.map((section, sIdx) => (
              <div key={section.id || sIdx} className="space-y-6">
                
                {/* Main section explanation card */}
                <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1F1A17] font-semibold">
                      {section.title}
                    </h2>
                  </div>

                  <div className="border-t border-[#F5F0E8] pt-4">
                    <MarkdownRenderer content={section.contentMarkdown} />
                  </div>
                </div>

                {/* Conjugation Table (rendered ONLY if present in this section) */}
                {section.conjugationTable && (
                  <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 sm:p-8 space-y-4">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#1F1A17] font-normal">
                        {section.conjugationTable.verbName}
                      </h3>
                      {section.conjugationTable.auxiliaryNote && (
                        <p className="text-xs text-[#7A7169] mt-0.5">
                          {section.conjugationTable.auxiliaryNote}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#EAE4DA] overflow-hidden">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#FAF7F2] border-b border-[#EAE4DA] text-[#68605A] font-semibold">
                          <tr>
                            <th className="p-3.5 sm:px-6">Pronom</th>
                            <th className="p-3.5 sm:px-6">Forme verbale</th>
                            <th className="p-3.5 sm:px-6">Traduction</th>
                            <th className="p-3.5 sm:px-6">Exemple</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0E8] font-medium text-[#1F1A17]">
                          {section.conjugationTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#FAF7F2] transition-colors">
                              <td className="p-3.5 sm:px-6 font-semibold text-[#68605A]">{row.pronoun}</td>
                              <td className="p-3.5 sm:px-6 font-mono text-[#C04A33] font-bold">{row.verbForm}</td>
                              <td className="p-3.5 sm:px-6 text-[#7A7169]">{row.translation}</td>
                              <td className="p-3.5 sm:px-6 text-[#1F1A17]">
                                <span className="font-semibold">{row.example}</span>
                                {row.exampleFr && (
                                  <span className="block text-[11px] text-[#8A817A]">{row.exampleFr}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Daily Life Examples (rendered if present) */}
                {section.examples && section.examples.length > 0 && (
                  <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 sm:p-8 space-y-4">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#1F1A17] font-normal">
                        Exemples en contexte & Prononciation
                      </h3>
                      <p className="text-xs text-[#7A7169] mt-0.5">
                        Cliquez sur une phrase pour écouter la prononciation audio italienne.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {section.examples.map((item, exIdx) => (
                        <div
                          key={exIdx}
                          onClick={() => audioService.speak(item.italian)}
                          className="p-4 rounded-2xl border border-[#EAE4DA] hover:border-[#C04A33] transition-all bg-[#FAF7F2] hover:bg-[#FDF6F2] flex items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-semibold text-sm sm:text-base text-[#1F1A17] group-hover:text-[#C04A33] transition-colors">
                              {item.italian}
                            </div>
                            <div className="text-xs text-[#7A7169]">{item.french}</div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              title="Écouter la prononciation"
                              className="w-10 h-10 rounded-full bg-[#FDF0EB] text-[#C04A33] group-hover:bg-[#C04A33] group-hover:text-white flex items-center justify-center transition-colors shadow-xs"
                            >
                              <Volume2 size={18} />
                            </button>
                            <ChevronRight size={16} className="text-[#8A817A]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes (rendered if present) */}
                {section.commonMistakes && section.commonMistakes.length > 0 && (
                  <div className="p-6 rounded-3xl bg-[#FDF5F3] border border-[#F6D9CE] space-y-3">
                    <h4 className="font-serif text-lg text-[#C04A33] font-semibold flex items-center gap-2">
                      <AlertCircle size={18} />
                      <span>Pièges fréquents à éviter</span>
                    </h4>
                    <div className="space-y-2.5">
                      {section.commonMistakes.map((mis, mIdx) => (
                        <div key={mIdx} className="space-y-1 text-xs bg-white/70 p-3 rounded-2xl border border-[#F6D9CE]">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[#C04A33] line-through font-semibold">✗ {mis.incorrect}</span>
                            <span className="text-[#8A817A]">→</span>
                            <span className="text-[#2A6F55] font-bold">✓ {mis.correct}</span>
                          </div>
                          <p className="text-[#68605A] text-[11px] leading-relaxed pt-0.5">{mis.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
              </>
            )}

            {/* Validation Quiz Section (Multi-Questions QCM) */}
            {activeCourseTab === 'quiz' && <div id="lesson-quiz-section" className="bg-white rounded-3xl border border-[#CDE3D8] shadow-parla p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center font-bold">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#1F1A17] font-bold">
                      Quiz QCM de validation de la leçon
                    </h3>
                    <p className="text-xs text-[#7A7169]">
                      {lesson.quiz.length} question(s) pour valider cette leçon et gagner +50 XP.
                    </p>
                  </div>
                </div>

                <span className="text-xs text-[#2A6F55] font-bold bg-[#EDF6F2] border border-[#CDE3D8] px-3 py-1 rounded-xl">
                  {isQuizFinished ? `Score : ${quizScore}/${lesson.quiz.length}` : `Question ${currentQuizIndex + 1}/${lesson.quiz.length}`}
                </span>
              </div>

              {!isQuizFinished ? (
                currentQuestion ? (
                  <div className="space-y-4">
                    {/* Question text */}
                    <p className="text-sm sm:text-base font-semibold text-[#1F1A17]">
                      {currentQuestion.question}
                    </p>

                    {/* Options list */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, optIdx) => {
                        const isSelected = selectedOptionIndex === optIdx;
                        const isCorrectOption = optIdx === currentQuestion.correctIndex;

                        let btnStyle = 'bg-[#FAF7F2] text-[#1F1A17] border-[#EAE4DA] hover:bg-[#F2ECE3]';
                        if (isAnswerChecked) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-[#EDF6F2] text-[#2A6F55] border-[#2A6F55] font-bold shadow-xs';
                          } else if (isSelected && !isCorrectOption) {
                            btnStyle = 'bg-[#FDF0EB] text-[#C04A33] border-[#C04A33] line-through';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-[#C04A33] text-white border-[#C04A33] shadow-xs font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswerChecked}
                            onClick={() => setSelectedOptionIndex(optIdx)}
                            className={`p-4 rounded-2xl text-left text-xs sm:text-sm border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold opacity-70">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isAnswerChecked && isCorrectOption && (
                              <CheckCircle2 size={16} className="text-[#2A6F55] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Didactic Explanation Feedback */}
                    {isAnswerChecked && (
                      <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                        isCurrentCorrect 
                          ? 'bg-[#EDF6F2] border-[#CDE3D8] text-[#2A6F55]' 
                          : 'bg-[#FDF4ED] border-[#F6D9CE] text-[#C04A33]'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          {isCurrentCorrect ? '✓ Bravissimo ! Réponse exacte.' : '✗ Pas tout à fait...'}
                        </div>
                        <p className="text-[#4A423D] text-xs">
                          {currentQuestion.explanation || 'Analysez bien la structure et réessayez.'}
                        </p>
                      </div>
                    )}

                    {/* Actions button */}
                    <div className="pt-2 flex justify-end gap-3">
                      {!isAnswerChecked ? (
                        <button
                          disabled={selectedOptionIndex === null}
                          onClick={handleCheckAnswer}
                          className="px-6 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-transform active:scale-95"
                        >
                          Vérifier ma réponse
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="px-6 py-2.5 rounded-xl bg-[#2A6F55] hover:bg-[#235b46] text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-2"
                        >
                          <span>{currentQuizIndex < lesson.quiz.length - 1 ? 'Question suivante ›' : 'Terminer le quiz (+50 XP)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#7A7169]">Aucune question dans ce quiz pour le moment.</p>
                )
              ) : (
                /* Quiz Finished Card */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#EDF6F2] text-[#2A6F55] mx-auto flex items-center justify-center border-2 border-[#CDE3D8]">
                    <Award size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl font-bold text-[#1F1A17]">
                      Félicitations ! Leçon validée
                    </h4>
                    <p className="text-xs sm:text-sm text-[#7A7169]">
                      Vous avez obtenu <span className="font-bold text-[#2A6F55]">{quizScore} sur {lesson.quiz.length}</span> bonnes réponses.
                    </p>
                    <p className="text-xs font-semibold text-[#C04A33]">
                      +50 XP et +15 gemmes ajoutés à votre profil !
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleRestartQuiz}
                      className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#4A423D] text-xs font-semibold border border-[#EAE4DA]"
                    >
                      Recommencer le quiz
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white text-xs font-bold shadow-xs"
                    >
                      Retour au parcours
                    </button>
                  </div>
                </div>
              )}
            </div>}

            {activeCourseTab === 'vocabulary' && <VocabularyView />}
            {activeCourseTab === 'conjugation' && <ConjugationView />}
            {activeCourseTab === 'videos' && <MediaLibraryView kind="videos" />}
            {activeCourseTab === 'music' && <MediaLibraryView kind="music" />}

          </div>

          {/* Right Column (4 cols) — Integrated AI Assistant matching Screenshot 1 */}
          <div className="lg:col-span-4 sticky top-24">
            
            <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla overflow-hidden flex flex-col h-[640px]">
              
              {/* Header */}
              <div className="p-5 border-b border-[#EAE4DA] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#1F1A17] font-semibold leading-tight">
                    Assistant IA
                  </h3>
                  <p className="text-[11px] text-[#7A7169]">
                    Tuteur dédié pour « {lesson.title} »
                  </p>
                </div>
              </div>

              {/* Chat Message Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]/60">
                {messages.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    {m.sender === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl p-3 bg-[#FDF4ED] text-[#1F1A17] border border-[#F6D9CE] text-xs font-medium leading-relaxed">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center shrink-0 mt-1">
                          <Sparkles size={12} />
                        </div>
                        <div className="max-w-[88%] rounded-2xl p-3 bg-white text-[#1F1A17] border border-[#EAE4DA] text-xs leading-relaxed space-y-2 shadow-xs">
                          <p className="whitespace-pre-line">{m.text}</p>
                        </div>
                      </div>
                    )}
                    <div className={`text-[10px] text-[#8A817A] px-2 ${m.sender === 'user' ? 'text-right' : 'text-left pl-8'}`}>
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick suggestion chips matching screenshot */}
              <div className="px-4 py-2 border-t border-[#EAE4DA] bg-white flex items-center gap-2">
                <button
                  onClick={() => handleSendQuestion("Expliquez-moi plus en détail la règle.")}
                  className="px-3 py-1 rounded-full border border-[#D8CEBD] hover:border-[#C04A33] text-[11px] font-medium text-[#4A423D] hover:text-[#C04A33] transition-colors"
                >
                  Expliquer
                </button>
                <button
                  onClick={() => handleSendQuestion("Donnez-moi un exemple pratique.")}
                  className="px-3 py-1 rounded-full border border-[#D8CEBD] hover:border-[#C04A33] text-[11px] font-medium text-[#4A423D] hover:text-[#C04A33] transition-colors"
                >
                  Un exemple
                </button>
              </div>

              {/* Input bar */}
              <div className="p-4 border-t border-[#EAE4DA] bg-white space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuestion();
                  }}
                  className="flex items-center gap-2 relative"
                >
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Posez une question sur ce cours..."
                    className="flex-1 bg-white border border-[#EAE4DA] rounded-2xl px-4 py-2.5 text-xs text-[#1F1A17] placeholder-[#8A817A] focus:outline-none focus:border-[#C04A33] shadow-xs"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-full bg-[#C04A33] hover:bg-[#AA3E29] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </form>

                <p className="text-[10px] text-[#8A817A] text-center leading-tight">
                  L'assistant peut faire des erreurs. Vérifiez toujours les informations importantes.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

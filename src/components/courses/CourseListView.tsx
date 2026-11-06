import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Play, Award, Lock, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CefrBadge } from '../common/CefrBadge';
import { CefrLevel, Lesson } from '../../types';
import { CourseExam } from './CourseExam';

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CourseListView: React.FC = () => {
  const { lessons, user, startLesson } = useApp();
  const filterLevel = String(user.italianLevel);
  const [examLevel, setExamLevel] = useState<CefrLevel | null>(null);

  const levels: Array<CefrLevel | 'ALL'> = [user.italianLevel];
  const nextLevel = CEFR_LEVELS[CEFR_LEVELS.indexOf(user.italianLevel) + 1];

  const filteredLessons = lessons.filter(l =>
    l.level === user.italianLevel
  );

  // Group all lessons by CECRL level to find exam eligibility
  const getLessonsForLevel = (level: CefrLevel) =>
    lessons.filter(l => l.level === level);

  const isLevelComplete = (level: CefrLevel) => {
    const levelLessons = getLessonsForLevel(level);
    if (levelLessons.length === 0) return false;
    return levelLessons.every(l => user.completedLessons.includes(l.id));
  };

  const getCompletionPct = (level: CefrLevel) => {
    const levelLessons = getLessonsForLevel(level);
    if (levelLessons.length === 0) return 0;
    const done = levelLessons.filter(l => user.completedLessons.includes(l.id)).length;
    return Math.round((done / levelLessons.length) * 100);
  };

  // If exam is open, render it full screen
  if (examLevel) {
    return <CourseExam level={examLevel} onClose={() => setExamLevel(null)} />;
  }

  // Group filtered lessons by level for display when showing ALL
  const lessonsByLevel: Record<string, Lesson[]> = {};
  if (filterLevel === 'ALL') {
    for (const lvl of CEFR_LEVELS) {
      const group = lessons.filter(l => l.level === lvl);
      if (group.length > 0) lessonsByLevel[lvl] = group;
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* View Header */}
      <div className="space-y-1.5 border-b border-[#EAE4DA] pb-5">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1A17] font-normal tracking-tight">
          Catalogue des <span className="italic font-serif">Leçons</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7169] max-w-2xl font-sans">
          Un cursus structuré et progressif du niveau débutant A1 au niveau avancé C2. Chaque niveau se termine par un <strong className="text-[#1F1A17]">examen final de certification</strong>.
        </p>
      </div>

      {/* CEFR Level Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {levels.map((lvl) => {
          return (
            <button
              key={lvl}
              type="button"
              aria-current="page"
              className="flex items-center gap-1.5 rounded-xl bg-[#C04A33] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              {`Niveau ${lvl}`}
            </button>
          );
        })}
      </div>

      {nextLevel && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#EAE4DA] bg-[#FAF7F2] p-4 text-sm text-[#7A7169]">
          <Lock size={17} className="shrink-0" />
          <p>
            Le niveau <strong className="text-[#1F1A17]">{nextLevel}</strong> sera débloqué après avoir terminé les leçons {user.italianLevel} et réussi son examen final (60 % minimum).
          </p>
        </div>
      )}

      {/* Content: ALL view — grouped by level with exam banner */}
      {filterLevel === 'ALL' ? (
        <div className="space-y-12">
          {Object.entries(lessonsByLevel).map(([lvl, lvlLessons]) => {
            const level = lvl as CefrLevel;
            const complete = isLevelComplete(level);
            const pct = getCompletionPct(level);

            return (
              <div key={lvl} className="space-y-4">
                {/* Level header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CefrBadge level={level} size="md" />
                    <div>
                      <span className="text-sm font-bold text-[#1F1A17]">{lvlLessons.length} leçon{lvlLessons.length > 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1.5 w-28 bg-[#F5F0E8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C04A33] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#8A817A] font-medium">{pct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Exam button */}
                  {complete ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setExamLevel(level)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-xs shadow-md shadow-[#C04A33]/20 transition-all"
                    >
                      <Award size={15} />
                      <span>Passer l'examen final</span>
                      <ChevronRight size={14} />
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#8A817A] text-xs font-semibold cursor-not-allowed">
                      <Lock size={13} />
                      <span>Examen — {pct}% complété</span>
                    </div>
                  )}
                </div>

                {/* Lessons grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {lvlLessons.map((lesson, idx) => {
                    const isDone = user.completedLessons.includes(lesson.id);
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between bg-white shadow-parla ${isDone ? 'border-[#CDE3D8]' : 'border-[#EAE4DA] hover:border-[#D8CEBD]'
                          }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <CefrBadge level={lesson.level} size="sm" />
                            <div className="flex items-center gap-1.5 text-xs text-[#8A817A]">
                              <Clock size={12} />
                              <span>{lesson.estimatedMinutes} min</span>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="font-serif font-bold text-[#1F1A17] text-base leading-snug">{lesson.title}</h3>
                            <p className="text-xs text-[#C04A33] font-medium">{lesson.titleFr}</p>
                          </div>
                          <p className="text-xs text-[#68605A] line-clamp-2 leading-relaxed">{lesson.description}</p>
                        </div>
                        <div className="pt-4 mt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                          {isDone
                            ? <span className="flex items-center gap-1.5 text-xs font-bold text-[#2A6F55]"><CheckCircle size={14} />Terminée</span>
                            : <span className="text-xs font-medium text-[#8A817A]">À commencer</span>}
                          <button
                            onClick={() => startLesson(lesson)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isDone
                              ? 'bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#1F1A17] border border-[#EAE4DA]'
                              : 'bg-[#C04A33] hover:bg-[#AA3E29] text-white shadow-xs'
                              }`}
                          >
                            <Play size={11} className="fill-current" />
                            <span>{isDone ? 'Réviser' : 'Étudier'}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Exam unlock banner */}
                {complete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-[#FDF4ED] to-[#FAF7F2] border border-[#F6D9CE] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#C04A33] flex items-center justify-center shadow-xs">
                        <Award size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1F1A17]">Niveau {level} complété !</p>
                        <p className="text-xs text-[#7A7169]">Passez l'examen final pour obtenir votre certifcat de niveau {level}.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExamLevel(level)}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <span>Passer l'examen</span>
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Single level filtered view */
        <div className="space-y-6">
          {/* Exam eligibility banner */}
          {(() => {
            const level = filterLevel as CefrLevel;
            const complete = isLevelComplete(level);
            const pct = getCompletionPct(level);
            return (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${complete
                ? 'bg-gradient-to-r from-[#FDF4ED] to-[#FAF7F2] border-[#F6D9CE]'
                : 'bg-[#FAF7F2] border-[#EAE4DA]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${complete ? 'bg-[#C04A33]' : 'bg-[#FAF7F2] border border-[#EAE4DA]'
                    }`}>
                    {complete ? <Award size={18} className="text-white" /> : <Lock size={16} className="text-[#8A817A]" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F1A17]">
                      {complete ? `Examen final — Niveau ${filterLevel} débloqué !` : `Examen final — Niveau ${filterLevel}`}
                    </p>
                    <p className="text-xs text-[#7A7169]">
                      {complete
                        ? 'Toutes les leçons sont terminées. Vous pouvez passer l\'examen.'
                        : `${pct}% des leçons complétées. Terminez toutes les leçons pour débloquer l'examen.`}
                    </p>
                  </div>
                </div>
                {complete ? (
                  <button
                    onClick={() => setExamLevel(level)}
                    className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-sm shadow-xs transition-all"
                  >
                    <Award size={15} />
                    Passer l'examen
                  </button>
                ) : (
                  <span className="text-xs text-[#8A817A] font-bold shrink-0">{pct}% / 100%</span>
                )}
              </div>
            );
          })()}

          {/* Lessons grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, idx) => {
              const isDone = user.completedLessons.includes(lesson.id);
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between bg-white shadow-parla ${isDone ? 'border-[#CDE3D8]' : 'border-[#EAE4DA] hover:border-[#D8CEBD]'
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CefrBadge level={lesson.level} size="sm" />
                      <div className="flex items-center gap-1.5 text-xs text-[#8A817A]">
                        <Clock size={13} />
                        <span>{lesson.estimatedMinutes} min</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-serif font-bold text-[#1F1A17] text-lg leading-snug">{lesson.title}</h3>
                      <p className="text-xs text-[#C04A33] font-medium">{lesson.titleFr}</p>
                    </div>
                    <p className="text-xs text-[#68605A] line-clamp-3 leading-relaxed">{lesson.description}</p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-[#F2ECE3] flex items-center justify-between">
                    {isDone
                      ? <span className="flex items-center gap-1.5 text-xs font-bold text-[#2A6F55]"><CheckCircle size={15} />Terminée</span>
                      : <span className="text-xs font-medium text-[#8A817A]">À commencer</span>}
                    <button
                      onClick={() => startLesson(lesson)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isDone
                        ? 'bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#1F1A17] border border-[#EAE4DA]'
                        : 'bg-[#C04A33] hover:bg-[#AA3E29] text-white shadow-xs'
                        }`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>{isDone ? 'Réviser' : 'Étudier'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredLessons.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#EAE4DA] space-y-3">
              <p className="text-sm text-[#8A817A]">Aucune leçon pour ce niveau pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

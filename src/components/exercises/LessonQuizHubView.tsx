import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, CircleHelp, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExerciseHubView } from './ExerciseHubView';
import { CefrBadge } from '../common/CefrBadge';

export const LessonQuizHubView: React.FC = () => {
  const { lessons, user, startLesson } = useApp();
  const [showExercises, setShowExercises] = useState(false);

  const levelLessons = lessons
    .filter(lesson => lesson.level === user.italianLevel)
    .sort((a, b) => a.unitNumber - b.unitNumber || a.orderNumber - b.orderNumber);
  const lessonsWithQuiz = levelLessons.filter(lesson => lesson.quiz.length > 0);

  if (showExercises) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setShowExercises(false)}
          className="flex items-center gap-2 text-sm font-semibold text-[#C04A33] hover:underline"
        >
          <ArrowLeft size={16} />
          Retour aux quiz des leçons
        </button>
        <ExerciseHubView />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#EAE4DA] pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EDF6F2] text-[#2A6F55]">
              <CircleHelp size={20} />
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1F1A17]">
              Quiz des leçons
            </h1>
          </div>
          <p className="text-sm text-[#7A7169]">
            Retrouvez les quiz de toutes les leçons de votre niveau.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowExercises(true)}
          className="flex items-center gap-2 rounded-xl border border-[#EAE4DA] bg-white px-4 py-2.5 text-xs font-semibold text-[#4A423D] hover:bg-[#FAF7F2]"
        >
          <Sparkles size={15} />
          Exercices libres
        </button>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-[#CDE3D8] bg-[#EDF6F2] p-4">
        <CefrBadge level={user.italianLevel} size="md" />
        <p className="text-sm text-[#4A423D]">
          <strong>{lessonsWithQuiz.length}</strong> quiz disponible{lessonsWithQuiz.length > 1 ? 's' : ''}
          {' '}sur {levelLessons.length} leçon{levelLessons.length > 1 ? 's' : ''} de ce niveau.
        </p>
      </div>

      {lessonsWithQuiz.length === 0 ? (
        <div role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-[#8A817A]" size={28} />
          <p className="text-sm font-semibold text-[#4A423D]">Aucun quiz disponible pour le niveau {user.italianLevel}.</p>
          <p className="mt-1 text-xs text-[#7A7169]">Les quiz apparaîtront ici dès qu’ils seront ajoutés aux leçons.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessonsWithQuiz.map((lesson, index) => {
            const isCompleted = user.completedLessons.includes(lesson.id);
            return (
              <article
                key={lesson.id}
                className="flex flex-col justify-between rounded-3xl border border-[#EAE4DA] bg-white p-5 shadow-parla"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CefrBadge level={lesson.level} size="sm" />
                    <span className="text-xs font-medium text-[#8A817A]">
                      Leçon {index + 1} · {lesson.quiz.length} question{lesson.quiz.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold leading-snug text-[#1F1A17]">{lesson.title}</h2>
                    <p className="mt-0.5 text-xs font-medium text-[#C04A33]">{lesson.titleFr}</p>
                  </div>
                  {isCompleted && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#2A6F55]">
                      <CheckCircle2 size={14} />
                      Quiz terminé
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startLesson(lesson, 'quiz')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C04A33] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#AA3E29]"
                >
                  {isCompleted ? 'Refaire le quiz' : 'Commencer le quiz'}
                  {isCompleted ? <Award size={15} /> : <ArrowRight size={15} />}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

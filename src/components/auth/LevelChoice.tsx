import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FlaskConical, ArrowRight, Sparkles, Globe, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CourseExam } from '../courses/CourseExam';

export const LevelChoice: React.FC = () => {
  const { setShowLevelChoice, setActiveTab } = useApp();
  const [showExam, setShowExam] = useState(false);

  const handleStartAtA1 = () => {
    setShowLevelChoice(false);
    setActiveTab('dashboard');
  };

  const handleTakeTest = () => {
    setShowExam(true);
  };

  const handleExamClose = () => {
    setShowLevelChoice(false);
    setActiveTab('dashboard');
  };

  if (showExam) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FBF9F5] overflow-y-auto">
        <CourseExam level="A1" onClose={handleExamClose} />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Decorative top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#C04A33] via-[#B26A00] to-[#2A6F55]" />

          <div className="p-8 space-y-7">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF4ED] flex items-center justify-center mx-auto shadow-sm border border-[#F6D9CE]">
                <Globe size={28} className="text-[#C04A33]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1A17]">
                  Bienvenue sur Italiano AI !
                </h2>
                <p className="text-sm text-[#7A7169] mt-1.5 leading-relaxed">
                  Votre compte est créé. Comment souhaitez-vous<br />commencer votre apprentissage ?
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">

              {/* Option 1 — Test de niveau */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTakeTest}
                className="w-full text-left p-5 rounded-2xl border-2 border-[#C04A33] bg-[#FDF4ED] hover:bg-[#FBF0EA] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#C04A33] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <FlaskConical size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[#1F1A17] text-sm">Passer le test de niveau</p>
                      <ArrowRight size={16} className="text-[#C04A33] shrink-0" />
                    </div>
                    <p className="text-xs text-[#7A7169] mt-1 leading-relaxed">
                      Évaluez votre niveau actuel en 5 questions et accédez directement aux cours adaptés à votre profil.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Sparkles size={11} className="text-[#C04A33]" />
                      <span className="text-[10px] font-semibold text-[#C04A33] uppercase tracking-wide">Recommandé</span>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Option 2 — Niveau 1 direct */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartAtA1}
                className="w-full text-left p-5 rounded-2xl border-2 border-[#EAE4DA] bg-white hover:bg-[#FAF7F2] hover:border-[#C8BFB4] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F0E8] flex items-center justify-center shrink-0 group-hover:bg-[#EAE4DA] transition-colors">
                    <BookOpen size={20} className="text-[#4A423D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[#1F1A17] text-sm">Commencer au niveau A1</p>
                      <ArrowRight size={16} className="text-[#7A7169] shrink-0" />
                    </div>
                    <p className="text-xs text-[#7A7169] mt-1 leading-relaxed">
                      Débutez depuis le début avec les bases de l'italien — idéal si vous êtes grand(e) débutant(e).
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Footer note */}
            <div className="flex items-start gap-2 text-[11px] text-[#8A817A] bg-[#FAF7F2] rounded-xl p-3 border border-[#EAE4DA]">
              <CheckCircle2 size={13} className="text-[#2A6F55] shrink-0 mt-0.5" />
              <span>Vous pourrez changer de niveau à tout moment depuis vos paramètres ou en completant un examen de niveau.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

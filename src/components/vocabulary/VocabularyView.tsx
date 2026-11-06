import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  RotateCw, 
  Volume2, 
  Check, 
  X, 
  Plus, 
  BookMarked 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VocabularyWord, SrsBox, CefrLevel } from '../../types';
import { audioService } from '../../services/audioService';
import { CefrBadge } from '../common/CefrBadge';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';

export const VocabularyView: React.FC = () => {
  const { user, vocabulary, updateWordSrs, addCustomWord, addXp } = useApp();
  const [selectedBox, setSelectedBox] = useState<SrsBox | 'all'>('all');
  const [isFlipped, setIsFlipped] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for new word
  const [newItalian, setNewItalian] = useState('');
  const [newFrench, setNewFrench] = useState('');
  const [newGender, setNewGender] = useState<'s.m.' | 's.f.' | 'v.' | 'adj.' | 'adv.' | 'expr.'>('s.m.');
  const [newExampleIt, setNewExampleIt] = useState('');
  const [newExampleFr, setNewExampleFr] = useState('');

  const filteredWords = vocabulary.filter(w => {
    if (selectedBox === 'all') return true;
    return w.srsBox === selectedBox;
  });

  const toggleFlip = (id: string) => {
    setIsFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSrsReview = (word: VocabularyWord, success: boolean) => {
    let nextBox: SrsBox = 'today';
    if (success) {
      if (word.srsBox === 'today') nextBox = 'learning';
      else if (word.srsBox === 'learning') nextBox = 'mastered';
      else nextBox = 'mastered';
      triggerSuccessConfetti();
      addXp(10);
    } else {
      nextBox = 'today';
    }
    updateWordSrs(word.id, nextBox);
  };

  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItalian.trim() || !newFrench.trim()) return;

    const newWord: VocabularyWord = {
      id: `voc-${Date.now()}`,
      italian: newItalian.trim(),
      french: newFrench.trim(),
      genderOrType: newGender,
      level: 'A1',
      exampleItalian: newExampleIt.trim() || newItalian.trim(),
      exampleFrench: newExampleFr.trim() || newFrench.trim(),
      srsBox: 'today',
      reviewCount: 0
    };

    if (!await addCustomWord(newWord)) return;
    setNewItalian('');
    setNewFrench('');
    setNewExampleIt('');
    setNewExampleFr('');
    setShowAddModal(false);
    triggerSuccessConfetti();
  };

  const countToday = vocabulary.filter(w => w.srsBox === 'today').length;
  const countLearning = vocabulary.filter(w => w.srsBox === 'learning').length;
  const countMastered = vocabulary.filter(w => w.srsBox === 'mastered').length;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1F1A17] font-normal tracking-tight">
              Vocabulaire & Répétition Espacée
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7A7169] leading-relaxed max-w-2xl">
            Système Leitner d'optimisation mémorielle. Les mots difficiles reviennent plus souvent, les mots maîtrisés sont espacés dans le temps.
          </p>
        </div>

        {user.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-xs shadow-xs shrink-0 self-start sm:self-auto transition-transform hover:scale-105"
          >
            <Plus size={16} />
            <span>Ajouter une fiche mot</span>
          </button>
        )}
      </div>

      {/* SRS Category Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedBox('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedBox === 'all'
              ? 'bg-[#C04A33] border-[#C04A33] text-white shadow-xs'
              : 'bg-white border-[#EAE4DA] text-[#68605A] hover:bg-[#FAF7F2]'
          }`}
        >
          <div className={`text-2xl font-serif font-bold ${selectedBox === 'all' ? 'text-white' : 'text-[#1F1A17]'}`}>
            {vocabulary.length}
          </div>
          <div className={`text-xs font-semibold ${selectedBox === 'all' ? 'text-white/80' : 'text-[#8A817A]'}`}>
            Toutes les fiches
          </div>
        </button>

        <button
          onClick={() => setSelectedBox('today')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedBox === 'today'
              ? 'bg-[#C04A33] border-[#C04A33] text-white shadow-xs'
              : 'bg-white border-[#EAE4DA] text-[#68605A] hover:bg-[#FAF7F2]'
          }`}
        >
          <div className={`text-2xl font-serif font-bold ${selectedBox === 'today' ? 'text-white' : 'text-[#C04A33]'}`}>
            {countToday}
          </div>
          <div className={`text-xs font-semibold ${selectedBox === 'today' ? 'text-white/80' : 'text-[#8A817A]'}`}>
            À réviser aujourd'hui
          </div>
        </button>

        <button
          onClick={() => setSelectedBox('learning')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedBox === 'learning'
              ? 'bg-[#C04A33] border-[#C04A33] text-white shadow-xs'
              : 'bg-white border-[#EAE4DA] text-[#68605A] hover:bg-[#FAF7F2]'
          }`}
        >
          <div className={`text-2xl font-serif font-bold ${selectedBox === 'learning' ? 'text-white' : 'text-[#2A6F55]'}`}>
            {countLearning}
          </div>
          <div className={`text-xs font-semibold ${selectedBox === 'learning' ? 'text-white/80' : 'text-[#8A817A]'}`}>
            En apprentissage
          </div>
        </button>

        <button
          onClick={() => setSelectedBox('mastered')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedBox === 'mastered'
              ? 'bg-[#C04A33] border-[#C04A33] text-white shadow-xs'
              : 'bg-white border-[#EAE4DA] text-[#68605A] hover:bg-[#FAF7F2]'
          }`}
        >
          <div className={`text-2xl font-serif font-bold ${selectedBox === 'mastered' ? 'text-white' : 'text-[#2A6F55]'}`}>
            {countMastered}
          </div>
          <div className={`text-xs font-semibold ${selectedBox === 'mastered' ? 'text-white/80' : 'text-[#8A817A]'}`}>
            Mots maîtrisés
          </div>
        </button>
      </div>

      {/* 3D Flashcards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.length === 0 && (
          <div role="status" className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center text-sm text-[#7A7169]">
            Aucune fiche de vocabulaire n’est disponible pour le moment.
          </div>
        )}
        {filteredWords.map((word) => {
          const flipped = !!isFlipped[word.id];

          return (
            <div
              key={word.id}
              className="h-64 cursor-pointer perspective-1000 group"
              onClick={() => toggleFlip(word.id)}
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  flipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 backface-hidden p-6 rounded-3xl bg-white border border-[#EAE4DA] hover:border-[#C04A33]/40 shadow-parla flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <CefrBadge level={word.level} size="sm" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#7A7169] border border-[#EAE4DA]">
                      {word.genderOrType}
                    </span>
                  </div>

                  <div className="text-center space-y-1.5 my-auto">
                    <h3 className="font-serif text-2xl font-bold text-[#1F1A17] tracking-tight">{word.italian}</h3>
                    <p className="text-xs text-[#8A817A]">Cliquez pour révéler la traduction</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE3]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speak(word.italian);
                      }}
                      className="p-2 rounded-xl bg-[#FAF7F2] text-[#C04A33] hover:bg-[#FDF4ED] transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                    <span className="text-[11px] text-[#8A817A] flex items-center gap-1 font-medium">
                      <RotateCw size={12} /> Retourner
                    </span>
                  </div>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE4DA] shadow-parla flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A6F55]">Traduction & Contexte</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.speak(word.exampleItalian);
                      }}
                      className="text-[#C04A33] hover:text-[#AA3E29] p-1"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 my-auto text-left">
                    <div className="font-serif text-xl font-bold text-[#1F1A17]">{word.french}</div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs space-y-1">
                      <p className="text-[#1F1A17] font-medium italic">"{word.exampleItalian}"</p>
                      <p className="text-[#7A7169] text-[11px]">🇫🇷 {word.exampleFrench}</p>
                    </div>
                  </div>

                  {/* SRS Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DA] gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSrsReview(word, false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#FDF0EB] hover:bg-[#FCE2D8] text-[#C04A33] text-xs font-semibold flex items-center justify-center gap-1 border border-[#F6D9CE]"
                    >
                      <X size={14} />
                      <span>Difficile</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSrsReview(word, true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#EDF6F2] hover:bg-[#E3EFE9] text-[#2A6F55] text-xs font-semibold flex items-center justify-center gap-1 border border-[#CDE3D8]"
                    >
                      <Check size={14} />
                      <span>Maîtrisé</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE4DA] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1F1A17]">Ajouter un nouveau mot de vocabulaire</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8A817A] hover:text-[#1F1A17]">✕</button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-3 text-xs">
              <div>
                <label className="text-[#1F1A17] font-semibold block mb-1">Mot ou expression en italien :</label>
                <input
                  type="text"
                  required
                  value={newItalian}
                  onChange={(e) => setNewItalian(e.target.value)}
                  placeholder="Ex: La spiaggia"
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                />
              </div>

              <div>
                <label className="text-[#1F1A17] font-semibold block mb-1">Traduction en français :</label>
                <input
                  type="text"
                  required
                  value={newFrench}
                  onChange={(e) => setNewFrench(e.target.value)}
                  placeholder="Ex: La plage"
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                />
              </div>

              <div>
                <label className="text-[#1F1A17] font-semibold block mb-1">Catégorie grammaticale :</label>
                <select
                  aria-label="Sélectionner la catégorie grammaticale"
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                >
                  <option value="s.m.">Nom masculin (s.m.)</option>
                  <option value="s.f.">Nom féminin (s.f.)</option>
                  <option value="v.">Verbe (v.)</option>
                  <option value="adj.">Adjectif (adj.)</option>
                  <option value="adv.">Adverbe (adv.)</option>
                  <option value="expr.">Expression (expr.)</option>
                </select>
              </div>

              <div>
                <label className="text-[#1F1A17] font-semibold block mb-1">Exemple en italien :</label>
                <input
                  type="text"
                  value={newExampleIt}
                  onChange={(e) => setNewExampleIt(e.target.value)}
                  placeholder="Ex: Andiamo alla spiaggia oggi."
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                />
              </div>

              <div>
                <label className="text-[#1F1A17] font-semibold block mb-1">Traduction de l'exemple :</label>
                <input
                  type="text"
                  value={newExampleFr}
                  onChange={(e) => setNewExampleFr(e.target.value)}
                  placeholder="Ex: Nous allons à la plage aujourd'hui."
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F2ECE3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#4A423D] font-semibold hover:bg-[#F2ECE3]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

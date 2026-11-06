import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Gauge, 
  FileText 
} from 'lucide-react';
import { audioService, PronunciationResult } from '../../services/audioService';
import { useApp } from '../../context/AppContext';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';

export const AudioPracticeView: React.FC = () => {
  const { addXp } = useApp();
  const [activeTab, setActiveTab] = useState<'speaking' | 'dictation'>('speaking');

  // Speaking Pronunciation Practice
  const [targetPhraseIndex, setTargetPhraseIndex] = useState(0);
  const targetPhrases = [
    { it: "Vorrei un cappuccino e un cornetto alla crema.", fr: "Je voudrais un cappuccino et un croissant à la crème." },
    { it: "La mia famiglia vive a Milano da dieci anni.", fr: "Ma famille vit à Milan depuis dix ans." },
    { it: "Non vedo l'ora di visitare Roma e Firenze.", fr: "J'ai hâte de visiter Rome et Florence." },
    { it: "Amo gli gnocchi fatti in casa con il basilico.", fr: "J'adore les gnocchis faits maison avec du basilic." },
  ];

  const currentPhrase = targetPhrases[targetPhraseIndex];
  const [isRecording, setIsRecording] = useState(false);
  const [activePlaybackSpeed, setActivePlaybackSpeed] = useState<number>(1.0);
  const [speakingResult, setSpeakingResult] = useState<PronunciationResult | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Dictation Exercise
  const dictations = [
    { audio: "Oggi il tempo a Milano è bellissimo.", fr: "Aujourd'hui le temps à Milan est très beau." },
    { audio: "Ho venticinque anni e studio medicina.", fr: "J'ai vingt-cinq ans et j'étudie la médecine." },
    { audio: "Ieri sera sono andato a mangiare una pizza.", fr: "Hier soir je suis allé manger une pizza." }
  ];
  const [dictationIndex, setDictationIndex] = useState(0);
  const currentDictation = dictations[dictationIndex];
  const [dictationInput, setDictationInput] = useState("");
  const [dictationValidated, setDictationValidated] = useState(false);
  const [dictationScore, setDictationScore] = useState<number | null>(null);

  const handleStartRecording = () => {
    setSpeakingResult(null);
    setRecordingError(null);
    setIsRecording(true);

    const controller = audioService.listenAndScore(
      currentPhrase.it,
      (res) => {
        setIsRecording(false);
        setSpeakingResult(res);
        if (res.isMatch) {
          triggerSuccessConfetti();
          addXp(20);
        }
      },
      (err) => {
        setIsRecording(false);
        setRecordingError(err);
      }
    );

    // Safety timeout in case user doesn't speak
    setTimeout(() => {
      if (isRecording) {
        controller.stop();
        setIsRecording(false);
      }
    }, 7000);
  };

  const handleValidateDictation = () => {
    setDictationValidated(true);
    const cleanUser = dictationInput.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const cleanTarget = currentDictation.audio.trim().toLowerCase().replace(/[.,!?;:]/g, '');

    if (cleanUser === cleanTarget) {
      setDictationScore(100);
      triggerSuccessConfetti();
      addXp(25);
    } else {
      // Calculate word matches
      const userWords = cleanUser.split(/\s+/);
      const targetWords = cleanTarget.split(/\s+/);
      const matches = userWords.filter(w => targetWords.includes(w)).length;
      const pct = Math.round((matches / targetWords.length) * 100);
      setDictationScore(pct);
      if (pct >= 70) addXp(15);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Headphones className="text-emerald-400" size={26} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Compréhension Orale & Prononciation
          </h1>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Synthèse vocale native en italien à vitesse modulable (0.75x, 1x, 1.25x), dictées interactives et reconnaissance vocale avec conseils phonétiques.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('speaking')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'speaking'
              ? 'bg-emerald-600 text-white shadow-glow-green'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Mic size={15} />
          <span>Atelier de Prononciation Vocale</span>
        </button>

        <button
          onClick={() => setActiveTab('dictation')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dictation'
              ? 'bg-emerald-600 text-white shadow-glow-green'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText size={15} />
          <span>Dictée & Écoute Active</span>
        </button>
      </div>

      {/* ================= SECTION 1: SPEAKING ================= */}
      {activeTab === 'speaking' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase">
              Phrase {targetPhraseIndex + 1} / {targetPhrases.length}
            </span>
            {/* Speed selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[0.75, 1.0, 1.25].map(spd => (
                <button
                  key={spd}
                  onClick={() => setActivePlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    activePlaybackSpeed === spd ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Model Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed">
              "{currentPhrase.it}"
            </div>
            <p className="text-xs text-slate-400 italic">🇫🇷 {currentPhrase.fr}</p>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => audioService.speak(currentPhrase.it, activePlaybackSpeed)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
              >
                <Volume2 size={16} />
                <span>Écouter le modèle ({activePlaybackSpeed}x)</span>
              </button>
            </div>
          </div>

          {/* Recording Area */}
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${
                isRecording 
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green'
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <span className="text-xs font-semibold text-slate-300">
              {isRecording ? "Enregistrement en cours... Parlez maintenant !" : "Cliquez sur le micro et prononcez la phrase"}
            </span>
          </div>

          {recordingError && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 text-center">
              {recordingError}
            </div>
          )}

          {/* Evaluation Result */}
          {speakingResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Score de similarité phonétique</span>
                <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                  speakingResult.accuracyScore >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {speakingResult.accuracyScore}%
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="text-slate-400">Ce que le micro a capté :</div>
                <div className="text-sm font-bold text-white font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  "{speakingResult.transcript}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300">
                🗣️ <strong>Conseil phonétique :</strong> {speakingResult.phoneticFeedback}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setTargetPhraseIndex((targetPhraseIndex + 1) % targetPhrases.length);
                    setSpeakingResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Phrase suivante
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ================= SECTION 2: DICTATION ================= */}
      {activeTab === 'dictation' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase">
              Dictée {dictationIndex + 1} / {dictations.length}
            </span>
            <span className="text-xs text-slate-400">Écoutez et écrivez exactement ce que vous entendez</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
            <button
              onClick={() => audioService.speak(currentDictation.audio, 0.85)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-glow-green hover:scale-105 transition-all"
            >
              <Volume2 size={20} />
              <span>Écouter la dictée en italien</span>
            </button>
            <p className="text-xs text-slate-400">Indice de sens : 🇫🇷 {currentDictation.fr}</p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              disabled={dictationValidated}
              placeholder="Écrivez le texte italien dicté..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white focus:outline-none leading-relaxed"
            />

            {!dictationValidated ? (
              <button
                onClick={handleValidateDictation}
                disabled={!dictationInput.trim()}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-glow-green"
              >
                Vérifier ma transcription
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Précision de transcription</span>
                  <span className="text-sm font-extrabold text-emerald-400">{dictationScore}%</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-slate-400">Texte attendu :</div>
                  <div className="font-bold text-emerald-300 font-mono bg-slate-900 p-2.5 rounded-lg">
                    {currentDictation.audio}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDictationIndex((dictationIndex + 1) % dictations.length);
                    setDictationInput("");
                    setDictationValidated(false);
                    setDictationScore(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Dictée suivante
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
};

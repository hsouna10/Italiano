import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const LoginPage: React.FC = () => {
  const { login, register, setAuthState } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Erreur de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col lg:flex-row">

      {/* ── LEFT PANEL (Brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1F1A17] flex-col justify-between p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#C04A33]/10 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#2A6F55]/10 blur-3xl -translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-[#C04A33] flex items-center justify-center shadow-lg">
            <Globe size={20} className="text-white" />
          </div>
          <span className="font-serif text-2xl font-bold text-white tracking-tight">ITALIANO AI</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-4xl font-bold text-white leading-snug">
              La voie royale<br />
              vers l'<span className="text-[#C04A33]">italien</span> courant
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Cours structurés, exercices adaptatifs, tuteur IA et répétition espacée — tout en un, gratuitement.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: BookOpen, label: 'Cours CECRL de A1 à C2', color: '#C04A33', bg: 'rgba(192,74,51,0.1)' },
              { icon: Sparkles, label: 'Assistant IA tuteur personnel', color: '#B26A00', bg: 'rgba(178,106,0,0.1)' },
              { icon: GraduationCap, label: 'Vocabulaire SRS Leitner', color: '#2A6F55', bg: 'rgba(42,111,85,0.1)' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: f.bg }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${f.color}20` }}>
                  <f.icon size={16} style={{ color: f.color }} />
                </div>
                <span className="text-sm font-medium text-white/80">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-white/30 text-xs relative z-10">
          "Chi vuole, può." — Proverbe italien
        </p>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16">

        {/* Back to landing */}
        <div className="w-full max-w-md mb-6">
          <button
            onClick={() => setAuthState('landing')}
            className="flex items-center gap-2 text-sm text-[#7A7169] hover:text-[#1F1A17] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Retour à l'accueil</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="space-y-1">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-[#C04A33] flex items-center justify-center">
                <Globe size={16} className="text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-[#1F1A17]">ITALIANO AI</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1F1A17]">Bienvenue</h1>
            <p className="text-sm text-[#7A7169]">Connectez-vous pour accéder à votre espace d'apprentissage.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-xs font-semibold text-[#1F1A17] block mb-1.5">Nom</label>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={e => { setName(e.target.value); setError(null); }}
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#EAE4DA] text-[#1F1A17] text-sm focus:outline-none focus:border-[#C04A33] focus:ring-2 focus:ring-[#C04A33]/10 transition-all"
              />
            </div>
          )}
          <div>
              <label className="text-xs font-semibold text-[#1F1A17] block mb-1.5">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#EAE4DA] text-[#1F1A17] text-sm focus:outline-none focus:border-[#C04A33] focus:ring-2 focus:ring-[#C04A33]/10 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F1A17] block mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={isRegistering ? 8 : undefined}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#EAE4DA] text-[#1F1A17] text-sm focus:outline-none focus:border-[#C04A33] focus:ring-2 focus:ring-[#C04A33]/10 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A817A] hover:text-[#1F1A17] transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FDF0EB] border border-[#F6D9CE]"
                >
                  <AlertCircle size={16} className="text-[#C04A33] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#C04A33] font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] disabled:opacity-60 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <span>
                    {isRegistering ? 'Créer mon compte' : 'Me connecter'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsRegistering(value => !value); setError(null); }}
              className="text-xs font-semibold text-[#C04A33] hover:underline"
            >
              {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? Créer un compte'}
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

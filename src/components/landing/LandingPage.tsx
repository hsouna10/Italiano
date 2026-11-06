import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Mic, 
  Layers, 
  BarChart3, 
  MessageCircle, 
  ArrowRight, 
  Star,
  CheckCircle2,
  Globe,
  Zap,
  Award,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const features = [
  {
    icon: BookOpen,
    title: 'Cours Structurés',
    desc: 'Parcours CECRL adaptatif de A1 à C2 avec des leçons progressives et des explications didactiques rigoureuses.',
    color: '#C04A33',
    bg: '#FDF4ED',
    border: '#F6D9CE',
  },
  {
    icon: Sparkles,
    title: 'Exercices Interactifs',
    desc: 'QCM, textes à trous, remise en ordre, traduction et production libre pour ancrer chaque règle de grammaire.',
    color: '#2A6F55',
    bg: '#EDF6F2',
    border: '#CDE3D8',
  },
  {
    icon: MessageCircle,
    title: 'Assistant IA Tuteur',
    desc: 'Un tuteur intelligent qui corrige vos erreurs, explique les subtilités et vous guide à votre propre rythme.',
    color: '#1E6B8A',
    bg: '#E8F4F8',
    border: '#C7E3ED',
  },
  {
    icon: Mic,
    title: 'Prononciation & Dictée',
    desc: 'Synthèse vocale native à vitesse modulable et exercices de dictée interactive avec retour phonétique.',
    color: '#B26A00',
    bg: '#FDF4E7',
    border: '#F5DCB5',
  },
  {
    icon: Layers,
    title: 'Vocabulaire SRS',
    desc: 'Système Leitner intelligent : les mots difficiles reviennent plus souvent, les mots maîtrisés s\'espacent.',
    color: '#6941C6',
    bg: '#F3EFF8',
    border: '#E0D4F0',
  },
  {
    icon: BarChart3,
    title: 'Tableau de Bord',
    desc: 'Suivi de progression détaillé, streak quotidien, points XP et statistiques d\'apprentissage avancées.',
    color: '#9E1A5A',
    bg: '#F8EDF3',
    border: '#EDCADC',
  },
];

const testimonials = [
  {
    name: 'Marie Dupont',
    level: 'Niveau B1',
    text: 'Après 3 mois sur ITALIANO AI, je comprends enfin la différence entre essere et avere. L\'IA m\'explique mes erreurs avec une patience infinie !',
    avatar: 'MD',
    stars: 5,
  },
  {
    name: 'Thomas Leclair',
    level: 'Niveau A2',
    text: 'La reconnaissance vocale est impressionnante. Mon accent s\'est nettement amélioré et je peux maintenant commander un espresso sans hésiter.',
    avatar: 'TL',
    stars: 5,
  },
  {
    name: 'Claire Martin',
    level: 'Niveau B2',
    text: 'Les flashcards Leitner sont ma routine du matin. En quelques semaines, mon vocabulaire a explosé. L\'interface est magnifique, un vrai plaisir à utiliser.',
    avatar: 'CM',
    stars: 5,
  },
];

const stats = [
  { value: '12,000+', label: 'Apprenants actifs' },
  { value: '6 modules', label: 'Entièrement gratuits' },
  { value: '98%', label: 'Taux de satisfaction' },
  { value: 'A1–C2', label: 'Tous niveaux CECRL' },
];

export const LandingPage: React.FC = () => {
  const { setAuthState } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1A17] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EAE4DA]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C04A33] flex items-center justify-center shadow-sm">
              <Globe size={16} className="text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-[#1F1A17] tracking-tight">ITALIANO AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#68605A]">
            <a href="#features" className="hover:text-[#C04A33] transition-colors">Fonctionnalités</a>
            <a href="#testimonials" className="hover:text-[#C04A33] transition-colors">Témoignages</a>
            <a href="#pricing" className="hover:text-[#C04A33] transition-colors">Tarifs</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthState('login')}
              className="text-sm font-semibold text-[#1F1A17] hover:text-[#C04A33] transition-colors hidden sm:block"
            >
              Se connecter
            </button>
            <button
              onClick={() => setAuthState('login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Commencer</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-[#C04A33]/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#2A6F55]/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF4ED] border border-[#F6D9CE] text-[#C04A33] text-xs font-semibold mb-6 shadow-xs">
              <Zap size={13} />
              <span>Propulsé par l'Intelligence Artificielle</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1F1A17] leading-tight mb-6">
              Apprenez l'italien<br />
              <span className="text-[#C04A33] relative">
                intelligemment
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 C80 2, 220 2, 298 10" stroke="#C04A33" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#68605A] leading-relaxed max-w-2xl mx-auto mb-10">
              Une plateforme complète qui allie cours structurés CECRL, exercices interactifs, 
              assistant IA personnel et répétition espacée pour maîtriser l'italien à votre rythme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAuthState('login')}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-base shadow-lg shadow-[#C04A33]/25 transition-colors"
              >
                <Sparkles size={18} />
                <span>Commencer gratuitement</span>
                <ArrowRight size={18} />
              </motion.button>

              <button
                onClick={() => setAuthState('login')}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-[#EAE4DA] text-[#1F1A17] font-semibold text-sm hover:bg-[#FAF7F2] transition-colors shadow-xs"
              >
                <span>Voir la démo</span>
              </button>
            </div>

            <p className="text-xs text-[#8A817A] mt-5">
              ✓ Accès instantané &nbsp;·&nbsp; ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Tous niveaux acceptés
            </p>
          </motion.div>

          {/* Hero Image / Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#EAE4DA] overflow-hidden">
              {/* Fake browser bar */}
              <div className="bg-[#FAF7F2] border-b border-[#EAE4DA] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#F6D9CE]" />
                  <div className="w-3 h-3 rounded-full bg-[#F5DCB5]" />
                  <div className="w-3 h-3 rounded-full bg-[#CDE3D8]" />
                </div>
                <div className="flex-1 mx-4 bg-white rounded-lg border border-[#EAE4DA] px-4 py-1.5 text-xs text-[#8A817A] text-center">
                  italiano-ai.app
                </div>
              </div>
              {/* App Preview Mockup */}
              <div className="bg-[#FBF9F5] p-6 grid grid-cols-4 gap-4 h-64">
                {/* Sidebar mockup */}
                <div className="col-span-1 bg-white rounded-2xl border border-[#EAE4DA] p-3 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF4ED] flex items-center justify-center mb-4">
                    <Globe size={14} className="text-[#C04A33]" />
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-xl ${i === 0 ? 'bg-[#FDF4ED] border border-[#F6D9CE]' : 'bg-[#FAF7F2]'}`} />
                  ))}
                </div>
                {/* Main content mockup */}
                <div className="col-span-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { color: '#C04A33', bg: '#FDF4ED' },
                      { color: '#2A6F55', bg: '#EDF6F2' },
                      { color: '#1E6B8A', bg: '#E8F4F8' },
                    ].map((c, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-[#EAE4DA] p-3 space-y-2">
                        <div className={`w-7 h-7 rounded-lg`} style={{ background: c.bg }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-3 h-3 rounded" style={{ background: c.color, opacity: 0.5 }} />
                          </div>
                        </div>
                        <div className="h-4 bg-[#FAF7F2] rounded-md w-3/4" />
                        <div className="h-3 bg-[#F5F0E8] rounded-md w-1/2" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-[#EAE4DA] p-3 space-y-2">
                    <div className="h-4 bg-[#FAF7F2] rounded-md w-2/3" />
                    <div className="flex gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 h-10 bg-[#FAF7F2] rounded-xl border border-[#EAE4DA]" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#C04A33] rounded-2xl p-3 text-white flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-3 bg-white/30 rounded w-24" />
                      <div className="h-2 bg-white/20 rounded w-16" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 bg-white rounded-2xl border border-[#EAE4DA] shadow-lg p-3 hidden sm:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EDF6F2] flex items-center justify-center">
                <CheckCircle2 size={16} className="text-[#2A6F55]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1F1A17]">Leçon complète !</div>
                <div className="text-[10px] text-[#8A817A]">+ 50 XP gagnés</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-white rounded-2xl border border-[#EAE4DA] shadow-lg p-3 hidden sm:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FDF4ED] flex items-center justify-center">
                <Sparkles size={16} className="text-[#C04A33]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1F1A17]">IA Tuteur actif</div>
                <div className="text-[10px] text-[#8A817A]">Analyse en cours…</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-20">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[#8A817A]"
          >
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 bg-white border-y border-[#EAE4DA]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-serif text-3xl font-bold text-[#C04A33]">{s.value}</div>
              <div className="text-xs text-[#7A7169] mt-1 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold text-[#C04A33] uppercase tracking-widest">6 modules complets</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F1A17] mt-3 mb-4">
                Tout pour maîtriser l'italien
              </h2>
              <p className="text-[#68605A] text-lg max-w-xl mx-auto">
                Une suite pédagogique complète conçue avec des experts linguistiques et enrichie par l'IA.
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs hover:shadow-md transition-all group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1A17] mb-2">{f.title}</h3>
                <p className="text-sm text-[#68605A] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6 sm:px-10 bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold text-[#2A6F55] uppercase tracking-widest">Ils apprennent avec nous</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F1A17] mt-3 mb-4">
                Ce qu'ils en disent
              </h2>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(t.stars)].map((_, s) => (
                    <Star key={s} size={14} className="text-[#C04A33] fill-[#C04A33]" />
                  ))}
                </div>
                <p className="text-sm text-[#4A423D] leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#F2ECE3]">
                  <div className="w-9 h-9 rounded-full bg-[#FDF4ED] border border-[#F6D9CE] flex items-center justify-center text-xs font-bold text-[#C04A33]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1F1A17]">{t.name}</div>
                    <div className="text-xs text-[#8A817A]">{t.level}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold text-[#C04A33] uppercase tracking-widest">Tarification simple</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F1A17] mt-3 mb-4">
              100% gratuit, toujours
            </h2>
            <p className="text-[#68605A] text-lg mb-12">
              Tous les modules sont accessibles sans abonnement. Apprenez sans limite.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-3xl border-2 border-[#C04A33]/30 shadow-xl p-10 space-y-6"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C04A33] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md">
              Accès Complet
            </div>

            <div className="font-serif text-6xl font-bold text-[#1F1A17]">
              0€
              <span className="text-lg font-sans font-normal text-[#8A817A]"> / toujours</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                '6 modules pédagogiques complets',
                'Assistant IA tuteur personnel',
                'Système de répétition espacée',
                'Exercices interactifs illimités',
                'Prononciation avec retour vocal',
                'Progression CECRL A1 → C2',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#4A423D]">
                  <CheckCircle2 size={15} className="text-[#2A6F55] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAuthState('login')}
              className="w-full py-4 rounded-2xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-base shadow-lg shadow-[#C04A33]/25 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Accéder à la plateforme
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1F1A17] text-white py-12 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C04A33] flex items-center justify-center">
              <Globe size={16} className="text-white" />
            </div>
            <span className="font-serif text-lg font-bold">ITALIANO AI</span>
          </div>
          <p className="text-sm text-white/50 text-center">
            Plateforme intelligente d'apprentissage de l'italien · Tous niveaux CECRL
          </p>
          <button
            onClick={() => setAuthState('login')}
            className="text-sm font-semibold text-[#C04A33] hover:text-white transition-colors"
          >
            Jriji Hsine
          </button>
        </div>
      </footer>

    </div>
  );
};

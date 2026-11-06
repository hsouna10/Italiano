import React, { useState } from 'react';
import { 
  BookOpen, 
  Bot, 
  Sparkles, 
  Flame, 
  Headphones, 
  PenTool, 
  Layers, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X,
  LayoutDashboard,
  Languages,
  Music2,
  Video,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    toggleAiDrawer, 
    isDarkMode, 
    toggleDarkMode 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean }> = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={18} /> },
    { id: 'courses', label: 'Cours', icon: <BookOpen size={18} /> },
    { id: 'exercises', label: 'Quiz', icon: <Sparkles size={18} /> },
    { id: 'vocabulary', label: 'Vocabulaire', icon: <Layers size={18} /> },
    { id: 'conjugation', label: 'Conjugaison', icon: <Languages size={18} /> },
    { id: 'videos', label: 'Vidéos', icon: <Video size={18} /> },
    { id: 'music', label: 'Musique', icon: <Music2 size={18} /> },
    { id: 'assistant', label: 'Assistant IA', icon: <Bot size={18} /> },
    { id: 'audio', label: 'Audio & Voix', icon: <Headphones size={18} /> },
    { id: 'reading-writing', label: 'Lecture & Écriture', icon: <PenTool size={18} /> },
    { id: 'admin', label: 'Administration', icon: <ShieldCheck size={18} />, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-italia-500 to-emerald-400 flex items-center justify-center shadow-glow-green text-white font-black text-xl tracking-tight transition-transform group-hover:scale-105">
                IT
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    ITALIANO
                  </span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Impara l'italiano con l'IA</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.adminOnly && user.role !== 'admin') return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Streak Counter */}
            <div 
              title="Série de jours consécutifs d'étude"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
            >
              <Flame size={14} className="fill-amber-400 animate-pulse text-amber-400" />
              <span>{user.streakDays}j</span>
            </div>

            {/* XP Points */}
            <div 
              title="Points d'expérience d'apprentissage"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"
            >
              <span>⚡</span>
              <span>{user.xpPoints} XP</span>
            </div>

            <span className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-emerald-400">
              Niveau {user.italianLevel}
            </span>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Floating AI Drawer Toggle Button */}
            <button
              onClick={toggleAiDrawer}
              title="Ouvrir le tuteur IA interactif"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-glow-green transition-all transform hover:scale-105"
            >
              <Bot size={15} />
              <span className="hidden md:inline">Tuteur IA</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && user.role !== 'admin') return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Rôle : {user.role}</span>
          </div>
        </div>
      )}
    </header>
  );
};

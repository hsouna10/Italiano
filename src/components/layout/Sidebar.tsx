import React, { useState } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  Sparkles, 
  BookMarked, 
  BarChart2, 
  Headphones, 
  FileText, 
  ShieldCheck,
  LogOut,
  GraduationCap,
  Languages,
  Music2,
  Video,
  Menu,
  X
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const studentItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Parcours', icon: <BookOpen size={19} /> },
    { id: 'courses', label: 'Cours', icon: <PlayCircle size={19} /> },
    { id: 'exercises', label: 'Quiz', icon: <BarChart2 size={19} /> },
    { id: 'vocabulary', label: 'Vocabulaire', icon: <BookMarked size={19} /> },
    { id: 'conjugation', label: 'Conjugaison', icon: <Languages size={19} /> },
    { id: 'videos', label: 'Vidéos', icon: <Video size={19} /> },
    { id: 'music', label: 'Musique', icon: <Music2 size={19} /> },
    { id: 'assistant', label: 'Assistant IA', icon: <Sparkles size={19} /> },
    { id: 'audio', label: 'Audio & Voix', icon: <Headphones size={19} /> },
    { id: 'reading-writing', label: 'Lecture & Studio', icon: <FileText size={19} /> },
  ];

  const navigationItems = user.role === 'admin'
    ? [{ id: 'admin' as NavTab, label: 'Espace administration', icon: <ShieldCheck size={19} /> }]
    : studentItems;

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={mobileOpen}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE4DA] bg-[#FBF9F5] text-[#4A423D] shadow-sm lg:hidden"
      >
        <Menu size={20} />
      </button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#1F1A17]/40 lg:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh min-h-0 w-72 max-w-[85vw] select-none flex-col justify-between overflow-y-auto border-r border-[#EAE4DA] bg-[#F5F1EA] transition-transform duration-200 lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:min-h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <button
        type="button"
        onClick={() => setMobileOpen(false)}
        aria-label="Fermer le menu"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#68605A] hover:bg-[#EFE9DF] lg:hidden"
      >
        <X size={19} />
      </button>
      
      {/* Top Brand & Navigation */}
      <div className="p-6 space-y-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setActiveTab(user.role === 'admin' ? 'admin' : 'dashboard');
            setMobileOpen(false);
          }}
          className="cursor-pointer group space-y-0.5"
        >
          <div className="font-serif text-3xl font-normal tracking-tight text-[#C04A33] group-hover:opacity-90 transition-opacity">
            Parla
          </div>
          <div className="text-[10px] tracking-[0.2em] font-medium text-[#8A817A] uppercase">
            ITALIEN POUR VOUS
          </div>
        </div>

        {/* User pill */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-[#FDF4ED] border border-[#F6D9CE] flex items-center justify-center shrink-0">
            {user.role === 'admin'
              ? <ShieldCheck size={13} className="text-[#C04A33]" />
              : <GraduationCap size={13} className="text-[#C04A33]" />
            }
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#1F1A17] truncate">{user.name}</div>
            <div className="text-[10px] text-[#8A817A] capitalize">{user.role} · {user.italianLevel}</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#C04A33] text-white shadow-sm font-semibold'
                    : 'text-[#4A423D] hover:text-[#1F1A17] hover:bg-[#EFE9DF]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#68605A]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'admin' && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white/80">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-6 pt-0 space-y-3">
        <div className="p-4 rounded-2xl bg-[#EDE7DD] border border-[#E2D9CC] space-y-3 text-center">
          
          {/* Mosaic Tile Icon */}
          <div className="flex justify-center">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#FDFBF7" stroke="#D8CEBD" strokeWidth="1" />
              <path d="M24 10L30 18L24 26L18 18Z" fill="#2A6F55" />
              <path d="M24 22L30 30L24 38L18 30Z" fill="#C04A33" />
              <path d="M10 24L18 18L26 24L18 30Z" fill="#D3A248" />
              <path d="M22 24L30 18L38 24L30 30Z" fill="#2A6F55" />
              <circle cx="24" cy="24" r="3.5" fill="#C04A33" />
            </svg>
          </div>

          <div className="text-[10px] tracking-[0.16em] uppercase font-semibold text-[#68605A] leading-tight">
            PICCOLE LEZIONI<br />GRANDI ORIZZONTI
          </div>

          {/* Italian Tri-color Accent Bar */}
          <div className="flex h-1 w-16 mx-auto rounded-full overflow-hidden shadow-xs">
            <div className="flex-1 bg-[#009246]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#CE2B37]" />
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-[13px] font-medium text-[#7A7169] hover:text-[#C04A33] hover:bg-[#FDF4ED] transition-all group"
        >
          <LogOut size={15} className="group-hover:text-[#C04A33] transition-colors" />
          <span>Se déconnecter</span>
        </button>
      </div>

      </aside>
    </>
  );
};

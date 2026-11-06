import React from 'react';
import { 
  Play, 
  Check, 
  Lock, 
  Flame, 
  Headphones, 
  Calendar, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { user, lessons, startLesson, setActiveTab } = useApp();

  const levelLessons = lessons
    .filter(lesson => lesson.level === user.italianLevel)
    .sort((a, b) => a.orderNumber - b.orderNumber);
  const isCurrentLevelComplete = levelLessons.length > 0
    && levelLessons.every(lesson => user.completedLessons.includes(lesson.id));
  const currentLesson = levelLessons.find(lesson => !user.completedLessons.includes(lesson.id)) || levelLessons[0];
  const currentLessonNumber = currentLesson ? levelLessons.findIndex(lesson => lesson.id === currentLesson.id) + 1 : 0;
  const pathModules = levelLessons.map((lesson, index) => ({
    num: index + 1,
    title: lesson.title,
    status: user.completedLessons.includes(lesson.id) ? 'completed' : 'current',
    lessonId: lesson.id,
  }));

  const daysOfWeek = [
    { label: 'Lun', done: true },
    { label: 'Mar', done: true },
    { label: 'Mer', done: true },
    { label: 'Jeu', done: true },
    { label: 'Ven', done: true },
    { label: 'Sam', done: true },
    { label: 'Dim', done: false },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#EAE4DA] pb-5">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1A17] font-normal tracking-tight">
            Mon parcours <span className="italic font-serif">italien</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7169] mt-1 font-sans">
            Des étapes claires pour parler italien, pas à pas.
          </p>
        </div>
        <div className="text-xs text-[#8A817A] italic font-serif sm:text-right">
          Un piccolo passo ogni giorno —
        </div>
      </div>

      {/* Main Grid: Left Column (Hero & Course Path) + Right Column (Widgets) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tuscan Hillside Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-[#EAE4DA] shadow-parla p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="space-y-4 max-w-md z-10">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8A817A]">
                REPRENDRE LA LEÇON
              </span>

              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1A17] font-medium leading-tight">
                  Bentornato, {user.name}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#4A423D]">
                  {isCurrentLevelComplete
                    ? `Toutes les leçons du niveau ${user.italianLevel} sont terminées`
                    : currentLesson ? `Reprendre : ${currentLesson.title}` : 'Aucune leçon disponible pour le moment'}
                </p>
                <p className="text-[11px] text-[#8A817A]">
                  {isCurrentLevelComplete
                    ? 'Passez l’examen final pour débloquer le prochain niveau'
                    : currentLesson ? `Leçon ${currentLessonNumber} sur ${levelLessons.length} • ${currentLesson.estimatedMinutes} min` : `Parcours ${user.italianLevel}`}
                </p>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (isCurrentLevelComplete) setActiveTab('courses');
                    else if (currentLesson) startLesson(currentLesson);
                  }}
                  disabled={!currentLesson}
                  className="flex items-center gap-2 rounded-2xl bg-[#C04A33] px-6 py-3 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play size={14} className="fill-white" />
                  <span>
                    {isCurrentLevelComplete
                      ? 'Passer l’examen'
                      : currentLesson ? 'Continuer la leçon' : 'Aucune leçon disponible'}
                  </span>
                </button>
              </div>
            </div>

            {/* Tuscan Village Illustration (SVG Artwork) */}
            <div className="w-48 sm:w-60 shrink-0 select-none">
              <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                {/* Soft rolling hills */}
                <path d="M0 160C40 130 90 145 130 135C180 120 210 140 240 130V160H0Z" fill="#C5DBC8" />
                <path d="M0 160C50 145 100 150 150 140C190 130 220 145 240 140V160H0Z" fill="#9FBFA5" />
                
                {/* Tuscan Hillside Village Houses */}
                <rect x="140" y="100" width="22" height="26" fill="#F8EAD7" rx="1" />
                <polygon points="138,100 151,88 164,100" fill="#C04A33" />
                
                <rect x="160" y="90" width="26" height="36" fill="#FAF0E3" rx="1" />
                <polygon points="158,90 173,78 188,90" fill="#AA3E29" />
                
                <rect x="184" y="95" width="20" height="31" fill="#F2DFCA" rx="1" />
                <polygon points="182,95 194,84 206,95" fill="#C04A33" />

                {/* Village church bell tower */}
                <rect x="195" y="70" width="12" height="40" fill="#EAE0D2" rx="1" />
                <polygon points="193,70 201,58 209,70" fill="#8B3828" />
                <circle cx="201" cy="78" r="2" fill="#574F49" />

                {/* Windows and doors */}
                <rect x="147" y="112" width="4" height="6" fill="#574F49" rx="1" />
                <rect x="168" y="104" width="4" height="6" fill="#574F49" rx="1" />
                <rect x="174" y="116" width="5" height="10" fill="#574F49" rx="1" />

                {/* Cypress Trees */}
                <path d="M125 140C125 140 128 105 130 100C132 105 135 140 135 140H125Z" fill="#2E5A44" />
                <path d="M136 142C136 142 138 115 140 110C142 115 144 142 144 142H136Z" fill="#254D39" />
                <path d="M215 138C215 138 217 110 219 105C221 110 223 138 223 138H215Z" fill="#2E5A44" />
                <path d="M224 140C224 140 226 120 227 115C228 120 230 140 230 140H224Z" fill="#1F4231" />
              </svg>
            </div>

          </div>

          {/* Current level progression */}
          <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#F2ECE3] pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#1F1A17] font-normal">
                  Parcours {user.italianLevel}
                </h3>
                <p className="text-xs text-[#7A7169] mt-0.5">
                  <span className="font-semibold text-[#1F1A17]">{levelLessons.length}</span> leçons dans votre niveau actuel
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#F5F0E8]">
              {pathModules.map((item) => {
                const isCurrent = item.status === 'current';
                const isDone = item.status === 'completed';
                const isLocked = item.status === 'locked';
                const lesson = levelLessons.find(candidate => candidate.id === item.lessonId);

                return (
                  <div
                    key={item.num}
                    onClick={() => {
                      if (!isLocked && lesson) startLesson(lesson);
                    }}
                    className={`flex items-center justify-between py-3.5 px-3 rounded-2xl transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#FDF4ED] hover:bg-[#FCEEE3]' 
                        : isLocked 
                          ? 'opacity-65 hover:bg-[#FAF7F2]' 
                          : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {/* Left: Indicator Circle + Title */}
                    <div className="flex items-center gap-4">
                      {isDone ? (
                        <div className="w-7 h-7 rounded-full bg-[#2A6F55] text-white flex items-center justify-center shadow-xs">
                          <Check size={14} strokeWidth={2.5} />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-7 h-7 rounded-full bg-[#C04A33] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {item.num}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#EDE7DD] text-[#8A817A] flex items-center justify-center font-semibold text-xs">
                          {item.num}
                        </div>
                      )}

                      <span className={`text-xs sm:text-sm ${
                        isCurrent 
                          ? 'font-bold text-[#C04A33]' 
                          : isDone 
                            ? 'font-medium text-[#1F1A17]' 
                            : 'text-[#68605A]'
                      }`}>
                        {item.title}
                      </span>
                    </div>

                    {/* Right: State & Arrow / Lock */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${
                        isDone ? 'text-[#2A6F55]' :
                        isCurrent ? 'text-[#C04A33] font-semibold' :
                        'text-[#8A817A] flex items-center gap-1'
                      }`}>
                        {isDone && 'Terminée'}
                        {isCurrent && 'En cours'}
                        {isLocked && (
                          <span className="flex items-center gap-1.5 text-[#998F86]">
                            <Lock size={13} /> Verrouillée
                          </span>
                        )}
                      </span>

                      {!isLocked && (
                        <ChevronRight size={15} className="text-[#8A817A]" />
                      )}
                    </div>

                  </div>
                );
              })}
              {pathModules.length === 0 && (
                <p className="py-8 text-center text-sm text-[#7A7169]">
                  Aucune leçon disponible pour le niveau {user.italianLevel}.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Right Column (4 cols) — Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 1: VOTRE SÉRIE D'ÉTUDE */}
          <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 space-y-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8A817A]">
              VOTRE SÉRIE D'ÉTUDE
            </span>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#FDF0EB] text-[#C04A33] flex items-center justify-center">
                <Flame size={22} className="fill-[#C04A33]" />
              </div>
              <div>
                <div className="font-serif text-2xl text-[#1F1A17] font-semibold leading-tight">
                  7 jours
                </div>
                <p className="text-xs text-[#7A7169]">
                  Bravo ! Vous gardez le rythme.
                </p>
              </div>
            </div>

            {/* Days of Week Bubbles */}
            <div className="grid grid-cols-7 gap-1 pt-1 text-center">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="space-y-1.5">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors ${
                    d.done 
                      ? 'bg-[#2A6F55] text-white shadow-xs' 
                      : 'border border-[#D8CEBD] text-[#8A817A]'
                  }`}>
                    {d.done && <Check size={14} strokeWidth={2.5} />}
                  </div>
                  <span className="text-[10px] text-[#8A817A] font-medium">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: ACTIVITÉ RECOMMANDÉE */}
          <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 space-y-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8A817A]">
              ACTIVITÉ RECOMMANDÉE
            </span>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center shrink-0">
                <Headphones size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base text-[#1F1A17] font-semibold">
                  Écoute guidée
                </h4>
                <p className="text-xs text-[#7A7169] leading-relaxed">
                  Entraînez votre oreille avec un dialogue de la vie quotidienne.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('audio')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#EAE4DA] hover:border-[#C04A33] text-xs font-semibold text-[#1F1A17] hover:text-[#C04A33] flex items-center justify-between transition-colors bg-[#FAF7F2]"
            >
              <span>Commencer l'activité</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Widget 3: À NE PAS OUBLIER (SRS) */}
          <div className="bg-white rounded-3xl border border-[#EAE4DA] shadow-parla p-6 space-y-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8A817A]">
              À NE PAS OUBLIER
            </span>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FDF4ED] text-[#C04A33] flex items-center justify-center shrink-0">
                <Calendar size={19} />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base text-[#1F1A17] font-semibold">
                  Révision spaced repetition
                </h4>
                <p className="text-xs text-[#7A7169]">
                  3 mots à revoir aujourd'hui
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vocabulary')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#EAE4DA] hover:border-[#C04A33] text-xs font-semibold text-[#1F1A17] hover:text-[#C04A33] flex items-center justify-between transition-colors bg-[#FAF7F2]"
            >
              <span>Voir mes révisions</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Widget 4: Botanical Italian Quote Card */}
          <div className="rounded-3xl bg-[#EDF6F2] border border-[#CDE3D8] p-6 space-y-3 relative overflow-hidden">
            <div className="text-2xl text-[#2A6F55] font-serif leading-none">“</div>
            
            <p className="font-serif italic text-sm text-[#1F1A17] leading-relaxed relative z-10">
              La lingua è la casa dell'essere.
            </p>

            <div className="pt-2 border-t border-[#D5E8DF] flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-[#2A6F55]">
              <span>MARTIN HEIDEGGER</span>
              <div className="w-6 h-0.5 bg-[#C04A33]" />
            </div>

            {/* Olive Branch Botanical Silhouette Accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-15 pointer-events-none text-[#2A6F55]">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10C45 30 25 40 10 50C30 55 45 75 50 95C55 75 70 55 90 50C75 40 55 30 50 10Z" />
              </svg>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

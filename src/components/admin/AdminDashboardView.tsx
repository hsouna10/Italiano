import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  Bot, 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Play, 
  Sparkles, 
  Flame, 
  Key, 
  RotateCcw,
  X,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lesson, CefrLevel, UserRole, UserProfile } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';
import { AdminLessonEditorModal } from './AdminLessonEditorModal';
import { AdminContentManager } from './AdminContentManager';
import { AdminVocabularyManager } from './AdminVocabularyManager';

export const AdminDashboardView: React.FC = () => {
  const { 
    lessons, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    startLesson,
    vocabulary,
    adminUsers, 
    updateUserByAdmin, 
    deleteUserByAdmin 
  } = useApp();

  type AdminTab = 'courses' | 'users' | 'vocabulary' | 'content' | 'ai-settings' | 'analytics';
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');

  // Search & Filters
  const [courseSearch, setCourseSearch] = useState('');
  const [courseLevelFilter, setCourseLevelFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Modals state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // AI Settings state
  // Open Create Lesson Modal
  const handleOpenCreateLesson = () => {
    setEditingLesson(null);
    setShowLessonModal(true);
  };

  // Open Edit Lesson Modal
  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowLessonModal(true);
  };

  // Duplicate an existing lesson as a template
  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicated: Lesson = {
      ...lesson,
      id: `lesson-${lesson.level.toLowerCase()}-${Date.now()}`,
      title: `${lesson.title} (Copie)`,
      titleFr: `${lesson.titleFr} (Copie)`,
      orderNumber: lessons.length + 1,
      sections: lesson.sections.map(s => ({
        ...s,
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      })),
      quiz: lesson.quiz.map(q => ({
        ...q,
        id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }))
    };
    addLesson(duplicated);
  };

  // Save Lesson (Create or Update)
  const handleSaveLesson = async (savedLesson: Lesson) => {
    if (editingLesson) {
      return updateLesson(savedLesson);
    }
    return addLesson(savedLesson);
  };

  // Export Analytics CSV/JSON simulation
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ lessons, adminUsers, exportDate: new Date() }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `italiano_ai_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLessons = lessons.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
                        l.titleFr.toLowerCase().includes(courseSearch.toLowerCase());
    const matchLevel = courseLevelFilter === 'ALL' || l.level === courseLevelFilter;
    return matchSearch && matchLevel;
  });

  const filteredUsers = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                        u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Admin Super Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE4DA] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FDF4ED] text-[#C04A33] border border-[#F6D9CE]">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#1F1A17] font-normal tracking-tight flex items-center gap-2.5">
                <span>Espace Administrateur</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDF6F2] text-[#2A6F55] border border-[#CDE3D8] font-sans font-semibold">
                  Admin Parla
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7169]">
                Gestion des cours, apprenants, fiches SRS, paramétrage de l'IA et suivi pédagogique global.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#4A423D] border border-[#EAE4DA] text-xs font-semibold transition-colors"
          >
            <Download size={15} />
            <span>Exporter données</span>
          </button>
          
          <button
            onClick={handleOpenCreateLesson}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-xs shadow-xs transition-all transform hover:scale-105"
          >
            <Plus size={16} />
            <span>Nouvelle leçon</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F5F1EA] rounded-2xl border border-[#EAE4DA]">
        {[
          { id: 'courses', label: '1. Cours & Leçons', icon: <BookOpen size={15} />, count: lessons.length },
          { id: 'users', label: '2. Utilisateurs & Apprenants', icon: <Users size={15} />, count: adminUsers.length },
          { id: 'vocabulary', label: '3. Vocabulaire Global (SRS)', icon: <Layers size={15} />, count: vocabulary.length },
          { id: 'content', label: '4. Exercices, lectures & scénarios', icon: <BookOpen size={15} /> },
          { id: 'ai-settings', label: '5. Moteur & Prompts IA', icon: <Bot size={15} /> },
          { id: 'analytics', label: '6. Statistiques & Erreurs', icon: <BarChart3 size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#C04A33] text-white shadow-xs font-bold'
                : 'text-[#4A423D] hover:text-[#1F1A17] hover:bg-[#EFE9DF]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === tab.id ? 'bg-[#AA3E29] text-white' : 'bg-white text-[#68605A]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: COURS & LEÇONS ================= */}
      {activeTab === 'courses' && (
        <div className="space-y-5">
          {/* Summary Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs space-y-1">
              <span className="text-[11px] text-[#8A817A] font-medium">Total des Leçons</span>
              <div className="text-2xl font-serif font-bold text-[#1F1A17]">{lessons.length}</div>
              <div className="text-[10px] text-[#7A7169]">Tous niveaux A1 - C2</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs space-y-1">
              <span className="text-[11px] text-[#8A817A] font-medium">Questions de QCM</span>
              <div className="text-2xl font-serif font-bold text-[#C04A33]">
                {lessons.reduce((acc, l) => acc + (l.quiz?.length || 0), 0)}
              </div>
              <div className="text-[10px] text-[#2A6F55] font-semibold">Validation formative active</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs space-y-1">
              <span className="text-[11px] text-[#8A817A] font-medium">Modules Didactiques</span>
              <div className="text-2xl font-serif font-bold text-[#1F1A17]">
                {lessons.reduce((acc, l) => acc + (l.sections?.length || 0), 0)}
              </div>
              <div className="text-[10px] text-[#7A7169]">Règles & Markdown enrichis</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs space-y-1">
              <span className="text-[11px] text-[#8A817A] font-medium">Phrases & Audio TTS</span>
              <div className="text-2xl font-serif font-bold text-[#2A6F55]">
                {lessons.reduce((acc, l) => acc + (l.sections?.reduce((sAcc, s) => sAcc + (s.examples?.length || 0), 0) || 0), 0)}
              </div>
              <div className="text-[10px] text-[#8A817A]">Exemples avec prononciation</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search size={16} className="text-[#8A817A]" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Rechercher par titre de cours..."
                className="w-full bg-[#FAF7F2] border border-[#EAE4DA] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#8A817A] focus:outline-none focus:border-[#C04A33]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#7A7169]">Niveau :</span>
                {['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setCourseLevelFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      courseLevelFilter === lvl 
                        ? 'bg-[#C04A33] text-white' 
                        : 'bg-[#FAF7F2] text-[#68605A] border border-[#EAE4DA] hover:bg-[#F2ECE3]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={handleOpenCreateLesson}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-semibold text-xs shadow-xs transition-all"
              >
                <Plus size={15} />
                <span>+ Nouvelle leçon</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#68605A] border-b border-[#EAE4DA]">
                <tr>
                  <th className="p-4">Niveau</th>
                  <th className="p-4">Titre italien</th>
                  <th className="p-4">Titre français</th>
                  <th className="p-4">Durée</th>
                  <th className="p-4">Modules</th>
                  <th className="p-4">Quiz QCM</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {filteredLessons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <p className="mb-3 text-sm text-[#7A7169]">
                        {lessons.length === 0
                          ? 'Aucun cours n’est encore créé. Ajoutez votre première leçon.'
                          : 'Aucune leçon ne correspond à votre recherche.'}
                      </p>
                      {lessons.length === 0 && (
                        <button
                          type="button"
                          onClick={handleOpenCreateLesson}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#C04A33] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#AA3E29]"
                        >
                          <Plus size={14} />
                          Créer une leçon
                        </button>
                      )}
                    </td>
                  </tr>
                )}
                {filteredLessons.map(lesson => (
                  <tr key={lesson.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-4"><CefrBadge level={lesson.level} size="sm" /></td>
                    <td className="p-4">
                      <div className="font-bold text-[#1F1A17]">{lesson.title}</div>
                      {lesson.sections[0]?.conjugationTable && (
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#EAE4DA] text-[#68605A]">
                          Tableau de conjugaison inclus
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[#7A7169]">{lesson.titleFr}</td>
                    <td className="p-4 text-[#1F1A17] font-mono">{lesson.estimatedMinutes} min</td>
                    <td className="p-4 text-[#7A7169]">{lesson.sections.length} module(s)</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        lesson.quiz.length > 0 
                          ? 'bg-[#EDF6F2] text-[#2A6F55] border-[#CDE3D8]' 
                          : 'bg-[#FDF0EB] text-[#C04A33] border-[#F6D9CE]'
                      }`}>
                        {lesson.quiz.length} question{lesson.quiz.length > 1 ? 's' : ''} QCM
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => startLesson(lesson)}
                        title="Tester / Lancer le cours"
                        className="p-2 rounded-lg bg-[#EDF6F2] hover:bg-[#E3EFE9] text-[#2A6F55] border border-[#CDE3D8] transition-colors"
                      >
                        <Play size={13} />
                      </button>
                      <button
                        onClick={() => handleDuplicateLesson(lesson)}
                        title="Dupliquer comme modèle"
                        className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#68605A] border border-[#EAE4DA] transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => handleOpenEditLesson(lesson)}
                        title="Modifier cette leçon"
                        className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#4A423D] border border-[#EAE4DA] transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Confirmer la suppression de "${lesson.title}" ?`)) {
                            deleteLesson(lesson.id);
                          }
                        }}
                        title="Supprimer cette leçon"
                        className="p-2 rounded-lg bg-[#FDF0EB] hover:bg-[#FCE2D8] text-[#C04A33] border border-[#F6D9CE] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: UTILISATEURS ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search size={16} className="text-[#8A817A]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full bg-[#FAF7F2] border border-[#EAE4DA] rounded-xl px-3 py-1.5 text-xs text-[#1F1A17] placeholder-[#8A817A] focus:outline-none focus:border-[#C04A33]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7169]">Rôle :</span>
              {['ALL', 'student', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    userRoleFilter === r 
                      ? 'bg-[#C04A33] text-white' 
                      : 'bg-[#FAF7F2] text-[#68605A] border border-[#EAE4DA] hover:bg-[#F2ECE3]'
                  }`}
                >
                  {r === 'ALL' ? 'Tous' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#68605A] border-b border-[#EAE4DA]">
                <tr>
                  <th className="p-4">Apprenant</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Niveau CECRL</th>
                  <th className="p-4">Progression (XP)</th>
                  <th className="p-4">Série</th>
                  <th className="p-4">Temps</th>
                  <th className="p-4 text-right">Actions de gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-4 font-bold text-[#1F1A17] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FDF0EB] text-[#C04A33] flex items-center justify-center text-xs font-bold border border-[#F6D9CE]">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-4 text-[#7A7169] font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      <select
                        aria-label="Modifier le rôle"
                        value={u.role}
                        onChange={(e) => updateUserByAdmin(u.id, { role: e.target.value as UserRole })}
                        className="bg-[#FAF7F2] border border-[#EAE4DA] text-[#C04A33] text-[11px] rounded-lg px-2 py-1 font-semibold focus:outline-none"
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        aria-label="Modifier le niveau CECRL"
                        value={u.italianLevel}
                        onChange={(e) => updateUserByAdmin(u.id, { italianLevel: e.target.value as CefrLevel })}
                        className="bg-[#FAF7F2] border border-[#EAE4DA] text-[#2A6F55] text-[11px] rounded-lg px-2 py-1 font-bold focus:outline-none"
                      >
                        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 font-bold text-[#C04A33] font-mono">{u.xpPoints} XP</td>
                    <td className="p-4 text-[#C04A33] font-bold flex items-center gap-1">
                      <Flame size={13} className="fill-[#C04A33]" />
                      <span>{u.streakDays}j</span>
                    </td>
                    <td className="p-4 text-[#68605A] font-mono">{u.studiedMinutes}m</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          updateUserByAdmin(u.id, { xpPoints: u.xpPoints + 100 });
                          triggerSuccessConfetti();
                        }}
                        title="Attribuer un bonus de +100 XP"
                        className="px-2 py-1 rounded-lg bg-[#EDF6F2] hover:bg-[#E3EFE9] text-[#2A6F55] border border-[#CDE3D8] text-[10px] font-bold"
                      >
                        +100 XP
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Réinitialiser la progression de ${u.name} ?`)) {
                            updateUserByAdmin(u.id, { completedLessons: [], xpPoints: 0, streakDays: 0 });
                          }
                        }}
                        title="Réinitialiser progression"
                        className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#8A817A] hover:text-[#1F1A17] border border-[#EAE4DA]"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le compte de ${u.name} ?`)) {
                            deleteUserByAdmin(u.id);
                          }
                        }}
                        title="Supprimer l'utilisateur"
                        className="p-1.5 rounded-lg bg-[#FDF0EB] text-[#C04A33] border border-[#F6D9CE] hover:bg-[#FCE2D8]"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: VOCABULAIRE SRS ================= */}
      {activeTab === 'vocabulary' && <AdminVocabularyManager />}

      {activeTab === 'content' && <AdminContentManager />}

      {/* ================= TAB 4: MOTEUR & PROMPTS IA ================= */}
      {activeTab === 'ai-settings' && (
        <div className="rounded-3xl border border-[#EAE4DA] bg-white p-6 shadow-parla">
          <h3 className="mb-2 flex items-center gap-2 font-serif text-xl text-[#1F1A17]">
            <Bot size={20} className="text-[#C04A33]" />
            Tuteur pédagogique exécuté par le backend
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-[#68605A]">
            Les six modes (correction, explication, traduction, conversation et révision) passent par l’API protégée.
            Ils utilisent actuellement les réponses pédagogiques simulées du projet ; aucun fournisseur LLM ni
            paramètres de modèle ne sont configurés. Les paramètres et journaux affichés auparavant n’étaient pas
            enregistrés et ont été retirés.
          </p>
        </div>
      )}

      {/* ================= TAB 5: STATISTIQUES & ERREURS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-1.5">
              <span className="text-xs text-[#8A817A] font-medium">Comptes inscrits</span>
              <div className="text-3xl font-serif text-[#1F1A17]">{adminUsers.length}</div>
              <div className="text-[11px] text-[#68605A]">Données du backend</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-1.5">
              <span className="text-xs text-[#8A817A] font-medium">Leçons publiées</span>
              <div className="text-3xl font-serif text-[#C04A33]">{lessons.length}</div>
              <div className="text-[11px] text-[#68605A]">Collection MongoDB</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-1.5">
              <span className="text-xs text-[#8A817A] font-medium">Fiches vocabulaire</span>
              <div className="text-3xl font-serif text-[#2A6F55]">{vocabulary.length}</div>
              <div className="text-[11px] text-[#68605A]">Collection MongoDB</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-1.5">
              <span className="text-xs text-[#8A817A] font-medium">XP moyen apprenant</span>
              <div className="text-3xl font-serif text-[#C04A33]">
                {adminUsers.length
                  ? Math.round(adminUsers.reduce((total, user) => total + user.xpPoints, 0) / adminUsers.length)
                  : 0}
              </div>
              <div className="text-[11px] text-[#68605A]">Calculé depuis les comptes</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-4">
              <h4 className="font-serif font-bold text-[#1F1A17] text-base">Progression des apprenants</h4>
              <div className="space-y-2">
                {[...adminUsers]
                  .sort((left, right) => right.xpPoints - left.xpPoints)
                  .slice(0, 5)
                  .map(student => (
                    <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] p-3 text-xs">
                      <div>
                        <div className="font-semibold text-[#1F1A17]">{student.name}</div>
                        <div className="text-[#7A7169]">{student.completedLessons.length} leçons terminées</div>
                      </div>
                      <div className="font-mono font-bold text-[#C04A33]">{student.xpPoints} XP</div>
                    </div>
                  ))}
                {adminUsers.length === 0 && (
                  <p className="text-sm text-[#7A7169]">Aucun compte n’est encore enregistré dans la base.</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#EAE4DA] shadow-parla space-y-4">
              <h4 className="font-serif font-bold text-[#1F1A17] text-base">Ressources par niveau</h4>
              <div className="space-y-2">
                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map(level => (
                  <div key={level} className="flex items-center justify-between rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] p-3 text-xs">
                    <span className="font-semibold text-[#1F1A17]">{level}</span>
                    <span className="text-[#7A7169]">
                      {lessons.filter(lesson => lesson.level === level).length} leçons ·{' '}
                      {vocabulary.filter(word => word.level === level).length} fiches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRÉER OU MODIFIER UNE LEÇON ================= */}
      {showLessonModal && (
        <AdminLessonEditorModal
          initialLesson={editingLesson}
          onSave={handleSaveLesson}
          onClose={() => setShowLessonModal(false)}
          existingCount={lessons.length}
        />
      )}

    </div>
  );
};

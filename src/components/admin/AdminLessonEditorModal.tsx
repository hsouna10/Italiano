import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ListChecks, 
  Table, 
  AlertTriangle,
  Save,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Lesson, CefrLevel, LessonQuizQuestion, ConjugationRow } from '../../types';
import { apiService } from '../../services/apiService';
import { audioService } from '../../services/audioService';
import { triggerSuccessConfetti } from '../common/ConfettiTrigger';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface AdminLessonEditorModalProps {
  initialLesson?: Lesson | null;
  onSave: (lesson: Lesson) => Promise<boolean>;
  onClose: () => void;
  existingCount: number;
}

type ModalTab = 'general' | 'content' | 'conjugation' | 'examples' | 'quiz';

export const AdminLessonEditorModal: React.FC<AdminLessonEditorModalProps> = ({
  initialLesson,
  onSave,
  onClose,
  existingCount
}) => {
  const isEditing = !!initialLesson;

  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  // Form State
  const [level, setLevel] = useState<CefrLevel>(initialLesson?.level || 'A1');
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [titleFr, setTitleFr] = useState(initialLesson?.titleFr || '');
  const [description, setDescription] = useState(initialLesson?.description || '');
  const [videoUrl, setVideoUrl] = useState(initialLesson?.videoUrl || '');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialLesson?.estimatedMinutes || 15);
  
  // Learning Objectives
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    initialLesson?.learningObjectives && initialLesson.learningObjectives.length > 0
      ? initialLesson.learningObjectives
      : []
  );
  const [newObjective, setNewObjective] = useState('');

  // Section Content
  const firstSection = initialLesson?.sections?.[0];
  const [sectionTitle, setSectionTitle] = useState(firstSection?.title || '');
  const [contentMarkdown, setContentMarkdown] = useState(
    firstSection?.contentMarkdown || ''
  );

  // Conjugation Table
  const [hasConjugationTable, setHasConjugationTable] = useState(
    !!firstSection?.conjugationTable
  );
  const [verbName, setVerbName] = useState(firstSection?.conjugationTable?.verbName || '');
  const [auxiliaryNote, setAuxiliaryNote] = useState(
    firstSection?.conjugationTable?.auxiliaryNote || ''
  );
  const [conjugationRows, setConjugationRows] = useState<ConjugationRow[]>(
    firstSection?.conjugationTable?.rows || []
  );

  // Examples
  const [examples, setExamples] = useState<Array<{ italian: string; french: string; note?: string }>>(
    firstSection?.examples && firstSection.examples.length > 0
      ? firstSection.examples
      : []
  );
  const [newExIt, setNewExIt] = useState('');
  const [newExFr, setNewExFr] = useState('');

  // Common Mistakes
  const [commonMistakes, setCommonMistakes] = useState<Array<{ incorrect: string; correct: string; explanation: string }>>(
    firstSection?.commonMistakes && firstSection.commonMistakes.length > 0
      ? firstSection.commonMistakes
      : []
  );
  const [newMistakeInc, setNewMistakeInc] = useState('');
  const [newMistakeCor, setNewMistakeCor] = useState('');
  const [newMistakeExp, setNewMistakeExp] = useState('');

  // Quiz Questions (QCM multi-questions)
  const [quizList, setQuizList] = useState<LessonQuizQuestion[]>(
    initialLesson?.quiz && initialLesson.quiz.length > 0
      ? initialLesson.quiz
      : []
  );

  // Helper actions for Objectives
  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setLearningObjectives([...learningObjectives, newObjective.trim()]);
    setNewObjective('');
  };
  const handleRemoveObjective = (idx: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== idx));
  };

  // Helper actions for Examples
  const handleAddExample = () => {
    if (!newExIt.trim() || !newExFr.trim()) return;
    setExamples([...examples, { italian: newExIt.trim(), french: newExFr.trim() }]);
    setNewExIt('');
    setNewExFr('');
  };
  const handleRemoveExample = (idx: number) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };

  // Helper actions for Common Mistakes
  const handleAddMistake = () => {
    if (!newMistakeInc.trim() || !newMistakeCor.trim()) return;
    setCommonMistakes([
      ...commonMistakes,
      {
        incorrect: newMistakeInc.trim(),
        correct: newMistakeCor.trim(),
        explanation: newMistakeExp.trim() || 'Attention à la règle grammaticale.'
      }
    ]);
    setNewMistakeInc('');
    setNewMistakeCor('');
    setNewMistakeExp('');
  };
  const handleRemoveMistake = (idx: number) => {
    setCommonMistakes(commonMistakes.filter((_, i) => i !== idx));
  };

  // Helper actions for Quiz
  const handleAddQuizQuestion = () => {
    const newQ: LessonQuizQuestion = {
      id: `q-${Date.now()}-${quizList.length + 1}`,
      question: '',
      options: ['', ''],
      correctIndex: 0,
      explanation: ''
    };
    setQuizList([...quizList, newQ]);
  };

  const handleUpdateQuizQuestion = (qIdx: number, updated: Partial<LessonQuizQuestion>) => {
    setQuizList(quizList.map((q, i) => (i === qIdx ? { ...q, ...updated } : q)));
  };

  const handleRemoveQuizQuestion = (qIdx: number) => {
    if (quizList.length <= 1) {
      alert('Une leçon doit comporter au moins 1 question de quiz.');
      return;
    }
    setQuizList(quizList.filter((_, i) => i !== qIdx));
  };

  const handleAddOptionToQuestion = (qIdx: number) => {
    const target = quizList[qIdx];
    if (target.options.length >= 6) return;
    const newOptions = [...target.options, ''];
    handleUpdateQuizQuestion(qIdx, { options: newOptions });
  };

  const handleRemoveOptionFromQuestion = (qIdx: number, optIdx: number) => {
    const target = quizList[qIdx];
    if (target.options.length <= 2) {
      alert('Un QCM doit avoir au moins 2 options.');
      return;
    }
    const newOptions = target.options.filter((_, i) => i !== optIdx);
    let newCorrect = target.correctIndex;
    if (newCorrect >= newOptions.length) {
      newCorrect = newOptions.length - 1;
    }
    handleUpdateQuizQuestion(qIdx, { options: newOptions, correctIndex: newCorrect });
  };

  const handleUpdateConjugationRow = (rowIndex: number, updates: Partial<ConjugationRow>) => {
    setConjugationRows(rows => rows.map((row, index) =>
      index === rowIndex ? { ...row, ...updates } : row
    ));
  };

  const handleAddConjugationRow = () => {
    setConjugationRows(rows => [...rows, {
      pronoun: '',
      verbForm: '',
      translation: '',
      example: '',
      exampleFr: '',
    }]);
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    setVideoUploadError(null);
    try {
      setVideoUrl(await apiService.uploadVideo(file));
    } catch (uploadError) {
      setVideoUploadError(uploadError instanceof Error ? uploadError.message : 'Impossible de téléverser cette vidéo.');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingVideo) return;
    if (!title.trim()) {
      alert('Veuillez renseigner le titre en italien.');
      setActiveTab('general');
      return;
    }
    if (!titleFr.trim()) {
      alert('Veuillez renseigner le titre en français.');
      setActiveTab('general');
      return;
    }
    if (!sectionTitle.trim()) {
      alert('Veuillez renseigner le titre de la section principale.');
      setActiveTab('content');
      return;
    }
    if (quizList.length === 0) {
      alert('Ajoutez au moins une question au quiz.');
      setActiveTab('quiz');
      return;
    }
    if (hasConjugationTable && (
      conjugationRows.length === 0 ||
      conjugationRows.some(row => !row.pronoun.trim() || !row.verbForm.trim() ||
        !row.translation.trim() || !row.example.trim() || !row.exampleFr.trim())
    )) {
      alert('Renseignez les cinq champs de chaque ligne du tableau de conjugaison, ou supprimez les lignes incomplètes.');
      setActiveTab('conjugation');
      return;
    }

    // Validate QCM Questions
    const invalidQuestion = quizList.find(q => !q.question.trim());
    if (invalidQuestion) {
      alert('Chaque question de QCM doit comporter un énoncé clair.');
      setActiveTab('quiz');
      return;
    }

    const hasTooFewOptions = quizList.some(q => q.options.length < 2);
    if (hasTooFewOptions) {
      alert('Chaque question de QCM doit comporter au moins deux options.');
      setActiveTab('quiz');
      return;
    }

    const hasEmptyOptions = quizList.some(q => q.options.some(opt => !opt.trim()));
    if (hasEmptyOptions) {
      alert('Veuillez renseigner toutes les options de réponse pour vos questions de QCM.');
      setActiveTab('quiz');
      return;
    }

    const lessonData: Lesson = {
      id: initialLesson?.id || `lesson-${level.toLowerCase()}-${Date.now()}`,
      level,
      unitNumber: initialLesson?.unitNumber || 1,
      orderNumber: initialLesson?.orderNumber || existingCount + 1,
      title: title.trim(),
      titleFr: titleFr.trim() || title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim() || undefined,
      learningObjectives,
      estimatedMinutes: Number(estimatedMinutes) || 15,
      sections: [
        {
          id: firstSection?.id || `sec-${Date.now()}-1`,
          title: sectionTitle.trim(),
          contentMarkdown: contentMarkdown.trim(),
          conjugationTable: hasConjugationTable
            ? {
                verbName: verbName.trim() || 'Tableau de conjugaison',
                auxiliaryNote: auxiliaryNote.trim(),
                rows: conjugationRows
              }
            : undefined,
          examples: examples.map(ex => ({
            italian: ex.italian,
            french: ex.french,
            audioText: ex.italian,
            note: ex.note
          })),
          commonMistakes: commonMistakes
        },
        ...(initialLesson?.sections?.slice(1) || [])
      ],
      quiz: quizList
    };

    if (await onSave(lessonData)) {
      triggerSuccessConfetti();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-4xl w-full bg-white rounded-3xl border border-[#EAE4DA] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#1F1A17]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAE4DA] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF0EB] text-[#C04A33] border border-[#F6D9CE] flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1A17]">
                {isEditing ? 'Modifier la leçon' : 'Créer une nouvelle leçon & son QCM'}
              </h2>
              <p className="text-xs text-[#7A7169]">
                Configurez le cours, les explications, les exemples audio et les questions du quiz QCM.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={uploadingVideo}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#7A7169] hover:text-[#1F1A17] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-[#EAE4DA] bg-white flex items-center gap-1.5 overflow-x-auto select-none">
          {[
            { id: 'general', label: '1. Informations & Objectifs', icon: <ListChecks size={14} /> },
            { id: 'content', label: '2. Contenu & Règles', icon: <BookOpen size={14} /> },
            { id: 'examples', label: `3. Exemples & Pièges (${examples.length})`, icon: <Volume2 size={14} /> },
            { id: 'conjugation', label: '4. Conjugaison', icon: <Table size={14} /> },
            { id: 'quiz', label: `5. Quiz QCM (${quizList.length})`, icon: <HelpCircle size={14} />, badgeColor: '#C04A33' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ModalTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#C04A33] text-white shadow-xs font-bold'
                  : 'text-[#68605A] hover:bg-[#FAF7F2] hover:text-[#1F1A17]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF7F2]/40">
          
          {/* TAB 1: INFORMATIONS GÉNÉRALES & OBJECTIFS */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F1A17]">Titre du cours en italien *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: I saluti e presentarsi"
                    className="w-full p-3 rounded-2xl bg-white border border-[#EAE4DA] text-sm text-[#1F1A17] focus:outline-none focus:border-[#C04A33] shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F1A17]">Titre du cours en français *</label>
                  <input
                    type="text"
                    required
                    value={titleFr}
                    onChange={e => setTitleFr(e.target.value)}
                    placeholder="Ex: Les salutations et se présenter"
                    className="w-full p-3 rounded-2xl bg-white border border-[#EAE4DA] text-sm text-[#1F1A17] focus:outline-none focus:border-[#C04A33] shadow-xs"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F1A17]">Niveau CECRL</label>
                  <div className="flex gap-2">
                    {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map(lvl => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setLevel(lvl)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          level === lvl
                            ? 'bg-[#C04A33] text-white border-[#C04A33] shadow-xs'
                            : 'bg-white text-[#4A423D] border-[#EAE4DA] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1F1A17]">Durée estimée d’apprentissage</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={estimatedMinutes}
                      onChange={e => setEstimatedMinutes(Number(e.target.value))}
                      className="w-28 p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-sm text-[#1F1A17] font-mono focus:outline-none focus:border-[#C04A33]"
                    />
                    <span className="text-xs text-[#7A7169]">minutes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1A17]">Description concise / Résumé</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Expliquez en 1 ou 2 phrases l'intérêt pratique de cette leçon pour l'apprenant..."
                  className="w-full p-3 rounded-2xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none focus:border-[#C04A33] leading-relaxed shadow-xs"
                />
              </div>

              <div className="space-y-3 rounded-3xl border border-[#EAE4DA] bg-white p-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F1A17]">Vidéo de la leçon</h3>
                  <p className="mt-1 text-[11px] text-[#7A7169]">MP4, M4V, MOV, OGV ou WebM — 500 Mo maximum.</p>
                </div>
                <input
                  type="file"
                  accept=".mp4,.m4v,.mov,.ogv,.webm,video/mp4,video/x-m4v,video/quicktime,video/ogg,video/webm"
                  disabled={uploadingVideo}
                  onChange={event => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void handleVideoUpload(file);
                  }}
                  className="block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#2A6F55] file:px-3 file:py-2 file:font-semibold file:text-white disabled:opacity-50"
                />
                {uploadingVideo && <p role="status" className="text-xs text-[#2A6F55]">Téléversement en cours…</p>}
                {videoUploadError && <p role="alert" className="text-xs text-[#A53623]">{videoUploadError}</p>}
                {videoUrl && (
                  <div className="space-y-2">
                    <video controls preload="metadata" className="aspect-video w-full rounded-xl bg-[#1F1A17]" aria-label={`Vidéo de ${title || 'la leçon'}`}>
                      <source src={videoUrl} />
                      Votre navigateur ne peut pas lire cette vidéo.
                    </video>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-xs font-semibold text-[#C04A33] hover:underline"
                    >
                      Retirer la vidéo de cette leçon
                    </button>
                  </div>
                )}
              </div>

              {/* Learning Objectives List */}
              <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1F1A17] uppercase tracking-wide">
                      Objectifs pédagogiques de la leçon ({learningObjectives.length})
                    </h3>
                    <p className="text-[11px] text-[#7A7169]">
                      Affichés sous forme de cartes d'objectifs dans le lecteur de leçon.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA]">
                      <div className="flex items-center gap-2.5 text-xs text-[#1F1A17]">
                        <div className="w-5 h-5 rounded-full bg-[#EDF6F2] text-[#2A6F55] flex items-center justify-center shrink-0">
                          <CheckCircle2 size={13} />
                        </div>
                        <span>{obj}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(i)}
                        className="text-[#8A817A] hover:text-[#C04A33] p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={e => setNewObjective(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                    placeholder="Ajouter un nouvel objectif pédagogique..."
                    className="flex-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EDF6F2] hover:bg-[#E3EFE9] text-[#2A6F55] font-bold text-xs border border-[#CDE3D8] transition-colors"
                  >
                    <Plus size={14} />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONTENU DIDACTIQUE & RÈGLES */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1A17]">Titre de la section principale</label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={e => setSectionTitle(e.target.value)}
                  placeholder="Ex: Les règles d'or des verbes auxiliaires"
                  className="w-full p-3 rounded-2xl bg-white border border-[#EAE4DA] text-sm text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F1A17]">Contenu didactique du cours (Markdown)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMarkdown(!previewMarkdown)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        previewMarkdown 
                          ? 'bg-[#C04A33] text-white border-[#C04A33]' 
                          : 'bg-white text-[#4A423D] border-[#EAE4DA] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {previewMarkdown ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{previewMarkdown ? 'Mode Édition' : 'Aperçu élève'}</span>
                    </button>
                    <span className="text-[11px] text-[#8A817A] hidden sm:inline">Prend en charge **gras**, listes et titres</span>
                  </div>
                </div>

                {previewMarkdown ? (
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DA] min-h-[220px]">
                    <div className="text-[11px] font-bold text-[#C04A33] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Sparkles size={13} /> Aperçu du rendu élève
                    </div>
                    {contentMarkdown.trim() ? (
                      <MarkdownRenderer content={contentMarkdown} />
                    ) : (
                      <p className="text-xs text-[#8A817A] italic">Aucun texte pour le moment. Basculez en mode édition pour rédiger.</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={10}
                    value={contentMarkdown}
                    onChange={e => setContentMarkdown(e.target.value)}
                    placeholder="Rédigez l'explication grammaticale, les nuances d'usage et les conseils de prononciation..."
                    className="w-full p-4 rounded-2xl bg-white border border-[#EAE4DA] text-xs font-mono text-[#1F1A17] focus:outline-none focus:border-[#C04A33] leading-relaxed shadow-xs"
                  />
                )}
              </div>

              {/* Quick syntax helper */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE4DA] text-xs text-[#68605A] space-y-1">
                <p className="font-bold text-[#1F1A17]">Astuces de mise en page :</p>
                <p className="text-[11px]">• Pour mettre un mot en valeur : <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE4DA]">**mot en gras**</code> ou <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE4DA]">*italique*</code></p>
                <p className="text-[11px]">• Pour ajouter un sous-titre de règle : <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE4DA]">### Mon sous-titre</code></p>
                <p className="text-[11px]">• Pour des listes à puces : commencez la ligne par <code className="bg-white px-1.5 py-0.5 rounded border border-[#EAE4DA]">- Point clé</code></p>
              </div>
            </div>
          )}

          {/* TAB 3: EXEMPLES AUDIO & PIÈGES */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              
              {/* Examples section */}
              <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1F1A17] uppercase tracking-wide">
                      Exemples de phrases avec prononciation audio ({examples.length})
                    </h3>
                    <p className="text-[11px] text-[#7A7169]">
                      Chaque phrase peut être écoutée par l'élève en cliquant sur l'icône de son.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {examples.map((ex, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DA] flex items-center justify-between gap-3">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1F1A17] truncate">{ex.italian}</span>
                          <button
                            type="button"
                            onClick={() => audioService.speak(ex.italian)}
                            title="Écouter la voix italienne"
                            className="w-7 h-7 rounded-full bg-[#FDF0EB] text-[#C04A33] hover:bg-[#C04A33] hover:text-white flex items-center justify-center transition-colors shrink-0"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                        <p className="text-xs text-[#7A7169] truncate">{ex.french}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExample(i)}
                        className="text-[#8A817A] hover:text-[#C04A33] p-1.5 transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new example form */}
                <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#EAE4DA] space-y-2.5">
                  <span className="text-xs font-bold text-[#C04A33] block">+ Ajouter un nouvel exemple</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newExIt}
                      onChange={e => setNewExIt(e.target.value)}
                      placeholder="Phrase en italien (ex: Vorrei un caffè per favore.)"
                      className="p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                    />
                    <input
                      type="text"
                      value={newExFr}
                      onChange={e => setNewExFr(e.target.value)}
                      placeholder="Traduction française (ex: Je voudrais un café s'il vous plaît.)"
                      className="p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddExample}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-xs shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Ajouter l'exemple</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Common mistakes section */}
              <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#1F1A17] uppercase tracking-wide">
                    Pièges didactiques & Erreurs fréquentes ({commonMistakes.length})
                  </h3>
                  <p className="text-[11px] text-[#7A7169]">
                    Aide l'élève à ne pas calquer ses habitudes du français.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {commonMistakes.map((mis, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FDF5F3] border border-[#F6D9CE] flex items-start justify-between gap-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#C04A33] line-through font-semibold">✗ {mis.incorrect}</span>
                          <span className="text-[#8A817A]">→</span>
                          <span className="text-[#2A6F55] font-bold">✓ {mis.correct}</span>
                        </div>
                        <p className="text-[#68605A] text-[11px]">{mis.explanation}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMistake(i)}
                        className="text-[#8A817A] hover:text-[#C04A33] p-1 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new mistake */}
                <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#EAE4DA] space-y-2.5">
                  <span className="text-xs font-bold text-[#C04A33] block">+ Ajouter un piège fréquent</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newMistakeInc}
                      onChange={e => setNewMistakeInc(e.target.value)}
                      placeholder="Forme incorrecte (ex: Io sono fame)"
                      className="p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newMistakeCor}
                      onChange={e => setNewMistakeCor(e.target.value)}
                      placeholder="Forme correcte (ex: Ho fame)"
                      className="p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={newMistakeExp}
                    onChange={e => setNewMistakeExp(e.target.value)}
                    placeholder="Explication didactique (ex: La faim s'exprime avec avere...)"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddMistake}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EDF6F2] hover:bg-[#E3EFE9] text-[#2A6F55] font-bold text-xs border border-[#CDE3D8]"
                    >
                      <Plus size={14} />
                      <span>Ajouter le piège</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CONJUGAISON (OPTIONNEL) */}
          {activeTab === 'conjugation' && (
            <div className="space-y-5">
              
              <div className="p-4 rounded-2xl bg-white border border-[#EAE4DA] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1F1A17]">Inclure un tableau de conjugaison</h3>
                  <p className="text-xs text-[#7A7169]">Active une grille de conjugaison interactive dans la leçon.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConjugationTable}
                    onChange={e => setHasConjugationTable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#EAE4DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C04A33]" />
                </label>
              </div>

              {hasConjugationTable && (
                <div className="p-5 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1F1A17]">Titre du verbe / temps</label>
                      <input
                        type="text"
                        value={verbName}
                        onChange={e => setVerbName(e.target.value)}
                        placeholder="Ex: Parlare al presente"
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs text-[#1F1A17]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1F1A17]">Note explicative</label>
                      <input
                        type="text"
                        value={auxiliaryNote}
                        onChange={e => setAuxiliaryNote(e.target.value)}
                        placeholder="Ex: Modèle régulier du 1er groupe (-are)"
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs text-[#1F1A17]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#EAE4DA]">
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#68605A] border-b border-[#EAE4DA]">
                        <tr>
                          <th className="p-3">Pronom</th>
                          <th className="p-3">Forme verbale</th>
                          <th className="p-3">Traduction</th>
                          <th className="p-3">Exemple italien</th>
                          <th className="p-3">Traduction exemple</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5F0E8]">
                        {conjugationRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF7F2]">
                            <td className="p-2.5 font-bold text-[#C04A33]">
                              <input
                                type="text"
                                value={row.pronoun}
                                onChange={e => handleUpdateConjugationRow(idx, { pronoun: e.target.value })}
                                aria-label={`Pronom, ligne ${idx + 1}`}
                                placeholder="io"
                                className="w-24 p-2 rounded-lg bg-[#FAF7F2] border border-[#EAE4DA] text-xs font-bold"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={row.verbForm}
                                onChange={e => handleUpdateConjugationRow(idx, { verbForm: e.target.value })}
                                aria-label={`Forme verbale, ligne ${idx + 1}`}
                                placeholder="parlo"
                                className="w-28 p-2 rounded-lg bg-white border border-[#EAE4DA] text-xs font-mono font-bold text-[#2A6F55]"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={row.translation}
                                onChange={e => handleUpdateConjugationRow(idx, { translation: e.target.value })}
                                aria-label={`Traduction de la forme verbale, ligne ${idx + 1}`}
                                placeholder="je parle"
                                className="w-32 p-2 rounded-lg bg-white border border-[#EAE4DA] text-xs text-[#7A7169]"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={row.example}
                                onChange={e => handleUpdateConjugationRow(idx, { example: e.target.value })}
                                aria-label={`Exemple italien, ligne ${idx + 1}`}
                                placeholder="Io parlo italiano."
                                className="w-full min-w-48 p-2 rounded-lg bg-white border border-[#EAE4DA] text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={row.exampleFr}
                                onChange={e => handleUpdateConjugationRow(idx, { exampleFr: e.target.value })}
                                aria-label={`Traduction de l’exemple, ligne ${idx + 1}`}
                                placeholder="Je parle italien."
                                className="w-full min-w-48 p-2 rounded-lg bg-white border border-[#EAE4DA] text-xs text-[#7A7169]"
                              />
                            </td>
                            <td className="p-2">
                              <button
                                type="button"
                                onClick={() => setConjugationRows(rows => rows.filter((_, index) => index !== idx))}
                                aria-label={`Supprimer la ligne ${idx + 1}`}
                                className="rounded-lg px-2 py-1.5 font-semibold text-[#C04A33] hover:bg-[#FDF0EB]"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddConjugationRow}
                    className="flex items-center gap-2 rounded-xl bg-[#EDF6F2] px-4 py-2.5 text-xs font-bold text-[#2A6F55] hover:bg-[#E3EFE9]"
                  >
                    <Plus size={14} />
                    Ajouter une ligne
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: QUIZ QCM MULTI-QUESTIONS */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F1A17]">
                    Questions de Quiz QCM de validation ({quizList.length})
                  </h3>
                  <p className="text-xs text-[#7A7169]">
                    L’apprenant doit valider ces questions QCM pour terminer la leçon et gagner +50 XP.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuizQuestion}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105"
                >
                  <Plus size={16} />
                  <span>+ Ajouter une question de QCM</span>
                </button>
              </div>

              {/* Questions list */}
              <div className="space-y-5">
                {quizList.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EAE4DA] shadow-xs space-y-4"
                  >
                    {/* Question header */}
                    <div className="flex items-center justify-between border-b border-[#F2ECE3] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#FDF0EB] text-[#C04A33] font-bold text-xs flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <span className="font-bold text-xs text-[#1F1A17]">Question QCM #{qIdx + 1}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuizQuestion(qIdx)}
                        className="text-[#8A817A] hover:text-[#C04A33] p-1 transition-colors flex items-center gap-1 text-xs"
                      >
                        <Trash2 size={14} />
                        <span>Supprimer</span>
                      </button>
                    </div>

                    {/* Question prompt */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1F1A17]">Énoncé de la question *</label>
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={e => handleUpdateQuizQuestion(qIdx, { question: e.target.value })}
                        placeholder="Ex: Quelle est la forme correcte pour..."
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs text-[#1F1A17] font-semibold focus:outline-none focus:border-[#C04A33]"
                      />
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#1F1A17]">
                          Options de réponse (Cochez le bouton radio de la bonne réponse)
                        </label>
                        {q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => handleAddOptionToQuestion(qIdx)}
                            className="text-[11px] font-bold text-[#C04A33] hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Ajouter une option
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                                isCorrect
                                  ? 'bg-[#EDF6F2] border-[#2A6F55]'
                                  : 'bg-[#FAF7F2] border-[#EAE4DA]'
                              }`}
                            >
                              <input
                                type="radio"
                                id={`quiz-${qIdx}-opt-${optIdx}`}
                                name={`quiz-${qIdx}-correct`}
                                checked={isCorrect}
                                onChange={() => handleUpdateQuizQuestion(qIdx, { correctIndex: optIdx })}
                                className="accent-[#2A6F55] w-4 h-4 cursor-pointer"
                              />
                              <label
                                htmlFor={`quiz-${qIdx}-opt-${optIdx}`}
                                className="font-mono text-xs font-bold text-[#68605A] cursor-pointer"
                              >
                                {String.fromCharCode(65 + optIdx)}.
                              </label>
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const updatedOptions = [...q.options];
                                  updatedOptions[optIdx] = e.target.value;
                                  handleUpdateQuizQuestion(qIdx, { options: updatedOptions });
                                }}
                                className="flex-1 p-1.5 rounded-lg bg-white border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none"
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionFromQuestion(qIdx, optIdx)}
                                  className="text-[#8A817A] hover:text-[#C04A33] p-1 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Didactic explanation */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1F1A17]">
                        Explication didactique (affichée lors de la correction)
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={e => handleUpdateQuizQuestion(qIdx, { explanation: e.target.value })}
                        placeholder="Ex: La bonne réponse est ... car la règle impose ..."
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DA] text-xs text-[#1F1A17] focus:outline-none focus:border-[#C04A33]"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE4DA] bg-[#FDFBF7] flex items-center justify-between gap-4">
          <div className="text-xs text-[#7A7169] hidden sm:block">
            Niveau <span className="font-bold text-[#1F1A17]">{level}</span> • {learningObjectives.length} objectif(s) • {examples.length} exemple(s) • {quizList.length} question(s) QCM
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadingVideo}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#4A423D] border border-[#EAE4DA] text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploadingVideo}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C04A33] hover:bg-[#AA3E29] text-white font-bold text-xs shadow-md shadow-[#C04A33]/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <Save size={15} />
              <span>{uploadingVideo ? 'Téléversement…' : isEditing ? 'Mettre à jour la leçon' : 'Créer et publier la leçon'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

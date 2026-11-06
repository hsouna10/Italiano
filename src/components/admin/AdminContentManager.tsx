import React, { useEffect, useState } from 'react';
import { apiService, DynamicContentKind, DynamicContentRecord } from '../../services/apiService';
import { useApp } from '../../context/AppContext';

const contentKinds: Array<{ id: DynamicContentKind; label: string }> = [
  { id: 'exercises', label: 'Exercices' },
  { id: 'reading-texts', label: 'Lectures' },
  { id: 'conversation-scenarios', label: 'Scénarios' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'music', label: 'Musique' },
];

const getTitle = (record: DynamicContentRecord) => {
  const title = [record.title, record.topic, record.prompt].find(value => typeof value === 'string');
  return typeof title === 'string' ? title : record.id;
};

const getEmptyContent = (contentKind: DynamicContentKind) => {
  if (contentKind === 'videos') {
    return JSON.stringify({ title: '', description: '', level: 'A1', videoUrl: '' }, null, 2);
  }
  if (contentKind === 'music') {
    return JSON.stringify({
      title: '',
      artist: '',
      level: 'A1',
      audioUrl: '',
      italianLyrics: '',
      frenchTranslation: '',
    }, null, 2);
  }
  if (contentKind === 'exercises') {
    return JSON.stringify({
      level: 'A1',
      part: '',
      topic: '',
      type: 'multiple_choice',
      prompt: '',
      difficulty: 'facile',
      explanation: '',
      options: ['Option 1', 'Option 2'],
      correctIndex: 0,
    }, null, 2);
  }
  if (contentKind === 'reading-texts') {
    return JSON.stringify({
      level: 'A1',
      title: 'La mia giornata',
      titleFr: 'Ma journée',
      category: 'Vie quotidienne',
      italianParagraphs: ['Mi sveglio alle sette e faccio colazione.'],
      frenchParagraphs: ['Je me réveille à sept heures et je prends le petit-déjeuner.'],
      vocabularyGlossary: { sveglio: 'je me réveille', colazione: 'petit-déjeuner' },
      comprehensionQuestions: [{
        question: 'A che ora mi sveglio?',
        options: ['Alle sette', 'Alle nove'],
        correctIndex: 0,
        explanation: 'Le texte indique : « Mi sveglio alle sette. »',
      }],
    }, null, 2);
  }
  if (contentKind === 'conversation-scenarios') {
    return JSON.stringify({
      title: 'Au café',
      theme: 'Commander au café',
      level: 'A1',
      scenarioDescription: 'Vous commandez une boisson dans un café italien.',
      initialAiMessage: 'Buongiorno! Che cosa desidera?',
      initialAiMessageFr: 'Bonjour ! Que désirez-vous ?',
      userRoleDescription: 'Un client qui commande une boisson.',
      aiRoleDescription: 'Un serveur dans un café italien.',
      sampleReplies: ['Vorrei un caffè, per favore.'],
    }, null, 2);
  }
  return '{\n  \n}';
};

export const AdminContentManager: React.FC = () => {
  const { refreshLearningContent } = useApp();
  const [kind, setKind] = useState<DynamicContentKind>('exercises');
  const [records, setRecords] = useState<DynamicContentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState('{\n  \n}');
  const [exercisePart, setExercisePart] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async (contentKind: DynamicContentKind) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getDynamicContent(contentKind);
      setRecords(result);
      setSelectedId(null);
      setJsonValue(getEmptyContent(contentKind));
      setExercisePart('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger ces contenus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(kind);
  }, [kind]);

  const selectRecord = (record: DynamicContentRecord) => {
    setSelectedId(record.id);
    setJsonValue(JSON.stringify(record, null, 2));
    setExercisePart(typeof record.part === 'string' ? record.part : '');
    setError(null);
  };

  const updateExercisePart = (value: string) => {
    setExercisePart(value);
    try {
      const parsed: unknown = JSON.parse(jsonValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setJsonValue(JSON.stringify({ ...parsed, part: value }, null, 2));
      }
    } catch {
      // Saving will report invalid JSON; keep the part input available while it is corrected.
    }
  };

  const uploadVideo = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const videoUrl = await apiService.uploadVideo(file);
      let data: Record<string, unknown>;
      try {
        const parsed: unknown = JSON.parse(jsonValue);
        data = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed as Record<string, unknown>
          : {};
      } catch {
        data = { title: '', description: '', level: 'A1' };
        setError('La vidéo a été téléversée. Le JSON invalide a été remplacé par un formulaire vidéo vierge.');
      }
      setJsonValue(JSON.stringify({ ...data, videoUrl }, null, 2));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Impossible de téléverser cette vidéo.');
    } finally {
      setUploading(false);
    }
  };

  const uploadMusic = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const audioUrl = await apiService.uploadMusic(file);
      let data: Record<string, unknown>;
      try {
        const parsed: unknown = JSON.parse(jsonValue);
        data = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed as Record<string, unknown>
          : {};
      } catch {
        data = { title: '', artist: '', level: 'A1', italianLyrics: '', frenchTranslation: '' };
        setError('La musique a été téléversée. Le JSON invalide a été remplacé par un formulaire musical vierge.');
      }
      setJsonValue(JSON.stringify({ ...data, audioUrl }, null, 2));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Impossible de téléverser ce fichier audio.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    let data: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(jsonValue);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Le contenu doit être un objet JSON.');
      }
      data = parsed as Record<string, unknown>;
      if (kind === 'exercises') {
        if (exercisePart.trim()) data.part = exercisePart.trim();
        else delete data.part;
      }
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Le JSON est invalide.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (selectedId) {
        const updated = await apiService.updateDynamicContent(kind, selectedId, data);
        setRecords(current => current.map(record => record.id === selectedId ? updated : record));
        setSelectedId(updated.id);
        setJsonValue(JSON.stringify(updated, null, 2));
      } else {
        const created = await apiService.createDynamicContent(kind, data);
        setRecords(current => [...current, created]);
        setSelectedId(created.id);
        setJsonValue(JSON.stringify(created, null, 2));
      }
      try {
        await refreshLearningContent();
      } catch (refreshError) {
        setError(`Contenu enregistré, mais les vues n’ont pas pu être actualisées : ${
          refreshError instanceof Error ? refreshError.message : 'erreur API.'
        }`);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer ce contenu.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !confirm('Supprimer définitivement ce contenu ?')) return;
    setSaving(true);
    setError(null);
    try {
      await apiService.deleteDynamicContent(kind, selectedId);
      setRecords(current => current.filter(record => record.id !== selectedId));
      setSelectedId(null);
      setJsonValue(getEmptyContent(kind));
      setExercisePart('');
      try {
        await refreshLearningContent();
      } catch (refreshError) {
        setError(`Contenu supprimé, mais les vues n’ont pas pu être actualisées : ${
          refreshError instanceof Error ? refreshError.message : 'erreur API.'
        }`);
      }
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Impossible de supprimer ce contenu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
      <div className="space-y-4 rounded-2xl border border-[#EAE4DA] bg-white p-4">
        <label className="block text-xs font-semibold text-[#4A423D]">
          Type de contenu
          <select
            value={kind}
            onChange={event => setKind(event.target.value as DynamicContentKind)}
            disabled={uploading}
            className="mt-2 w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2 text-sm"
          >
            {contentKinds.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            setSelectedId(null);
            setJsonValue(getEmptyContent(kind));
            setExercisePart('');
            setError(null);
          }}
          className="w-full rounded-xl bg-[#C04A33] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Nouveau contenu
        </button>
        <div className="space-y-1">
          {loading ? <p className="p-3 text-sm text-[#7A7169]">Chargement…</p> : records.map(record => (
            <button
              type="button"
              key={record.id}
              onClick={() => selectRecord(record)}
              className={`block w-full truncate rounded-xl px-3 py-2.5 text-left text-sm ${
                selectedId === record.id ? 'bg-[#FDF4ED] font-semibold text-[#C04A33]' : 'text-[#4A423D] hover:bg-[#FAF7F2]'
              }`}
            >
              {getTitle(record)}
            </button>
          ))}
          {!loading && records.length === 0 && <p className="p-3 text-sm text-[#7A7169]">Aucun contenu dans la base.</p>}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#EAE4DA] bg-white p-4">
        <div>
          <h3 className="font-serif text-lg text-[#1F1A17]">{selectedId ? 'Modifier le contenu' : 'Créer un contenu'}</h3>
          <p className="mt-1 text-xs text-[#7A7169]">
            {kind === 'exercises'
              ? 'Créez un exercice et indiquez sa partie libre. Réutilisez le même nom pour regrouper plusieurs exercices.'
              : kind === 'reading-texts'
                ? 'Créez un texte avec un paragraphe italien et sa traduction française correspondante, un glossaire et au moins une question.'
                : kind === 'conversation-scenarios'
                  ? 'Créez une mise en situation avec son message de départ, ses traductions, les rôles et des réponses suggérées.'
              : kind === 'videos'
              ? 'Téléversez une vidéo ou indiquez une URL, puis renseignez le titre, la description et le niveau.'
              : kind === 'music'
                ? 'Téléversez un fichier audio ou indiquez son URL, puis renseignez le titre, l’artiste et le niveau. Les paroles et leur traduction sont facultatives.'
                : 'Le document est enregistré dans MongoDB via l’API.'}
          </p>
        </div>
        {kind === 'exercises' && (
          <label className="block text-xs font-semibold text-[#4A423D]">
            Partie d’exercice libre
            <input
              type="text"
              list="admin-exercise-parts"
              value={exercisePart}
              onChange={event => updateExercisePart(event.target.value)}
              placeholder="Ex. Les verbes au présent"
              className="mt-2 w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2 text-sm font-normal"
            />
            <datalist id="admin-exercise-parts">
              {[...new Set(records
                .map(record => record.part)
                .filter((part): part is string => typeof part === 'string' && part.trim().length > 0))]
                .map(part => <option key={part} value={part} />)}
            </datalist>
          </label>
        )}
        {kind === 'videos' && (
          <label className="block rounded-xl border border-dashed border-[#CDBFB2] bg-[#FAF7F2] p-4 text-sm text-[#4A423D]">
            <span className="mb-2 block font-semibold">Fichier vidéo (MP4, M4V, MOV, OGV ou WebM — 500 Mo maximum)</span>
            <input
              type="file"
              accept=".mp4,.m4v,.mov,.ogv,.webm,video/mp4,video/x-m4v,video/quicktime,video/ogg,video/webm"
              disabled={uploading || saving}
              onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void uploadVideo(file);
              }}
              className="block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#2A6F55] file:px-3 file:py-2 file:font-semibold file:text-white"
            />
            {uploading && <span role="status" className="mt-2 block text-xs text-[#2A6F55]">Téléversement en cours…</span>}
          </label>
        )}
        {kind === 'music' && (
          <label className="block rounded-xl border border-dashed border-[#CDBFB2] bg-[#FAF7F2] p-4 text-sm text-[#4A423D]">
            <span className="mb-2 block font-semibold">Fichier audio (MP3, M4A, WAV, OGG, OPUS, AAC, FLAC ou WebA — 100 Mo maximum)</span>
            <input
              type="file"
              accept=".mp3,.m4a,.wav,.ogg,.opus,.aac,.flac,.weba,audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/opus,audio/aac,audio/flac,audio/webm"
              disabled={uploading || saving}
              onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void uploadMusic(file);
              }}
              className="block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#2A6F55] file:px-3 file:py-2 file:font-semibold file:text-white"
            />
            {uploading && <span role="status" className="mt-2 block text-xs text-[#2A6F55]">Téléversement en cours…</span>}
          </label>
        )}
        <textarea
          value={jsonValue}
          onChange={event => {
            const value = event.target.value;
            setJsonValue(value);
            if (kind === 'exercises') {
              try {
                const parsed: unknown = JSON.parse(value);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                  const data = parsed as Record<string, unknown>;
                  setExercisePart(typeof data.part === 'string' ? data.part : '');
                }
              } catch {
                // Keep the part field unchanged until the JSON is valid again.
              }
            }
          }}
          disabled={uploading}
          spellCheck={false}
          aria-label="Contenu au format JSON"
          className="min-h-[360px] w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] p-4 font-mono text-xs text-[#1F1A17] outline-none focus:border-[#C04A33]"
        />
        {error && <p role="alert" className="rounded-lg bg-[#FDF0EB] p-3 text-sm text-[#A53623]">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          {selectedId && (
            <button type="button"             disabled={saving || uploading} onClick={() => void remove()} className="rounded-xl border border-[#F6D9CE] px-4 py-2 text-sm font-semibold text-[#C04A33] disabled:opacity-50">
              Supprimer
            </button>
          )}
          <button type="button" disabled={saving || uploading} onClick={() => void save()} className="rounded-xl bg-[#2A6F55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Enregistrement…' : selectedId ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </section>
  );
};

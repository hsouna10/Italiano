import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CefrLevel, VocabularyWord } from '../../types';
import { CefrBadge } from '../common/CefrBadge';

type VocabularyFields = Pick<
  VocabularyWord,
  'italian' | 'french' | 'genderOrType' | 'level' | 'exampleItalian' | 'exampleFrench' | 'audioHint'
>;

const EMPTY_FIELDS: VocabularyFields = {
  italian: '',
  french: '',
  genderOrType: 's.m.',
  level: 'A1',
  exampleItalian: '',
  exampleFrench: '',
  audioHint: '',
};

const genderTypes: VocabularyWord['genderOrType'][] = ['s.m.', 's.f.', 'v.', 'adj.', 'adv.', 'expr.'];
const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const AdminVocabularyManager: React.FC = () => {
  const { vocabulary, addCustomWord, updateVocabularyWord, deleteWord } = useApp();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fields, setFields] = useState<VocabularyFields>(EMPTY_FIELDS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredWords = useMemo(() => vocabulary.filter(word =>
    `${word.italian} ${word.french}`.toLowerCase().includes(search.toLowerCase())
  ), [vocabulary, search]);

  const openCreate = () => {
    setFormOpen(true);
    setEditingId(null);
    setFields(EMPTY_FIELDS);
    setError(null);
  };

  const openEdit = (word: VocabularyWord) => {
    setFormOpen(true);
    setEditingId(word.id);
    setFields({
      italian: word.italian,
      french: word.french,
      genderOrType: word.genderOrType,
      level: word.level,
      exampleItalian: word.exampleItalian,
      exampleFrench: word.exampleFrench,
      audioHint: word.audioHint || '',
    });
    setError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const existing = vocabulary.find(word => word.id === editingId);
    const word: VocabularyWord = {
      ...fields,
      id: editingId || `voc-${Date.now()}`,
      srsBox: existing?.srsBox || 'today',
      reviewCount: existing?.reviewCount || 0,
      lastReviewedAt: existing?.lastReviewedAt,
      nextReviewAt: existing?.nextReviewAt,
    };
    try {
      const saved = editingId
        ? await updateVocabularyWord(word)
        : await addCustomWord(word);
      if (!saved) {
        setError('La fiche n’a pas pu être enregistrée. Consultez le message d’erreur en haut de la page.');
        return;
      }
      setEditingId(null);
      setFields(EMPTY_FIELDS);
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (word: VocabularyWord) => {
    if (!confirm(`Supprimer la fiche « ${word.italian} » et les révisions associées ?`)) return;
    await deleteWord(word.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-[#EAE4DA] bg-white p-4 shadow-parla sm:flex-row sm:items-center sm:justify-between">
        <label className="flex max-w-sm flex-1 items-center gap-2">
          <Search size={16} className="text-[#8A817A]" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Chercher italien ou français…"
            className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2 text-xs text-[#1F1A17] outline-none focus:border-[#C04A33]"
          />
        </label>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C04A33] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#AA3E29]">
          <Plus size={15} /> Ajouter une fiche
        </button>
      </div>

      {formOpen && (
        <form onSubmit={save} className="space-y-4 rounded-3xl border border-[#EAE4DA] bg-white p-5 shadow-parla">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-[#1F1A17]">{editingId ? 'Modifier la fiche' : 'Nouvelle fiche de vocabulaire'}</h3>
              <p className="mt-1 text-xs text-[#7A7169]">Les champs sont enregistrés dans MongoDB.</p>
            </div>
            <button type="button" onClick={() => { setFormOpen(false); setEditingId(null); setFields(EMPTY_FIELDS); setError(null); }} aria-label="Fermer le formulaire" className="rounded-lg p-2 text-[#7A7169] hover:bg-[#FAF7F2]">
              <X size={17} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Mot ou expression en italien
              <input required value={fields.italian} onChange={event => setFields(current => ({ ...current, italian: event.target.value }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Traduction française
              <input required value={fields.french} onChange={event => setFields(current => ({ ...current, french: event.target.value }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Niveau
              <select value={fields.level} onChange={event => setFields(current => ({ ...current, level: event.target.value as CefrLevel }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal">
                {levels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Nature grammaticale
              <select value={fields.genderOrType} onChange={event => setFields(current => ({ ...current, genderOrType: event.target.value as VocabularyWord['genderOrType'] }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal">
                {genderTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Exemple italien
              <input value={fields.exampleItalian} onChange={event => setFields(current => ({ ...current, exampleItalian: event.target.value }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D]">Traduction de l’exemple
              <input value={fields.exampleFrench} onChange={event => setFields(current => ({ ...current, exampleFrench: event.target.value }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="space-y-1 text-xs font-semibold text-[#4A423D] sm:col-span-2">Indication audio (facultatif)
              <input value={fields.audioHint} onChange={event => setFields(current => ({ ...current, audioHint: event.target.value }))} className="w-full rounded-xl border border-[#EAE4DA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-normal" />
            </label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-[#FDF0EB] p-3 text-sm text-[#A53623]">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setFormOpen(false); setEditingId(null); setFields(EMPTY_FIELDS); }} className="rounded-xl border border-[#EAE4DA] px-4 py-2 text-xs font-semibold text-[#4A423D]">Annuler</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#2A6F55] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer la fiche'}</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#EAE4DA] bg-[#FAF7F2] text-[#68605A]">
            <tr>
              <th className="p-4">Niveau</th><th className="p-4">Italien</th><th className="p-4">Type</th>
              <th className="p-4">Français</th><th className="p-4">Exemple</th><th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F0E8]">
            {filteredWords.map(word => (
              <tr key={word.id}>
                <td className="p-4"><CefrBadge level={word.level} size="sm" /></td>
                <td className="p-4 font-bold text-[#1F1A17]">{word.italian}</td>
                <td className="p-4 text-[#7A7169]">{word.genderOrType}</td>
                <td className="p-4 font-semibold text-[#2A6F55]">{word.french}</td>
                <td className="p-4 text-[#4A423D]">{word.exampleItalian || '—'}</td>
                <td className="space-x-1 p-4 text-right">
                  <button type="button" title="Modifier" onClick={() => openEdit(word)} className="rounded-lg border border-[#EAE4DA] p-2 text-[#4A423D] hover:bg-[#FAF7F2]"><Edit3 size={13} /></button>
                  <button type="button" title="Supprimer" onClick={() => void remove(word)} className="rounded-lg border border-[#F6D9CE] p-2 text-[#C04A33] hover:bg-[#FDF0EB]"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {filteredWords.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-[#7A7169]">
                {vocabulary.length === 0 ? 'Aucune fiche vocabulaire. Créez la première avec « Ajouter une fiche ».' : 'Aucun mot ne correspond à la recherche.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

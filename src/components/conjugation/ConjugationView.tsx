import React, { useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CefrLevel } from '../../types';
import { CefrBadge } from '../common/CefrBadge';

const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const ConjugationView: React.FC = () => {
  const { lessons } = useApp();
  const [levelFilter, setLevelFilter] = useState<CefrLevel | 'ALL'>('ALL');
  const tables = useMemo(() => lessons
    .filter(lesson => levelFilter === 'ALL' || lesson.level === levelFilter)
    .flatMap(lesson => lesson.sections.flatMap(section =>
      section.conjugationTable ? [{ lesson, section, table: section.conjugationTable }] : []
    )), [lessons, levelFilter]);

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      <header className="space-y-2 border-b border-[#EAE4DA] pb-5">
        <div className="flex items-center gap-3">
          <Languages className="text-[#C04A33]" size={25} />
          <h1 className="font-serif text-3xl text-[#1F1A17]">Conjugaison</h1>
        </div>
        <p className="max-w-2xl text-sm text-[#7A7169]">Les tableaux de conjugaison publiés dans les leçons apparaissent ici automatiquement.</p>
      </header>

      <nav aria-label="Filtrer par niveau" className="flex flex-wrap gap-2">
        {(['ALL', ...levels] as const).map(level => (
          <button
            type="button"
            key={level}
            onClick={() => setLevelFilter(level)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              levelFilter === level
                ? 'border-[#C04A33] bg-[#C04A33] text-white'
                : 'border-[#EAE4DA] bg-white text-[#4A423D] hover:bg-[#FAF7F2]'
            }`}
          >
            {level === 'ALL' ? 'Tous les niveaux' : level}
          </button>
        ))}
      </nav>

      {tables.length === 0 ? (
        <p role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center text-sm text-[#7A7169]">
          Aucun tableau de conjugaison n’est disponible pour ce niveau. L’administrateur peut en ajouter dans une leçon.
        </p>
      ) : (
        <div className="space-y-5">
          {tables.map(({ lesson, section, table }, index) => (
            <article key={`${lesson.id}-${section.id}-${index}`} className="overflow-hidden rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F2ECE3] p-5">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#1F1A17]">{table.verbName || section.title}</h2>
                  <p className="mt-1 text-sm text-[#7A7169]">{lesson.title} · {section.title}</p>
                  {table.auxiliaryNote && <p className="mt-2 text-xs text-[#68605A]">{table.auxiliaryNote}</p>}
                </div>
                <CefrBadge level={lesson.level} size="sm" />
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF7F2] text-xs text-[#68605A]">
                    <tr><th className="p-3">Pronom</th><th className="p-3">Forme</th><th className="p-3">Traduction</th><th className="p-3">Exemple</th><th className="p-3">Traduction de l’exemple</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F0E8]">
                    {table.rows.map((row, rowIndex) => (
                      <tr key={`${row.pronoun}-${rowIndex}`} className="text-[#4A423D]">
                        <td className="p-3 font-semibold">{row.pronoun}</td>
                        <td className="p-3 font-bold text-[#C04A33]">{row.verbForm}</td>
                        <td className="p-3">{row.translation}</td>
                        <td className="p-3 italic">{row.example}</td>
                        <td className="p-3">{row.exampleFr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

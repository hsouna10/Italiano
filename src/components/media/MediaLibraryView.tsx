import React, { useState } from 'react';
import { Music2, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CefrLevel, LearningVideo, MusicTrack } from '../../types';
import { CefrBadge } from '../common/CefrBadge';

type MediaKind = 'videos' | 'music';

const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const getYouTubeEmbedUrl = (videoUrl: string): string | null => {
  try {
    const url = new URL(videoUrl);
    let videoId: string | null = null;
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      videoId = url.searchParams.get('v');
    }
    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
};

const LevelFilter: React.FC<{ value: CefrLevel | 'ALL'; onChange: (value: CefrLevel | 'ALL') => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {(['ALL', ...levels] as const).map(level => (
      <button
        key={level}
        type="button"
        onClick={() => onChange(level)}
        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
          value === level ? 'border-[#C04A33] bg-[#C04A33] text-white' : 'border-[#EAE4DA] bg-white text-[#4A423D]'
        }`}
      >
        {level === 'ALL' ? 'Tous' : level}
      </button>
    ))}
  </div>
);

const VideoLibrary: React.FC<{ videos: LearningVideo[] }> = ({ videos }) => {
  const [level, setLevel] = useState<CefrLevel | 'ALL'>('ALL');
  const items = videos.filter(video => level === 'ALL' || video.level === level);
  return (
    <section className="space-y-5">
      <LevelFilter value={level} onChange={setLevel} />
      {items.length === 0 ? (
        <p role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center text-sm text-[#7A7169]">Aucune vidéo n’est disponible. L’administrateur peut en ajouter dans l’onglet Contenus.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map(video => (
            <article key={video.id} className="overflow-hidden rounded-3xl border border-[#EAE4DA] bg-white shadow-parla">
              {getYouTubeEmbedUrl(video.videoUrl)
                ? (
                  <iframe
                    src={getYouTubeEmbedUrl(video.videoUrl) || undefined}
                    title={video.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full bg-[#1F1A17]"
                  />
                )
                : (
                  <video controls preload="metadata" poster={video.thumbnailUrl} className="aspect-video w-full bg-[#1F1A17]" aria-label={video.title}>
                    <source src={video.videoUrl} />
                    Votre navigateur ne peut pas lire cette vidéo.
                  </video>
                )}
              <div className="space-y-2 p-5">
                <CefrBadge level={video.level} size="sm" />
                <h2 className="font-serif text-xl font-bold text-[#1F1A17]">{video.title}</h2>
                <p className="text-sm text-[#68605A]">{video.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const MusicLibrary: React.FC<{ tracks: MusicTrack[] }> = ({ tracks }) => {
  const [level, setLevel] = useState<CefrLevel | 'ALL'>('ALL');
  const items = tracks.filter(track => level === 'ALL' || track.level === level);
  return (
    <section className="space-y-5">
      <LevelFilter value={level} onChange={setLevel} />
      {items.length === 0 ? (
        <p role="status" className="rounded-3xl border border-[#EAE4DA] bg-white p-10 text-center text-sm text-[#7A7169]">Aucun morceau n’est disponible. L’administrateur peut en ajouter dans l’onglet Contenus.</p>
      ) : (
        <div className="grid gap-4">
          {items.map(track => (
            <article key={track.id} className="rounded-3xl border border-[#EAE4DA] bg-white p-5 shadow-parla">
              <div className="flex items-start gap-4">
                {track.coverUrl
                  ? <img src={track.coverUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                  : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EDF6F2] text-[#2A6F55]"><Music2 size={28} /></div>}
                <div className="min-w-0 flex-1 space-y-1">
                  <CefrBadge level={track.level} size="sm" />
                  <h2 className="font-serif text-xl font-bold text-[#1F1A17]">{track.title}</h2>
                  <p className="text-sm text-[#7A7169]">{track.artist}</p>
                </div>
              </div>
              <audio controls preload="metadata" className="mt-4 w-full" aria-label={`${track.title} — ${track.artist}`}>
                <source src={track.audioUrl} />
                Votre navigateur ne peut pas lire ce fichier audio.
              </audio>
              {track.italianLyrics && (
                <details className="mt-4 rounded-2xl bg-[#FAF7F2] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#4A423D]">Paroles et traduction</summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[#1F1A17]">{track.italianLyrics}</p>
                  {track.frenchTranslation && <p className="mt-3 whitespace-pre-wrap border-t border-[#EAE4DA] pt-3 text-sm text-[#68605A]">{track.frenchTranslation}</p>}
                </details>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export const MediaLibraryView: React.FC<{ kind: MediaKind }> = ({ kind }) => {
  const { videos, musicTracks } = useApp();
  const isVideo = kind === 'videos';
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="space-y-2 border-b border-[#EAE4DA] pb-5">
        <div className="flex items-center gap-3">
          {isVideo ? <Video className="text-[#C04A33]" size={25} /> : <Music2 className="text-[#C04A33]" size={25} />}
          <h1 className="font-serif text-3xl text-[#1F1A17]">{isVideo ? 'Vidéos en italien' : 'Musique italienne'}</h1>
        </div>
        <p className="text-sm text-[#7A7169]">
          {isVideo ? 'Regardez des vidéos choisies pour votre niveau.' : 'Écoutez des chansons et suivez leurs paroles.'}
        </p>
      </header>
      {isVideo ? <VideoLibrary videos={videos} /> : <MusicLibrary tracks={musicTracks} />}
    </div>
  );
};

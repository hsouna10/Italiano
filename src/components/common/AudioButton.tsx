import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface AudioButtonProps {
  text: string;
  speed?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showWaveform?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  speed = 1.0,
  label,
  size = 'md',
  className = '',
  showWaveform = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audioService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    audioService.speak(text, speed, () => {
      setIsPlaying(false);
    });
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20
  };

  return (
    <button
      onClick={handlePlay}
      title={`Écouter : "${text}"`}
      className={`inline-flex items-center gap-2 rounded-xl transition-all duration-200 ${
        isPlaying 
          ? 'bg-italia-600 text-white shadow-glow-green scale-105' 
          : 'bg-slate-800/80 hover:bg-italia-900/60 text-slate-300 hover:text-emerald-400 border border-slate-700/60 hover:border-emerald-500/50'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <span className="flex items-center gap-1">
          <Volume2 size={iconSizes[size]} className="animate-pulse text-white" />
          {showWaveform && (
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </span>
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
      {label && <span className="font-medium text-xs">{label}</span>}
    </button>
  );
};

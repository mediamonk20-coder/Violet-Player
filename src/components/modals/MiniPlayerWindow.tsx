import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Minus,
  X,
  Maximize2,
} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';

interface MiniPlayerWindowProps {
  media: MediaItem;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onRestore: () => void;
}

export const MiniPlayerWindow: React.FC<MiniPlayerWindowProps> = ({
  media,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onClose,
  onRestore,
}) => {
  const effectiveDuration = duration > 0 ? duration : media.duration;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-[#16151E]/95 backdrop-blur-2xl border border-[#373340] rounded-3xl p-5 shadow-2xl flex flex-col gap-4 select-none animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Top row: Art + Info + Window Buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#24222C] border border-[#373340] shrink-0">
            {media.thumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2D2147] to-[#16151D] text-[#8B5CF6]">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#F5F3FA] truncate" title={media.title}>
              {media.title}
            </h3>
            <p className="text-xs text-[#9994A8] font-medium truncate">
              {media.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFavorite(media.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              media.isFavorite ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${media.isFavorite ? 'fill-[#8B5CF6]' : ''}`} />
          </button>
          <button
            onClick={onRestore}
            className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
            title="Restore Window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#716C80] hover:text-rose-400 rounded-lg transition-colors"
            title="Close Mini Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Seek Bar */}
      <div className="w-full flex items-center gap-2.5">
        <span className="text-[10px] font-mono text-[#9994A8] tabular-nums w-10 text-right">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1 group py-1 flex items-center">
          <div className="w-full h-1 bg-[#262430] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent || 0}
            onChange={(e) => onSeek((parseFloat(e.target.value) / 100) * effectiveDuration)}
            className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
          />
        </div>

        <span className="text-[10px] font-mono text-[#716C80] tabular-nums w-10">
          {formatTime(effectiveDuration)}
        </span>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onToggleShuffle}
          className={`p-1.5 rounded-lg transition-colors ${
            isShuffle ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onPrevious}
          className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Circular Violet Play/Pause */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center transition-all shadow-md shadow-[#8B5CF6]/40 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        <button
          onClick={onNext}
          className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={onToggleRepeat}
          className={`p-1.5 rounded-lg transition-colors ${
            repeatMode !== 'off' ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
          }`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-3.5 h-3.5" />
          ) : (
            <Repeat className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Sliders,
  Maximize2,
  PictureInPicture2,
  Heart,
  Video,
} from 'lucide-react';
import { MediaItem } from '../types/media';
import { formatTime } from '../utils/formatters';

interface BottomPlayerBarProps {
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (mediaId: string) => void;
  onOpenEqualizer: () => void;
  onToggleMiniPlayer: () => void;
  onToggleFullscreen: () => void;
  onEnterFullVideoView?: () => void;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  currentMedia,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackSpeed,
  repeatMode,
  isShuffle,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSpeedChange,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onOpenEqualizer,
  onToggleMiniPlayer,
  onToggleFullscreen,
  onEnterFullVideoView,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  if (!currentMedia) {
    return (
      <div className="h-20 bg-[#16151E] border-t border-[#262430] flex items-center justify-between px-6 select-none shrink-0 text-[#9994A8] text-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#24222C] flex items-center justify-center text-[#555064]">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <div>
            <div className="text-[#F5F3FA] font-medium">No media selected</div>
            <div className="text-[11px] text-[#716C80]">Select a track or video from the library</div>
          </div>
        </div>
      </div>
    );
  }

  const effectiveDuration = duration > 0 ? duration : currentMedia.duration;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * effectiveDuration);
  };

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <footer className="h-20 bg-[#16151E] border-t border-[#262430] flex items-center justify-between px-5 select-none shrink-0 z-40 relative">
      {/* Left: Media metadata */}
      <div className="flex items-center gap-3 w-64 min-w-0">
        <div
          onClick={currentMedia.type === 'video' ? onEnterFullVideoView : undefined}
          className={`relative w-12 h-12 rounded-xl overflow-hidden bg-[#24222C] flex-shrink-0 border border-[#373340] ${
            currentMedia.type === 'video' ? 'cursor-pointer group' : ''
          }`}
          title={currentMedia.type === 'video' ? 'Click to open Video Player' : undefined}
        >
          {currentMedia.thumbnail ? (
            <img
              src={currentMedia.thumbnail}
              alt={currentMedia.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2D2342] to-[#1F1D27] text-[#A78BFA]">
              <Play className="w-5 h-5" />
            </div>
          )}
          {currentMedia.type === 'video' && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Video className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[#F5F3FA] truncate" title={currentMedia.title}>
            {currentMedia.title}
          </div>
          <div className="text-[11px] text-[#9994A8] truncate">
            {currentMedia.artist || (currentMedia.type === 'video' ? 'Video File' : 'Violet Audio')}
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(currentMedia.id)}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            currentMedia.isFavorite
              ? 'text-[#8B5CF6] hover:text-[#A78BFA]'
              : 'text-[#555064] hover:text-[#F5F3FA]'
          }`}
          title={currentMedia.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${currentMedia.isFavorite ? 'fill-[#8B5CF6]' : ''}`} />
        </button>
      </div>

      {/* Center: Controls + Seek Bar */}
      <div className="flex-1 max-w-2xl px-6 flex flex-col items-center gap-1.5">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-lg transition-colors ${
              isShuffle ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
            }`}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPrevious}
            className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
            title="Previous (Ctrl+Left)"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-[#8B5CF6]/35"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
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
            title="Next (Ctrl+Right)"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-lg transition-colors ${
              repeatMode !== 'off' ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Seek Bar with Timers */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#9994A8] w-12 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group py-2 flex items-center">
            {/* Background track */}
            <div className="w-full h-1 bg-[#262430] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            {/* Interactive range slider overlay */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent || 0}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
              title="Seek"
            />
          </div>

          <span className="text-[11px] font-mono text-[#716C80] w-12 tabular-nums">
            {formatTime(effectiveDuration)}
          </span>
        </div>
      </div>

      {/* Right: Volume, Speed, Tools */}
      <div className="flex items-center gap-3 w-64 justify-end">
        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="text-[#9994A8] hover:text-[#F5F3FA] transition-colors p-1"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#262430] rounded-full accent-[#8B5CF6] cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>

        {/* Speed button with popup */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-2 py-1 text-[11px] font-mono text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-md transition-colors"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-10 right-0 bg-[#1E1D27] border border-[#373340] rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 w-24 z-50">
              <span className="text-[10px] text-[#716C80] px-2 py-1 uppercase tracking-wider font-semibold">Speed</span>
              {speedOptions.map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    onSpeedChange(spd);
                    setShowSpeedMenu(false);
                  }}
                  className={`px-2 py-1 text-xs rounded-md text-left transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-[#8B5CF6] text-white font-medium'
                      : 'text-[#9994A8] hover:bg-[#2C2936] hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Equalizer Modal Trigger */}
        <button
          onClick={onOpenEqualizer}
          className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-lg transition-colors"
          title="10-Band Graphic Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Mini Player */}
        <button
          onClick={onToggleMiniPlayer}
          className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-lg transition-colors"
          title="Floating Mini Player"
        >
          <PictureInPicture2 className="w-4 h-4" />
        </button>

        {/* Fullscreen / Full view */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-lg transition-colors"
          title="Fullscreen (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};

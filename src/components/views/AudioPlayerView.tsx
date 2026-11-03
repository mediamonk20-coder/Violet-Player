import React, { useEffect, useRef, useState } from 'react';
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
  Heart,
  MoreHorizontal,
  Sliders,
  Info,
  ListPlus,
} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';
import { audioEngine } from '../../services/audioEngine';

interface AudioPlayerViewProps {
  media: MediaItem;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  visualizerType: 'bars' | 'wave' | 'spectrum' | 'off';
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenEqualizer: () => void;
  onOpenMediaInfo: (media: MediaItem) => void;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  media,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  visualizerType,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onPrevious,
  onNext,
  onToggleFavorite,
  onOpenEqualizer,
  onOpenMediaInfo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Audio visualization loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const analyser = audioEngine.analyserNode;
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        if (visualizerType === 'wave') {
          analyser.getByteTimeDomainData(dataArray);
        } else {
          analyser.getByteFrequencyData(dataArray);
        }
      } else {
        // Subtle resting animation when paused
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(i * 0.2 + Date.now() * 0.002) * 8 + 14;
        }
      }

      // Draw bars / rounded pins matching the visual reference collage
      const barCount = 48;
      const step = Math.floor(bufferLength / barCount) || 1;
      const barWidth = 4;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        // Scale height smoothly
        const percent = isPlaying ? value / 255 : (Math.sin(i * 0.3) + 1) * 0.08;
        const barHeight = Math.max(4, percent * (height - 8));

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Violet gradient fill
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#C4B5FD');
        grad.addColorStop(0.5, '#8B5CF6');
        grad.addColorStop(1, '#6D28D9');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualizerType]);

  const effectiveDuration = duration > 0 ? duration : media.duration;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="w-full h-full bg-[#111116] flex flex-col items-center justify-center p-8 select-none relative overflow-y-auto">
      {/* Centered Audio Player Container matching visual reference */}
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Album Artwork & Info Row */}
        <div className="w-full flex items-center gap-8 mb-8">
          {/* Large rounded album art */}
          <div className="w-56 h-56 rounded-3xl overflow-hidden bg-[#1B1A22] border border-[#373340] shadow-2xl relative shrink-0 group">
            {media.thumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2E204A] to-[#16151D] text-[#A78BFA]">
                <Play className="w-12 h-12" />
              </div>
            )}
            {/* Subtle vinyl groove reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Track Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#F5F3FA] tracking-tight leading-tight mb-2 truncate">
              {media.title}
            </h1>
            <h2 className="text-sm font-semibold text-[#A78BFA] tracking-wide mb-1 truncate">
              {media.artist || 'Unknown Artist'}
            </h2>
            <p className="text-xs text-[#716C80] mb-6 truncate">
              {media.album || 'The Violet Sessions'}
            </p>

            {/* Actions: Heart + More */}
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => onToggleFavorite(media.id)}
                className={`p-2.5 rounded-xl border border-[#373340]/60 transition-all ${
                  media.isFavorite
                    ? 'text-[#8B5CF6] bg-[#2C243D] border-[#8B5CF6]/40'
                    : 'text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1E1D27]'
                }`}
                title={media.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${media.isFavorite ? 'fill-[#8B5CF6]' : ''}`} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 rounded-xl border border-[#373340]/60 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1E1D27] transition-colors"
                  title="Track Options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute top-12 left-0 bg-[#1E1D27] border border-[#373340] rounded-xl p-2 shadow-2xl flex flex-col gap-1 w-48 z-40">
                    <button
                      onClick={() => {
                        onOpenEqualizer();
                        setShowMenu(false);
                      }}
                      className="px-3 py-1.5 text-xs text-[#F5F3FA] hover:bg-[#2C2936] rounded-lg text-left flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Audio Equalizer</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenMediaInfo(media);
                        setShowMenu(false);
                      }}
                      className="px-3 py-1.5 text-xs text-[#F5F3FA] hover:bg-[#2C2936] rounded-lg text-left flex items-center gap-2"
                    >
                      <Info className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Track Info & Codecs</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Canvas matching visual reference */}
        <div className="w-full h-16 mb-6 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={540}
            height={60}
            className="w-full h-full"
          />
        </div>

        {/* Progress seek bar row */}
        <div className="w-full flex items-center gap-4 mb-8">
          <span className="text-xs font-mono text-[#9994A8] tabular-nums w-12 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group py-2 flex items-center">
            {/* Background track */}
            <div className="w-full h-1.5 bg-[#262430] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            {/* Interactive range slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent || 0}
              onChange={(e) => onSeek((parseFloat(e.target.value) / 100) * effectiveDuration)}
              className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
              title="Seek"
            />
          </div>

          <span className="text-xs font-mono text-[#716C80] tabular-nums w-12">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        {/* Bottom Playback Controls matching visual reference */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition-colors ${
              isShuffle ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
            }`}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevious}
            className="p-2 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Large prominent circular violet play button */}
          <button
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white flex items-center justify-center transition-all shadow-xl shadow-[#8B5CF6]/40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-colors ${
              repeatMode !== 'off' ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>

          {/* Volume slider */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onToggleMute}
              className="text-[#9994A8] hover:text-[#F5F3FA] transition-colors p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
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
              className="w-20 h-1 bg-[#262430] rounded-full accent-[#8B5CF6] cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

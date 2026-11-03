import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
  Minimize2,
  Sliders,
  ChevronLeft,
  MessageSquare,
  PictureInPicture2,
  RotateCcw,
  StepBack,
  StepForward,
  Bookmark,
  Check,
} from 'lucide-react';
import { MediaItem, VideoAdjustments, SubtitleTrack } from '../../types/media';
import { formatTime } from '../../utils/formatters';
import { getActiveCue } from '../../services/subtitleParser';

interface VideoPlayerViewProps {
  media: MediaItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  videoAdjustments: VideoAdjustments;
  subtitleDelay: number;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleBg: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onOpenAdjustments: () => void;
  onToggleMiniPlayer: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  media,
  videoRef,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  videoAdjustments,
  subtitleDelay,
  subtitleFontSize,
  subtitleColor,
  subtitleBg,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onPrevious,
  onNext,
  onBack,
  onOpenAdjustments,
  onToggleMiniPlayer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  // Subtitle state
  const [selectedSubTrack, setSelectedSubTrack] = useState<string | null>(
    media.subtitles && media.subtitles.length > 0 ? media.subtitles[0].id : null
  );
  const [showSubMenu, setShowSubMenu] = useState(false);

  // A-B Repeat state
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (isPlaying) {
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
        setShowSubMenu(false);
      }, 3200);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Handle A-B Repeat loop
  useEffect(() => {
    if (loopA !== null && loopB !== null && loopB > loopA) {
      if (currentTime >= loopB) {
        onSeek(loopA);
      }
    }
  }, [currentTime, loopA, loopB, onSeek]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  // Step frame (approx 30fps = 0.033s)
  const stepFrame = (delta: number) => {
    const newTime = Math.max(0, Math.min(duration || media.duration, currentTime + delta * (1 / 30)));
    onSeek(newTime);
  };

  // Find active subtitle cue
  const activeTrack = media.subtitles?.find((s) => s.id === selectedSubTrack);
  const activeCue = activeTrack ? getActiveCue(activeTrack.cues, currentTime, subtitleDelay) : null;

  // Build CSS filter string
  const cssFilter = `
    brightness(${videoAdjustments.brightness}%)
    contrast(${videoAdjustments.contrast}%)
    saturate(${videoAdjustments.saturation}%)
    hue-rotate(${(videoAdjustments.gamma - 100) * 1.8}deg)
  `;

  // Build transform string
  const transform = `
    scale(${videoAdjustments.zoom})
    translate(${videoAdjustments.panX}px, ${videoAdjustments.panY}px)
    rotate(${videoAdjustments.rotation}deg)
    scaleX(${videoAdjustments.flipH ? -1 : 1})
    scaleY(${videoAdjustments.flipV ? -1 : 1})
  `;

  // Aspect ratio class
  const getAspectRatioClass = () => {
    switch (videoAdjustments.aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '21:9':
        return 'aspect-[21/9]';
      case '1:1':
        return 'aspect-square';
      case 'fill':
        return 'w-full h-full object-fill';
      default:
        return 'w-full h-full object-contain';
    }
  };

  const effectiveDuration = duration > 0 ? duration : media.duration;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full bg-[#0D0D11] flex flex-col justify-between overflow-hidden select-none"
      style={{ cursor: controlsVisible ? 'default' : 'none' }}
    >
      {/* Top Header Bar matching UI collage */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#F5F3FA] hover:text-[#A78BFA] transition-colors bg-[#1E1D27]/80 hover:bg-[#2C2936] backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#373340]/60 text-xs font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-semibold truncate max-w-md">{media.title}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* A-B Loop indicator if set */}
          {loopA !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6D28D9]/40 border border-[#8B5CF6]/40 text-xs text-[#E9D5FF]">
              <Bookmark className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>A-B Loop: {formatTime(loopA)} - {loopB !== null ? formatTime(loopB) : '...'}</span>
              <button
                onClick={() => {
                  setLoopA(null);
                  setLoopB(null);
                }}
                className="ml-1 text-xs text-[#A78BFA] hover:text-white"
                title="Clear loop"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={onOpenAdjustments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1D27]/80 hover:bg-[#2C2936] backdrop-blur-md text-[#F5F3FA] hover:text-[#A78BFA] border border-[#373340]/60 text-xs font-medium transition-colors"
            title="Video Adjustments (Equalizer, Color, Aspect Ratio)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adjustments</span>
          </button>
        </div>
      </div>

      {/* Main Video Presentation Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer"
        onDoubleClick={toggleFullscreen}
        onClick={onPlayPause}
      >
        <video
          ref={videoRef}
          src={media.src}
          poster={media.thumbnail}
          playsInline
          className={`max-w-full max-h-full transition-transform duration-100 ${getAspectRatioClass()}`}
          style={{
            filter: cssFilter,
            transform: transform,
          }}
        />

        {/* Fallback poster or play icon if paused and no video frames */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/90 flex items-center justify-center text-white shadow-2xl shadow-[#8B5CF6]/50">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Live Subtitle Overlay */}
        {activeCue && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-4xl px-4 text-center pointer-events-none z-20">
            <span
              className={`inline-block px-3 py-1 rounded-md font-medium leading-relaxed tracking-wide ${
                subtitleBg ? 'bg-black/75 backdrop-blur-sm' : ''
              }`}
              style={{
                fontSize: `${subtitleFontSize}px`,
                color: subtitleColor,
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
              }}
            >
              {activeCue.text}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar matching visual reference */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-4 left-6 right-6 z-30 bg-[#1B1A22]/90 backdrop-blur-xl border border-[#373340]/80 rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Progress seek bar row */}
        <div className="w-full flex items-center gap-3 mb-3">
          <span className="text-xs font-mono text-[#F5F3FA] font-medium tabular-nums w-16">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group py-1 flex items-center">
            {/* Background track */}
            <div className="w-full h-1.5 bg-[#2B2836] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            {/* Range input */}
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

          <span className="text-xs font-mono text-[#9994A8] tabular-nums w-16 text-right">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        {/* Second row: Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Volume */}
          <div className="flex items-center gap-2 w-48">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
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
              className="w-20 h-1 bg-[#2B2836] rounded-full accent-[#8B5CF6] cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Center: Playback transport */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-[#8B5CF6]' : 'text-[#716C80] hover:text-[#F5F3FA]'
              }`}
              title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Frame step back */}
            <button
              onClick={() => stepFrame(-1)}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors hidden sm:block"
              title="Step Backward 1 Frame"
            >
              <StepBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrevious}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
              title="Previous (Ctrl+Left)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Prominent circular violet play button */}
            <button
              onClick={onPlayPause}
              className="w-11 h-11 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-[#8B5CF6]/40"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
              title="Next (Ctrl+Right)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Frame step forward */}
            <button
              onClick={() => stepFrame(1)}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors hidden sm:block"
              title="Step Forward 1 Frame"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-1.5 rounded-lg transition-colors ${
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
          </div>

          {/* Right: Subtitles, A-B Loop, PIP, Fullscreen */}
          <div className="flex items-center gap-2 w-48 justify-end relative">
            {/* Set A-B Repeat button */}
            <button
              onClick={() => {
                if (loopA === null) {
                  setLoopA(currentTime);
                } else if (loopB === null && currentTime > loopA) {
                  setLoopB(currentTime);
                } else {
                  setLoopA(null);
                  setLoopB(null);
                }
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                loopA !== null ? 'text-[#8B5CF6] bg-[#2C243D]' : 'text-[#9994A8] hover:text-[#F5F3FA]'
              }`}
              title={loopA === null ? 'Set Loop Point A' : loopB === null ? 'Set Loop Point B' : 'Clear Loop'}
            >
              A-B
            </button>

            {/* Subtitle toggle & track selector */}
            <div className="relative">
              <button
                onClick={() => setShowSubMenu(!showSubMenu)}
                className={`p-1.5 rounded-lg transition-colors ${
                  selectedSubTrack
                    ? 'text-[#8B5CF6] hover:bg-[#2C243D]'
                    : 'text-[#9994A8] hover:text-[#F5F3FA]'
                }`}
                title="Subtitles"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {showSubMenu && (
                <div className="absolute bottom-10 right-0 bg-[#1E1D27] border border-[#373340] rounded-xl p-2 shadow-2xl flex flex-col gap-1 w-44 z-50">
                  <span className="text-[10px] text-[#716C80] px-2 py-1 uppercase tracking-wider font-semibold">Subtitles</span>
                  <button
                    onClick={() => {
                      setSelectedSubTrack(null);
                      setShowSubMenu(false);
                    }}
                    className={`px-2 py-1 text-xs rounded-md text-left flex items-center justify-between ${
                      selectedSubTrack === null ? 'bg-[#8B5CF6] text-white' : 'text-[#9994A8] hover:bg-[#2C2936]'
                    }`}
                  >
                    <span>Off</span>
                    {selectedSubTrack === null && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {media.subtitles?.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSelectedSubTrack(st.id);
                        setShowSubMenu(false);
                      }}
                      className={`px-2 py-1 text-xs rounded-md text-left flex items-center justify-between truncate ${
                        selectedSubTrack === st.id ? 'bg-[#8B5CF6] text-white' : 'text-[#9994A8] hover:bg-[#2C2936]'
                      }`}
                    >
                      <span className="truncate">{st.label}</span>
                      {selectedSubTrack === st.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mini Player */}
            <button
              onClick={onToggleMiniPlayer}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
              title="Picture in Picture / Mini Player"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#A78BFA]" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

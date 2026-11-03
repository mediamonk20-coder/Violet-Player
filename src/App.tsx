/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowFrame } from './components/WindowFrame';
import { Sidebar, ViewType } from './components/Sidebar';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { VideoPlayerView } from './components/views/VideoPlayerView';
import { AudioPlayerView } from './components/views/AudioPlayerView';
import { LibraryView } from './components/views/LibraryView';
import { PlaylistView } from './components/views/PlaylistView';
import { FavoritesView } from './components/views/FavoritesView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { MiniPlayerWindow } from './components/modals/MiniPlayerWindow';
import { EqualizerModal } from './components/modals/EqualizerModal';
import { VideoAdjustmentsModal } from './components/modals/VideoAdjustmentsModal';
import { MediaInfoModal } from './components/modals/MediaInfoModal';
import { OpenUrlModal } from './components/modals/OpenUrlModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';

import {
  MediaItem,
  Playlist,
  PlaybackHistoryItem,
  PlayerSettings,
  EqualizerState,
  VideoAdjustments,
} from './types/media';
import { storage } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { logger } from './services/logger';
import { parseSubtitleText } from './services/subtitleParser';

export default function App() {
  // Persistence state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => storage.getMediaItems());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [history, setHistory] = useState<PlaybackHistoryItem[]>(() => storage.getHistory());
  const [settings, setSettings] = useState<PlayerSettings>(() => storage.getSettings());
  const [equalizer, setEqualizer] = useState<EqualizerState>(() => storage.getEqualizer());
  const [videoAdjustments, setVideoAdjustments] = useState<VideoAdjustments>(() =>
    storage.getVideoAdjustments()
  );

  // Active navigation view
  const [activeView, setActiveView] = useState<ViewType>('library');

  // Currently loaded media item
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(() => {
    const items = storage.getMediaItems();
    return items.length > 0 ? items[0] : null;
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(settings.defaultSpeed || 1.0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>(settings.repeatMode || 'all');
  const [isShuffle, setIsShuffle] = useState<boolean>(settings.shuffle || false);

  // Mini Player floating window state
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'equalizer' | 'video_adjustments' | 'media_info' | 'open_url' | 'shortcuts' | null
  >(null);
  const [inspectingMedia, setInspectingMedia] = useState<MediaItem | null>(null);

  // Media element references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Update Equalizer on changes
  useEffect(() => {
    audioEngine.applyEqualizer(equalizer);
    storage.saveEqualizer(equalizer);
  }, [equalizer]);

  // Update Settings in storage
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // Update MediaItems in storage
  useEffect(() => {
    storage.saveMediaItems(mediaItems);
  }, [mediaItems]);

  // Update Playlists in storage
  useEffect(() => {
    storage.savePlaylists(playlists);
  }, [playlists]);

  // Active media element getter
  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (currentMedia?.type === 'video') {
      return videoRef.current;
    }
    return audioRef.current;
  }, [currentMedia]);

  // Connect active media element to Audio Engine
  useEffect(() => {
    const el = getActiveMediaElement();
    if (el) {
      audioEngine.connectMediaElement(el);
      audioEngine.applyEqualizer(equalizer);
      el.volume = isMuted ? 0 : volume;
      el.playbackRate = playbackSpeed;
    }
  }, [currentMedia, getActiveMediaElement, equalizer, isMuted, volume, playbackSpeed]);

  // Play / Pause toggle
  const handlePlayPause = useCallback(async () => {
    if (!currentMedia) return;
    const el = getActiveMediaElement();

    if (isPlaying) {
      if (el) el.pause();
      if (currentMedia.isProceduralAudio) {
        audioEngine.stopProceduralSynth();
      }
      setIsPlaying(false);
      logger.info('PLAYBACK', `Paused: ${currentMedia.title}`);
    } else {
      if (el) {
        try {
          audioEngine.init();
          await el.play();
          setIsPlaying(true);
          logger.info('PLAYBACK', `Playing: ${currentMedia.title}`);
        } catch (err) {
          // If browser audio autoplay or blocked, fallback gracefully
          logger.warn('PLAYBACK', `Direct media play notice: ${String(err)}`);
          if (currentMedia.isProceduralAudio) {
            audioEngine.startProceduralSynth(volume);
            setIsPlaying(true);
          }
        }
      } else if (currentMedia.isProceduralAudio) {
        audioEngine.startProceduralSynth(volume);
        setIsPlaying(true);
      }
    }
  }, [currentMedia, isPlaying, getActiveMediaElement, volume]);

  // Play specific media item
  const handlePlayMedia = useCallback(
    (item: MediaItem, startPosition?: number) => {
      // Pause current
      const prevEl = getActiveMediaElement();
      if (prevEl) prevEl.pause();
      audioEngine.stopProceduralSynth();

      setCurrentMedia(item);
      setCurrentTime(startPosition || 0);
      setIsPlaying(true);

      // Auto switch view if video is selected
      if (item.type === 'video') {
        setActiveView('video_player');
      } else if (activeView === 'video_player') {
        setActiveView('audio');
      }

      logger.info('MEDIA', `Loaded: ${item.title} (${item.type.toUpperCase()})`);

      // Add to playback history
      const historyEntry: PlaybackHistoryItem = {
        mediaId: item.id,
        title: item.title,
        artist: item.artist,
        type: item.type,
        lastPosition: startPosition || 0,
        duration: item.duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: false,
        thumbnail: item.thumbnail,
      };
      storage.addHistoryItem(historyEntry);
      setHistory(storage.getHistory());

      // Start playback on next tick
      setTimeout(async () => {
        const el = item.type === 'video' ? videoRef.current : audioRef.current;
        if (el) {
          audioEngine.connectMediaElement(el);
          audioEngine.applyEqualizer(equalizer);
          el.playbackRate = playbackSpeed;
          el.volume = isMuted ? 0 : volume;
          if (startPosition) {
            el.currentTime = startPosition;
          }
          try {
            await el.play();
          } catch {
            if (item.isProceduralAudio) {
              audioEngine.startProceduralSynth(volume);
            }
          }
        } else if (item.isProceduralAudio) {
          audioEngine.startProceduralSynth(volume);
        }
      }, 50);
    },
    [getActiveMediaElement, activeView, equalizer, playbackSpeed, isMuted, volume]
  );

  // Next Track
  const handleNext = useCallback(() => {
    if (!currentMedia || mediaItems.length === 0) return;
    let nextIndex = 0;
    const currentIndex = mediaItems.findIndex((m) => m.id === currentMedia.id);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * mediaItems.length);
    } else {
      nextIndex = (currentIndex + 1) % mediaItems.length;
    }

    handlePlayMedia(mediaItems[nextIndex]);
  }, [currentMedia, mediaItems, isShuffle, handlePlayMedia]);

  // Previous Track
  const handlePrevious = useCallback(() => {
    if (!currentMedia || mediaItems.length === 0) return;
    if (currentTime > 3) {
      // If played more than 3 seconds, restart current track
      handleSeek(0);
      return;
    }
    const currentIndex = mediaItems.findIndex((m) => m.id === currentMedia.id);
    const prevIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
    handlePlayMedia(mediaItems[prevIndex]);
  }, [currentMedia, mediaItems, currentTime, handlePlayMedia]);

  // Seek
  const handleSeek = (time: number) => {
    const el = getActiveMediaElement();
    if (el) {
      el.currentTime = time;
    }
    setCurrentTime(time);
  };

  // Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    const el = getActiveMediaElement();
    if (el) {
      el.volume = vol;
    }
    audioEngine.setSynthVolume(vol);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const el = getActiveMediaElement();
    if (el) {
      el.volume = newMuted ? 0 : volume;
    }
    audioEngine.setSynthVolume(newMuted ? 0 : volume);
  };

  // Speed
  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
    const el = getActiveMediaElement();
    if (el) {
      el.playbackRate = spd;
    }
    logger.info('PLAYBACK', `Speed set to ${spd}x`);
  };

  // Repeat toggle
  const handleToggleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    setSettings((s) => ({ ...s, repeatMode: nextMode }));
  };

  // Shuffle toggle
  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    setSettings((s) => ({ ...s, shuffle: !isShuffle }));
  };

  // Favorite toggle
  const handleToggleFavorite = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (currentMedia && currentMedia.id === id) {
      setCurrentMedia((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Add Files to library
  const handleAddFiles = (files: FileList) => {
    const newItems: MediaItem[] = [];

    Array.from(files).forEach((file) => {
      // Check if subtitle
      if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text && currentMedia) {
            const track = parseSubtitleText(text, file.name);
            setCurrentMedia((prev) =>
              prev ? { ...prev, subtitles: [...(prev.subtitles || []), track] } : null
            );
            logger.info('SUBTITLE', `Loaded external subtitle: ${file.name}`);
          }
        };
        reader.readAsText(file);
        return;
      }

      const isVideo = file.type.startsWith('video/') || /\.(mp4|mkv|webm|avi|mov)$/i.test(file.name);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|flac|ogg|m4a)$/i.test(file.name);

      if (isVideo || isAudio) {
        const objectUrl = URL.createObjectURL(file);
        newItems.push({
          id: 'local-' + Math.random().toString(36).substring(2, 9),
          title: file.name,
          type: isVideo ? 'video' : 'audio',
          src: objectUrl,
          duration: 180, // estimated until metadata loads
          folder: isVideo ? 'Movies' : 'Music',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          codec: isVideo ? 'Local Hardware Stream' : 'Lossless Audio Stream',
          dateAdded: new Date().toISOString().split('T')[0],
          file: file,
        });
      }
    });

    if (newItems.length > 0) {
      setMediaItems((prev) => [...newItems, ...prev]);
      logger.info('LIBRARY', `Imported ${newItems.length} media items from disk`);
      if (!currentMedia) {
        handlePlayMedia(newItems[0]);
      }
    }
  };

  // Delete media item
  const handleDeleteMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    if (currentMedia?.id === id) {
      const remaining = mediaItems.filter((item) => item.id !== id);
      if (remaining.length > 0) {
        handlePlayMedia(remaining[0]);
      } else {
        setCurrentMedia(null);
        setIsPlaying(false);
      }
    }
  };

  // Queue Next
  const handleAddToQueue = (item: MediaItem) => {
    if (!currentMedia) {
      handlePlayMedia(item);
      return;
    }
    const filtered = mediaItems.filter((m) => m.id !== item.id);
    const currIdx = filtered.findIndex((m) => m.id === currentMedia.id);
    filtered.splice(currIdx + 1, 0, item);
    setMediaItems(filtered);
    logger.info('QUEUE', `Queued next: ${item.title}`);
  };

  // Global Keyboard Shortcuts (Section 12 of prompt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept while typing in inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyS' && !e.ctrlKey) {
        e.preventDefault();
        const el = getActiveMediaElement();
        if (el) el.pause();
        audioEngine.stopProceduralSynth();
        setIsPlaying(false);
        handleSeek(0);
      } else if (e.code === 'KeyF' && !e.ctrlKey) {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.code === 'ArrowLeft' && !e.ctrlKey) {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowRight' && !e.ctrlKey) {
        e.preventDefault();
        handleSeek(currentTime + 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.05));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.ctrlKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.ctrlKey && e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'BracketRight') {
        e.preventDefault();
        handleSpeedChange(Math.min(2.0, playbackSpeed + 0.25));
      } else if (e.code === 'BracketLeft') {
        e.preventDefault();
        handleSpeedChange(Math.max(0.25, playbackSpeed - 0.25));
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        handleSpeedChange(1.0);
      } else if (e.ctrlKey && e.code === 'KeyO') {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if (e.ctrlKey && e.code === 'KeyP') {
        e.preventDefault();
        setActiveView('playlist');
      } else if (e.ctrlKey && e.code === 'KeyU') {
        e.preventDefault();
        setActiveModal('open_url');
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        setActiveModal('equalizer');
      } else if (e.code === 'KeyZ') {
        // Subtitle delay -50ms
        setSettings((s) => ({ ...s, subtitleDelay: Math.max(-5, s.subtitleDelay - 0.05) }));
      } else if (e.code === 'KeyX') {
        // Subtitle delay +50ms
        setSettings((s) => ({ ...s, subtitleDelay: Math.min(5, s.subtitleDelay + 0.05) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handlePrevious,
    handleNext,
    handleSpeedChange,
    currentTime,
    volume,
    playbackSpeed,
    getActiveMediaElement,
  ]);

  // Window Drag & Drop media file support
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Keep playback progress updated
  const handleTimeUpdate = (el: HTMLMediaElement) => {
    setCurrentTime(el.currentTime);
    if (el.duration && !isNaN(el.duration) && el.duration !== Infinity) {
      setDuration(el.duration);
    }

    // Save position to history periodically
    if (currentMedia && Math.floor(el.currentTime) % 5 === 0) {
      storage.addHistoryItem({
        mediaId: currentMedia.id,
        title: currentMedia.title,
        artist: currentMedia.artist,
        type: currentMedia.type,
        lastPosition: el.currentTime,
        duration: el.duration || currentMedia.duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: el.currentTime >= (el.duration || currentMedia.duration) - 5,
        thumbnail: currentMedia.thumbnail,
      });
    }
  };

  // Media element ended handler
  const handleMediaEnded = () => {
    if (repeatMode === 'one') {
      handleSeek(0);
      handlePlayPause();
    } else if (repeatMode === 'all') {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#111116] text-[#F5F3FA] select-none"
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentMedia?.type === 'audio' ? currentMedia.src : undefined}
        onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget)}
        onEnded={handleMediaEnded}
      />

      {/* Hidden File / Folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,.mkv,.mp4,.avi,.mov,.webm,.mp3,.wav,.flac,.ogg,.m4a,.srt,.vtt"
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory standard
        webkitdirectory="true"
        multiple
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
        className="hidden"
      />

      {/* Desktop Windows Title Bar */}
      <WindowFrame
        currentTitle={currentMedia ? currentMedia.title : undefined}
        onOpenFile={() => fileInputRef.current?.click()}
        onOpenUrl={() => setActiveModal('open_url')}
        onOpenShortcuts={() => setActiveModal('shortcuts')}
        onToggleMiniPlayer={() => setIsMiniPlayer(!isMiniPlayer)}
        isMiniPlayer={isMiniPlayer}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (visible on non-video view or when toggled) */}
        {activeView !== 'video_player' && (
          <Sidebar
            activeView={activeView}
            onSelectView={(v) => setActiveView(v)}
          />
        )}

        {/* View Switcher Container */}
        <main className="flex-1 overflow-hidden relative bg-[#111116]">
          {activeView === 'video_player' && currentMedia?.type === 'video' ? (
            <VideoPlayerView
              media={currentMedia}
              videoRef={videoRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              playbackSpeed={playbackSpeed}
              repeatMode={repeatMode}
              isShuffle={isShuffle}
              videoAdjustments={videoAdjustments}
              subtitleDelay={settings.subtitleDelay}
              subtitleFontSize={settings.subtitleFontSize}
              subtitleColor={settings.subtitleColor}
              subtitleBg={settings.subtitleBg}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onToggleRepeat={handleToggleRepeat}
              onToggleShuffle={handleToggleShuffle}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onBack={() => setActiveView('library')}
              onOpenAdjustments={() => setActiveModal('video_adjustments')}
              onToggleMiniPlayer={() => setIsMiniPlayer(true)}
            />
          ) : activeView === 'audio' && currentMedia?.type === 'audio' ? (
            <AudioPlayerView
              media={currentMedia}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              repeatMode={repeatMode}
              isShuffle={isShuffle}
              visualizerType={settings.visualizerType}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onToggleRepeat={handleToggleRepeat}
              onToggleShuffle={handleToggleShuffle}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleFavorite={handleToggleFavorite}
              onOpenEqualizer={() => setActiveModal('equalizer')}
              onOpenMediaInfo={(m) => {
                setInspectingMedia(m);
                setActiveModal('media_info');
              }}
            />
          ) : activeView === 'videos' ? (
            <LibraryView
              mediaItems={mediaItems.filter((m) => m.type === 'video')}
              onPlayMedia={handlePlayMedia}
              onToggleFavorite={handleToggleFavorite}
              onOpenMediaInfo={(m) => {
                setInspectingMedia(m);
                setActiveModal('media_info');
              }}
              onAddFiles={handleAddFiles}
              onDeleteMedia={handleDeleteMedia}
              onAddToQueue={handleAddToQueue}
            />
          ) : activeView === 'audio' ? (
            <LibraryView
              mediaItems={mediaItems.filter((m) => m.type === 'audio')}
              onPlayMedia={handlePlayMedia}
              onToggleFavorite={handleToggleFavorite}
              onOpenMediaInfo={(m) => {
                setInspectingMedia(m);
                setActiveModal('media_info');
              }}
              onAddFiles={handleAddFiles}
              onDeleteMedia={handleDeleteMedia}
              onAddToQueue={handleAddToQueue}
            />
          ) : activeView === 'playlist' ? (
            <PlaylistView
              playlists={playlists}
              allMedia={mediaItems}
              onPlayMedia={handlePlayMedia}
              onUpdatePlaylists={(pls) => setPlaylists(pls)}
              onAddMediaItems={(items) => setMediaItems((prev) => [...items, ...prev])}
            />
          ) : activeView === 'favorites' ? (
            <FavoritesView
              mediaItems={mediaItems}
              onPlayMedia={handlePlayMedia}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : activeView === 'history' ? (
            <HistoryView
              history={history}
              allMedia={mediaItems}
              onResumeMedia={(item, pos) => handlePlayMedia(item, pos)}
              onClearHistory={() => {
                storage.clearHistory();
                setHistory([]);
              }}
            />
          ) : activeView === 'settings' ? (
            <SettingsView
              settings={settings}
              onUpdateSettings={(s) => setSettings(s)}
              onResetSettings={() => {
                storage.saveSettings(storage.getSettings());
                setSettings(storage.getSettings());
              }}
            />
          ) : (
            /* Home / Library Default View */
            <LibraryView
              mediaItems={mediaItems}
              onPlayMedia={handlePlayMedia}
              onToggleFavorite={handleToggleFavorite}
              onOpenMediaInfo={(m) => {
                setInspectingMedia(m);
                setActiveModal('media_info');
              }}
              onAddFiles={handleAddFiles}
              onDeleteMedia={handleDeleteMedia}
              onAddToQueue={handleAddToQueue}
            />
          )}
        </main>
      </div>

      {/* Persistent Bottom Playback Bar (shown whenever not in full video player view) */}
      {activeView !== 'video_player' && (
        <BottomPlayerBar
          currentMedia={currentMedia}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          playbackSpeed={playbackSpeed}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onSpeedChange={handleSpeedChange}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onToggleFavorite={handleToggleFavorite}
          onOpenEqualizer={() => setActiveModal('equalizer')}
          onToggleMiniPlayer={() => setIsMiniPlayer(!isMiniPlayer)}
          onToggleFullscreen={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          onEnterFullVideoView={() => setActiveView('video_player')}
        />
      )}

      {/* Floating Mini Player Widget (matching visual reference collage bottom-right) */}
      {isMiniPlayer && currentMedia && (
        <MiniPlayerWindow
          media={currentMedia}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setIsMiniPlayer(false)}
          onRestore={() => {
            setIsMiniPlayer(false);
            if (currentMedia.type === 'video') {
              setActiveView('video_player');
            } else {
              setActiveView('audio');
            }
          }}
        />
      )}

      {/* Modals */}
      {activeModal === 'equalizer' && (
        <EqualizerModal
          equalizer={equalizer}
          onUpdateEqualizer={(eq) => setEqualizer(eq)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'video_adjustments' && (
        <VideoAdjustmentsModal
          adjustments={videoAdjustments}
          onUpdateAdjustments={(adj) => {
            setVideoAdjustments(adj);
            storage.saveVideoAdjustments(adj);
          }}
          onClose={() => setActiveModal(null)}
          onReset={() => {
            const def = storage.getVideoAdjustments();
            setVideoAdjustments(def);
            storage.saveVideoAdjustments(def);
          }}
        />
      )}

      {activeModal === 'media_info' && (
        <MediaInfoModal
          media={inspectingMedia || currentMedia}
          onClose={() => {
            setActiveModal(null);
            setInspectingMedia(null);
          }}
        />
      )}

      {activeModal === 'open_url' && (
        <OpenUrlModal
          onPlayUrl={(item) => {
            setMediaItems((prev) => [item, ...prev]);
            handlePlayMedia(item);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'shortcuts' && (
        <ShortcutsModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

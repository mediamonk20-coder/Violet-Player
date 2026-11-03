import { MediaItem, Playlist, PlaybackHistoryItem, PlayerSettings, EqualizerState, VideoAdjustments } from '../types/media';
import { DEFAULT_MEDIA_ITEMS, DEFAULT_PLAYLISTS } from '../data/defaultMedia';
import { EQ_PRESETS } from './audioEngine';

const STORAGE_KEYS = {
  MEDIA: 'violet_media_items_v1',
  PLAYLISTS: 'violet_playlists_v1',
  HISTORY: 'violet_playback_history_v1',
  SETTINGS: 'violet_player_settings_v1',
  EQUALIZER: 'violet_equalizer_v1',
  VIDEO_ADJUSTMENTS: 'violet_video_adj_v1',
};

export const DEFAULT_SETTINGS: PlayerSettings = {
  defaultSpeed: 1.0,
  resumePlayback: true,
  hardwareAcceleration: true,
  audioDeviceId: 'default',
  subtitleFontSize: 22,
  subtitleColor: '#F5F3FA',
  subtitleBg: true,
  subtitleDelay: 0,
  visualizerType: 'wave',
  themeAccent: '#8B5CF6',
  compactMode: false,
  crossfade: false,
  repeatMode: 'all',
  shuffle: false,
};

export const DEFAULT_EQUALIZER: EqualizerState = {
  enabled: true,
  preset: 'rock',
  preamp: EQ_PRESETS.rock.preamp,
  bassBoost: EQ_PRESETS.rock.bassBoost,
  treble: EQ_PRESETS.rock.treble,
  bands: [...EQ_PRESETS.rock.bands],
};

export const DEFAULT_VIDEO_ADJUSTMENTS: VideoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  gamma: 100,
  aspectRatio: 'auto',
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  deinterlace: false,
};

export class StorageService {
  public getMediaItems(): MediaItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_MEDIA_ITEMS;
  }

  public saveMediaItems(items: MediaItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  public getPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_PLAYLISTS;
  }

  public savePlaylists(playlists: Playlist[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }

  public getHistory(): PlaybackHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public addHistoryItem(item: PlaybackHistoryItem) {
    const list = this.getHistory().filter((h) => h.mediaId !== item.mediaId);
    list.unshift(item);
    if (list.length > 50) list.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {
      // ignore
    }
  }

  public getSettings(): PlayerSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: PlayerSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  public getEqualizer(): EqualizerState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EQUALIZER);
      if (stored) {
        return { ...DEFAULT_EQUALIZER, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_EQUALIZER;
  }

  public saveEqualizer(eq: EqualizerState) {
    try {
      localStorage.setItem(STORAGE_KEYS.EQUALIZER, JSON.stringify(eq));
    } catch {
      // ignore
    }
  }

  public getVideoAdjustments(): VideoAdjustments {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEO_ADJUSTMENTS);
      if (stored) {
        return { ...DEFAULT_VIDEO_ADJUSTMENTS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_VIDEO_ADJUSTMENTS;
  }

  public saveVideoAdjustments(adj: VideoAdjustments) {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEO_ADJUSTMENTS, JSON.stringify(adj));
    } catch {
      // ignore
    }
  }
}

export const storage = new StorageService();

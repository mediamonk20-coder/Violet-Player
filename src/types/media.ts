export type MediaType = 'video' | 'audio';

export interface SubtitleCue {
  id?: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  cues: SubtitleCue[];
}

export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  type: MediaType;
  src: string;
  duration: number; // in seconds
  thumbnail?: string;
  folder?: string;
  size?: string;
  resolution?: string;
  codec?: string;
  audioCodec?: string;
  bitrate?: string;
  dateAdded: string;
  isFavorite?: boolean;
  subtitles?: SubtitleTrack[];
  file?: File;
  isProceduralAudio?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdDate: string;
}

export interface PlaybackHistoryItem {
  mediaId: string;
  title: string;
  artist?: string;
  type: MediaType;
  lastPosition: number;
  duration: number;
  timestamp: string;
  completed: boolean;
  thumbnail?: string;
}

export interface VideoAdjustments {
  brightness: number; // 50 - 150 (100 is normal)
  contrast: number;   // 50 - 150
  saturation: number; // 0 - 200
  gamma: number;      // 50 - 150
  aspectRatio: 'auto' | '16:9' | '4:3' | '21:9' | '1:1' | 'fill' | 'original';
  zoom: number;       // 1.0 - 3.0
  panX: number;       // -100 to 100
  panY: number;       // -100 to 100
  rotation: number;   // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  deinterlace: boolean;
}

export interface EqualizerState {
  enabled: boolean;
  preset: string;
  preamp: number;    // -6 to +6 dB
  bassBoost: number; // 0 to 12 dB
  treble: number;    // -6 to +6 dB
  bands: number[];   // 10 bands: 32, 64, 125, 250, 500, 1k, 2k, 4k, 8k, 16k
}

export interface PlayerSettings {
  defaultSpeed: number;
  resumePlayback: boolean;
  hardwareAcceleration: boolean;
  audioDeviceId: string;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleBg: boolean;
  subtitleDelay: number; // seconds
  visualizerType: 'bars' | 'wave' | 'spectrum' | 'off';
  themeAccent: string;
  compactMode: boolean;
  crossfade: boolean;
  repeatMode: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
}

import React from 'react';
import { Clock, Play, RotateCcw, Trash2, Video, Music } from 'lucide-react';
import { PlaybackHistoryItem, MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';

interface HistoryViewProps {
  history: PlaybackHistoryItem[];
  allMedia: MediaItem[];
  onResumeMedia: (item: MediaItem, resumePosition: number) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  allMedia,
  onResumeMedia,
  onClearHistory,
}) => {
  const handleResume = (h: PlaybackHistoryItem) => {
    const media = allMedia.find((m) => m.id === h.mediaId) || {
      id: h.mediaId,
      title: h.title,
      artist: h.artist,
      type: h.type,
      src: '',
      duration: h.duration,
      dateAdded: '',
    };
    onResumeMedia(media, h.lastPosition);
  };

  return (
    <div className="w-full h-full bg-[#111116] flex flex-col p-6 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22202E] border border-[#3A364B] flex items-center justify-center text-[#A78BFA]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F3FA]">Playback History</h1>
            <p className="text-xs text-[#716C80]">Recently watched videos and played music</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24222C] hover:bg-rose-950/40 text-xs text-[#9994A8] hover:text-rose-400 border border-[#373340]/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 border border-dashed border-[#2B2836] rounded-2xl flex flex-col items-center justify-center text-[#716C80] p-8 text-center">
          <Clock className="w-12 h-12 mb-3 text-[#3B3848]" />
          <h3 className="text-sm font-semibold text-[#9994A8] mb-1">No playback history</h3>
          <p className="text-xs max-w-sm">
            Files you play will appear here with saved progress so you can resume anytime.
          </p>
        </div>
      ) : (
        <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl overflow-hidden divide-y divide-[#262430]">
          {history.map((h) => {
            const progress = h.duration > 0 ? (h.lastPosition / h.duration) * 100 : 0;
            return (
              <div
                key={h.mediaId}
                className="flex items-center justify-between p-4 hover:bg-[#24222C] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#16151D] border border-[#373340]/60 shrink-0 relative">
                    {h.thumbnail ? (
                      <img
                        src={h.thumbnail}
                        alt={h.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8B5CF6]">
                        {h.type === 'video' ? <Video className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#F5F3FA] truncate">
                      {h.title}
                    </div>
                    <div className="text-[11px] text-[#716C80] flex items-center gap-2 mt-0.5">
                      <span>Played {h.timestamp}</span>
                      <span>·</span>
                      <span className="font-mono text-[#A78BFA]">
                        Stopped at {formatTime(h.lastPosition)} / {formatTime(h.duration)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-48 h-1 bg-[#262430] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-[#8B5CF6] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleResume(h)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

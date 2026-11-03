import React from 'react';
import { X, Info, FileCode, Film, Music2, HardDrive, Clock } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';

interface MediaInfoModalProps {
  media: MediaItem | null;
  onClose: () => void;
}

export const MediaInfoModal: React.FC<MediaInfoModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const details = [
    { label: 'File Name', value: media.title, icon: FileCode },
    { label: 'Format / Type', value: media.type === 'video' ? 'Video Stream / Container' : 'Audio Track', icon: media.type === 'video' ? Film : Music2 },
    { label: 'Duration', value: formatTime(media.duration), icon: Clock },
    { label: 'Resolution', value: media.resolution || 'Standard Definition', icon: Film },
    { label: 'Video Codec', value: media.codec || 'H.264 / AVC Hardware Decoded', icon: Film },
    { label: 'Audio Codec', value: media.audioCodec || 'AAC-LC / Stereo', icon: Music2 },
    { label: 'Bitrate', value: media.bitrate || 'Estimated 8.5 Mbps', icon: HardDrive },
    { label: 'File Size', value: media.size || '342 MB', icon: HardDrive },
    { label: 'Folder Category', value: media.folder || 'Library Default', icon: Info },
    { label: 'Date Added', value: media.dateAdded || 'Recently Added', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1B1A22] border border-[#373340] rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#262430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2147] border border-[#4C3877] flex items-center justify-center text-[#8B5CF6]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F3FA]">Media Metadata & Codecs</h2>
              <p className="text-xs text-[#716C80]">Stream container and hardware decoding telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#14131A] border border-[#2B2836] rounded-2xl p-4 divide-y divide-[#262430] max-h-96 overflow-y-auto">
          {details.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#716C80]">
                  <Icon className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{d.label}</span>
                </div>
                <span className="font-mono text-[#F5F3FA] font-medium max-w-xs truncate text-right">
                  {d.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#262430]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

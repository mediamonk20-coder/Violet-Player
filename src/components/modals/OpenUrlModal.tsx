import React, { useState } from 'react';
import { X, Globe, Play, Radio } from 'lucide-react';
import { MediaItem } from '../../types/media';

interface OpenUrlModalProps {
  onPlayUrl: (media: MediaItem) => void;
  onClose: () => void;
}

export const OpenUrlModal: React.FC<OpenUrlModalProps> = ({ onPlayUrl, onClose }) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'video' | 'audio'>('video');
  const [title, setTitle] = useState('');

  const sampleStreams = [
    {
      title: 'Tears of Steel (4K Sci-Fi Stream)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      type: 'video' as const,
    },
    {
      title: 'Big Buck Bunny (1080p 60fps)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video' as const,
    },
    {
      title: 'Synthwave Night Radio (Audio Stream)',
      url: 'https://cdn.freesound.org/previews/612/612628_5674468-lq.mp3',
      type: 'audio' as const,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const mediaName = title.trim() || url.split('/').pop()?.split('?')[0] || 'Network Media Stream';

    const newMedia: MediaItem = {
      id: 'net-' + Math.random().toString(36).substring(2, 9),
      title: mediaName,
      type: type,
      src: url.trim(),
      duration: 3600,
      codec: type === 'video' ? 'Hardware Stream Decoded' : 'AAC / MP3 Stream',
      folder: 'Streams',
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onPlayUrl(newMedia);
    onClose();
  };

  const handleSelectSample = (sample: typeof sampleStreams[0]) => {
    setUrl(sample.url);
    setTitle(sample.title);
    setType(sample.type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1B1A22] border border-[#373340] rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2147] border border-[#4C3877] flex items-center justify-center text-[#8B5CF6]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F3FA]">Open Network Stream</h2>
              <p className="text-xs text-[#716C80]">Play HTTP, HTTPS, HLS m3u8, or online radio streams</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#9994A8] mb-1.5 block">
              Stream or File URL
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/live/stream.m3u8 or video.mp4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#14131A] border border-[#2B2836] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F3FA] placeholder-[#716C80] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#9994A8] mb-1.5 block">
                Stream Title (Optional)
              </label>
              <input
                type="text"
                placeholder="Custom title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#14131A] border border-[#2B2836] rounded-xl px-3.5 py-2 text-xs text-[#F5F3FA] placeholder-[#716C80] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9994A8] mb-1.5 block">
                Stream Media Type
              </label>
              <div className="flex rounded-xl bg-[#14131A] border border-[#2B2836] p-1">
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors ${
                    type === 'video' ? 'bg-[#8B5CF6] text-white' : 'text-[#9994A8]'
                  }`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setType('audio')}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors ${
                    type === 'audio' ? 'bg-[#8B5CF6] text-white' : 'text-[#9994A8]'
                  }`}
                >
                  Audio
                </button>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-xs font-semibold text-[#9994A8] mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Sample Test Streams</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {sampleStreams.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className="px-3 py-2 bg-[#24222C] hover:bg-[#2C2936] text-left text-xs rounded-xl flex items-center justify-between transition-colors border border-[#373340]/40 group"
                >
                  <span className="text-[#F5F3FA] group-hover:text-[#A78BFA] transition-colors truncate">
                    {s.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#16151E] text-[#9994A8]">
                    {s.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#262430]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9994A8] hover:text-[#F5F3FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

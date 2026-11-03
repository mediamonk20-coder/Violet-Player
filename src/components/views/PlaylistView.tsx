import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Download,
  Upload,
  Music,
  Video,
  GripVertical,
  Check,
} from 'lucide-react';
import { Playlist, MediaItem } from '../../types/media';
import { formatTime, generateM3U, parseM3U } from '../../utils/formatters';

interface PlaylistViewProps {
  playlists: Playlist[];
  allMedia: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
  onUpdatePlaylists: (playlists: Playlist[]) => void;
  onAddMediaItems: (items: MediaItem[]) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlists,
  allMedia,
  onPlayMedia,
  onUpdatePlaylists,
  onAddMediaItems,
}) => {
  const [activePlaylistId, setActivePlaylistId] = useState<string>(
    playlists[0]?.id || ''
  );
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];

  const playlistItems = activePlaylist
    ? activePlaylist.itemIds
        .map((id) => allMedia.find((m) => m.id === id))
        .filter((item): item is MediaItem => item !== undefined)
    : [];

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: 'pl-' + Math.random().toString(36).substring(2, 9),
      name: newPlaylistName.trim(),
      itemIds: [],
      createdDate: new Date().toISOString().split('T')[0],
    };
    const updated = [...playlists, newPl];
    onUpdatePlaylists(updated);
    setActivePlaylistId(newPl.id);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter((p) => p.id !== id);
    onUpdatePlaylists(updated);
    if (activePlaylistId === id && updated.length > 0) {
      setActivePlaylistId(updated[0].id);
    }
  };

  const handleRemoveTrack = (itemId: string) => {
    if (!activePlaylist) return;
    const updatedPl = {
      ...activePlaylist,
      itemIds: activePlaylist.itemIds.filter((id) => id !== itemId),
    };
    onUpdatePlaylists(playlists.map((p) => (p.id === activePlaylist.id ? updatedPl : p)));
  };

  const handleExportM3U = () => {
    if (!activePlaylist || playlistItems.length === 0) return;
    const m3uContent = generateM3U(playlistItems);
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlaylist.name.toLowerCase().replace(/\s+/g, '_')}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportM3U = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseM3U(text);
        if (parsed.length > 0) {
          const newItems: MediaItem[] = parsed.map((p, idx) => ({
            id: 'imp-' + Math.random().toString(36).substring(2, 9),
            title: p.title,
            type: p.src.endsWith('.mp4') || p.src.endsWith('.mkv') ? 'video' : 'audio',
            src: p.src,
            duration: p.duration || 180,
            dateAdded: new Date().toISOString().split('T')[0],
          }));

          onAddMediaItems(newItems);

          const newPl: Playlist = {
            id: 'pl-' + Math.random().toString(36).substring(2, 9),
            name: file.name.replace(/\.[^/.]+$/, ''),
            itemIds: newItems.map((item) => item.id),
            createdDate: new Date().toISOString().split('T')[0],
          };

          onUpdatePlaylists([...playlists, newPl]);
          setActivePlaylistId(newPl.id);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full bg-[#111116] flex p-6 gap-6 select-none overflow-hidden">
      {/* Left Column: Playlists List */}
      <div className="w-72 bg-[#1B1A22] border border-[#2B2836] rounded-2xl flex flex-col p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5F3FA]">
            <ListMusic className="w-4 h-4 text-[#8B5CF6]" />
            <span>Playlists</span>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1.5 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-lg transition-colors"
            title="Create New Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Creation Box */}
        {isCreating && (
          <div className="mb-3 p-2 bg-[#24222C] border border-[#373340] rounded-xl flex items-center gap-2">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              className="bg-transparent text-xs text-[#F5F3FA] focus:outline-none flex-1 placeholder-[#716C80]"
              autoFocus
            />
            <button
              onClick={handleCreatePlaylist}
              className="p-1 bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED]"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {playlists.map((pl) => {
            const isActive = pl.id === activePlaylist?.id;
            return (
              <div
                key={pl.id}
                onClick={() => setActivePlaylistId(pl.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#352554] text-[#F5F3FA] shadow-sm'
                    : 'text-[#9994A8] hover:bg-[#24222C] hover:text-[#F5F3FA]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">{pl.name}</div>
                  <div className="text-[11px] text-[#716C80]">
                    {pl.itemIds.length} {pl.itemIds.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {playlists.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id);
                    }}
                    className="p-1 text-[#716C80] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Import Playlist file */}
        <div className="pt-3 border-t border-[#262430]">
          <label className="flex items-center justify-center gap-2 w-full py-2 bg-[#24222C] hover:bg-[#2D2A38] text-xs font-medium text-[#9994A8] hover:text-[#F5F3FA] rounded-xl cursor-pointer transition-colors border border-[#373340]/60">
            <Upload className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Import M3U / M3U8</span>
            <input
              type="file"
              accept=".m3u,.m3u8"
              onChange={handleImportM3U}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Right Column: Playlist Tracks */}
      <div className="flex-1 bg-[#1B1A22] border border-[#2B2836] rounded-2xl flex flex-col p-6 overflow-hidden">
        {activePlaylist ? (
          <>
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262430] mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#F5F3FA] mb-1">
                  {activePlaylist.name}
                </h2>
                <p className="text-xs text-[#716C80]">
                  {playlistItems.length} media items · Created {activePlaylist.createdDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {playlistItems.length > 0 && (
                  <>
                    <button
                      onClick={() => onPlayMedia(playlistItems[0])}
                      className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play All</span>
                    </button>

                    <button
                      onClick={handleExportM3U}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#24222C] hover:bg-[#322F3D] text-[#F5F3FA] rounded-xl text-xs font-medium transition-colors border border-[#373340]/60"
                      title="Export to M3U format"
                    >
                      <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Export M3U</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#262430]">
              {playlistItems.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-[#716C80]">
                  <ListMusic className="w-10 h-10 mb-2 text-[#474355]" />
                  <p className="text-xs">This playlist is empty. Add items from the Library.</p>
                </div>
              ) : (
                playlistItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => onPlayMedia(item)}
                    className="flex items-center justify-between py-3 px-3 hover:bg-[#24222C] rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <span className="text-xs font-mono text-[#716C80] w-6 text-center">
                        {index + 1}
                      </span>

                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#16151D] shrink-0 border border-[#373340]/50 relative">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8B5CF6]">
                            {item.type === 'video' ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F5F3FA] group-hover:text-[#A78BFA] transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#716C80] truncate">
                          {item.artist || item.folder || item.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs text-[#9994A8]">
                        {formatTime(item.duration)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrack(item.id);
                        }}
                        className="p-1 text-[#716C80] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#716C80] text-xs">
            Select or create a playlist
          </div>
        )}
      </div>
    </div>
  );
};

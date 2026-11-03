import React, { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Folder,
  Play,
  MoreVertical,
  Plus,
  Upload,
  Heart,
  Clock,
  Music,
  Video,
  Info,
  ListPlus,
  Trash2,
} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';

interface LibraryViewProps {
  mediaItems: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenMediaInfo: (item: MediaItem) => void;
  onAddFiles: (files: FileList) => void;
  onDeleteMedia: (id: string) => void;
  onAddToQueue: (item: MediaItem) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  mediaItems,
  onPlayMedia,
  onToggleFavorite,
  onOpenMediaInfo,
  onAddFiles,
  onDeleteMedia,
  onAddToQueue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'videos' | 'audio'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Compute folder counts
  const folders = [
    { name: 'Movies', count: mediaItems.filter((m) => m.folder === 'Movies').length || 12 },
    { name: 'Music', count: mediaItems.filter((m) => m.folder === 'Music').length || 48 },
    { name: 'Projects', count: mediaItems.filter((m) => m.folder === 'Projects').length || 6 },
  ];

  // Filter items
  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.album && item.album.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all' ||
      (filterType === 'videos' && item.type === 'video') ||
      (filterType === 'audio' && item.type === 'audio');

    const matchesFolder = !selectedFolder || item.folder === selectedFolder;

    return matchesSearch && matchesType && matchesFolder;
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  return (
    <div className="w-full h-full bg-[#111116] flex flex-col p-6 overflow-y-auto select-none">
      {/* Header controls: Search & View Toggles */}
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#716C80] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1B1A22] border border-[#2B2836] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F3FA] placeholder-[#716C80] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#716C80] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action buttons: Import & View Mode */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-[#24222C] hover:bg-[#322F3D] text-[#F5F3FA] rounded-xl text-xs font-medium cursor-pointer transition-colors border border-[#373340]/60">
            <Upload className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Add Files</span>
            <input
              type="file"
              multiple
              accept="video/*,audio/*,.mkv,.mp4,.webm,.avi,.mov,.mp3,.wav,.flac,.ogg,.m4a"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-[#24222C] hover:bg-[#322F3D] text-[#F5F3FA] rounded-xl text-xs font-medium cursor-pointer transition-colors border border-[#373340]/60">
            <Folder className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Add Folder</span>
            <input
              type="file"
              // @ts-expect-error webkitdirectory is standard for folder picking
              webkitdirectory="true"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          <div className="flex items-center bg-[#1B1A22] border border-[#2B2836] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#352554] text-[#A78BFA]' : 'text-[#716C80] hover:text-[#F5F3FA]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#352554] text-[#A78BFA]' : 'text-[#716C80] hover:text-[#F5F3FA]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs matching visual reference */}
      <div className="flex items-center gap-2 mb-6 shrink-0">
        {(['all', 'videos', 'audio'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterType === type
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                : 'text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1B1A22]'
            }`}
          >
            {type}
          </button>
        ))}

        {selectedFolder && (
          <div className="flex items-center gap-1.5 ml-3 px-3 py-1 bg-[#2C243D] border border-[#8B5CF6]/40 rounded-xl text-xs text-[#E9D5FF]">
            <span>Folder: {selectedFolder}</span>
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-xs hover:text-white ml-1 font-bold"
              title="Clear folder filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Folders Row matching visual reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 shrink-0">
        {folders.map((folder) => {
          const isSelected = selectedFolder === folder.name;
          return (
            <div
              key={folder.name}
              onClick={() => setSelectedFolder(isSelected ? null : folder.name)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 group ${
                isSelected
                  ? 'bg-[#2E2248] border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20'
                  : 'bg-[#1B1A22] border-[#2B2836] hover:bg-[#24222C] hover:border-[#3E3A4D]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#2D2147] border border-[#4C3A73] flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform shrink-0">
                <Folder className="w-6 h-6 fill-[#8B5CF6]/40 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F5F3FA] group-hover:text-white transition-colors">
                  {folder.name}
                </div>
                <div className="text-xs text-[#716C80]">
                  {folder.count} items
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Items Area */}
      <div className="flex-1">
        {filteredItems.length === 0 ? (
          <div className="w-full h-48 border border-dashed border-[#2B2836] rounded-2xl flex flex-col items-center justify-center text-[#716C80] p-6 text-center">
            <Folder className="w-10 h-10 mb-2 text-[#474355]" />
            <div className="text-sm font-medium text-[#9994A8] mb-1">No media files found</div>
            <div className="text-xs">Drag and drop audio/video files here or click Add Files</div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View matching visual reference cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#1B1A22] border border-[#2B2836] hover:border-[#3E3A4D] rounded-2xl overflow-hidden group hover:bg-[#24222C] transition-all flex flex-col relative"
              >
                {/* Media Thumbnail Container */}
                <div
                  onClick={() => onPlayMedia(item)}
                  className="aspect-video w-full bg-[#16151D] relative overflow-hidden cursor-pointer"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2D2147] to-[#16151D] text-[#8B5CF6]">
                      {item.type === 'video' ? (
                        <Video className="w-8 h-8" />
                      ) : (
                        <Music className="w-8 h-8" />
                      )}
                    </div>
                  )}

                  {/* Play Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-lg shadow-[#8B5CF6]/50">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-white">
                    {formatTime(item.duration)}
                  </div>
                </div>

                {/* Card Info & Menu */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div
                      onClick={() => onPlayMedia(item)}
                      className="text-xs font-semibold text-[#F5F3FA] truncate cursor-pointer hover:text-[#A78BFA] transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#716C80] truncate">
                      {item.artist || item.folder || (item.type === 'video' ? 'Video' : 'Audio')}
                    </div>
                  </div>

                  {/* Context Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      className="p-1 text-[#716C80] hover:text-[#F5F3FA] rounded-md transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === item.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-8 right-0 bg-[#1E1D27] border border-[#373340] rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 w-40 z-50 text-xs"
                      >
                        <button
                          onClick={() => {
                            onPlayMedia(item);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1.5 text-left text-[#F5F3FA] hover:bg-[#2C2936] rounded-md flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>Play</span>
                        </button>
                        <button
                          onClick={() => {
                            onAddToQueue(item);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1.5 text-left text-[#F5F3FA] hover:bg-[#2C2936] rounded-md flex items-center gap-2"
                        >
                          <ListPlus className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>Queue Next</span>
                        </button>
                        <button
                          onClick={() => {
                            onToggleFavorite(item.id);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1.5 text-left text-[#F5F3FA] hover:bg-[#2C2936] rounded-md flex items-center gap-2"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>{item.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenMediaInfo(item);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1.5 text-left text-[#F5F3FA] hover:bg-[#2C2936] rounded-md flex items-center gap-2"
                        >
                          <Info className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteMedia(item.id);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1.5 text-left text-rose-400 hover:bg-[#2C2936] rounded-md flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl overflow-hidden divide-y divide-[#262430]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onPlayMedia(item)}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#24222C] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#24222C] shrink-0 border border-[#373340]/60 relative">
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
                    <div className="text-xs font-semibold text-[#F5F3FA] truncate group-hover:text-[#A78BFA] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#716C80] truncate">
                      {item.artist || item.folder || item.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs text-[#9994A8]">
                  <span className="hidden sm:inline font-mono text-[11px] text-[#716C80]">
                    {item.resolution || item.codec || 'Standard'}
                  </span>
                  <span className="font-mono text-xs text-[#F5F3FA]">
                    {formatTime(item.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-1 transition-colors ${
                      item.isFavorite ? 'text-[#8B5CF6]' : 'text-[#555064] hover:text-[#F5F3FA]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#8B5CF6]' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

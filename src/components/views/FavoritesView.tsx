import React from 'react';
import { Heart, Play, Video, Music } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime } from '../../utils/formatters';

interface FavoritesViewProps {
  mediaItems: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  mediaItems,
  onPlayMedia,
  onToggleFavorite,
}) => {
  const favorites = mediaItems.filter((m) => m.isFavorite);

  return (
    <div className="w-full h-full bg-[#111116] flex flex-col p-6 overflow-y-auto select-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#2E204A] border border-[#523A7E] flex items-center justify-center text-[#8B5CF6]">
          <Heart className="w-5 h-5 fill-[#8B5CF6]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F5F3FA]">Favorites</h1>
          <p className="text-xs text-[#716C80]">{favorites.length} starred media items</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex-1 border border-dashed border-[#2B2836] rounded-2xl flex flex-col items-center justify-center text-[#716C80] p-8 text-center">
          <Heart className="w-12 h-12 mb-3 text-[#3B3848]" />
          <h3 className="text-sm font-semibold text-[#9994A8] mb-1">No favorites yet</h3>
          <p className="text-xs max-w-sm">
            Click the heart icon on any video or audio file to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              onClick={() => onPlayMedia(item)}
              className="bg-[#1B1A22] border border-[#2B2836] hover:border-[#3E3A4D] rounded-2xl overflow-hidden group hover:bg-[#24222C] transition-all cursor-pointer flex flex-col"
            >
              <div className="aspect-video w-full bg-[#16151D] relative overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8B5CF6]">
                    {item.type === 'video' ? <Video className="w-8 h-8" /> : <Music className="w-8 h-8" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-lg shadow-[#8B5CF6]/50">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-white">
                  {formatTime(item.duration)}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F5F3FA] truncate group-hover:text-[#A78BFA] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#716C80] truncate">
                    {item.artist || item.folder || item.type}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="p-1 text-[#8B5CF6] hover:text-white transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

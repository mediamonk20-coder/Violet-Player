import React from 'react';
import { Home, Video, Music, ListMusic, FolderArchive, Heart, Clock, Settings, Play } from 'lucide-react';

export type ViewType = 'home' | 'videos' | 'audio' | 'playlist' | 'library' | 'favorites' | 'history' | 'settings' | 'video_player';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed = false,
}) => {
  const navItems: { id: ViewType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'playlist', label: 'Playlist', icon: ListMusic },
    { id: 'library', label: 'Library', icon: FolderArchive },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-[#14131A] border-r border-[#262430] flex flex-col justify-between p-3 select-none transition-all duration-200 shrink-0`}
    >
      <div className="flex flex-col gap-6">
        {/* Violet App Header in Sidebar */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 shrink-0">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#F5F3FA] leading-tight tracking-tight">
                Violet
              </span>
              <span className="text-[11px] text-[#9994A8] leading-tight">
                Media Player
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#352554] text-[#F5F3FA] font-semibold shadow-sm shadow-[#8B5CF6]/20'
                    : 'text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1E1D27]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#A78BFA]' : 'text-[#9994A8]'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings Button */}
      <div className="pt-4 border-t border-[#262430]">
        <button
          onClick={() => onSelectView('settings')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeView === 'settings'
              ? 'bg-[#352554] text-[#F5F3FA] font-semibold'
              : 'text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1E1D27]'
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings
            className={`w-4 h-4 shrink-0 ${
              activeView === 'settings' ? 'text-[#A78BFA]' : 'text-[#9994A8]'
            }`}
          />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { Minus, Square, X, Play, FolderOpen, Globe, Keyboard, HelpCircle } from 'lucide-react';

interface WindowFrameProps {
  currentTitle?: string;
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onOpenShortcuts: () => void;
  onToggleMiniPlayer: () => void;
  isMiniPlayer: boolean;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  currentTitle,
  onOpenFile,
  onOpenUrl,
  onOpenShortcuts,
  onToggleMiniPlayer,
  isMiniPlayer,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <header className="h-10 bg-[#16151D] border-b border-[#2B2836] flex items-center justify-between px-3 select-none z-50 shrink-0">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-sm shadow-[#8B5CF6]/30">
          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-[#F5F3FA] whitespace-nowrap">
          Violet Media Player
        </span>
        {currentTitle && (
          <>
            <span className="text-[#4E4A5C] text-xs">/</span>
            <span className="text-xs text-[#9994A8] max-w-xs truncate font-medium">
              {currentTitle}
            </span>
          </>
        )}
      </div>

      {/* Center quick actions */}
      <div className="hidden sm:flex items-center gap-1.5">
        <button
          onClick={onOpenFile}
          title="Open Media File (Ctrl+O)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-md transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open File</span>
        </button>

        <button
          onClick={onOpenUrl}
          title="Open Network Stream (Ctrl+U)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-md transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Open URL</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="p-1 text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#24222C] rounded-md transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Windows Window Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMiniPlayer}
          title={isMiniPlayer ? 'Exit Mini Player' : 'Float Mini Player'}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            isMiniPlayer ? 'bg-[#8B5CF6] text-white' : 'text-[#9994A8] hover:bg-[#24222C]'
          }`}
        >
          Mini
        </button>

        <button
          onClick={() => {}}
          title="Minimize"
          className="w-8 h-7 flex items-center justify-center text-[#9994A8] hover:bg-[#24222C] hover:text-[#F5F3FA] rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
          className="w-8 h-7 flex items-center justify-center text-[#9994A8] hover:bg-[#24222C] hover:text-[#F5F3FA] rounded transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>

        <button
          onClick={() => {}}
          title="Close"
          className="w-8 h-7 flex items-center justify-center text-[#9994A8] hover:bg-rose-600 hover:text-white rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

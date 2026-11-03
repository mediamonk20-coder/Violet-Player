import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcutGroups = [
    {
      category: 'Playback Controls',
      items: [
        { key: 'Space', desc: 'Play / Pause' },
        { key: 'S', desc: 'Stop playback' },
        { key: 'Left / Right', desc: 'Seek backward / forward (5s)' },
        { key: 'Ctrl + Left / Right', desc: 'Previous / Next track' },
        { key: 'F', desc: 'Toggle Fullscreen' },
        { key: 'Esc', desc: 'Exit Fullscreen' },
      ],
    },
    {
      category: 'Audio & Speed',
      items: [
        { key: 'Up / Down', desc: 'Volume up / down 5%' },
        { key: 'M', desc: 'Toggle Mute' },
        { key: ']', desc: 'Increase speed (+0.25x)' },
        { key: '[', desc: 'Decrease speed (-0.25x)' },
        { key: 'Backspace', desc: 'Reset speed to 1.0x' },
        { key: 'E', desc: 'Open 10-Band Equalizer' },
      ],
    },
    {
      category: 'Navigation & Subtitles',
      items: [
        { key: 'Ctrl + O', desc: 'Open media file' },
        { key: 'Ctrl + U', desc: 'Open network stream URL' },
        { key: 'Ctrl + P', desc: 'Open Playlists view' },
        { key: 'Ctrl + ,', desc: 'Open Settings' },
        { key: 'Z / X', desc: 'Subtitle delay -50ms / +50ms' },
        { key: 'A', desc: 'Set / Clear A-B repeat loop' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1B1A22] border border-[#373340] rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#262430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2147] border border-[#4C3877] flex items-center justify-center text-[#8B5CF6]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F3FA]">Windows Desktop Keyboard Shortcuts</h2>
              <p className="text-xs text-[#716C80]">Master media playback with native keyboard hotkeys</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="flex flex-col gap-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-[#9994A8]">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-[#24222C] border border-[#373340] font-mono text-[11px] text-[#F5F3FA] shadow-xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#262430]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

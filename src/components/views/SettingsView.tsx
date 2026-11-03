import React, { useState, useEffect } from 'react';
import {
  Settings,
  Monitor,
  Play,
  Type,
  Cpu,
  FileText,
  Download,
  Trash2,
  Check,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { PlayerSettings } from '../../types/media';
import { logger } from '../../services/logger';

interface SettingsViewProps {
  settings: PlayerSettings;
  onUpdateSettings: (settings: PlayerSettings) => void;
  onResetSettings: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'playback' | 'interface' | 'subtitles' | 'diagnostics'>('general');
  const [logs, setLogs] = useState(logger.getLogs());

  useEffect(() => {
    const unsub = logger.subscribe((newLogs) => setLogs([...newLogs]));
    return () => unsub();
  }, []);

  const handleExportLogs = () => {
    const content = logger.exportLogs();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violet_diagnostic_logs_${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const accentColors = [
    { name: 'Classic Violet', value: '#8B5CF6' },
    { name: 'Electric Purple', value: '#A855F7' },
    { name: 'Deep Indigo', value: '#6366F1' },
    { name: 'Amethyst Night', value: '#7C3AED' },
  ];

  return (
    <div className="w-full h-full bg-[#111116] flex flex-col p-6 overflow-y-auto select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#252230] border border-[#3C374D] flex items-center justify-center text-[#8B5CF6]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F3FA]">Player Settings</h1>
            <p className="text-xs text-[#716C80]">Configure playback, hardware acceleration, and UI</p>
          </div>
        </div>

        <button
          onClick={onResetSettings}
          className="px-3 py-1.5 rounded-xl bg-[#24222C] hover:bg-[#322F3D] text-xs text-[#9994A8] hover:text-[#F5F3FA] border border-[#373340]/60 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#262430] pb-2">
        {[
          { id: 'general', label: 'General', icon: Monitor },
          { id: 'playback', label: 'Playback', icon: Play },
          { id: 'interface', label: 'Interface', icon: Monitor },
          { id: 'subtitles', label: 'Subtitles', icon: Type },
          { id: 'diagnostics', label: 'Performance & Logs', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#352554] text-[#F5F3FA]'
                  : 'text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#1B1A22]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B5CF6]' : 'text-[#716C80]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 max-w-3xl">
        {activeTab === 'general' && (
          <div className="flex flex-col gap-6">
            {/* Theme Accent */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F5F3FA] mb-1">Theme Accent Color</h3>
              <p className="text-xs text-[#716C80] mb-4">Choose the primary violet accent hue for controls</p>
              <div className="flex items-center gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onUpdateSettings({ ...settings, themeAccent: color.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      settings.themeAccent === color.value
                        ? 'bg-[#2E204A] border-[#8B5CF6] text-white'
                        : 'bg-[#24222C] border-[#373340] text-[#9994A8] hover:border-[#524C5E]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.value }} />
                    <span>{color.name}</span>
                    {settings.themeAccent === color.value && <Check className="w-3.5 h-3.5 ml-1 text-[#A78BFA]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Startup Behavior */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F3FA] mb-1">Resume Playback Position</h3>
                <p className="text-xs text-[#716C80]">
                  Automatically restore last played timestamp when opening unfinished videos
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.resumePlayback}
                onChange={(e) => onUpdateSettings({ ...settings, resumePlayback: e.target.checked })}
                className="w-5 h-5 accent-[#8B5CF6] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'playback' && (
          <div className="flex flex-col gap-6">
            {/* Default Speed */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F5F3FA] mb-1">Default Playback Speed</h3>
              <p className="text-xs text-[#716C80] mb-3">Playback speed applied when starting new media</p>
              <div className="flex items-center gap-2">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onUpdateSettings({ ...settings, defaultSpeed: speed })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                      settings.defaultSpeed === speed
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : 'bg-[#24222C] border-[#373340] text-[#9994A8] hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Acceleration Status */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F5F3FA]">Hardware-Accelerated Decoding</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>D3D11 Active</span>
                  </span>
                </div>
                <p className="text-xs text-[#716C80] mt-1">
                  Enables GPU decoding (D3D11VA/DXVA2) to minimize CPU usage during 4K/HEVC playback
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.hardwareAcceleration}
                onChange={(e) => onUpdateSettings({ ...settings, hardwareAcceleration: e.target.checked })}
                className="w-5 h-5 accent-[#8B5CF6] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'interface' && (
          <div className="flex flex-col gap-6">
            {/* Visualizer Type */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F5F3FA] mb-1">Audio Visualizer Mode</h3>
              <p className="text-xs text-[#716C80] mb-3">Visualization displayed during audio playback</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['wave', 'bars', 'spectrum', 'off'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdateSettings({ ...settings, visualizerType: type })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      settings.visualizerType === type
                        ? 'bg-[#352554] border-[#8B5CF6] text-white'
                        : 'bg-[#24222C] border-[#373340] text-[#9994A8] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subtitles' && (
          <div className="flex flex-col gap-6">
            {/* Subtitle Font Size */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#F5F3FA]">Subtitle Font Size</h3>
                <span className="text-xs font-mono text-[#A78BFA]">{settings.subtitleFontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="36"
                step="2"
                value={settings.subtitleFontSize}
                onChange={(e) => onUpdateSettings({ ...settings, subtitleFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-[#8B5CF6]"
              />
            </div>

            {/* Subtitle Delay Offset */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#F5F3FA]">Default Subtitle Delay Offset</h3>
                <span className="text-xs font-mono text-[#A78BFA]">{settings.subtitleDelay > 0 ? `+${settings.subtitleDelay}s` : `${settings.subtitleDelay}s`}</span>
              </div>
              <p className="text-xs text-[#716C80] mb-3">Adjust subtitle synchronization timing (-5.0s to +5.0s)</p>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={settings.subtitleDelay}
                onChange={(e) => onUpdateSettings({ ...settings, subtitleDelay: parseFloat(e.target.value) })}
                className="w-full accent-[#8B5CF6]"
              />
            </div>

            {/* Background box */}
            <div className="bg-[#1B1A22] border border-[#2B2836] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F3FA]">Subtitle Background Scrim</h3>
                <p className="text-xs text-[#716C80]">Render semi-transparent dark backdrop behind subtitles for enhanced readability</p>
              </div>
              <input
                type="checkbox"
                checked={settings.subtitleBg}
                onChange={(e) => onUpdateSettings({ ...settings, subtitleBg: e.target.checked })}
                className="w-5 h-5 accent-[#8B5CF6] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F3FA]">Diagnostic Event Logs</h3>
                <p className="text-xs text-[#716C80]">Real-time hardware decoding, WASAPI audio, and playback telemetry</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Diagnostic Logs</span>
                </button>
                <button
                  onClick={() => logger.clear()}
                  className="p-1.5 bg-[#24222C] hover:bg-[#322F3D] text-[#9994A8] rounded-xl transition-colors border border-[#373340]/60"
                  title="Clear logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Logs Terminal Window */}
            <div className="bg-[#0F0E14] border border-[#262430] rounded-2xl p-4 font-mono text-xs text-[#9994A8] h-80 overflow-y-auto space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#555064] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold shrink-0 ${
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : log.category === 'SYSTEM'
                        ? 'text-[#A78BFA]'
                        : 'text-emerald-400'
                    }`}
                  >
                    [{log.category}]
                  </span>
                  <span className="text-[#E2DFEB]">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

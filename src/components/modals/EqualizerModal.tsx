import React from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { EqualizerState } from '../../types/media';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../../services/audioEngine';

interface EqualizerModalProps {
  equalizer: EqualizerState;
  onUpdateEqualizer: (eq: EqualizerState) => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  equalizer,
  onUpdateEqualizer,
  onClose,
}) => {
  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...equalizer.bands];
    newBands[index] = gain;
    onUpdateEqualizer({
      ...equalizer,
      preset: 'custom',
      bands: newBands,
    });
  };

  const handleSelectPreset = (presetKey: string) => {
    const p = EQ_PRESETS[presetKey];
    if (p) {
      onUpdateEqualizer({
        ...equalizer,
        preset: presetKey,
        bands: [...p.bands],
        preamp: p.preamp,
        bassBoost: p.bassBoost,
        treble: p.treble,
      });
    }
  };

  const handleReset = () => {
    handleSelectPreset('flat');
  };

  const formatFreq = (hz: number) => {
    return hz >= 1000 ? `${hz / 1000}k` : `${hz}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1B1A22] border border-[#373340] rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2147] border border-[#4C3877] flex items-center justify-center text-[#8B5CF6]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F3FA]">10-Band Graphic Equalizer</h2>
              <p className="text-xs text-[#716C80]">Fine-tune acoustics with zero phase distortion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Enable switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#9994A8]">
              <span>EQ Active</span>
              <input
                type="checkbox"
                checked={equalizer.enabled}
                onChange={(e) => onUpdateEqualizer({ ...equalizer, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#8B5CF6] rounded"
              />
            </label>

            <button
              onClick={onClose}
              className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div>
          <div className="text-xs font-semibold text-[#9994A8] mb-2">Preset Profile</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EQ_PRESETS).map((key) => {
              const isSelected = equalizer.preset === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    isSelected
                      ? 'bg-[#8B5CF6] text-white shadow-sm shadow-[#8B5CF6]/30'
                      : 'bg-[#24222C] text-[#9994A8] hover:text-[#F5F3FA] hover:bg-[#2F2C3A]'
                  }`}
                >
                  {EQ_PRESETS[key].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10 Vertical Band Sliders */}
        <div className="bg-[#14131A] border border-[#2B2836] rounded-2xl p-5 flex items-center justify-between gap-2">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = equalizer.bands[idx] ?? 0;
            return (
              <div key={freq} className="flex flex-col items-center gap-3 flex-1">
                {/* dB value */}
                <span className="text-[10px] font-mono font-semibold text-[#A78BFA] h-4">
                  {gain > 0 ? `+${gain}` : gain}
                </span>

                {/* Vertical slider wrapper */}
                <div className="h-36 flex items-center justify-center relative">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={gain}
                    onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                    className="w-32 h-1.5 accent-[#8B5CF6] bg-[#262430] rounded-full -rotate-90 origin-center cursor-pointer"
                    title={`${freq}Hz: ${gain}dB`}
                  />
                </div>

                {/* Frequency Label */}
                <span className="text-[11px] font-mono text-[#716C80] font-medium">
                  {formatFreq(freq)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Tone Adjustments: Preamp, Bass Boost, Treble */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Preamp</span>
              <span className="font-mono text-[#A78BFA]">{equalizer.preamp > 0 ? `+${equalizer.preamp}` : equalizer.preamp} dB</span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={equalizer.preamp}
              onChange={(e) => onUpdateEqualizer({ ...equalizer, preamp: parseFloat(e.target.value) })}
              className="w-full accent-[#8B5CF6]"
            />
          </div>

          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Bass Boost</span>
              <span className="font-mono text-[#A78BFA]">+{equalizer.bassBoost} dB</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={equalizer.bassBoost}
              onChange={(e) => onUpdateEqualizer({ ...equalizer, bassBoost: parseFloat(e.target.value) })}
              className="w-full accent-[#8B5CF6]"
            />
          </div>

          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Treble</span>
              <span className="font-mono text-[#A78BFA]">{equalizer.treble > 0 ? `+${equalizer.treble}` : equalizer.treble} dB</span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={equalizer.treble}
              onChange={(e) => onUpdateEqualizer({ ...equalizer, treble: parseFloat(e.target.value) })}
              className="w-full accent-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#262430]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Flat</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

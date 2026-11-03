import React from 'react';
import { X, Sliders, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ZoomIn } from 'lucide-react';
import { VideoAdjustments } from '../../types/media';

interface VideoAdjustmentsModalProps {
  adjustments: VideoAdjustments;
  onUpdateAdjustments: (adj: VideoAdjustments) => void;
  onClose: () => void;
  onReset: () => void;
}

export const VideoAdjustmentsModal: React.FC<VideoAdjustmentsModalProps> = ({
  adjustments,
  onUpdateAdjustments,
  onClose,
  onReset,
}) => {
  const aspectRatios = [
    { id: 'auto', label: 'Auto' },
    { id: 'original', label: 'Original' },
    { id: '16:9', label: '16:9' },
    { id: '4:3', label: '4:3' },
    { id: '21:9', label: '21:9 (Ultrawide)' },
    { id: '1:1', label: '1:1' },
    { id: 'fill', label: 'Stretch Fill' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#1B1A22] border border-[#373340] rounded-3xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D2147] border border-[#4C3877] flex items-center justify-center text-[#8B5CF6]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F3FA]">Video Adjustments & Geometry</h2>
              <p className="text-xs text-[#716C80]">GPU-accelerated color grading and viewport transformation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#716C80] hover:text-[#F5F3FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div>
          <div className="text-xs font-semibold text-[#9994A8] mb-2">Aspect Ratio</div>
          <div className="flex flex-wrap gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.id}
                onClick={() =>
                  onUpdateAdjustments({
                    ...adjustments,
                    aspectRatio: ar.id as VideoAdjustments['aspectRatio'],
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  adjustments.aspectRatio === ar.id
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#24222C] text-[#9994A8] hover:text-[#F5F3FA]'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Brightness, Contrast, Saturation, Gamma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Brightness</span>
              <span className="font-mono text-[#A78BFA]">{adjustments.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={adjustments.brightness}
              onChange={(e) =>
                onUpdateAdjustments({ ...adjustments, brightness: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#8B5CF6]"
            />
          </div>

          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Contrast</span>
              <span className="font-mono text-[#A78BFA]">{adjustments.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={adjustments.contrast}
              onChange={(e) =>
                onUpdateAdjustments({ ...adjustments, contrast: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#8B5CF6]"
            />
          </div>

          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Saturation</span>
              <span className="font-mono text-[#A78BFA]">{adjustments.saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="2"
              value={adjustments.saturation}
              onChange={(e) =>
                onUpdateAdjustments({ ...adjustments, saturation: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#8B5CF6]"
            />
          </div>

          <div className="bg-[#24222C] border border-[#373340]/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9994A8] mb-1.5">
              <span>Gamma / Hue</span>
              <span className="font-mono text-[#A78BFA]">{adjustments.gamma}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={adjustments.gamma}
              onChange={(e) =>
                onUpdateAdjustments({ ...adjustments, gamma: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Zoom & Geometry transforms */}
        <div className="bg-[#14131A] border border-[#2B2836] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3FA]">
              <ZoomIn className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Zoom & Pan</span>
            </div>
            <span className="text-xs font-mono text-[#A78BFA]">
              {adjustments.zoom.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={adjustments.zoom}
            onChange={(e) =>
              onUpdateAdjustments({ ...adjustments, zoom: parseFloat(e.target.value) })
            }
            className="w-full accent-[#8B5CF6]"
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() =>
                onUpdateAdjustments({
                  ...adjustments,
                  rotation: (adjustments.rotation + 90) % 360,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24222C] hover:bg-[#322F3D] text-xs font-medium text-[#F5F3FA] rounded-xl border border-[#373340]/60 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Rotate 90° ({adjustments.rotation}°)</span>
            </button>

            <button
              onClick={() =>
                onUpdateAdjustments({
                  ...adjustments,
                  flipH: !adjustments.flipH,
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                adjustments.flipH
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                  : 'bg-[#24222C] text-[#9994A8] border-[#373340]/60 hover:text-white'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip H</span>
            </button>

            <button
              onClick={() =>
                onUpdateAdjustments({
                  ...adjustments,
                  flipV: !adjustments.flipV,
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                adjustments.flipV
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                  : 'bg-[#24222C] text-[#9994A8] border-[#373340]/60 hover:text-white'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip V</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#262430]">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-[#9994A8] hover:text-[#F5F3FA] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Adjustments</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#8B5CF6]/30 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

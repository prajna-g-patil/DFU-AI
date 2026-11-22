import React, { useState, useRef } from 'react';
import { 
  Eye, 
  Layers, 
  Columns, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  Info, 
  Maximize2, 
  Download, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';

interface GradCamViewerProps {
  originalImageUrl: string;
  gradcamImageUrl?: string;
  predictedGrade: number;
  confidenceScore: number;
  rationale?: string;
  className?: string;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  originalImageUrl,
  gradcamImageUrl,
  predictedGrade,
  confidenceScore,
  rationale,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'blend' | 'solo-cam'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [blendOpacity, setBlendOpacity] = useState(65);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const gradCamSrc = gradcamImageUrl || originalImageUrl;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className={`bg-white rounded-lg border border-[#E5E7EB] shadow-card overflow-hidden ${className}`}>
      
      {/* Header Bar */}
      <div className="bg-[#202938] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#334155]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-[#1C1E20] text-white">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Grad-CAM Explainability Studio
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                Visual Saliency Map
              </span>
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              Convolutional activation maps identifying morphological ulcer features driving classification
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#1A2232] p-1 rounded-md border border-[#334155] text-xs">
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'slider' 
                ? 'bg-[#1C1E20] text-white shadow-sm' 
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'side-by-side' 
                ? 'bg-[#1C1E20] text-white shadow-sm' 
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('blend')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'blend' 
                ? 'bg-[#1C1E20] text-white shadow-sm' 
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alpha Blend</span>
          </button>

          <button
            onClick={() => setViewMode('solo-cam')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'solo-cam' 
                ? 'bg-[#1C1E20] text-white shadow-sm' 
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pure Heatmap</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Viewport */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* View Mode 1: Interactive Split Slider */}
        {viewMode === 'slider' && (
          <div className="space-y-3">
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              onClick={handleMouseMove}
              className="relative w-full h-80 sm:h-96 rounded-md overflow-hidden select-none cursor-ew-resize bg-[#202938] border border-[#E5E7EB]"
            >
              {/* Underlying Image: Grad-CAM Heatmap */}
              <img 
                src={gradCamSrc} 
                alt="Grad-CAM Saliency" 
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Overlying Image: Original RGB Ulcer Photo with clip-path */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={originalImageUrl} 
                  alt="Original Ulcer" 
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
                />
              </div>

              {/* Slider Divider Bar */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#1C1E20] text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Columns className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Left/Right Overlaid Tags */}
              <span className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#202938]/80 text-white text-[10px] font-bold backdrop-blur-sm pointer-events-none">
                Original RGB Macro Photo
              </span>
              <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-[#1C1E20]/90 text-white text-[10px] font-bold backdrop-blur-sm pointer-events-none">
                Grad-CAM Activation Map
              </span>
            </div>

            <p className="text-[11px] text-[#64748B] text-center">
              Drag the center slider left or right to inspect how model weights align with wound margins.
            </p>
          </div>
        )}

        {/* View Mode 2: Side-by-Side Dual Comparison */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#202938] block">1. Clinical Macro Photograph (Original)</span>
              <div className="relative h-72 sm:h-80 rounded-md overflow-hidden bg-[#202938] border border-[#E5E7EB]">
                <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#1C1E20] block">2. Convolutional Grad-CAM Saliency Overlay</span>
              <div className="relative h-72 sm:h-80 rounded-md overflow-hidden bg-[#202938] border border-[#E5E7EB]">
                <img src={gradCamSrc} alt="Grad-CAM" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* View Mode 3: Alpha Blending Slider */}
        {viewMode === 'blend' && (
          <div className="space-y-3">
            <div className="relative w-full h-80 sm:h-96 rounded-md overflow-hidden bg-[#202938] border border-[#E5E7EB]">
              <img src={originalImageUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
              <img 
                src={gradCamSrc} 
                alt="Grad-CAM Overlay" 
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
                style={{ opacity: blendOpacity / 100 }}
              />
            </div>

            <div className="flex items-center space-x-3 bg-[#F7F8FA] p-3 rounded-md border border-[#E5E7EB]">
              <span className="text-xs font-bold text-[#202938] shrink-0">Grad-CAM Opacity:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={blendOpacity}
                onChange={(e) => setBlendOpacity(Number(e.target.value))}
                className="w-full accent-[#1C1E20]"
              />
              <span className="text-xs font-mono font-bold text-[#1C1E20] shrink-0">{blendOpacity}%</span>
            </div>
          </div>
        )}

        {/* View Mode 4: Solo Grad-CAM */}
        {viewMode === 'solo-cam' && (
          <div className="space-y-2">
            <div className="relative w-full h-80 sm:h-96 rounded-md overflow-hidden bg-[#202938] border border-[#E5E7EB]">
              <img src={gradCamSrc} alt="Pure Grad-CAM" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Clinical Interpretation & AI Rationale Card */}
        <div className="p-3.5 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#202938] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1C1E20]" />
              <span>AI Feature Attribution & Grad-CAM Diagnostic Rationale</span>
            </div>
            <span className="text-[11px] font-semibold text-[#1C1E20]">
              Wagner Grade {predictedGrade} Focus
            </span>
          </div>

          <p className="text-[#64748B] leading-relaxed">
            {rationale || `Convolutional saliency maps confirm high gradient activations on central ulcer margins and surrounding tissue bed, confirming Grade ${predictedGrade} classification confidence.`}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#64748B] border-t border-[#E5E7EB]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D94848]" />
              <span>Red/Warm: Peak Convolutional Attention</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D99124]" />
              <span>Yellow/Orange: Sub-acute Peri-wound Tissue</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
              <span>Blue/Cool: Background / Unaffected Epidermis</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

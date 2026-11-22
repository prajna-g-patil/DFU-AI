import React from 'react';

interface DfuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const DfuLogo: React.FC<DfuLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  inverted = false
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 42 : 34;

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Specialized DFU Limb Salvage Medical Icon */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-lg bg-[#1C1E20] text-white shadow-sm border border-[#2D3135]"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Anatomical Foot & Limb Salvage Outline */}
          <path 
            d="M12 6C15 6 18 8 18 11V16C18 19 19 21 21 23C23 25 25 26.5 25 29C25 31.5 22.5 33 19 33C14.5 33 11 30.5 11 26C11 22 10.5 18 10 14C9.5 10 10 6 12 6Z" 
            stroke="#F7B955" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Diabetic Ulcer Assessment Thermal Diagnostic Target */}
          <circle cx="17" cy="27" r="3.2" fill="#F7B955" />
          <circle cx="17" cy="27" r="5.5" stroke="#F7B955" strokeWidth="1" strokeDasharray="2 2" />
          {/* Medical Pulse / Cross Line */}
          <path 
            d="M5 16H8L10 12L12 20L14 16H17" 
            stroke="#FFFFFF" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center space-x-1.5">
          <span className={`font-black tracking-tight font-display ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
          } ${inverted ? 'text-white' : 'text-[#1C1E20]'}`}>
            DFU<span className="text-[#F7B955]">-AI</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
            HEALTH
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[10px] font-semibold tracking-wide ${
            inverted ? 'text-gray-300' : 'text-[#6A6E73]'
          } -mt-0.5`}>
            Diabetic Foot Ulcer & Limb Salvage
          </p>
        )}
      </div>
    </div>
  );
};

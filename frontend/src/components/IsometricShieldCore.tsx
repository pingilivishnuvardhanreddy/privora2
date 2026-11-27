import React from 'react';

interface IsometricShieldCoreProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IsometricShieldCore: React.FC<IsometricShieldCoreProps> = ({ 
  size = 'lg', 
  className = '' 
}) => {
  if (size === 'sm') {
    return (
      <div className={`relative flex items-center justify-center w-9 h-9 select-none ${className}`}>
        {/* Compact Mini Isometric Core with Multi-Accent Gradient */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-violet-500/20 border border-emerald-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]"
        >
          <path
            d="M12 2L4 5.5V11.5C4 16.5 7.5 21.2 12 22.5C16.5 21.2 20 16.5 20 11.5V5.5L12 2Z"
            stroke="url(#miniShieldMulti)"
            strokeWidth="2"
            fill="url(#miniShieldFill)"
          />
          <path
            d="M8.5 12.5L10.5 14.5L15.5 9.5"
            stroke="#38BDF8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="miniShieldMulti" x1="4" y1="2" x2="20" y2="22.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="miniShieldFill" x1="12" y1="2" x2="12" y2="22.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="1" stopColor="#060811" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  const containerDimensions = size === 'md' ? 'w-56 h-56' : 'w-72 h-72';
  const sceneDimensions = size === 'md' ? 'w-48 h-48' : 'w-56 h-56';
  const ring1 = size === 'md' ? 'w-52 h-52' : 'w-64 h-64';
  const ring2 = size === 'md' ? 'w-42 h-42' : 'w-52 h-52';
  const plateBase = size === 'md' ? 'w-32 h-32' : 'w-40 h-40';
  const plateMid = size === 'md' ? 'w-28 h-28' : 'w-36 h-36';
  const plateTop = size === 'md' ? 'w-24 h-24' : 'w-32 h-32';
  const svgSize = size === 'md' ? 56 : 72;

  return (
    <div className={`relative flex items-center justify-center ${containerDimensions} select-none pointer-events-none ${className}`}>
      {/* Soft Multi-Accent Aurora Glow Aura Behind (Emerald -> Cyan -> Violet) */}
      <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-violet-500/20 blur-3xl pointer-events-none" />

      {/* 3D Scene Container */}
      <div 
        className={`relative ${sceneDimensions} flex items-center justify-center`}
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {/* Rotating Orbital Telemetry Ring 1 with Floating Colorful Dots */}
        <div 
          className={`absolute ${ring1} rounded-full border border-cyan-400/35 dark:border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] animate-orbit`}
        >
          {/* Orbital Satellite Dots */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06B6D4]" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_#8B5CF6]" />
        </div>

        {/* Counter-Rotating Orbital Telemetry Ring 2 */}
        <div 
          className={`absolute ${ring2} rounded-full border border-dashed border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-orbit-reverse`}
        >
          <span className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
          <span className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
        </div>

        {/* 3 Stacked Translucent 3D Isometric Layers (Emerald -> Cyan -> Violet) */}
        <div 
          className="absolute flex items-center justify-center"
          style={{ 
            transform: 'rotateX(55deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Layer 1: Bottom Base Isometric Slab */}
          <div 
            className={`${plateBase} rounded-2xl bg-[#080C16]/95 border border-slate-700/60 shadow-[0_30px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.2)] relative`}
            style={{ transform: 'translateZ(-40px)' }}
          >
            {/* Live Corner Multi-Color Telemetry Nodes */}
            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8B5CF6]" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
          </div>

          {/* Layer 2: Middle Translucent Cyan-to-Emerald Plate */}
          <div 
            className={`absolute ${plateMid} rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900/70 to-emerald-950/60 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)]`}
            style={{ transform: 'translateZ(-15px)' }}
          >
            <div className="absolute inset-2 rounded-xl border border-cyan-500/25 bg-dot-grid-dark opacity-75" />
          </div>

          {/* Layer 3: Top Frosted Glass Emerald-to-Violet Platform */}
          <div 
            className={`absolute ${plateTop} rounded-2xl bg-gradient-to-br from-slate-900/90 via-emerald-950/40 to-violet-950/40 border-t border-t-white/30 border-x border-x-cyan-400/30 border-b border-b-violet-400/30 shadow-[0_0_35px_rgba(139,92,246,0.35)]`}
            style={{ transform: 'translateZ(10px)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 blur-sm" />
            </div>
          </div>
        </div>

        {/* Hovering 3D Glowing Shield Emblem Above Platform */}
        <div 
          className="absolute z-20 animate-float3d flex items-center justify-center"
          style={{ transform: 'translateZ(60px)' }}
        >
          {/* Volumetric Multi-Accent Center Glow */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500/30 via-cyan-500/25 to-violet-500/25 blur-xl" />

          {/* Shield SVG Emblem with Multi-Gradient Stroke */}
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-[0_10px_25px_rgba(6,182,212,0.7)]"
          >
            <path
              d="M12 2L4 5.5V11.5C4 16.5 7.5 21.2 12 22.5C16.5 21.2 20 16.5 20 11.5V5.5L12 2Z"
              stroke="url(#heroShieldLuminousStroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="url(#heroShieldLuminousFill)"
            />
            <path
              d="M8.5 12.5L10.5 14.5L15.5 9.5"
              stroke="url(#heroCheckCyanStroke)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="heroShieldLuminousStroke" x1="4" y1="2" x2="20" y2="22.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="0.5" stopColor="#38BDF8" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="heroShieldLuminousFill" x1="12" y1="2" x2="12" y2="22.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0EA5E9" stopOpacity="0.35" />
                <stop offset="0.7" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="1" stopColor="#060811" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="heroCheckCyanStroke" x1="8.5" y1="9.5" x2="15.5" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default IsometricShieldCore;

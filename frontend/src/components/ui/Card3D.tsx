import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tiltIntensity?: number;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  onClick,
  tiltIntensity = 9,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [sheen, setSheen] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rx = -((y - centerY) / centerY) * tiltIntensity;
    const ry = ((x - centerX) / centerX) * tiltIntensity;

    setTransformStyle(
      `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`
    );

    setSheen({
      x,
      y,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setSheen((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: 'transform 0.14s cubic-bezier(0.2, 0, 0.2, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 
        bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_30px_-8px_rgba(15,23,42,0.1)]
        dark:bg-gradient-to-b dark:from-[#111728]/95 dark:to-[#0A0D17]/95 dark:border-t dark:border-t-white/15 dark:border-x dark:border-x-white/[0.07] dark:border-b dark:border-b-white/[0.05] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)]
        ${className}`}
    >
      {/* 3D Luminous Multi-Color Specular Top Edge Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-400/40 via-cyan-400/40 to-violet-400/40 pointer-events-none z-20" />

      {/* Dynamic Cursor Spotlight (Interactive Rainbow / Cyan-Emerald Sheen) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: sheen.active ? 1 : 0,
          background: `radial-gradient(circle at ${sheen.x}px ${sheen.y}px, rgba(6, 182, 212, 0.18) 0%, rgba(16, 185, 129, 0.12) 35%, rgba(139, 92, 246, 0.08) 60%, transparent 80%)`,
        }}
      />

      {/* 3D Elevated Content Layer (translateZ(16px)) */}
      <div className="relative z-0 h-full" style={{ transform: 'translateZ(16px)' }}>
        {children}
      </div>
    </div>
  );
};

export default Card3D;

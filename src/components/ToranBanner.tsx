import React from 'react';

export const ToranBanner: React.FC = () => {
  return (
    <div className="w-full relative z-20 pointer-events-none select-none overflow-hidden">
      {/* Swaying Marigold Toran Garland across top */}
      <svg
        className="w-full h-14 sm:h-18 md:h-22 drop-shadow-lg"
        preserveAspectRatio="none"
        viewBox="0 0 1200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="orangeFlower" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="40%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>
          <radialGradient id="yellowFlower" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFEA00" />
            <stop offset="100%" stopColor="#FF8F00" />
          </radialGradient>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="goldString" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>

        {/* Garland string */}
        <path
          d="M0,15 Q150,55 300,15 Q450,55 600,15 Q750,55 900,15 Q1050,55 1200,15"
          stroke="url(#goldString)"
          strokeWidth="3"
          fill="none"
        />

        {/* Mango Leaves hanging along the loops */}
        {[75, 225, 375, 525, 675, 825, 975, 1125].map((x, i) => (
          <path
            key={`leaf-${i}`}
            d={`M${x - 8},28 C${x - 14},48 ${x - 4},64 ${x},72 C${x + 4},64 ${x + 14},48 ${x + 8},28 Z`}
            fill="url(#leafGrad)"
            opacity="0.95"
          />
        ))}

        {/* Marigold flowers clustered along the garland */}
        {Array.from({ length: 33 }).map((_, i) => {
          const x = i * 37.5;
          const curveIdx = Math.floor(x / 300);
          const localX = (x % 300) / 150 - 1;
          const y = 15 + 40 * (1 - localX * localX) * 0.7;
          const isYellow = i % 2 === 0;

          return (
            <g key={`flower-${i}`} transform={`translate(${x}, ${y})`}>
              <circle r="7.5" fill={isYellow ? 'url(#yellowFlower)' : 'url(#orangeFlower)'} />
              <circle r="3.2" fill={isYellow ? '#FF6F00' : '#FFD54F'} opacity="0.8" />
            </g>
          );
        })}
      </svg>

      {/* Hanging Akash Kandil / Paper Lanterns swaying at left and right */}
      <div className="absolute top-2 left-4 sm:left-10 md:left-20 animate-sway-slow flex flex-col items-center pointer-events-auto">
        <div className="w-[1.5px] h-12 sm:h-20 bg-gradient-to-b from-amber-300 to-amber-500/80" />
        <div className="relative -mt-1 group cursor-pointer">
          {/* Akash Kandil body */}
          <div className="w-9 h-11 sm:w-12 sm:h-15 relative flex items-center justify-center">
            {/* Diamond shape */}
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-tr from-rose-600 via-amber-400 to-amber-200 rotate-45 shadow-[0_0_18px_rgba(255,160,0,0.85)] border border-amber-300" />
            <div className="absolute w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          {/* Streamers/Tassels */}
          <div className="flex justify-center gap-1 -mt-1">
            <div className="w-[1.5px] h-6 sm:h-9 bg-amber-400" />
            <div className="w-[1.5px] h-8 sm:h-12 bg-rose-500" />
            <div className="w-[1.5px] h-10 sm:h-14 bg-amber-300" />
            <div className="w-[1.5px] h-8 sm:h-12 bg-rose-500" />
            <div className="w-[1.5px] h-6 sm:h-9 bg-amber-400" />
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-4 sm:right-10 md:right-20 animate-sway-fast flex flex-col items-center pointer-events-auto">
        <div className="w-[1.5px] h-14 sm:h-24 bg-gradient-to-b from-amber-300 to-amber-500/80" />
        <div className="relative -mt-1 group cursor-pointer">
          {/* Akash Kandil body */}
          <div className="w-9 h-11 sm:w-12 sm:h-15 relative flex items-center justify-center">
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-tr from-purple-600 via-fuchsia-400 to-amber-200 rotate-45 shadow-[0_0_18px_rgba(230,60,255,0.85)] border border-amber-300" />
            <div className="absolute w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          {/* Streamers/Tassels */}
          <div className="flex justify-center gap-1 -mt-1">
            <div className="w-[1.5px] h-7 sm:h-10 bg-amber-300" />
            <div className="w-[1.5px] h-9 sm:h-13 bg-fuchsia-400" />
            <div className="w-[1.5px] h-11 sm:h-15 bg-purple-400" />
            <div className="w-[1.5px] h-9 sm:h-13 bg-fuchsia-400" />
            <div className="w-[1.5px] h-7 sm:h-10 bg-amber-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

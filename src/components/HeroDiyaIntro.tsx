import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { festiveAudio } from '../utils/audio';
import { Sparkles, Flame, Volume2, ArrowDown } from 'lucide-react';

interface HeroDiyaIntroProps {
  onLightUp: () => void;
  isLit: boolean;
  receiverName?: string;
  senderName?: string;
  customGreeting?: string;
  onExploreClick: () => void;
}

export const HeroDiyaIntro: React.FC<HeroDiyaIntroProps> = ({
  onLightUp,
  isLit,
  receiverName,
  senderName,
  customGreeting,
  onExploreClick,
}) => {
  const [waveStep, setWaveStep] = useState(0);

  const handleIgnite = () => {
    if (isLit) return;
    festiveAudio.init();
    festiveAudio.playDiyaWhoosh();
    festiveAudio.playBellChime(523.25);

    onLightUp();

    // Trigger wave illumination sequence
    setWaveStep(1);
    setTimeout(() => setWaveStep(2), 350);
    setTimeout(() => setWaveStep(3), 700);
    setTimeout(() => setWaveStep(4), 1100);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background radial illumination on diya lighting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-out ${
          isLit
            ? 'opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(255,160,0,0.22)_0%,rgba(147,51,234,0.12)_45%,transparent_75%)]'
            : 'opacity-0'
        }`}
      />

      {/* Decorative Wave Diyas lighting up around */}
      <AnimatePresence>
        {isLit && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around px-8 opacity-75">
            {[-2, -1, 1, 2].map((offset, idx) => (
              <motion.div
                key={`wave-diya-${idx}`}
                initial={{ opacity: 0, scale: 0.4, y: 30 }}
                animate={{
                  opacity: waveStep >= idx + 1 ? 0.9 : 0,
                  scale: waveStep >= idx + 1 ? 1 : 0.4,
                  y: 0,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`hidden md:block transform ${offset > 0 ? 'translate-x-12' : '-translate-x-12'}`}
              >
                <div className="relative flex flex-col items-center">
                  {/* Miniature Flame */}
                  <div className="w-5 h-7 bg-gradient-to-t from-orange-500 via-amber-300 to-white rounded-full animate-flame shadow-[0_0_15px_rgba(255,170,0,0.85)] -mb-1" />
                  {/* Miniature clay diya */}
                  <div className="w-14 h-4 bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 rounded-b-full border-t border-amber-600/70" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Centerpiece Golden Diya */}
      <div className="relative z-10 flex flex-col items-center my-6">
        {/* Glow halo behind diya */}
        <div
          className={`absolute -top-14 w-48 h-48 rounded-full pointer-events-none transition-all duration-1000 ${
            isLit
              ? 'bg-amber-500/25 blur-3xl scale-125'
              : 'bg-amber-500/5 blur-xl scale-75'
          }`}
        />

        {/* Clickable Diya button */}
        <button
          onClick={handleIgnite}
          aria-label={isLit ? 'Diya is lit' : 'Tap to light the central diya'}
          className={`group relative focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-full transition-transform duration-300 active:scale-95 ${
            !isLit ? 'cursor-pointer hover:scale-105' : 'cursor-default'
          }`}
        >
          {/* Flame SVG container */}
          <div className="h-28 flex items-end justify-center">
            {isLit ? (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative -mb-2 z-10 flex flex-col items-center"
              >
                {/* Multi-layered Realistic Flame */}
                <svg
                  width="56"
                  height="82"
                  viewBox="0 0 56 82"
                  fill="none"
                  className="animate-flame drop-shadow-[0_0_20px_rgba(255,170,0,0.95)]"
                >
                  <defs>
                    <radialGradient id="outerFlame" cx="50%" cy="80%" r="70%">
                      <stop offset="0%" stopColor="#FFF9C4" />
                      <stop offset="30%" stopColor="#FFC107" />
                      <stop offset="65%" stopColor="#FF5722" />
                      <stop offset="100%" stopColor="#D50000" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="innerCore" cx="50%" cy="85%" r="45%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="40%" stopColor="#FFF59D" />
                      <stop offset="85%" stopColor="#29B6F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1E88E5" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {/* Outer flame */}
                  <path
                    d="M28 2 C20 22 10 38 10 56 C10 70 18 80 28 80 C38 80 46 70 46 56 C46 38 36 22 28 2 Z"
                    fill="url(#outerFlame)"
                  />
                  {/* Inner blue-white core */}
                  <path
                    d="M28 32 C23 44 19 54 19 64 C19 72 23 78 28 78 C33 78 37 72 37 64 C37 54 33 44 28 32 Z"
                    fill="url(#innerCore)"
                  />
                </svg>

                {/* Floating ember sparkles */}
                <div className="absolute -top-4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
              </motion.div>
            ) : (
              <div className="relative -mb-1 flex flex-col items-center opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Unlit wick */}
                <div className="w-1.5 h-6 bg-gradient-to-t from-stone-600 to-stone-900 rounded-t" />
                <div className="text-amber-400 text-xs flex items-center gap-1 font-medium bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/40 backdrop-blur-sm shadow-lg animate-bounce">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Tap to light</span>
                </div>
              </div>
            )}
          </div>

          {/* Diya Clay Base (Mitti ka Diya) with golden ornamentation */}
          <div className="relative">
            <svg
              width="140"
              height="48"
              viewBox="0 0 140 48"
              fill="none"
              className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
            >
              <defs>
                <linearGradient id="clayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="35%" stopColor="#B45309" />
                  <stop offset="80%" stopColor="#78350F" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>
                <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="25%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="75%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
              {/* Diya Bowl */}
              <path
                d="M10 14 C25 44 115 44 130 14 C120 22 20 22 10 14 Z"
                fill="url(#clayGrad)"
              />
              {/* Oil pool */}
              <ellipse cx="70" cy="14" rx="55" ry="10" fill="#92400E" />
              <ellipse cx="70" cy="13" rx="48" ry="7" fill={isLit ? '#F59E0B' : '#78350F'} opacity={isLit ? 0.9 : 0.6} />
              {/* Golden decorated rim */}
              <path
                d="M15 14 C35 19 105 19 125 14"
                stroke="url(#goldRim)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Traditional stamped dots */}
              {[30, 50, 70, 90, 110].map((cx) => (
                <circle key={cx} cx={cx} cy="23" r="2" fill="#FCD34D" opacity="0.8" />
              ))}
            </svg>
          </div>
        </button>

        {/* Ambient instruction or status */}
        {!isLit && (
          <p className="mt-4 text-amber-200/80 text-sm tracking-wide font-light max-w-xs">
            Touch the sacred flame to kindle auspicious light and unlock joyful melodies.
          </p>
        )}
      </div>

      {/* Main Greeting Reveal upon Lighting */}
      <AnimatePresence>
        {isLit && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="relative z-10 max-w-3xl mt-4 flex flex-col items-center"
          >
            {/* Sanskrit Auspicious Shloka / Salutation */}
            <p className="font-hindi text-xl md:text-3xl text-amber-300 font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(255,160,0,0.6)] mb-2">
              ॥ शुभं करोति कल्याणम् आरोग्यम् धनसंपदा ॥
            </p>
            <p className="font-hindi text-3xl md:text-5xl lg:text-6xl text-amber-400 font-bold tracking-wider drop-shadow-[0_0_24px_rgba(255,180,0,0.8)] my-1">
              शुभ दीपावली
            </p>

            {/* Glowing Golden English Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif shimmer-gold tracking-tight mt-2 mb-3">
              {receiverName ? `Happy Diwali, ${receiverName}!` : 'Diwali Digital Diya'}
            </h1>

            {/* Personal Custom Message if present */}
            {customGreeting ? (
              <div className="bg-amber-950/40 border border-amber-500/30 backdrop-blur-md rounded-2xl p-5 md:p-7 max-w-xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] my-4">
                <p className="text-amber-100 text-lg md:text-xl font-serif italic leading-relaxed">
                  "{customGreeting}"
                </p>
                {senderName && (
                  <p className="text-amber-400 text-sm font-medium mt-3 text-right">
                    — With loving blessings, {senderName}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-amber-200/90 text-base sm:text-lg md:text-xl font-light max-w-2xl leading-relaxed mt-2">
                May the festival of lights brighten your life with boundless wisdom, prosperity, health, and eternal peace.
              </p>
            )}

            {/* Audio enabled hint */}
            <div className="flex items-center gap-2 mt-4 text-xs text-amber-300/80 bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-600/30">
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Festive Raga audio is playing · Use music control in navbar to adjust</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-7">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-semibold text-sm sm:text-base shadow-[0_0_25px_rgba(255,160,0,0.6)] hover:shadow-[0_0_35px_rgba(255,180,20,0.85)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Create Personalized Greeting</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  festiveAudio.playFireworkLaunch();
                  const event = new CustomEvent('trigger-fireworks-show');
                  window.dispatchEvent(event);
                }}
                className="px-5 py-3 rounded-full bg-purple-950/60 hover:bg-purple-900/80 text-amber-200 border border-amber-500/40 text-sm sm:text-base font-medium backdrop-blur-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <span>🎆 Launch Fireworks Show</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, CheckCircle, RefreshCw } from 'lucide-react';
import { festiveAudio } from '../utils/audio';

interface DiyaItem {
  id: number;
  name: string;
  blessing: string;
  isLit: boolean;
}

const INITIAL_DIYAS: DiyaItem[] = [
  { id: 1, name: 'Aarogya', blessing: 'Sound health & vitality for your family', isLit: true },
  { id: 2, name: 'Dhana', blessing: 'Abundant wealth, grain & ethical success', isLit: false },
  { id: 3, name: 'Vidya', blessing: 'Illuminating wisdom & high intellect', isLit: false },
  { id: 4, name: 'Shanti', blessing: 'Tranquil calm & peaceful surroundings', isLit: false },
  { id: 5, name: 'Prem', blessing: 'Unconditional love & deep compassion', isLit: false },
  { id: 6, name: 'Kalyan', blessing: 'Good fortune & auspicious beginnings', isLit: false },
  { id: 7, name: 'Dhairya', blessing: 'Courage & patience through challenges', isLit: false },
  { id: 8, name: 'Siddhi', blessing: 'Fulfillment of all righteous aspirations', isLit: false },
  { id: 9, name: 'Ananda', blessing: 'Radiant celebration & supreme bliss', isLit: false },
  { id: 10, name: 'Maitri', blessing: 'Lifelong friendships & harmony', isLit: false },
  { id: 11, name: 'Moksha', blessing: 'Spiritual liberation & pure radiance', isLit: false },
];

export const DiyasGrid: React.FC = () => {
  const [diyas, setDiyas] = useState<DiyaItem[]>(INITIAL_DIYAS);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const litCount = diyas.filter((d) => d.isLit).length;
  const progressPercent = Math.min(100, Math.round((litCount / 11) * 100));

  // Trigger celebration when all 11 are lit
  useEffect(() => {
    if (litCount === 11 && !celebrationTriggered) {
      setCelebrationTriggered(true);
      festiveAudio.playFireworkBoom(true);
      festiveAudio.playSparkle();
      festiveAudio.playBellChime(1046.5);

      // Launch fireworks event
      const event = new CustomEvent('trigger-fireworks-burst', {
        detail: { count: 5 },
      });
      window.dispatchEvent(event);
    }
  }, [litCount, celebrationTriggered]);

  const toggleDiya = (id: number) => {
    setDiyas((prev) =>
      prev.map((diya) => {
        if (diya.id === id) {
          const nextState = !diya.isLit;
          if (nextState) {
            festiveAudio.playDiyaWhoosh();
            festiveAudio.playBellChime(440 + id * 40);
          } else {
            festiveAudio.playBellChime(300);
          }
          return { ...diya, isLit: nextState };
        }
        return diya;
      })
    );
    setActiveTooltip(id);
    setTimeout(() => setActiveTooltip(null), 3000);
  };

  const handleLightThemAll = () => {
    festiveAudio.playBellChime(523.25);
    diyas.forEach((diya, idx) => {
      setTimeout(() => {
        setDiyas((prev) =>
          prev.map((d) => (d.id === diya.id ? { ...d, isLit: true } : d))
        );
        festiveAudio.playDiyaWhoosh();
      }, idx * 120);
    });
  };

  const handleReset = () => {
    setDiyas(INITIAL_DIYAS.map((d, idx) => ({ ...d, isLit: idx === 0 })));
    setCelebrationTriggered(false);
    festiveAudio.playBellChime(440);
  };

  return (
    <div id="diyas-section" className="py-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
          Sacred Ekadashi Diyas
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif shimmer-gold mt-2">
          Illuminate the 11 Sacred Diyas
        </h2>
        <p className="text-amber-200/80 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
          In tradition, lighting 11 earthen lamps welcomes Mahalakshmi and wards off all shadows. Tap each diya to kindle its sacred virtue.
        </p>

        {/* Counter & Golden Progress Bar */}
        <div className="max-w-md mx-auto mt-6 bg-purple-950/50 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-2">
            <span>Diyas Kindled: {litCount} / 11</span>
            <span className="text-amber-400">{progressPercent}% Lit</span>
          </div>

          <div className="w-full h-3 bg-purple-950 rounded-full overflow-hidden border border-amber-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-[0_0_12px_rgba(255,215,0,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={handleLightThemAll}
              disabled={litCount === 11}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            >
              ✨ Light Them All (Wave)
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-amber-200 border border-amber-500/30 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 11 Sacred Celebration Banner when all lit */}
      <AnimatePresence>
        {celebrationTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-600/30 via-orange-600/40 to-yellow-500/30 border-2 border-amber-400 shadow-[0_0_40px_rgba(255,190,0,0.5)] text-center max-w-2xl mx-auto backdrop-blur-md"
          >
            <div className="flex items-center justify-center gap-2 text-amber-300 font-hindi text-xl md:text-2xl font-bold">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
              <span>॥ महालक्ष्मी कृपा दृष्टि सदा अस्तु ॥</span>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
            </div>
            <p className="font-serif text-lg md:text-xl text-amber-100 font-semibold mt-1">
              All 11 Sacred Lights Are Shining Brightly!
            </p>
            <p className="text-amber-200/90 text-xs sm:text-sm mt-1">
              May the combined radiance of Health, Wealth, Peace, and Wisdom eternally grace your household. Fireworks launched in your honor!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Diya Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-center">
        {diyas.map((diya) => (
          <div key={diya.id} className="relative flex flex-col items-center">
            {/* Tooltip on click */}
            <AnimatePresence>
              {activeTooltip === diya.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-100 text-[11px] font-medium shadow-xl pointer-events-none text-center whitespace-nowrap"
                >
                  {diya.blessing}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clickable Diya Unit */}
            <button
              onClick={() => toggleDiya(diya.id)}
              aria-label={`Toggle diya ${diya.name}`}
              className="group p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 flex flex-col items-center w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer shadow-lg active:scale-95"
            >
              {/* Flame / Wick Container */}
              <div className="h-14 flex items-end justify-center mb-1">
                {diya.isLit ? (
                  <div className="relative flex flex-col items-center">
                    {/* Glowing animated flame */}
                    <div className="w-5 h-8 bg-gradient-to-t from-orange-500 via-amber-300 to-white rounded-full animate-flame shadow-[0_0_18px_rgba(255,160,0,0.9)]" />
                    {/* Inner ember glow */}
                    <div className="absolute top-1 w-2 h-3 bg-white rounded-full opacity-80" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-40 group-hover:opacity-75 transition-opacity">
                    <div className="w-1 h-4 bg-stone-500 rounded-t" />
                    <span className="text-[10px] text-amber-300/70 mt-1">Light me</span>
                  </div>
                )}
              </div>

              {/* Clay Diya SVG */}
              <div className="relative">
                <svg width="74" height="26" viewBox="0 0 74 26" fill="none">
                  <path
                    d="M6 7 C14 24 60 24 68 7 C63 11 11 11 6 7 Z"
                    fill={diya.isLit ? '#B45309' : '#573012'}
                  />
                  <ellipse
                    cx="37"
                    cy="7"
                    rx="30"
                    ry="5.5"
                    fill={diya.isLit ? '#F59E0B' : '#3B1F0A'}
                  />
                  {diya.isLit && (
                    <path
                      d="M9 7 C19 10 55 10 65 7"
                      stroke="#FDE047"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </div>

              {/* Sanskrit Name and Virtue */}
              <div className="mt-2 text-center">
                <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  {diya.name}
                </p>
                <p className="text-[10px] text-amber-200/60 leading-tight">
                  {diya.isLit ? 'Kindled' : 'Unlit'}
                </p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

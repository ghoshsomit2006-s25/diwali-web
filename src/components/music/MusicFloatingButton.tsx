import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Pause } from 'lucide-react';
import { festiveAudio } from '../../utils/audio';

interface MusicFloatingButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isPlaying: boolean;
  trackTitle?: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  beatPulse?: number;
  onTogglePlay?: () => void;
}

export const MusicFloatingButton: React.FC<MusicFloatingButtonProps> = ({
  isOpen,
  onToggle,
  isPlaying,
  trackTitle,
  channelTitle,
  thumbnailUrl,
  beatPulse = 0,
  onTogglePlay,
}) => {
  const handleClick = () => {
    festiveAudio.playBellChime(880);
    onToggle();
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-5 z-40 select-none flex items-center gap-2.5">
      {/* Floating Circular Music Button */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        aria-label={isOpen ? 'Close Festive Music Player' : 'Open Festive Music Player'}
        aria-expanded={isOpen}
        title={isPlaying ? `Playing: ${trackTitle || 'Festive Music'}` : 'Open Festive Music Player'}
        className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none shadow-2xl ${
          isOpen
            ? 'bg-gradient-to-tr from-amber-400 to-orange-500 ring-4 ring-amber-300 shadow-[0_0_28px_rgba(255,215,0,0.85)] text-slate-950'
            : isPlaying
            ? 'bg-gradient-to-tr from-amber-500 to-orange-500 ring-3 ring-amber-400 shadow-[0_0_24px_rgba(255,180,0,0.8)] text-slate-950'
            : 'bg-[#150424] border-2 border-amber-400/80 hover:border-amber-300 ring-2 ring-amber-500/40 hover:ring-amber-400/80 shadow-[0_0_18px_rgba(0,0,0,0.7)] text-amber-300'
        }`}
        style={{
          transform: `scale(${1 + (isPlaying ? beatPulse * 0.1 : 0)})`,
        }}
      >
        {/* Glowing Diya Gold Outer Aura */}
        <div
          className={`absolute -inset-1 rounded-full pointer-events-none transition-opacity duration-300 ${
            isPlaying
              ? 'opacity-85 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 blur-sm animate-pulse'
              : 'opacity-0'
          }`}
        />

        {/* Music Note / Diya Icon */}
        <div className="relative flex items-center justify-center">
          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Miniature Diya Flame Indicator */}
        <div className="absolute -top-1.5 -right-1 text-xs">
          🪔
        </div>
      </motion.button>

      {/* Background Music Mini Status Pill */}
      {isPlaying && !isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e041f]/95 border border-amber-400/40 backdrop-blur-md shadow-xl"
        >
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-left cursor-pointer group min-w-0"
            title="Open music player"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-amber-400/50 flex-shrink-0"
              />
            ) : (
              <span className="text-sm">🪔</span>
            )}
            <div className="min-w-0 max-w-[120px] sm:max-w-[180px]">
              <p className="text-[10px] font-bold text-amber-200 group-hover:text-amber-300 truncate leading-tight">
                {trackTitle || 'Festive Music'}
              </p>
              <p className="text-[9px] text-amber-400/70 truncate leading-tight">
                {channelTitle || 'YouTube Music'}
              </p>
            </div>
          </button>

          {/* Quick Play/Pause on pill */}
          {onTogglePlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

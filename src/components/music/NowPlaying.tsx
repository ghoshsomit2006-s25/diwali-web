import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Repeat1,
  Flame,
  Radio,
  Sparkles,
} from 'lucide-react';
import { YouTubeTrack, LoopMode, PlayerState } from '../../types/music';

interface NowPlayingProps {
  currentTrack: YouTubeTrack;
  isPlaying: boolean;
  playerState: PlayerState;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  loopMode: LoopMode;
  beatPulse: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onToggleLoop: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  currentTrack,
  isPlaying,
  playerState,
  volume,
  isMuted,
  currentTime,
  duration,
  loopMode,
  beatPulse,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onSetVolume,
  onToggleMute,
  onToggleLoop,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetPercent = parseFloat(e.target.value);
    const targetSeconds = (targetPercent / 100) * duration;
    onSeek(targetSeconds);
  };

  const getLoopModeIcon = () => {
    if (loopMode === 'loop-one') {
      return <Repeat1 className="w-4 h-4 text-amber-400" />;
    }
    if (loopMode === 'loop-queue') {
      return <Repeat className="w-4 h-4 text-emerald-400" />;
    }
    return <Repeat className="w-4 h-4 opacity-40 text-amber-100" />;
  };

  const getLoopModeLabel = () => {
    if (loopMode === 'loop-one') return 'Loop One Track';
    if (loopMode === 'loop-queue') return 'Loop Queue';
    return 'Loop Off';
  };

  return (
    <div className="space-y-4 select-none">
      {/* Track Visual Card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/40 via-purple-950/60 to-black/80 border border-amber-500/30 p-3.5 flex items-center gap-3.5 shadow-xl">
        {/* Thumbnail with Diya Glow */}
        <div className="relative flex-shrink-0">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-amber-400/60 shadow-lg bg-black/60 relative"
            style={{
              transform: `scale(${1 + (isPlaying ? beatPulse * 0.05 : 0)})`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <img
              src={currentTrack.thumbnailUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback thumbnail
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop';
              }}
            />
            {/* Live Playing Glow Ring */}
            {isPlaying && (
              <div className="absolute inset-0 ring-2 ring-amber-400/80 rounded-xl animate-pulse pointer-events-none" />
            )}
          </div>
          {/* Flame Embers */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 text-xs">
              🪔
            </div>
          )}
        </div>

        {/* Info & Diya Equalizer */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              YouTube Music
            </span>
            {isPlaying && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-amber-100 truncate" title={currentTrack.title}>
            {currentTrack.title}
          </h3>
          <p className="text-[11px] text-amber-300/70 truncate mt-0.5">
            {currentTrack.channelTitle}
          </p>

          {/* Diya-themed Animated Equalizer */}
          <div className="flex items-end gap-1 mt-2 h-3.5">
            <span
              className={`w-1 rounded-full bg-amber-400 ${
                isPlaying ? 'h-3 animate-pulse' : 'h-1 opacity-40'
              }`}
              style={{ animationDuration: '0.4s' }}
            />
            <span
              className={`w-1 rounded-full bg-yellow-300 ${
                isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'
              }`}
              style={{ animationDuration: '0.6s' }}
            />
            <span
              className={`w-1 rounded-full bg-orange-400 ${
                isPlaying ? 'h-2 animate-pulse' : 'h-1 opacity-40'
              }`}
              style={{ animationDuration: '0.5s' }}
            />
            <span
              className={`w-1 rounded-full bg-rose-400 ${
                isPlaying ? 'h-3 animate-pulse' : 'h-1.5 opacity-40'
              }`}
              style={{ animationDuration: '0.7s' }}
            />
            <span className="text-[10px] text-amber-400/80 font-mono ml-2">
              {isPlaying ? 'Playing in background' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Tap to Play notice for autoplay blocked */}
      {!isPlaying && playerState === 'unstarted' && (
        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-400/40 text-center text-xs text-amber-200">
          <span>Tap play button below to start background music! 🎵</span>
        </div>
      )}

      {/* Seek Bar */}
      <div className="space-y-1">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent}
            onChange={handleSeekChange}
            aria-label="Seek track position"
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-purple-950/80 rounded-lg focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-amber-300/70 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Player Controls */}
      <div className="flex items-center justify-between px-2 pt-1">
        {/* Loop Toggle */}
        <button
          onClick={onToggleLoop}
          title={`Loop Mode: ${getLoopModeLabel()} (Click to toggle)`}
          className="p-2 rounded-xl hover:bg-white/10 text-amber-300 transition-colors cursor-pointer flex items-center gap-1 text-xs"
        >
          {getLoopModeIcon()}
          <span className="text-[9px] font-semibold hidden sm:inline">{getLoopModeLabel()}</span>
        </button>

        {/* Center: Previous, Play/Pause, Next */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            title="Previous / Restart"
            className="p-2 rounded-xl text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,180,0,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Next Track"
            className="p-2 rounded-xl text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume Mute Quick Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="p-2 rounded-xl hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : volume < 50 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Volume Slider Bar */}
      <div className="flex items-center gap-2 px-2 pt-1 border-t border-amber-500/15">
        <span className="text-[10px] text-amber-300/80 font-medium">Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={isMuted ? 0 : volume}
          onChange={(e) => onSetVolume(parseFloat(e.target.value))}
          aria-label="Volume slider"
          className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-purple-950 rounded-lg"
        />
        <span className="text-[10px] text-amber-400 font-mono w-7 text-right">
          {isMuted ? '0%' : `${volume}%`}
        </span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Minimize2,
  Maximize2,
  Radio,
  Search,
  ListMusic,
  Link as LinkIcon,
  Sparkles,
  Headphones,
  Check,
  Flame,
} from 'lucide-react';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { NowPlaying } from './NowPlaying';
import { MusicSearch } from './MusicSearch';
import { MusicQueue } from './MusicQueue';
import { festiveAudio } from '../../utils/audio';

interface MusicPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: ReturnType<typeof useYouTubePlayer>;
}

type TabType = 'now-playing' | 'search' | 'queue' | 'link';

export const MusicPanel: React.FC<MusicPanelProps> = ({ isOpen, onClose, player }) => {
  const [activeTab, setActiveTab] = useState<TabType>('now-playing');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [directLinkInput, setDirectLinkInput] = useState<string>('');

  const {
    currentTrack,
    queue,
    isPlaying,
    playerState,
    volume,
    isMuted,
    currentTime,
    duration,
    loopMode,
    toastMessage,
    isSearching,
    searchResults,
    searchError,
    beatPulse,
    playTrack,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    toggleLoopMode,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    playFromUrl,
    searchTracks,
  } = player;

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directLinkInput.trim()) return;
    const ok = playFromUrl(directLinkInput);
    if (ok) {
      setDirectLinkInput('');
      setActiveTab('now-playing');
      festiveAudio.playBellChime(880);
    }
  };

  return (
    <aside
      aria-label="YouTube Festive Music Player"
      className={`fixed z-50 select-none transition-all duration-300
        bottom-0 left-0 right-0 sm:bottom-20 sm:left-4 sm:right-auto sm:w-[460px] max-w-full
        ${
          isOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-[130%] sm:translate-y-[140%] opacity-0 pointer-events-none'
        }`}
    >
      <div className="relative rounded-t-3xl sm:rounded-3xl bg-[#0b031a]/95 border-t sm:border border-amber-500/40 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 left-4 right-4 z-50 p-2.5 rounded-xl bg-amber-950/95 border border-amber-400 text-amber-200 text-xs text-center font-medium shadow-xl"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="p-3.5 bg-gradient-to-r from-red-950/80 via-purple-950/90 to-amber-950/90 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Pulsing Diya Music Badge */}
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(255,180,0,0.6)] flex-shrink-0"
              style={{
                transform: `scale(${1 + (isPlaying ? beatPulse * 0.12 : 0)})`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <span className="text-sm">🪔</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-amber-200 truncate">
                  Festive Music Player
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Full Songs
                </span>
              </div>
              <p className="text-[10px] text-amber-300/70 truncate max-w-[210px]">
                {currentTrack.title}
              </p>
            </div>
          </div>

          {/* Action Buttons: Minimize, Close */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized((m) => !m)}
              aria-label={isMinimized ? 'Expand music panel' : 'Minimize music panel'}
              className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              aria-label="Close music panel"
              title="Close panel (Music keeps playing in background)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimized Quick Bar */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between gap-3 bg-black/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">🪔</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-200 truncate">{currentTrack.title}</p>
                <p className="text-[10px] text-amber-300/60 truncate">
                  {isPlaying ? 'Playing in background' : 'Paused'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition-all cursor-pointer shadow"
              >
                {isPlaying ? <span className="text-xs">❚❚</span> : <span className="text-xs ml-0.5">▶</span>}
              </button>
            </div>
          </div>
        ) : (
          /* Full Panel Body */
          <div className="p-3.5 sm:p-4 space-y-3.5 max-h-[78vh] sm:max-h-[520px] overflow-y-auto">
            {/* Continuous Playback Banner */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Music continues playing in background while exploring!</span>
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-purple-950/60 border border-amber-500/20 text-xs">
              <button
                onClick={() => setActiveTab('now-playing')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'now-playing'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow font-bold'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Player</span>
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow font-bold'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                  activeTab === 'queue'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow font-bold'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>Queue</span>
                {queue.length > 0 && (
                  <span className="px-1 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 ml-0.5">
                    {queue.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'link'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow font-bold'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Link</span>
              </button>
            </div>

            {/* Tab 1: Now Playing */}
            {activeTab === 'now-playing' && (
              <NowPlaying
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                playerState={playerState}
                volume={volume}
                isMuted={isMuted}
                currentTime={currentTime}
                duration={duration}
                loopMode={loopMode}
                beatPulse={beatPulse}
                onTogglePlay={togglePlay}
                onNext={playNext}
                onPrevious={playPrevious}
                onSeek={seekTo}
                onSetVolume={setVolume}
                onToggleMute={toggleMute}
                onToggleLoop={toggleLoopMode}
              />
            )}

            {/* Tab 2: Search & Festive Presets */}
            {activeTab === 'search' && (
              <MusicSearch
                onPlayTrack={(track) => {
                  playTrack(track);
                  setActiveTab('now-playing');
                }}
                onAddToQueue={addToQueue}
                onSearch={searchTracks}
                isSearching={isSearching}
                searchResults={searchResults}
                searchError={searchError}
                currentTrackId={currentTrack.id}
              />
            )}

            {/* Tab 3: Queue List */}
            {activeTab === 'queue' && (
              <MusicQueue
                queue={queue}
                onPlayTrack={(track) => {
                  playTrack(track);
                  setActiveTab('now-playing');
                }}
                onRemoveFromQueue={removeFromQueue}
                onClearQueue={clearQueue}
              />
            )}

            {/* Tab 4: Paste YouTube Link */}
            {activeTab === 'link' && (
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                    Paste Any YouTube / YouTube Music Link
                  </label>
                  <p className="text-[10px] text-amber-300/70 mb-2">
                    Plays full songs directly with no login and no API key required!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      value={directLinkInput}
                      onChange={(e) => setDirectLinkInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-purple-950/80 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!directLinkInput.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 shadow"
                    >
                      Play
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-amber-500/15 text-[10px] text-amber-300/70 space-y-1">
                  <p className="font-semibold text-amber-200">Supported Formats:</p>
                  <p>• YouTube: <code className="text-amber-300">youtube.com/watch?v=...</code></p>
                  <p>• Short URLs: <code className="text-amber-300">youtu.be/...</code></p>
                  <p>• YouTube Music: <code className="text-amber-300">music.youtube.com/watch?v=...</code></p>
                  <p>• Playlists: <code className="text-amber-300">youtube.com/playlist?list=...</code></p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

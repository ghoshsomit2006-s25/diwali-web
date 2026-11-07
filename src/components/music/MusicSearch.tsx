import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Plus, Sparkles, AlertCircle, Music, Flame } from 'lucide-react';
import { YouTubeTrack } from '../../types/music';
import { MUSIC_PRESET_CHIPS, PresetChip } from '../../constants/defaultMusicPresets';

interface MusicSearchProps {
  onPlayTrack: (track: YouTubeTrack) => void;
  onAddToQueue: (track: YouTubeTrack) => void;
  onSearch: (query: string) => Promise<YouTubeTrack[]>;
  isSearching: boolean;
  searchResults: YouTubeTrack[];
  searchError: string | null;
  currentTrackId?: string;
}

export const MusicSearch: React.FC<MusicSearchProps> = ({
  onPlayTrack,
  onAddToQueue,
  onSearch,
  isSearching,
  searchResults,
  searchError,
  currentTrackId,
}) => {
  const [query, setQuery] = useState('');
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // 500ms Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!query.trim()) {
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, onSearch]);

  const handleChipClick = (chip: PresetChip) => {
    setActiveChipId(chip.id);
    setQuery(chip.searchQuery);
    // Auto-search immediately for the preset
    onSearch(chip.searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onSearch(query);
  };

  // If no search query yet, display curated tracks from presets
  const displayTracks =
    query.trim() && searchResults.length > 0
      ? searchResults
      : activeChipId
      ? MUSIC_PRESET_CHIPS.find((c) => c.id === activeChipId)?.curatedTracks ||
        MUSIC_PRESET_CHIPS[0].curatedTracks
      : MUSIC_PRESET_CHIPS[0].curatedTracks;

  return (
    <div className="space-y-3.5 select-none">
      {/* 5 Quick-Pick Festive Preset Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Festive Vibe</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {MUSIC_PRESET_CHIPS.map((chip) => {
            const isSelected = activeChipId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold border-amber-300 shadow-md scale-[1.02]'
                    : 'bg-purple-950/60 hover:bg-purple-900/80 text-amber-200 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search full songs, aartis, singers (e.g. Om Jai Lakshmi Mata)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveChipId(null);
            }}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 text-xs focus:outline-none focus:border-amber-400 shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow"
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </form>

      {/* Friendly Notice / Error State if API Key not set */}
      {searchError && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-400/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{searchError}</p>
            <p className="text-[11px] text-amber-300/80">
              💡 Tip: Click any of the 5 Festive Preset chips above or paste a direct YouTube link in
              the "Paste Link" tab!
            </p>
          </div>
        </div>
      )}

      {/* Loading Shimmer */}
      {isSearching && (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-2.5 rounded-xl bg-purple-950/40 border border-amber-500/15 animate-pulse flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-amber-500/20 rounded w-3/4" />
                <div className="h-2.5 bg-amber-500/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results / Curated List */}
      {!isSearching && (
        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] text-amber-300/70 font-semibold px-1">
            <span>{query.trim() ? 'Search Results' : 'Featured Festive Tracks'}</span>
            <span>{displayTracks.length} songs</span>
          </div>

          {displayTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 group ${
                  isCurrent
                    ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_12px_rgba(255,215,0,0.25)]'
                    : 'bg-purple-950/30 hover:bg-purple-900/60 border-amber-500/15 hover:border-amber-400/40'
                }`}
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-amber-500/20">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=120&auto=format&fit=crop';
                      }}
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-amber-300 font-bold' : 'text-amber-100 group-hover:text-amber-200'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-amber-300/60 truncate mt-0.5">
                      {track.channelTitle}
                    </p>
                  </div>
                </div>

                {/* Actions: Play & Add to Queue */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onAddToQueue(track)}
                    title="Add to queue"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 hover:text-amber-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPlayTrack(track)}
                    title={isCurrent ? 'Playing now' : 'Play song'}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            );
          })}

          {displayTracks.length === 0 && (
            <div className="py-6 text-center text-xs text-amber-300/60 space-y-1">
              <Music className="w-6 h-6 mx-auto opacity-50 mb-1" />
              <p>No tracks found for this query.</p>
              <p className="text-[10px]">Try searching with a different singer or festive term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

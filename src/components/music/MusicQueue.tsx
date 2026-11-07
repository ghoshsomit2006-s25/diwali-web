import React from 'react';
import { Play, Trash2, ListMusic, Sparkles } from 'lucide-react';
import { YouTubeTrack } from '../../types/music';

interface MusicQueueProps {
  queue: YouTubeTrack[];
  onPlayTrack: (track: YouTubeTrack) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export const MusicQueue: React.FC<MusicQueueProps> = ({
  queue,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
          <ListMusic className="w-4 h-4 text-amber-400" />
          <span>Up Next in Queue ({queue.length})</span>
        </div>
        {queue.length > 0 && (
          <button
            onClick={onClearQueue}
            className="text-[10px] text-rose-300 hover:text-rose-200 hover:underline cursor-pointer transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="py-8 px-4 rounded-2xl bg-purple-950/30 border border-amber-500/15 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <ListMusic className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-amber-200">Your queue is empty</p>
          <p className="text-[11px] text-amber-300/60 max-w-xs mx-auto">
            Search for your favorite songs or click the "+" button on any track card to line them up!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {queue.map((track, idx) => (
            <div
              key={`${track.id}-${track.addedAt || idx}`}
              className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-amber-500/15 transition-all flex items-center justify-between gap-2.5 group"
            >
              <span className="text-[10px] font-mono text-amber-400/60 w-4 text-center">
                {idx + 1}
              </span>

              <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-amber-500/20">
                <img
                  src={track.thumbnailUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100&auto=format&fit=crop';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-100 truncate group-hover:text-amber-200">
                  {track.title}
                </p>
                <p className="text-[10px] text-amber-300/60 truncate">{track.channelTitle}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    onRemoveFromQueue(idx);
                    onPlayTrack(track);
                  }}
                  title="Play now"
                  className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>

                <button
                  onClick={() => onRemoveFromQueue(idx)}
                  title="Remove from queue"
                  className="p-1.5 rounded-lg hover:bg-rose-950/60 text-amber-300/60 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

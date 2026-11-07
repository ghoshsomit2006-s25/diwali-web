/**
 * Types for YouTube Music Player integration
 */

export interface YouTubeTrack {
  id: string; // YouTube Video ID
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: string;
  addedAt?: number;
}

export type LoopMode = 'loop-one' | 'loop-queue' | 'off';

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'buffering' | 'ended' | 'cued' | 'error';

export interface SearchCacheItem {
  timestamp: number;
  results: YouTubeTrack[];
}

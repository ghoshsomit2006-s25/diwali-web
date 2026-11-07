import { useState, useEffect, useRef, useCallback } from 'react';
import { YouTubeTrack, LoopMode, PlayerState, SearchCacheItem } from '../types/music';
import { DEFAULT_TRACK, MUSIC_PRESET_CHIPS } from '../constants/defaultMusicPresets';
import { parseYouTubeUrl } from '../utils/youtubeUrl';
import { festiveAudio } from '../utils/audio';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

const STORAGE_KEY_LAST_TRACK = 'diwali_yt_last_track_v1';
const STORAGE_KEY_VOLUME = 'diwali_yt_volume_v1';
const STORAGE_KEY_LOOP = 'diwali_yt_loop_v1';
const SEARCH_CACHE_PREFIX = 'diwali_yt_search_';

export function useYouTubePlayer() {
  const apiKey =
    import.meta.env.VITE_YOUTUBE_API_KEY ||
    'AIzaSyBVDfL7iP3Cbkmd2nXLmtSm4nApiA-EJE4';

  // 1. Initial State from localStorage (safely wrapped)
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_TRACK);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TRACK;
  });

  const [queue, setQueue] = useState<YouTubeTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState>('unstarted');
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    } catch (e) {}
    return 75;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [loopMode, setLoopMode] = useState<LoopMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOOP) as LoopMode;
      if (saved && ['loop-one', 'loop-queue', 'off'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'loop-one'; // Default ON so music repeats and never stops by itself!
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<YouTubeTrack[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [beatPulse, setBeatPulse] = useState<number>(0);

  // References
  const playerRef = useRef<any>(null);
  const isApiLoadedRef = useRef<boolean>(false);
  const currentTrackRef = useRef<YouTubeTrack>(currentTrack);
  const queueRef = useRef<YouTubeTrack[]>(queue);
  const loopModeRef = useRef<LoopMode>(loopMode);
  const progressTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  loopModeRef.current = loopMode;

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // 2. Audio Coordination with SFX
  useEffect(() => {
    festiveAudio.duckForMusic(isPlaying);
    return () => {
      festiveAudio.duckForMusic(false);
    };
  }, [isPlaying]);

  // 3. Beat Pulse animation loop while playing (~115 BPM rhythm)
  useEffect(() => {
    if (!isPlaying) {
      setBeatPulse(0);
      return;
    }

    let animId: number;
    const bpm = 115;
    const intervalMs = (60 / bpm) * 1000;

    const pulse = () => {
      const now = performance.now();
      const phase = (now % intervalMs) / intervalMs;
      const p = Math.max(0, Math.sin(phase * Math.PI));
      setBeatPulse(p);
      animId = requestAnimationFrame(pulse);
    };

    animId = requestAnimationFrame(pulse);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // 4. Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_TRACK, JSON.stringify(currentTrack));
    } catch (e) {}
  }, [currentTrack]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, volume.toString());
    } catch (e) {}
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOOP, loopMode);
    } catch (e) {}
  }, [loopMode]);

  // 5. Progress ticker
  const startProgressTimer = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(cur);
          if (dur > 0) setDuration(dur);
        } catch (e) {}
      }
    }, 400);
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // 6. Next Track Logic
  const playNext = useCallback(() => {
    const q = queueRef.current;
    if (q.length > 0) {
      const [nextTrack, ...remaining] = q;
      setQueue(remaining);
      playTrack(nextTrack);
    } else {
      // Queue is empty
      const mode = loopModeRef.current;
      if (mode === 'loop-one' || mode === 'loop-queue') {
        // Repeat current track
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }
      } else {
        // Stop
        setIsPlaying(false);
      }
    }
  }, []);

  // 7. Previous Track Logic
  const playPrevious = useCallback(() => {
    if (currentTime > 4) {
      // If played more than 4 seconds, restart current track
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0, true);
      }
    } else {
      // Restart current track or first in fallback
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0, true);
      }
    }
  }, [currentTime]);

  // 8. Player Event Handlers
  const handlePlayerStateChange = useCallback(
    (event: any) => {
      const state = event.data;
      if (!window.YT) return;

      if (state === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setPlayerState('playing');
        startProgressTimer();
      } else if (state === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        setPlayerState('paused');
        stopProgressTimer();
      } else if (state === window.YT.PlayerState.BUFFERING) {
        setPlayerState('buffering');
      } else if (state === window.YT.PlayerState.ENDED) {
        setPlayerState('ended');
        stopProgressTimer();
        playNext();
      } else if (state === window.YT.PlayerState.CUED) {
        setPlayerState('cued');
      }
    },
    [playNext, startProgressTimer, stopProgressTimer]
  );

  const handlePlayerError = useCallback(
    (event: any) => {
      const errorCode = event.data;
      console.warn('YouTube Player error code:', errorCode);
      setPlayerState('error');

      // Error codes: 2 (invalid param), 5 (HTML5 error), 100 (not found/private), 101/150 (not allowed to embed)
      showToast("This song can't be played here, playing next song...");

      // Automatically skip to the next in queue or fallback
      setTimeout(() => {
        const q = queueRef.current;
        if (q.length > 0) {
          playNext();
        } else {
          // Play next preset track
          const altTrack = MUSIC_PRESET_CHIPS[0].curatedTracks[1] || DEFAULT_TRACK;
          if (altTrack.id !== currentTrackRef.current.id) {
            playTrack(altTrack);
          }
        }
      }, 1200);
    },
    [playNext, showToast]
  );

  // 9. Initialize YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPlayer = () => {
      const container = document.getElementById('youtube-audio-player-host');
      if (!container || playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player('youtube-audio-player-host', {
          height: '100%',
          width: '100%',
          videoId: currentTrackRef.current.id,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target.setVolume(volume);
              } catch (e) {}
            },
            onStateChange: handlePlayerStateChange,
            onError: handlePlayerError,
          },
        });
      } catch (err) {
        console.error('Failed to instantiate YouTube player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!isApiLoadedRef.current) {
        isApiLoadedRef.current = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }

      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initPlayer();
      };
    }

    return () => {
      stopProgressTimer();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [handlePlayerError, handlePlayerStateChange, stopProgressTimer, volume]);

  // 10. Play a specific track
  const playTrack = useCallback(
    (track: YouTubeTrack) => {
      setCurrentTrack(track);
      currentTrackRef.current = track;
      festiveAudio.playBellChime(950);

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(track.id);
          setIsPlaying(true);
        } catch (e) {
          console.error('Error loading video by ID:', e);
        }
      }
    },
    []
  );

  // 11. Playback Controls
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Error toggling play state:', e);
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (e) {}
    }
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {}
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch (e) {}
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    setVolumeState(clamped);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(clamped);
        if (clamped > 0 && isMuted) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } catch (e) {}
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {}
  }, [isMuted]);

  const toggleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === 'loop-one') return 'loop-queue';
      if (prev === 'loop-queue') return 'off';
      return 'loop-one';
    });
  }, []);

  // 12. Queue Operations
  const addToQueue = useCallback((track: YouTubeTrack) => {
    setQueue((prev) => [...prev, { ...track, addedAt: Date.now() }]);
    showToast(`Added to queue: ${track.title}`);
  }, [showToast]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    showToast('Queue cleared');
  }, [showToast]);

  // 13. Direct URL / Link Playback
  const playFromUrl = useCallback(
    (inputUrl: string): boolean => {
      const parsed = parseYouTubeUrl(inputUrl);
      if (!parsed || !parsed.videoId) {
        showToast('Invalid YouTube link. Please paste a video or playlist URL.');
        return false;
      }

      const newTrack: YouTubeTrack = {
        id: parsed.videoId,
        title: `YouTube Video: ${parsed.videoId}`,
        channelTitle: 'Direct Link',
        thumbnailUrl: `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`,
      };

      playTrack(newTrack);
      showToast('Loaded YouTube track! 🎵');
      return true;
    },
    [playTrack, showToast]
  );

  // 14. YouTube Data API v3 Search
  const searchTracks = useCallback(
    async (query: string): Promise<YouTubeTrack[]> => {
      const q = query.trim();
      if (!q) {
        setSearchResults([]);
        setSearchError(null);
        return [];
      }

      // 1. Check in-memory / sessionStorage cache
      const cacheKey = `${SEARCH_CACHE_PREFIX}${q.toLowerCase()}`;
      try {
        const cachedStr = sessionStorage.getItem(cacheKey);
        if (cachedStr) {
          const cachedData: SearchCacheItem = JSON.parse(cachedStr);
          // 1 hour cache validity
          if (Date.now() - cachedData.timestamp < 3600000) {
            setSearchResults(cachedData.results);
            setSearchError(null);
            return cachedData.results;
          }
        }
      } catch (e) {}

      // 2. Check if API key is configured
      if (!apiKey) {
        setSearchError(
          'YouTube API key is not configured in VITE_YOUTUBE_API_KEY. You can still paste any YouTube link or pick from the festive presets!'
        );
        // Fallback: search within curated presets
        const lowerQ = q.toLowerCase();
        const fallbackResults: YouTubeTrack[] = [];
        MUSIC_PRESET_CHIPS.forEach((chip) => {
          chip.curatedTracks.forEach((track) => {
            if (
              track.title.toLowerCase().includes(lowerQ) ||
              chip.name.toLowerCase().includes(lowerQ) ||
              chip.tagline.toLowerCase().includes(lowerQ)
            ) {
              if (!fallbackResults.some((r) => r.id === track.id)) {
                fallbackResults.push(track);
              }
            }
          });
        });

        const results = fallbackResults.length > 0 ? fallbackResults : MUSIC_PRESET_CHIPS[0].curatedTracks;
        setSearchResults(results);
        return results;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const enhancedQuery = `${q} music`;
        let data: any = null;

        // Try backend proxy first (avoids browser CORS & referrer header limitations)
        try {
          const proxyRes = await fetch(`/api/youtube/search?q=${encodeURIComponent(enhancedQuery)}`);
          if (proxyRes.ok) {
            data = await proxyRes.json();
          }
        } catch (proxyErr) {
          // Fall through to direct call
        }

        // Direct YouTube API call if proxy was unavailable or didn't return data
        if (!data) {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&videoSyndicated=true&maxResults=12&q=${encodeURIComponent(
            enhancedQuery
          )}&key=${apiKey}`;

          const res = await fetch(url);
          if (!res.ok) {
            if (res.status === 403) {
              throw new Error('YouTube API quota exceeded or key restricted.');
            }
            throw new Error(`Search failed: HTTP ${res.status}`);
          }
          data = await res.json();
        }

        if (data?.error) {
          throw new Error(data.error.message || 'YouTube search error');
        }

        const items = data?.items || [];
        const tracks: YouTubeTrack[] = items.map((item: any) => ({
          id: item.id?.videoId || '',
          title: item.snippet?.title || 'YouTube Track',
          channelTitle: item.snippet?.channelTitle || 'Artist',
          thumbnailUrl:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.high?.url ||
            `https://img.youtube.com/vi/${item.id?.videoId}/hqdefault.jpg`,
        }));

        setSearchResults(tracks);

        // Cache results
        try {
          const cacheData: SearchCacheItem = {
            timestamp: Date.now(),
            results: tracks,
          };
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {}

        return tracks;
      } catch (err: any) {
        console.warn('YouTube search notice:', err.message);
        setSearchError(
          `${err.message || 'API key error'}. (Note: Ensure 'YouTube Data API v3' is enabled in Google Cloud Console with HTTP referrer restrictions. In the meantime, you can paste any YouTube link or pick from the festive presets!)`
        );

        // Graceful fallback: show matching curated festive tracks so search never feels empty
        const lowerQ = q.toLowerCase();
        const fallbackResults: YouTubeTrack[] = [];
        MUSIC_PRESET_CHIPS.forEach((chip) => {
          chip.curatedTracks.forEach((track) => {
            if (
              track.title.toLowerCase().includes(lowerQ) ||
              chip.name.toLowerCase().includes(lowerQ) ||
              chip.tagline.toLowerCase().includes(lowerQ)
            ) {
              if (!fallbackResults.some((r) => r.id === track.id)) {
                fallbackResults.push(track);
              }
            }
          });
        });

        const fallback = fallbackResults.length > 0 ? fallbackResults : MUSIC_PRESET_CHIPS[0].curatedTracks;
        setSearchResults(fallback);
        return fallback;
      } finally {
        setIsSearching(false);
      }
    },
    [apiKey]
  );

  // 15. Media Session API
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.channelTitle,
        album: 'Diwali Digital Diya Music',
        artwork: [
          { src: currentTrack.thumbnailUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.thumbnailUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seekTo(details.seekTime);
        }
      });
    } catch (e) {}
  }, [currentTrack, pause, playNext, playPrevious, resume, seekTo]);

  return {
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
    pause,
    resume,
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
    showToast,
  };
}

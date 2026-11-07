import { useState, useEffect, useCallback } from 'react';
import { festiveAudio } from '../utils/audio';

export interface AudioState {
  isMuted: boolean;
}

export function useAudioState() {
  const [isMuted, setIsMuted] = useState<boolean>(festiveAudio.isMuted());

  useEffect(() => {
    setIsMuted(festiveAudio.isMuted());

    const unsubscribe = festiveAudio.subscribe(() => {
      setIsMuted(festiveAudio.isMuted());
    });

    return unsubscribe;
  }, []);

  const toggleSfxMute = useCallback(() => {
    festiveAudio.toggleSfxMute();
  }, []);

  return {
    isMuted,
    isSfxMuted: isMuted,
    toggleSfxMute,
  };
}

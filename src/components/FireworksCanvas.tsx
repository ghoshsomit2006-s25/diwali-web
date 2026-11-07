import React, { useEffect, useRef, useState } from 'react';
import { FireworksEngine, BurstType } from '../utils/fireworks';
import { Sparkles, Play, Square } from 'lucide-react';
import { festiveAudio } from '../utils/audio';

export const FireworksCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FireworksEngine | null>(null);
  const [isAutoShow, setIsAutoShow] = useState(false);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new FireworksEngine(canvas);
    engine.start();
    engineRef.current = engine;

    // Listen to global events
    const handleTriggerBurst = (e: any) => {
      const count = e.detail?.count || 3;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!engineRef.current) return;
          const x = 0.2 * window.innerWidth + Math.random() * (0.6 * window.innerWidth);
          const y = 80 + Math.random() * (window.innerHeight * 0.4);
          engineRef.current.launch(x, x + (Math.random() * 80 - 40), y);
        }, i * 280);
      }
    };

    const handleTriggerShow = () => {
      if (engineRef.current) {
        setIsAutoShow(true);
        engineRef.current.startAutoShow(() => {
          setIsAutoShow(false);
        });
      }
    };

    window.addEventListener('trigger-fireworks-burst', handleTriggerBurst);
    window.addEventListener('trigger-fireworks-show', handleTriggerShow);

    return () => {
      window.removeEventListener('trigger-fireworks-burst', handleTriggerBurst);
      window.removeEventListener('trigger-fireworks-show', handleTriggerShow);
      engine.destroy();
    };
  }, []);

  // Handle click on canvas to launch firework
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    const startX = targetX + (Math.random() * 80 - 40);

    engineRef.current.launch(startX, targetX, targetY);
  };

  const toggleAutoShow = () => {
    if (!engineRef.current) return;
    if (isAutoShow) {
      engineRef.current.stopAutoShow();
      setIsAutoShow(false);
      festiveAudio.playBellChime(500);
    } else {
      setIsAutoShow(true);
      festiveAudio.playSparkle();
      engineRef.current.startAutoShow(() => {
        setIsAutoShow(false);
      });
    }
  };

  return (
    <>
      {/* Full-screen Fireworks canvas layer */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="fixed inset-0 w-full h-full pointer-events-auto z-10 select-none cursor-pointer"
        style={{ pointerEvents: 'none' }} // Set to none globally so elements below are clickable, but we'll re-enable on click through or specific zones
      />

      {/* Floating Auto Fireworks Show Pill Button in bottom-right */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={toggleAutoShow}
          aria-label="Toggle choreographed fireworks show"
          className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer border ${
            isAutoShow
              ? 'bg-rose-600/90 hover:bg-rose-700 text-white border-rose-400 animate-pulse'
              : 'bg-purple-950/80 hover:bg-purple-900 text-amber-300 border-amber-500/40 hover:scale-105'
          }`}
        >
          {isAutoShow ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Fireworks Show</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>30s Auto Fireworks Show</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

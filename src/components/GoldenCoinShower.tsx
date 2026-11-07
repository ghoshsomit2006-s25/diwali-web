import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { festiveAudio } from '../utils/audio';

interface Coin {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

export const GoldenCoinShower: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(false);

  const triggerCoins = () => {
    setIsActive(true);
    festiveAudio.playCoinSound();
    festiveAudio.playSparkle();

    const newCoins: Coin[] = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      newCoins.push({
        id: i,
        x: Math.random() * 95, // Percentage
        size: 24 + Math.random() * 20,
        delay: Math.random() * 1.8,
        duration: 3 + Math.random() * 2,
        rotation: Math.random() * 720,
      });
    }

    setCoins(newCoins);

    // Play periodic coin clinks
    for (let c = 1; c <= 6; c++) {
      setTimeout(() => {
        festiveAudio.playCoinSound();
      }, c * 400);
    }

    setTimeout(() => {
      setIsActive(false);
      setCoins([]);
    }, 6000);
  };

  useEffect(() => {
    // 1. Listen for global custom event
    const handleEvent = () => triggerCoins();
    window.addEventListener('trigger-coin-shower', handleEvent);

    // 2. Listen for secret keystroke "lakshmi"
    let buffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      buffer += e.key.toLowerCase();
      if (buffer.length > 10) {
        buffer = buffer.slice(-10);
      }
      if (buffer.includes('lakshmi')) {
        buffer = '';
        triggerCoins();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('trigger-coin-shower', handleEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Sacred notification banner */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-amber-950/90 border-2 border-amber-400 text-amber-200 px-6 py-2 rounded-full shadow-[0_0_35px_rgba(255,215,0,0.8)] backdrop-blur-md text-sm font-hindi font-bold flex items-center gap-2"
          >
            <span>✨</span>
            <span>॥ ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥</span>
            <span className="font-sans text-xs text-amber-300 font-semibold">(Goddess Lakshmi Blesses You with Abundance!)</span>
          </motion.div>

          {/* Falling Coins */}
          {coins.map((c) => (
            <motion.div
              key={c.id}
              initial={{ y: -60, x: `${c.x}vw`, rotateY: 0, opacity: 1 }}
              animate={{
                y: '105vh',
                rotateY: c.rotation,
                rotateZ: c.rotation / 2,
                opacity: [1, 1, 1, 0.8],
              }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                ease: 'linear',
              }}
              style={{
                width: c.size,
                height: c.size,
                position: 'absolute',
                top: 0,
              }}
              className="drop-shadow-[0_4px_10px_rgba(255,180,0,0.8)]"
            >
              {/* Golden Coin SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" fill="#FFA000" />
                <circle cx="50" cy="50" r="42" fill="#FFD700" stroke="#FFF9C4" strokeWidth="2" />
                <circle cx="50" cy="50" r="34" fill="#FFA000" stroke="#FF8F00" strokeWidth="1.5" />
                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fill="#FFF8E1"
                  fontSize="22"
                  fontWeight="bold"
                  fontFamily="serif"
                >
                  卐
                </text>
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

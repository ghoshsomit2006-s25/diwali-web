/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ToranBanner } from './components/ToranBanner';
import { HeroDiyaIntro } from './components/HeroDiyaIntro';
import { GreetingCardSection } from './components/GreetingCardSection';
import { DiyasGrid } from './components/DiyasGrid';
import { RangoliCanvas } from './components/RangoliCanvas';
import { WishLanterns } from './components/WishLanterns';
import { DiwaliTimelineAndQuiz } from './components/DiwaliTimelineAndQuiz';
import { PanditJiChat } from './components/PanditJiChat';
import { GoldenCoinShower } from './components/GoldenCoinShower';
import { FireworksCanvas } from './components/FireworksCanvas';
import { Footer } from './components/Footer';
import { GreetingData, ThemeMode } from './types';

// YouTube Music-Style Player Integration
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { MiniPlayer } from './components/music/MiniPlayer';
import { MusicPanel } from './components/music/MusicPanel';
import { MusicFloatingButton } from './components/music/MusicFloatingButton';

// Marigold Petal Definition for falling ambient animation
interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  scale: number;
  rotation: number;
}

export default function App() {
  const [isLit, setIsLit] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('classic-gold');
  const [attachedRangoli, setAttachedRangoli] = useState<string | undefined>(undefined);
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  // YouTube Music Player Controller Hook
  const player = useYouTubePlayer();

  const [greetingData, setGreetingData] = useState<GreetingData>({
    receiverName: '',
    senderName: '',
    message:
      'May the divine lights of Diwali spread peace, prosperity, joyful health, and everlasting happiness to you and your loved ones!',
    tone: 'heartfelt',
    language: 'English',
    relationship: 'friend',
    theme: 'classic-gold',
  });

  // Falling Petals State
  const [petals, setPetals] = useState<Petal[]>([]);

  // Golden Cursor Sparkle Trail
  const [cursorSparkles, setCursorSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  // 1. Read URL query parameters on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    const from = params.get('from');
    const msg = params.get('msg');
    const theme = params.get('theme') as ThemeMode;

    if (to || from || msg || theme) {
      setGreetingData((prev) => ({
        ...prev,
        receiverName: to || prev.receiverName,
        senderName: from || prev.senderName,
        message: msg || prev.message,
        theme: theme && ['classic-gold', 'royal-purple', 'cyber-neon', 'eco-green'].includes(theme)
          ? theme
          : prev.theme,
      }));

      if (theme) {
        setCurrentTheme(theme);
      }
    }

    // Generate falling marigold petals
    const newPetals: Petal[] = [];
    for (let i = 0; i < 22; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 98,
        delay: Math.random() * 12,
        duration: 9 + Math.random() * 8,
        scale: 0.6 + Math.random() * 0.7,
        rotation: Math.random() * 360,
      });
    }
    setPetals(newPetals);
  }, []);

  // 2. Sparkle trail on pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (Math.random() > 0.4) return;
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setCursorSparkles((prev) => [...prev.slice(-18), newSparkle]);

    setTimeout(() => {
      setCursorSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
    }, 600);
  };

  // Scroll smoothly to Greeting Card Section
  const handleExploreClick = () => {
    const el = document.getElementById('greet-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Theme-based root background classes
  const getThemeBackground = () => {
    switch (currentTheme) {
      case 'royal-purple':
        return 'bg-gradient-to-b from-[#100320] via-[#1b0533] to-[#07010f] text-fuchsia-100';
      case 'cyber-neon':
        return 'bg-gradient-to-b from-[#020b14] via-[#051c2c] to-[#01080e] text-cyan-100';
      case 'eco-green':
        return 'bg-gradient-to-b from-[#021309] via-[#072413] to-[#010a05] text-emerald-100';
      case 'classic-gold':
      default:
        return 'bg-gradient-to-b from-[#080214] via-[#150424] to-[#090212] text-amber-100';
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`min-h-screen relative overflow-x-hidden selection:bg-amber-500 selection:text-black transition-colors duration-700 ${getThemeBackground()}`}
    >
      {/* Dynamic Night Sky Twinkling Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 45 }).map((_, i) => {
            const cx = ((i * 89 + 17) % 97) + '%';
            const cy = ((i * 73 + 31) % 95) + '%';
            const r = i % 3 === 0 ? 1.5 : 1.0;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="#FFF9C4"
                className="animate-pulse"
                style={{ animationDuration: `${2 + (i % 4)}s`, animationDelay: `${(i % 5) * 0.4}s` }}
              />
            );
          })}
        </svg>
      </div>

      {/* Falling Marigold Petals Layer */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {petals.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}vw`,
              top: '-30px',
              animation: `fallPetal ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
            }}
            className="opacity-70 drop-shadow-[0_2px_4px_rgba(255,140,0,0.5)]"
          >
            {/* SVG Marigold Petal */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C9.5 6 5 9 5 13.5C5 17.5 8.13 21 12 21C15.87 21 19 17.5 19 13.5C19 9 14.5 6 12 2Z"
                fill="url(#petalGrad)"
              />
              <defs>
                <linearGradient id="petalGrad" x1="5" y1="2" x2="19" y2="21">
                  <stop stopColor="#FFB300" />
                  <stop offset="0.5" stopColor="#FF9800" />
                  <stop offset="1" stopColor="#E65100" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fallPetal {
          0% {
            transform: translateY(-30px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      {/* Sparkle cursor trail dots */}
      {cursorSparkles.map((s) => (
        <div
          key={s.id}
          style={{ left: s.x, top: s.y }}
          className="fixed pointer-events-none z-50 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd700] animate-ping"
        />
      ))}

      {/* Interactive Canvas Fireworks Engine Layer */}
      <FireworksCanvas />

      {/* Easter Egg Golden Coin Shower Component */}
      <GoldenCoinShower />

      {/* Top Swaying Toran Flower Garland & Akash Kandil */}
      <ToranBanner />

      {/* Sticky Glass Navbar */}
      <Navbar
        currentTheme={currentTheme}
        onThemeChange={(th) => {
          setCurrentTheme(th);
          setGreetingData((prev) => ({ ...prev, theme: th }));
        }}
        isLit={isLit}
        nowPlayingTrack={{
          title: player.currentTrack.title,
          channelTitle: player.currentTrack.channelTitle,
          isPlaying: player.isPlaying,
          thumbnailUrl: player.currentTrack.thumbnailUrl,
        }}
        onOpenMusic={() => setIsMusicOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-20">
        {/* Section 2: Landing / Hero Diya Intro */}
        <section id="hero-section">
          <HeroDiyaIntro
            onLightUp={() => setIsLit(true)}
            isLit={isLit}
            receiverName={greetingData.receiverName}
            senderName={greetingData.senderName}
            customGreeting={greetingData.message}
            onExploreClick={handleExploreClick}
          />
        </section>

        {/* Section 3: Personalized Greetings Card & Share Builder */}
        <section>
          <GreetingCardSection
            initialGreeting={greetingData}
            onUpdateGreeting={(updated) => setGreetingData(updated)}
            attachedRangoli={attachedRangoli}
          />
        </section>

        {/* Section 4: Animated 11 Sacred Diyas Grid */}
        <section>
          <DiyasGrid />
        </section>

        {/* Section 5: Interactive Symmetrical Rangoli Creator */}
        <section>
          <RangoliCanvas onAttachToCard={(dataUrl) => setAttachedRangoli(dataUrl)} />
        </section>

        {/* Section 8: Make a Wish & Sky Wish Wall */}
        <section>
          <WishLanterns />
        </section>

        {/* Section 8: Five-Day Diwali Timeline & Knowledge Quiz */}
        <section>
          <DiwaliTimelineAndQuiz />
        </section>
      </main>

      {/* Section 8: Ask Pandit-ji AI Assistant Widget */}
      <PanditJiChat />

      {/* Permanent YouTube IFrame Player (Hidden Mount Container) */}
      <MiniPlayer />

      {/* Floating Circular Music Button (Bottom-Left) */}
      <MusicFloatingButton
        isOpen={isMusicOpen}
        onToggle={() => setIsMusicOpen((prev) => !prev)}
        isPlaying={player.isPlaying}
        trackTitle={player.currentTrack.title}
        channelTitle={player.currentTrack.channelTitle}
        thumbnailUrl={player.currentTrack.thumbnailUrl}
        beatPulse={player.beatPulse}
        onTogglePlay={player.togglePlay}
      />

      {/* YouTube Music Slide-Up Glassmorphism Player Panel */}
      <MusicPanel
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        player={player}
      />

      {/* Section 9: Footer with Official Contest Attribution */}
      <Footer />
    </div>
  );
}

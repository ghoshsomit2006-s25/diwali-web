import React, { useState } from 'react';
import { Volume2, VolumeX, Palette, Menu, X, Sparkles, Moon, LogIn, LogOut } from 'lucide-react';
import { useAudioState } from '../hooks/useAudioState';
import { useAuth } from '../context/AuthContext';
import { festiveAudio } from '../utils/audio';
import { ThemeMode } from '../types';

interface NavbarProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isLit: boolean;
  nowPlayingTrack?: {
    title: string;
    channelTitle?: string;
    isPlaying: boolean;
    thumbnailUrl?: string;
  };
  onOpenMusic?: () => void;
}

const THEMES: { id: ThemeMode; name: string; icon: string }[] = [
  { id: 'classic-gold', name: 'Classic Gold', icon: '🟡' },
  { id: 'royal-purple', name: 'Royal Purple', icon: '🟣' },
  { id: 'cyber-neon', name: 'Cyber Neon', icon: '🔵' },
  { id: 'eco-green', name: 'Eco Green', icon: '🟢' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  isLit,
  nowPlayingTrack,
  onOpenMusic,
}) => {
  const { isMuted, toggleSfxMute } = useAudioState();
  const { user, signInWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggleSfx = () => {
    toggleSfxMute();
    if (isMuted) festiveAudio.playBellChime(880);
  };

  const handleMoonClick = () => {
    const event = new CustomEvent('trigger-coin-shower');
    window.dispatchEvent(event);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0216]/80 border-b border-amber-500/20 px-3 sm:px-6 py-2.5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            onClick={handleMoonClick}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_#ffa500] cursor-pointer hover:rotate-12 transition-transform"
            title="Click for Lakshmi's Blessing Coin Shower!"
          >
            <span className="text-base sm:text-lg">🪔</span>
          </div>

          <div className="flex flex-col">
            <span className="font-heading font-bold text-xs sm:text-base tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
              Diwali Digital Diya
            </span>
            <span className="text-[9px] text-amber-300/70 font-devanagari tracking-wider">
              ॥ शुभ दीपावली ॥
            </span>
          </div>

          {/* Secret Moon Easter Egg Trigger */}
          <button
            onClick={handleMoonClick}
            title="Full Moon of Kartik: Click for a Golden Coin Shower!"
            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300/80 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full transition-all cursor-pointer"
          >
            <Moon className="w-3 h-3 text-amber-300" />
            <span>Kartik Moon</span>
          </button>

          {/* Now-Playing Music Ticker in Navbar */}
          {nowPlayingTrack && nowPlayingTrack.title && (
            <button
              onClick={onOpenMusic}
              title={`Now Playing: ${nowPlayingTrack.title}. Click to open player.`}
              className="hidden md:flex items-center gap-2 max-w-[220px] lg:max-w-[280px] px-3 py-1 rounded-full bg-purple-950/80 hover:bg-purple-900/90 border border-amber-400/40 hover:border-amber-300 text-xs transition-all cursor-pointer shadow group"
            >
              <span
                className={`w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 ${
                  nowPlayingTrack.isPlaying ? 'animate-ping' : ''
                }`}
              />
              <div className="overflow-hidden whitespace-nowrap text-[11px] flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">Music:</span>
                <span className="text-amber-100 group-hover:text-amber-300 truncate">
                  {nowPlayingTrack.title}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-amber-200/90">
          <button
            onClick={() => scrollTo('greet-section')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Personalized Card
          </button>
          <button
            onClick={() => scrollTo('diyas-section')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            11 Sacred Diyas
          </button>
          <button
            onClick={() => scrollTo('rangoli-section')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Interactive Rangoli
          </button>
          <button
            onClick={() => scrollTo('wishes-section')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Wish Wall
          </button>
          <button
            onClick={() => scrollTo('lore-section')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            5-Day Lore &amp; Quiz
          </button>
        </div>

        {/* Right Controls: SFX Mute, Theme, Auth, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SFX Mute/Unmute Toggle Button */}
          <button
            onClick={handleToggleSfx}
            aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="px-2.5 py-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-amber-500/30 text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px] text-rose-300">SFX Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[11px] text-amber-200">SFX Active</span>
              </>
            )}
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker((p) => !p)}
              className="p-2 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-amber-500/30 text-amber-300 transition-all cursor-pointer"
              title="Change Festive Theme"
              aria-label="Select Color Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-48 bg-[#120426] border border-amber-500/40 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 text-xs">
                <span className="text-[10px] text-amber-300/70 uppercase tracking-widest block px-2 py-1 font-bold">
                  Theme Palette
                </span>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setShowThemePicker(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentTheme === t.id
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-amber-100 hover:bg-white/5'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="flex items-center gap-1.5 p-1 rounded-full bg-purple-950/80 border border-amber-400/50 hover:border-amber-300 cursor-pointer transition-all"
                title={`Signed in as ${user.displayName || user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#120426] border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-2">
                  <div className="border-b border-amber-500/20 pb-2">
                    <p className="font-bold text-amber-200 truncate">{user.displayName || 'Devotee'}</p>
                    <p className="text-[10px] text-amber-300/60 truncate">{user.email}</p>
                  </div>
                  <div className="text-[10px] text-amber-300/80 flex items-center gap-1.5 py-1">
                    <span>✨ Cloud Sync: Active with Firestore</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              type="button"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="p-2 rounded-full lg:hidden bg-purple-950/60 border border-amber-500/30 text-amber-300 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-amber-500/20 px-2 pb-3 space-y-2 text-sm text-amber-200">
          <button
            onClick={() => scrollTo('greet-section')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15"
          >
            ✉️ Personalized Card
          </button>
          <button
            onClick={() => scrollTo('diyas-section')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15"
          >
            🪔 11 Sacred Diyas
          </button>
          <button
            onClick={() => scrollTo('rangoli-section')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15"
          >
            🎨 Interactive Rangoli
          </button>
          <button
            onClick={() => scrollTo('wishes-section')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15"
          >
            ✨ Sky Wish Wall
          </button>
          <button
            onClick={() => scrollTo('lore-section')}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15"
          >
            📜 5-Day Lore &amp; Quiz
          </button>
          <button
            onClick={handleMoonClick}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-amber-500/15 text-amber-300 font-semibold"
          >
            🌕 Auspicious Coin Shower
          </button>
        </div>
      )}
    </nav>
  );
};

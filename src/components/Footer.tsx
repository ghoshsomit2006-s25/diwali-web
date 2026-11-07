import React from 'react';
import { Heart, Sparkles, Moon } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05010e] border-t border-amber-500/20 py-10 px-4 text-center text-xs text-amber-200/70 relative z-20">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Sanskrit Auspicious Peace Shanti Shloka */}
        <p className="font-hindi text-base sm:text-lg text-amber-300 font-medium tracking-wider">
          ॥ ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥
        </p>
        <p className="text-xs text-amber-400/80 italic font-serif">
          "Lead us from darkness unto light, from falsehood unto truth, from mortality unto immortality."
        </p>

        {/* Contest & Student Builder Group Credits required by prompt */}
        <div className="py-2 border-y border-amber-500/15 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold text-amber-200">
            Made with <span className="text-rose-500">❤️</span> for Diwali Digital Diya Contest | GDG on Campus JIS University × AWS Student Builder Group JIS University
          </p>
        </div>

        {/* Easter Egg Hint & Pure Web Audio note */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-amber-300/60">
          <span>✨ 100% Procedural Web Audio API &amp; Canvas</span>
          <span>·</span>
          <span>Zero External Asset Files</span>
          <span>·</span>
          <span>Secret: Type <span className="text-amber-300 font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">lakshmi</span> for a coin shower</span>
        </div>

        <p className="text-[10px] text-amber-400/40">
          Celebrating Eco-Friendly &amp; Humane Diwali 2026. Keep stray animals safe &amp; illuminate every heart.
        </p>
      </div>
    </footer>
  );
};

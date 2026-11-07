import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Heart, Globe, Flame } from 'lucide-react';
import { WishItem } from '../types';
import { festiveAudio } from '../utils/audio';

const LANTERN_COLORS = ['#ff9933', '#ffd700', '#ff4081', '#00e676', '#e040fb', '#00e5ff'];

export const WishLanterns: React.FC = () => {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [name, setName] = useState('');
  const [wishText, setWishText] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentlyFloatingWish, setRecentlyFloatingWish] = useState<WishItem | null>(null);

  // Real-time synchronization with Firestore collection 'wishes'
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      import('../lib/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, onSnapshot, query, limit }) => {
          const wishesRef = collection(db, 'wishes');
          const q = query(wishesRef, limit(40));

          unsubscribeFirestore = onSnapshot(
            q,
            (snapshot) => {
              if (!snapshot.empty) {
                const cloudWishes: WishItem[] = snapshot.docs.map((docSnap) => {
                  const data = docSnap.data();
                  return {
                    id: docSnap.id,
                    name: data.name || 'Anonymous',
                    wish: data.wish || '',
                    location: data.location || 'Earth',
                    color: data.color || '#ff9933',
                    createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : data.createdAt || Date.now(),
                  };
                });
                setWishes(cloudWishes);
              }
            },
            (err) => {
              console.warn('Firestore snapshot error, falling back to server API:', err);
              fallbackFetch();
            }
          );
        });
      });
    } catch (e) {
      fallbackFetch();
    }

    function fallbackFetch() {
      fetch('/api/wishes')
        .then((res) => res.json())
        .then((data) => {
          if (data.wishes && data.wishes.length > 0) {
            setWishes(data.wishes);
          }
        })
        .catch((err) => console.error('Wish fetch error:', err));
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    festiveAudio.playDiyaWhoosh();
    festiveAudio.playBellChime(880);

    const randomColor = LANTERN_COLORS[Math.floor(Math.random() * LANTERN_COLORS.length)];
    const wishId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newWish: WishItem = {
      id: wishId,
      name: name.trim() || 'Anonymous Devotee',
      wish: wishText.trim(),
      location: location.trim() || 'Earth',
      color: randomColor,
      createdAt: Date.now(),
    };

    // Trigger floating lantern animation
    setRecentlyFloatingWish(newWish);
    setWishes((prev) => [newWish, ...prev.filter((w) => w.id !== wishId)]);

    try {
      const { db } = await import('../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');

      await setDoc(doc(db, 'wishes', wishId), {
        id: wishId,
        name: newWish.name,
        wish: newWish.wish,
        location: newWish.location,
        color: newWish.color,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Direct Firestore save failed, syncing with server fallback:', err);
      try {
        await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newWish.name,
            wish: newWish.wish,
            location: newWish.location,
            color: newWish.color,
          }),
        });
      } catch (postErr) {
        // Optimistic state remains
      }
    } finally {
      setIsSubmitting(false);
      setWishText('');
      setTimeout(() => {
        setRecentlyFloatingWish(null);
      }, 7000);
    }
  };

  return (
    <div id="wishes-section" className="py-12 px-4 max-w-6xl mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
          Make a Wish &amp; Sky Lanterns
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif shimmer-gold mt-2">
          The Sacred Diwali Wish Wall
        </h2>
        <p className="text-amber-200/80 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
          Release your prayer or wish into the cosmic night. Watch your glowing Akash Diya rise to join prayers of goodwill from around the globe.
        </p>
      </div>

      {/* Floating Lantern Animation when user releases a wish */}
      <AnimatePresence>
        {recentlyFloatingWish && (
          <motion.div
            initial={{ y: 250, opacity: 0, scale: 0.8 }}
            animate={{ y: -500, opacity: [0, 1, 1, 0.4, 0], scale: [0.8, 1.1, 0.9, 0.7] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6.5, ease: 'easeOut' }}
            className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center"
          >
            {/* Glowing Lantern */}
            <div
              className="w-16 h-22 rounded-t-2xl rounded-b-lg p-2 flex flex-col items-center justify-between shadow-[0_0_40px_rgba(255,180,0,0.9)] border border-amber-300"
              style={{
                backgroundColor: `${recentlyFloatingWish.color}99`,
                boxShadow: `0 0 45px ${recentlyFloatingWish.color}`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <div className="w-4 h-5 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-full animate-flame" />
            </div>
            <div className="mt-2 text-xs font-serif text-amber-200 bg-black/70 px-3 py-1 rounded-full border border-amber-400/40 backdrop-blur-sm whitespace-nowrap">
              ✨ "{recentlyFloatingWish.wish.slice(0, 30)}..." rising!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wish Submission Form (4 cols) */}
        <div className="lg:col-span-4 bg-purple-950/40 border border-amber-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-amber-300 font-bold text-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Float a Wish Lantern</span>
          </div>

          <form onSubmit={handleSubmitWish} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Diya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. New Delhi, San Francisco, London"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Your Wish or Blessing
              </label>
              <textarea
                rows={3}
                required
                placeholder="Praying for global peace, good health for my family, and sweet beginnings..."
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 text-xs leading-relaxed"
              />
              <span className="text-[10px] text-amber-400/60 block text-right">
                {wishText.length}/200
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !wishText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Floating Lantern...' : 'Send Wish into Night Sky'}</span>
            </button>
          </form>
        </div>

        {/* Global Wish Wall (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-amber-300/80 flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Recent Wishes from Across the World ({wishes.length})
            </span>
            <span className="text-[10px] text-amber-400/60">Updated in real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="relative p-4 rounded-2xl bg-purple-950/30 border border-amber-500/20 hover:border-amber-400/50 backdrop-blur-sm transition-all hover:translate-y-[-2px] shadow-lg flex flex-col justify-between"
              >
                {/* Floating micro lantern icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-5 rounded-t-md rounded-b-sm border border-amber-300 shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: w.color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-200">{w.name}</h4>
                      <p className="text-[10px] text-amber-300/60">{w.location || 'Global'}</p>
                    </div>
                  </div>
                  <Heart className="w-3.5 h-3.5 text-rose-400/70" />
                </div>

                <p className="text-xs font-serif italic text-amber-100/90 leading-relaxed my-1">
                  "{w.wish}"
                </p>

                <div className="text-[10px] text-amber-400/50 text-right mt-2">
                  {new Date(w.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

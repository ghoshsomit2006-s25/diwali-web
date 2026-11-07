import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Sparkles, Share2, Copy, Check, MessageSquare, Download, Wand2, Image as ImageIcon, Heart, Cloud, CloudCheck } from 'lucide-react';
import { GreetingData, ThemeMode } from '../types';
import { festiveAudio } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface GreetingCardSectionProps {
  initialGreeting: GreetingData;
  onUpdateGreeting: (data: GreetingData) => void;
  attachedRangoli?: string;
}

export const GreetingCardSection: React.FC<GreetingCardSectionProps> = ({
  initialGreeting,
  onUpdateGreeting,
  attachedRangoli,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [receiver, setReceiver] = useState(initialGreeting.receiverName || '');
  const [sender, setSender] = useState(initialGreeting.senderName || '');
  const [message, setMessage] = useState(
    initialGreeting.message ||
      'May the divine lights of Diwali spread into your life peace, prosperity, happiness and good health!'
  );
  const [tone, setTone] = useState<GreetingData['tone']>('heartfelt');
  const [language, setLanguage] = useState<GreetingData['language']>('English');
  const [relationship, setRelationship] = useState<GreetingData['relationship']>('friend');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(initialGreeting.theme || 'classic-gold');

  // Photo upload
  const [userPhoto, setUserPhoto] = useState<string | null>(initialGreeting.userPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Typewriter effect state
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [isTyping, setIsTyping] = useState(false);

  // Share buttons state
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // One-click message templates
  const templates = [
    {
      label: 'Traditional',
      text: 'May the divine light of diyas guide you towards joy, wealth, and spiritual wisdom. Wishing you and your family a very blissful Diwali! Shubh Deepavali!',
    },
    {
      label: 'Heartfelt',
      text: 'On this auspicious night of lights, I pray that your life sparkles with true love, inner peace, and cherished memories with those who matter most.',
    },
    {
      label: 'Funny',
      text: 'Happy Diwali! May your laddoos stay calorie-free, your firecrackers not turn into duds, and may nobody gift you that same circulating box of Soan Papdi!',
    },
    {
      label: 'Friends & Family',
      text: 'To my favorite people: thank you for being the warmth and laughter in my life every single day. Wishing you a glittering, sweets-packed Diwali!',
    },
    {
      label: 'Corporate',
      text: 'Wishing you a prosperous Diwali and a rewarding festive season ahead. May our collaboration continue to shine brightly and achieve great milestones.',
    },
    {
      label: 'Shayari',
      text: 'दीपक की रोशनी, पटाखों की आवाज, सूरज की किरणें, खुशियों की बौछार। मुबारक हो आपको दीवाली का पावन त्योहार!',
    },
  ];

  // Sync displayed typewriter message
  useEffect(() => {
    let i = 0;
    setIsTyping(true);
    setDisplayedMessage('');

    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedMessage((prev) => prev + message.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [message]);

  // Update parent state
  useEffect(() => {
    onUpdateGreeting({
      receiverName: receiver,
      senderName: sender,
      message,
      tone,
      language,
      relationship,
      theme: selectedTheme,
      userPhotoUrl: userPhoto || undefined,
      rangoliDataUrl: attachedRangoli,
    });
  }, [receiver, sender, message, tone, language, relationship, selectedTheme, userPhoto, attachedRangoli]);

  // Generate with Gemini Server API
  const handleGenerateGeminiWish = async () => {
    setIsGenerating(true);
    setGeminiError(null);
    festiveAudio.playSparkle();

    try {
      const response = await fetch('/api/gemini/wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverName: receiver || 'Dear One',
          senderName: sender || '',
          relationship,
          tone,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.greeting) {
        setMessage(data.greeting);
        festiveAudio.playBellChime(659.25);
      }
    } catch (err: any) {
      console.error('Error generating wish with Gemini:', err);
      setGeminiError('Used our festive fallback wish. You can edit it anytime below!');
      setMessage(
        `May the radiant light of Diwali bring boundless happiness, health, and abundant prosperity to you, ${receiver || 'dear friend'}!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Build Shareable Link
  const getShareableUrl = () => {
    const origin = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (receiver) params.set('to', receiver);
    if (sender) params.set('from', sender);
    if (message) params.set('msg', message);
    if (selectedTheme) params.set('theme', selectedTheme);
    return `${origin}?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    festiveAudio.playBellChime(880);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = getShareableUrl();
    const text = `✨ *Happy Diwali!* I created a personalized glowing Diya and greeting for you.\n\nOpen to light your diya:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWebShare = async () => {
    const url = getShareableUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Happy Diwali ${receiver || ''}!`,
          text: `✨ I lit a digital diya and created a personalized Diwali greeting for you!`,
          url: url,
        });
      } catch (err) {
        // Share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    festiveAudio.playBellChime(523.25);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0a0418',
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Diwali_Greeting_${receiver || 'Card'}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveCardToCloud = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsSavingCloud(true);
    festiveAudio.playBellChime(659.25);

    try {
      const cardId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'users', user.uid, 'greetings', cardId), {
        id: cardId,
        userId: user.uid,
        receiverName: receiver || 'Family & Friends',
        senderName: sender || user.displayName || 'Devotee',
        message,
        tone,
        language,
        theme: selectedTheme,
        createdAt: new Date().toISOString(),
      });

      setCloudSaved(true);
      festiveAudio.playSparkle();
      setTimeout(() => setCloudSaved(false), 3500);
    } catch (err) {
      console.error('Error saving greeting to Firestore:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhoto(event.target?.result as string);
        festiveAudio.playSparkle();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="greet-section" className="py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
          Personalized Auspicious Wishes
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif shimmer-gold mt-2">
          Create &amp; Share Your Festive Card
        </h2>
        <p className="text-amber-200/80 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
          Customize your message, craft poetry with Gemini AI, embed your family photo or custom rangoli, and send a glowing diya link to loved ones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & AI Generator (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-purple-950/40 via-amber-950/20 to-black/60 border border-amber-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Receiver's Name
              </label>
              <input
                type="text"
                placeholder="e.g. Grandma, Aarav, Ananya, Sharma Family"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                maxLength={45}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-amber-500/40 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Sender's Name (Your Name)
              </label>
              <input
                type="text"
                placeholder="e.g. With love from Rohan"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                maxLength={45}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-amber-500/40 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
              />
            </div>

            {/* AI Generator Controls */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  AI Festive Wish Crafting
                </span>
                <span className="text-[10px] text-amber-400/80 bg-amber-900/50 px-2 py-0.5 rounded">
                  Gemini 3.8 Flash
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-amber-200/70 block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full py-1.5 px-2 bg-purple-950/80 border border-amber-500/30 rounded-lg text-amber-200 text-xs focus:outline-none"
                  >
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                    <option value="partner">Partner</option>
                    <option value="teacher">Teacher / Mentor</option>
                    <option value="colleague">Colleague</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-amber-200/70 block mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full py-1.5 px-2 bg-purple-950/80 border border-amber-500/30 rounded-lg text-amber-200 text-xs focus:outline-none"
                  >
                    <option value="heartfelt">Heartfelt</option>
                    <option value="poetic">Poetic</option>
                    <option value="funny">Funny</option>
                    <option value="traditional">Traditional</option>
                    <option value="corporate">Formal</option>
                    <option value="shayari">Shayari</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-amber-200/70 block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full py-1.5 px-2 bg-purple-950/80 border border-amber-500/30 rounded-lg text-amber-200 text-xs focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateGeminiWish}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is composing your wish...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate Unique Wish with Gemini</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Template Chips */}
            <div>
              <span className="text-[11px] font-medium text-amber-300 block mb-2">
                Or pick a quick template:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => {
                      setMessage(tpl.text);
                      festiveAudio.playBellChime(784);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-800/60 text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Custom Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-amber-500/40 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm leading-relaxed"
              />
              <span className="text-[10px] text-amber-400/60 block text-right">
                {message.length}/300 characters
              </span>
            </div>

            {/* Photo Attachment option */}
            <div className="flex items-center justify-between pt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-amber-200 border border-purple-500/40 flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{userPhoto ? 'Change Photo' : 'Attach Photo to Card'}</span>
              </button>

              {userPhoto && (
                <button
                  type="button"
                  onClick={() => setUserPhoto(null)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Glowing Card Preview & Share Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card Preview Container (Captured by html2canvas) */}
          <div
            ref={cardRef}
            className={`relative rounded-3xl p-6 sm:p-9 border shadow-2xl overflow-hidden transition-all duration-500 ${
              selectedTheme === 'royal-purple'
                ? 'bg-gradient-to-br from-[#1d0637] via-[#2d0a4e] to-[#0c0217] border-purple-500/40'
                : selectedTheme === 'cyber-neon'
                ? 'bg-gradient-to-br from-[#051923] via-[#003554] to-[#000814] border-cyan-400/50 shadow-cyan-500/20'
                : selectedTheme === 'eco-green'
                ? 'bg-gradient-to-br from-[#062414] via-[#0d3b1e] to-[#03140a] border-emerald-500/40'
                : 'bg-gradient-to-br from-[#240d04] via-[#3d1a08] to-[#120501] border-amber-500/50 shadow-amber-500/20'
            }`}
          >
            {/* Corner Decorative Rangoli Elements */}
            <div className="absolute top-2 left-2 opacity-60 pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <circle cx="20" cy="20" r="15" stroke="#FFD700" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#FFA000" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute top-2 right-2 opacity-60 pointer-events-none rotate-90">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <circle cx="20" cy="20" r="15" stroke="#FFD700" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#FFA000" opacity="0.3" />
              </svg>
            </div>

            {/* Glowing Diya Header inside Card */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                {/* Micro Animated Flame */}
                <div className="w-5 h-8 bg-gradient-to-t from-orange-500 via-amber-300 to-white rounded-full animate-flame shadow-[0_0_18px_rgba(255,160,0,0.9)] mx-auto -mb-1" />
                {/* Clay Diya SVG */}
                <svg width="70" height="24" viewBox="0 0 70 24" fill="none">
                  <path d="M5 7 C12 22 58 22 65 7 C60 11 10 11 5 7 Z" fill="#B45309" />
                  <ellipse cx="35" cy="7" rx="27" ry="5" fill="#F59E0B" />
                  <path d="M8 7 C18 10 52 10 62 7" stroke="#FDE047" strokeWidth="1.5" />
                </svg>
              </div>

              <p className="font-hindi text-lg sm:text-xl text-amber-300/90 font-medium">
                ॥ शुभ दीपावली ॥
              </p>

              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold shimmer-gold tracking-tight mt-1 mb-3">
                Happy Diwali, {receiver || 'Family & Friends'}!
              </h3>

              {/* Photo Frame or Attached Rangoli if user included one */}
              <div className="flex flex-wrap items-center justify-center gap-4 my-3">
                {userPhoto && (
                  <div className="relative p-1 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-xl">
                    <img
                      src={userPhoto}
                      alt="Personal celebration"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                )}

                {attachedRangoli && (
                  <div className="relative p-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 shadow-xl">
                    <img
                      src={attachedRangoli}
                      alt="Hand-drawn Rangoli"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-xl bg-black/40"
                    />
                    <div className="absolute -bottom-2 -left-2 bg-purple-600 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold shadow">
                      Rangoli
                    </div>
                  </div>
                )}
              </div>

              {/* Message Body with Typewriter Effect */}
              <div className="min-h-[70px] my-4 max-w-lg mx-auto">
                <p className="font-serif italic text-base sm:text-lg md:text-xl text-amber-100 leading-relaxed font-normal">
                  "{displayedMessage}"
                  {isTyping && <span className="inline-block w-1.5 h-4 bg-amber-400 ml-1 animate-pulse" />}
                </p>
              </div>

              {/* Signature */}
              {sender && (
                <div className="mt-3 text-right w-full max-w-md border-t border-amber-500/20 pt-2">
                  <p className="text-amber-300 font-serif text-sm sm:text-base font-semibold">
                    — {sender}
                  </p>
                </div>
              )}

              {/* Card Footer Stamp */}
              <div className="mt-4 flex items-center justify-between w-full text-[10px] text-amber-400/60 border-t border-amber-500/15 pt-2">
                <span>Diwali Digital Diya</span>
                <span>Festival of Lights 2026</span>
              </div>
            </div>
          </div>

          {/* Share & Download Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-950/40 border border-amber-500/30 p-3.5 rounded-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={handleWebShare}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCardToCloud}
                disabled={isSavingCloud}
                className="px-3.5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isSavingCloud
                    ? 'Saving...'
                    : cloudSaved
                    ? 'Saved to Cloud! ✓'
                    : user
                    ? 'Save to Cloud'
                    : 'Sign in to Save'}
                </span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Saving Card...' : 'Download Card'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

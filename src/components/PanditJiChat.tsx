import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  Zap,
  BookOpen,
  Feather,
  UtensilsCrossed,
  Leaf,
} from 'lucide-react';
import { festiveAudio } from '../utils/audio';

export type ChatRole = 'pandit' | 'kavi' | 'rasoi' | 'eco';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const ROLES: {
  id: ChatRole;
  name: string;
  title: string;
  avatar: string;
  icon: any;
  greeting: string;
  chips: string[];
}[] = [
  {
    id: 'pandit',
    name: 'Pandit-ji AI',
    title: 'Vedic Puja & Traditions Guide',
    avatar: '🕉️',
    icon: BookOpen,
    greeting:
      'Namaste and Shubh Deepavali! 🙏 I am Pandit-ji AI. Ask me about Lakshmi-Ganesha puja vidhi, auspicious dates, symbolic rituals, and the sacred stories of Diwali.',
    chips: [
      'How to do Lakshmi Puja at home step-by-step?',
      'Why do we light 13 diyas on Dhanteras?',
      'What direction should diyas face?',
      'Significance of Govardhan Annakut',
    ],
  },
  {
    id: 'kavi',
    name: 'Kavi-ji',
    title: 'Festive Poet & Shayar',
    avatar: '✍️',
    icon: Feather,
    greeting:
      'Aadaab and Shubh Deepavali! ✨ I am Kavi-ji. Tell me whom you wish to greet, and I will compose couplets, shayari, and rhyming festive poetry for you.',
    chips: [
      'Write a 4-line Diwali shayari for my parents',
      'Poetic greeting for my beloved with diya metaphors',
      'Funny rhyme for friends eating too many sweets',
      'Traditional Hindi blessing for new beginnings',
    ],
  },
  {
    id: 'rasoi',
    name: 'Chef Rasoi-ji',
    title: 'Mithai & Recipes Master',
    avatar: '🍲',
    icon: UtensilsCrossed,
    greeting:
      'Swagatam! 🪔 I am Chef Rasoi-ji. Need quick tips for melt-in-mouth Kaju Katli, crispy Chakli, golden Besan Ladoo, or Gulab Jamun sugar syrup consistency?',
    chips: [
      'Authentic 15-minute Kaju Katli recipe',
      'How to get perfect one-string chashni?',
      'Besan Ladoo tips so they don’t turn sticky',
      'Crispy Chakli secret tricks',
    ],
  },
  {
    id: 'eco',
    name: 'Prakriti-ji',
    title: 'Green & Animal-Safe Diwali',
    avatar: '🌿',
    icon: Leaf,
    greeting:
      'Pranam! 🌸 I am Prakriti-ji. Let us celebrate a compassionate, pollution-free Diwali that keeps street animals safe and fills every home with organic clay diya light.',
    chips: [
      'How to keep street dogs and cats calm during fireworks?',
      'Eco-friendly natural rangoli powder ideas',
      'Eco clay diya vs wax candle impact',
      'Zero-waste Diwali gift wrapping tips',
    ],
  },
];

export const PanditJiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('pandit');
  const [speed, setSpeed] = useState<'standard' | 'fast'>('standard');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Maintain separate multi-turn conversation thread per role
  const [conversations, setConversations] = useState<Record<ChatRole, ChatMessage[]>>({
    pandit: [
      {
        id: 'init-pandit',
        role: 'model',
        text: ROLES[0].greeting,
        timestamp: Date.now(),
      },
    ],
    kavi: [
      {
        id: 'init-kavi',
        role: 'model',
        text: ROLES[1].greeting,
        timestamp: Date.now(),
      },
    ],
    rasoi: [
      {
        id: 'init-rasoi',
        role: 'model',
        text: ROLES[2].greeting,
        timestamp: Date.now(),
      },
    ],
    eco: [
      {
        id: 'init-eco',
        role: 'model',
        text: ROLES[3].greeting,
        timestamp: Date.now(),
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  const currentMessages = conversations[selectedRole] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [currentMessages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    festiveAudio.playBellChime(880);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const updatedThread = [...currentMessages, userMsg];
    setConversations((prev) => ({
      ...prev,
      [selectedRole]: updatedThread,
    }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedThread.map((m) => ({ role: m.role, text: m.text })),
          role: selectedRole,
          speed,
        }),
      });

      const data = await response.json();
      const modelReply = data.reply || 'May the sacred light of Diwali dispel all darkness! Shubh Deepavali!';

      setConversations((prev) => ({
        ...prev,
        [selectedRole]: [
          ...prev[selectedRole],
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: modelReply,
            timestamp: Date.now(),
          },
        ],
      }));
      festiveAudio.playBellChime(1046.5);
    } catch (err) {
      setConversations((prev) => ({
        ...prev,
        [selectedRole]: [
          ...prev[selectedRole],
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: 'May the festival of lights bless your household with happiness and health. Shubh Deepavali!',
            timestamp: Date.now(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetThread = () => {
    festiveAudio.playBellChime(440);
    setConversations((prev) => ({
      ...prev,
      [selectedRole]: [
        {
          id: `init-${selectedRole}-${Date.now()}`,
          role: 'model',
          text: activeRoleData.greeting,
          timestamp: Date.now(),
        },
      ],
    }));
  };

  return (
    <>
      {/* Floating Trigger Button in bottom-left above audio controller */}
      <div className="fixed bottom-20 sm:bottom-22 left-4 sm:left-5 z-40">
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            festiveAudio.playBellChime(700);
          }}
          type="button"
          aria-label="Open Gemini Diwali Multi-Turn Chatbot"
          className="group px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(255,140,0,0.6)] hover:scale-105 transition-all cursor-pointer border border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
        >
          <span className="text-base">🪔</span>
          <span>Ask Gemini AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Floating Multi-Turn Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 w-[94vw] max-w-[440px] h-[540px] rounded-3xl bg-[#0c031c]/95 border border-amber-500/40 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header with Title & Controls */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg shadow-inner">
                  {activeRoleData.avatar}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-1.5 leading-tight">
                    <span>{activeRoleData.name}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-normal">
                      Gemini 3.8
                    </span>
                  </h4>
                  <p className="text-[10px] text-amber-300/70">{activeRoleData.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Speed Toggle */}
                <button
                  onClick={() => {
                    setSpeed((prev) => (prev === 'standard' ? 'fast' : 'standard'));
                    festiveAudio.playBellChime(900);
                  }}
                  title={speed === 'fast' ? 'Fast Mode (Gemini 3.1 Flash Lite)' : 'Standard Deep Mode (Gemini 3.8 Flash)'}
                  className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                    speed === 'fast'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                      : 'bg-purple-950/60 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">{speed === 'fast' ? 'Lite' : 'Standard'}</span>
                </button>

                {/* Reset Thread Button */}
                <button
                  onClick={handleResetThread}
                  title="Reset conversation history"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chatbot Role Selection Tabs */}
            <div className="flex items-center gap-1 p-1.5 bg-black/40 border-b border-amber-500/15 overflow-x-auto no-scrollbar text-xs">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r.id);
                    festiveAudio.playBellChime(750);
                  }}
                  className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedRole === r.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-amber-200/80 hover:bg-white/5'
                  }`}
                >
                  <span>{r.avatar}</span>
                  <span>{r.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {currentMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {activeRoleData.avatar}
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-slate-950 font-medium rounded-tr-xs shadow-md'
                        : 'bg-purple-950/70 border border-amber-500/25 text-amber-100 rounded-tl-xs shadow-sm'
                    }`}
                  >
                    {m.text}
                    <div className="text-[9px] opacity-60 text-right mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-amber-300 text-xs">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xs">
                    {activeRoleData.avatar}
                  </div>
                  <div className="bg-purple-950/70 border border-amber-500/25 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[11px]">{activeRoleData.name} is composing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips for the selected role */}
            <div className="px-3 py-1.5 overflow-x-auto flex gap-1.5 bg-black/40 border-t border-amber-500/15 text-[10px] whitespace-nowrap no-scrollbar">
              {activeRoleData.chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-2.5 py-1 rounded-full bg-purple-900/60 hover:bg-purple-800 text-amber-200 border border-amber-500/20 transition-colors cursor-pointer flex-shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-purple-950/40 border-t border-amber-500/20 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Ask ${activeRoleData.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-950/90 border border-amber-500/30 text-amber-100 placeholder-amber-400/40 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 transition-all hover:scale-105 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

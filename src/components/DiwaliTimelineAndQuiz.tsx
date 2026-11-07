import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizQuestion } from '../types';
import { Sparkles, Calendar, HelpCircle, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { festiveAudio } from '../utils/audio';

const FIVE_DAYS = [
  {
    day: 'Day 1',
    name: 'Dhanteras',
    hindi: 'धनतेरस',
    date: 'Dhanatrayodashi',
    icon: '🪙',
    significance: 'Welcoming prosperity & health with Lord Dhanvantari',
    desc: 'Devotees worship Lord Dhanvantari, the divine physician who emerged with Amrita (nectar of immortality). Families buy brass, copper, silver, or gold, and light 13 diyas facing south to ward off untimely troubles.',
  },
  {
    day: 'Day 2',
    name: 'Naraka Chaturdashi',
    hindi: 'नरक चतुर्दशी',
    date: 'Chhoti Diwali / Roop Chaudas',
    icon: '🪔',
    significance: 'Triumph over darkness & holy fragrant bath',
    desc: 'Commemorates Lord Krishna and Satyabhama vanquishing the tyrant demon Narakasura. People take an early morning fragrant oil bath (Abhyanga Snan) with herbal ubtan to purify body and mind.',
  },
  {
    day: 'Day 3',
    name: 'Lakshmi Puja',
    hindi: 'महालक्ष्मी पूजन',
    date: 'Badi Diwali (Amavasya)',
    icon: '✨',
    significance: 'Grand night of lights, Lord Rama returns & Lakshmi blessing',
    desc: 'The peak of festivities! Ayodhya was illuminated with millions of clay diyas to celebrate Lord Rama, Sita, and Lakshmana returning from 14 years in exile. Families perform grand Lakshmi-Ganesha Puja and share delicious feasts.',
  },
  {
    day: 'Day 4',
    name: 'Govardhan Puja',
    hindi: 'गोवर्धन पूजा',
    date: 'Annakut / Padwa',
    icon: '⛰️',
    significance: 'Honoring mother nature & the Govardhan mountain',
    desc: 'Celebrates Lord Krishna lifting the sacred Govardhan Hill on his little finger to shield villages and cattle from Indra’s torrential rains. Devotees prepare ‘Annakut’—a mountain of 56 delicacies (Chhappan Bhog) in gratitude.',
  },
  {
    day: 'Day 5',
    name: 'Bhai Dooj',
    hindi: 'भाई दूज',
    date: 'Yama Dwitiya / Bhav Bij',
    icon: '🌺',
    significance: 'Sacred bond of affection between siblings',
    desc: 'Honors the affectionate reunion of Goddess Yamuna and her brother Lord Yama (the God of Justice). Sisters apply an auspicious saffron and rice tilak on their brothers’ foreheads, praying for their long life and boundless joy.',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Why did the citizens of Ayodhya originally light millions of clay diyas on Diwali night?',
    options: [
      'To celebrate the arrival of the spring harvest',
      'To guide and welcome Lord Rama, Sita, and Lakshmana back home',
      'To build the sacred temple of Hastinapur',
      'To commemorate the construction of the Nal Setu bridge',
    ],
    correctIndex: 1,
    explanation:
      'When Lord Rama returned to Ayodhya after 14 years of exile and victory over Ravana on the moonless Amavasya night, the citizens lit rows (avali) of lamps (dipa) to illuminate his royal path.',
  },
  {
    question: 'On Dhanteras, which divine physician of the Gods is worshipped alongside Goddess Lakshmi?',
    options: ['Lord Dhanvantari', 'Lord Indra', 'Sage Agastya', 'Lord Varuna'],
    correctIndex: 0,
    explanation:
      'Lord Dhanvantari, the deity of Ayurveda and divine healing, emerged from the Samudra Manthan (churning of the cosmic ocean) carrying a pot of sacred nectar on Dhanteras.',
  },
  {
    question: 'What is the auspicious early-morning herbal oil bath called on Naraka Chaturdashi?',
    options: ['Kumbh Snan', 'Abhyanga Snan', 'Pavitra Jal Snan', 'Triveni Snan'],
    correctIndex: 1,
    explanation:
      'Abhyanga Snan involves anointing the body with sesame/fragrant oil and herbal ubtan before sunrise, symbolizing the washing away of sins, ego, and fatigue.',
  },
  {
    question: 'Which sacred hill did Lord Krishna lift on his little finger to protect his villagers?',
    options: ['Mount Kailash', 'Mount Meru', 'Govardhan Hill', 'Dronagiri Mountain'],
    correctIndex: 2,
    explanation:
      'Lord Krishna lifted Govardhan Hill to protect the residents and cattle of Braj from catastrophic storms, inspiring the celebration of Govardhan Puja (Annakut).',
  },
  {
    question: 'Bhai Dooj commemorates the legendary meeting between Goddess Yamuna and which deity?',
    options: ['Lord Kubera', 'Lord Yama', 'Lord Kartikeya', 'Lord Surya'],
    correctIndex: 1,
    explanation:
      'Lord Yama visited his beloved sister Yamuna on this day; moved by her loving feast and tilak, he declared that any brother receiving tilak on Yama Dwitiya would be blessed with longevity.',
  },
];

export const DiwaliTimelineAndQuiz: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(2); // Default to Lakshmi Puja
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeDay = FIVE_DAYS[selectedDay];
  const q = QUIZ_QUESTIONS[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    if (idx === q.correctIndex) {
      setScore((prev) => prev + 1);
      festiveAudio.playBellChime(1046.5);
      festiveAudio.playSparkle();
    } else {
      festiveAudio.playBellChime(350);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      if (score >= 3) {
        festiveAudio.playSparkle();
        const event = new CustomEvent('trigger-fireworks-burst', { detail: { count: 4 } });
        window.dispatchEvent(event);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    festiveAudio.playBellChime(523.25);
  };

  return (
    <div id="lore-section" className="py-12 px-4 max-w-6xl mx-auto space-y-16">
      {/* 1. Five-Day Diwali Timeline */}
      <div>
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
            Sacred Pancha Parva
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif shimmer-gold mt-2">
            The Five Sacred Days of Diwali
          </h2>
          <p className="text-amber-200/80 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
            Each day holds deep spiritual, mythological, and familial significance. Explore the rituals from Dhanteras to Bhai Dooj.
          </p>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          {FIVE_DAYS.map((item, idx) => (
            <button
              key={item.day}
              onClick={() => {
                setSelectedDay(idx);
                festiveAudio.playBellChime(500 + idx * 60);
              }}
              className={`px-3.5 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                selectedDay === idx
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(255,160,0,0.6)] scale-105'
                  : 'bg-purple-950/40 text-amber-200 hover:bg-purple-900/60 border-amber-500/20'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Active Day Detail Card */}
        <div className="bg-gradient-to-br from-purple-950/60 via-amber-950/30 to-black/80 border border-amber-500/40 rounded-3xl p-6 sm:p-9 backdrop-blur-md shadow-2xl max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {activeDay.day} · {activeDay.date}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mt-1 flex items-center gap-2">
                <span>{activeDay.name}</span>
                <span className="font-hindi text-amber-300 text-xl font-normal">
                  ({activeDay.hindi})
                </span>
              </h3>
            </div>
            <div className="text-4xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              {activeDay.icon}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm sm:text-base font-medium text-amber-300 italic">
              ✦ {activeDay.significance}
            </p>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-light">
              {activeDay.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Diwali Quiz */}
      <div className="bg-purple-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-9 backdrop-blur-md shadow-2xl max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/30">
            Festive Trivia
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold shimmer-gold mt-2">
            Diwali Knowledge Quiz
          </h3>
          <p className="text-xs text-amber-200/70 mt-1">
            Test how well you know the timeless legends of Deepavali!
          </p>
        </div>

        {!quizFinished ? (
          <div className="space-y-5">
            {/* Question Progress Header */}
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium border-b border-amber-500/20 pb-2">
              <span>Question {currentQIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="text-amber-400">Score: {score}</span>
            </div>

            {/* Question Text */}
            <h4 className="text-sm sm:text-base font-serif font-semibold text-amber-100 leading-snug">
              {q.question}
            </h4>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                let btnStyle =
                  'bg-purple-950/80 hover:bg-purple-900 border-amber-500/30 text-amber-200';

                if (isAnswerSubmitted) {
                  if (idx === q.correctIndex) {
                    btnStyle =
                      'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(0,230,118,0.4)]';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-950/80 border-rose-400 text-rose-200';
                  } else {
                    btnStyle = 'opacity-50 border-transparent text-amber-200/50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && idx === q.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                    )}
                    {isAnswerSubmitted && idx === selectedOption && idx !== q.correctIndex && (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            <AnimatePresence>
              {isAnswerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-3"
                >
                  <p className="text-xs text-amber-200/90 leading-relaxed font-light">
                    💡 <span className="font-semibold text-amber-300">Lore Insight:</span>{' '}
                    {q.explanation}
                  </p>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs sm:text-sm font-bold shadow-md hover:scale-102 transition-all cursor-pointer"
                  >
                    {currentQIndex + 1 < QUIZ_QUESTIONS.length ? 'Next Question →' : 'See Final Results 🏆'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Final Quiz Results View */
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            <h4 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
              {score >= 4 ? 'Glorious Pandit of Diwali!' : 'Festive Pilgrim!'}
            </h4>

            <p className="text-sm text-amber-200 font-medium">
              You scored <span className="text-amber-400 text-lg font-bold">{score}</span> out of{' '}
              {QUIZ_QUESTIONS.length}
            </p>

            <p className="text-xs text-amber-200/80 max-w-md mx-auto leading-relaxed">
              {score >= 4
                ? 'Your understanding of ancient traditions and the triumph of light is truly admirable! May Goddess Lakshmi illuminate your mind with timeless wisdom.'
                : 'Every story carries divine light. Revisit the Five Sacred Days above to immerse yourself in the rich tapestry of Deepavali.'}
            </p>

            <button
              onClick={handleRestartQuiz}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Quiz Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



//this is the timeline and quiz component for the diwali web app. It displays the five sacred days of diwali and allows users to take a quiz about diwali traditions and legends. The component uses React, motion for animations, and lucide-react for icons. It also plays festive audio effects when users interact with the quiz.
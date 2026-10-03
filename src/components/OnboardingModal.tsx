import React, { useState } from 'react';
import { userProgressRepo } from '../data/userProgressRepository';
import { BookOpen, Calendar, Swords, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Master Chess Principles',
      description:
        'Interactive pedagogy covering fundamentals, classical opening strategy, tactical motifs, and essential endgame theory.',
      icon: <BookOpen className="w-8 h-8 text-[#e5c158]" />,
      tagline: 'Course 01 · Conceptual Mastery',
    },
    {
      title: 'Daily Tactical Vision',
      description:
        '3,000 non-repeating puzzles across Easy, Medium, and Hard. Solve daily to build an unbroken tactical streak.',
      icon: <Calendar className="w-8 h-8 text-emerald-400" />,
      tagline: 'Course 02 · Daily Practice',
    },
    {
      title: 'Offline Stockfish Sparring',
      description:
        'Challenge tuned offline engine bots from Beginner (600) to Grandmaster with zero latency and full rule validation.',
      icon: <Swords className="w-8 h-8 text-rose-400" />,
      tagline: 'Course 03 · Engine Sparring',
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((s) => s + 1);
    } else {
      userProgressRepo.completeOnboarding();
      onComplete();
    }
  };

  const handleSkip = () => {
    userProgressRepo.completeOnboarding();
    onComplete();
  };

  const current = slides[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-5 select-none animate-fade-in">
      <div className="bg-[#12151c] border border-white/[0.1] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl flex flex-col justify-between min-h-[420px]">
        {/* Skip button */}
        <div className="flex justify-end">
          <button
            onClick={handleSkip}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded transition"
          >
            Skip
          </button>
        </div>

        {/* Slide Graphic & Text */}
        <div className="my-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#161a22] border border-white/[0.08] flex items-center justify-center mx-auto mb-6 shadow-md">
            {current.icon}
          </div>
          <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-widest block mb-2">
            {current.tagline}
          </span>
          <h2 className="font-brand text-2xl font-bold text-white mb-2">{current.title}</h2>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
            {current.description}
          </p>
        </div>

        {/* Indicators and Next Button */}
        <div>
          <div className="flex justify-center gap-1.5 mb-5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  step === i ? 'w-6 bg-[#e5c158]' : 'w-2 bg-neutral-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-[#e5c158] hover:bg-[#d4af37] text-black font-extrabold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            {step === slides.length - 1 ? 'Start Training' : 'Continue'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

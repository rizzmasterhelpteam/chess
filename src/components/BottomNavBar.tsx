import React from 'react';
import { BookOpen, Puzzle, Swords } from 'lucide-react';

export type MainTab = 'learn' | 'puzzles' | 'play';

interface BottomNavBarProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Curriculum', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-4 h-4" /> },
    { id: 'play', label: 'Play Bots', icon: <Swords className="w-4 h-4" /> },
  ];

  return (
    <nav className="md:hidden w-full bg-[#0b0e13]/98 backdrop-blur-md border-t border-white/[0.08] px-4 py-2 flex items-center justify-around select-none z-30">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg transition-colors relative ${
              isActive
                ? 'text-amber-300 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.icon}
            <span className="text-[11px] tracking-wide">{tab.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

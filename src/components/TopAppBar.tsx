import React from 'react';
import { Flame, Settings, BarChart2, BookOpen, Puzzle, Swords } from 'lucide-react';
import { MainTab } from './BottomNavBar';

interface TopAppBarProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  streak: number;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onSelectTab,
  streak,
  onOpenSettings,
  onOpenStats,
}) => {
  const navTabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'learn', label: 'Curriculum', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'puzzles', label: 'Tactics & Puzzles', icon: <Puzzle className="w-3.5 h-3.5" /> },
    { id: 'play', label: 'Play Bots', icon: <Swords className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="w-full bg-[#0b0e13]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 py-3 flex items-center justify-between select-none z-30">
      {/* Zone 1: Brand Wordmark (Single clean line) */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0">
          ♚
        </div>
        <div className="flex items-baseline gap-1.5 overflow-hidden">
          <span className="font-brand text-sm sm:text-base md:text-lg font-bold text-white tracking-wide whitespace-nowrap">
            Learn Chess:
          </span>
          <span className="text-[11px] sm:text-xs text-amber-300 font-semibold tracking-normal whitespace-nowrap">
            Tips, Puzzles & Play
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Desktop/Tablet) */}
      <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06]">
        {navTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.08] text-amber-300 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3">
        {/* Zero-Pill Streak Display */}
        <div
          title="Daily Puzzle Streak"
          className="flex items-center gap-1.5 text-xs text-neutral-300 pr-1"
        >
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="tabular-nums font-bold text-amber-300">{streak}</span>
          <span className="text-neutral-500 hidden lg:inline">day streak</span>
        </div>

        <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block" />

        {/* Statistics */}
        <button
          onClick={onOpenStats}
          title="Training Statistics"
          className="p-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08] transition"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Board Themes & Settings"
          className="p-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08] transition"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

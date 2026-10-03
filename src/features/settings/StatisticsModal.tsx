import React from 'react';
import { userProgressRepo } from '../../data/userProgressRepository';
import { dailyCycleManager } from '../../data/dailyCycleManager';
import { ALL_LESSONS } from '../../data/lessonsData';
import { BOT_PROFILES } from '../../chess/StockfishEngine';
import { X, Flame, Trophy, Target, BookOpen } from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const progress = userProgressRepo.getData();
  const dailyStats = dailyCycleManager.getStats();

  const totalLessons = ALL_LESSONS.length;
  const completedLessons = progress.completedLessons.length;
  const easySolved = progress.permanentPuzzles.easy.solvedIds.length;
  const medSolved = progress.permanentPuzzles.medium.solvedIds.length;
  const hardSolved = progress.permanentPuzzles.hard.solvedIds.length;
  const totalPuzzlesSolved = easySolved + medSolved + hardSolved;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#12151c] border border-white/[0.1] rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#e5c158]" />
            <h3 className="font-brand text-sm font-bold text-white tracking-wide">
              Player Statistics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Daily Streak Card */}
          <div className="bg-[#0c0e12] border border-[#e5c158]/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-[#e5c158] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" /> Daily Streak
              </span>
              <span className="font-mono text-neutral-400">
                {dailyStats.perfectDaysCount} Perfect Days
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#161a22] rounded-lg p-3 border border-white/[0.05]">
                <div className="text-2xl font-bold text-white tabular-nums">{dailyStats.currentStreak}</div>
                <div className="text-[11px] text-neutral-400">Current Days</div>
              </div>
              <div className="bg-[#161a22] rounded-lg p-3 border border-white/[0.05]">
                <div className="text-2xl font-bold text-[#e5c158] tabular-nums">{dailyStats.bestStreak}</div>
                <div className="text-[11px] text-neutral-400">All-Time Best</div>
              </div>
            </div>
          </div>

          {/* Curriculum & Puzzles Overview */}
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-3">
              Mastery Progress
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0c0e12] border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> Lessons
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {completedLessons} / {totalLessons}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  {Math.round((completedLessons / totalLessons) * 100)}% Mastered
                </div>
              </div>

              <div className="bg-[#0c0e12] border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                  <Target className="w-3.5 h-3.5" /> Tracks
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {totalPuzzlesSolved} / 450
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  {Math.round((totalPuzzlesSolved / 450) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Bot Records */}
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-3">
              Bot Head-to-Head Records
            </span>
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {Object.values(BOT_PROFILES).map((bot) => {
                const stats = progress.botStats[bot.id] || {
                  gamesPlayed: 0,
                  wins: 0,
                  losses: 0,
                  draws: 0,
                };
                const winRate =
                  stats.gamesPlayed > 0
                    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
                    : 0;

                return (
                  <div
                    key={bot.id}
                    className="py-3 px-1 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white mr-2">{bot.name}</span>
                      <span className="text-neutral-500 font-mono">({bot.rating})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-neutral-300">
                        {stats.wins}W · {stats.losses}L · {stats.draws}D
                      </div>
                      <div className="text-[10px] text-[#e5c158]">
                        {stats.gamesPlayed > 0 ? `${winRate}% Win Rate` : '0 Games'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

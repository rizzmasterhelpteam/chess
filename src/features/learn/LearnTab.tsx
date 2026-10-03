import React, { useState } from 'react';
import {
  LESSON_CATEGORIES,
  LessonCategory,
  LessonItem,
  ALL_LESSONS,
} from '../../data/lessonsData';
import { ChessBoardView } from '../../components/ChessBoardView';
import { ChessRulesService } from '../../chess/ChessRules';
import { userProgressRepo } from '../../data/userProgressRepository';
import { soundManager } from '../../utils/sound';
import {
  ChevronRight,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearnTabProps {
  onGoToPuzzles: () => void;
}

export const LearnTab: React.FC<LearnTabProps> = ({ onGoToPuzzles }) => {
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [interactiveStep, setInteractiveStep] = useState<number>(0);
  const [interactiveChess, setInteractiveChess] = useState<ChessRulesService | null>(null);

  const progressData = userProgressRepo.getData();
  const completedSet = new Set(progressData.completedLessons);

  const lastLessonId = progressData.lastLessonId;
  const lastLesson = ALL_LESSONS.find((l) => l.id === lastLessonId) || ALL_LESSONS[0];

  const handleOpenLesson = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setInteractiveStep(0);
    const service = new ChessRulesService(lesson.initialFen);
    setInteractiveChess(service);
  };

  const handleNextInteractiveStep = () => {
    if (!activeLesson || !interactiveChess) return;
    const moves = activeLesson.interactiveMoves || [];
    if (interactiveStep < moves.length) {
      const move = moves[interactiveStep];
      interactiveChess.makeMove(move.from as any, move.to as any);
      soundManager.playMove();
      setInteractiveStep((s) => s + 1);
    }
  };

  const handleResetInteractive = () => {
    if (!activeLesson) return;
    setInteractiveStep(0);
    setInteractiveChess(new ChessRulesService(activeLesson.initialFen));
  };

  const handleCompleteAndNext = () => {
    if (!activeLesson) return;
    userProgressRepo.markLessonComplete(activeLesson.id);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    soundManager.playSuccess();

    const curIdx = ALL_LESSONS.findIndex((l) => l.id === activeLesson.id);
    if (curIdx < ALL_LESSONS.length - 1) {
      handleOpenLesson(ALL_LESSONS[curIdx + 1]);
    } else {
      setActiveLesson(null);
    }
  };

  // ACTIVE LESSON VIEW
  if (activeLesson && interactiveChess) {
    const moves = activeLesson.interactiveMoves || [];
    const hasMoreSteps = interactiveStep < moves.length;
    const currentStepComment = interactiveStep > 0 ? moves[interactiveStep - 1]?.comment : null;
    const isCompleted = completedSet.has(activeLesson.id);

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-20 animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setActiveLesson(null)}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Lessons
          </button>
          <span className="text-xs text-[#d4af37] font-semibold tracking-wider uppercase">
            {activeLesson.categoryTitle}
          </span>
        </div>

        {/* Title and Intro */}
        <div className="mb-6">
          <h2 className="font-brand text-2xl font-bold text-white mb-2 tracking-wide">
            {activeLesson.title}
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
            {activeLesson.explanation}
          </p>
        </div>

        {/* Layout: Board + Interactive Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-7 flex flex-col items-center">
            <ChessBoardView
              board={interactiveChess.getBoard()}
              orientation={activeLesson.orientation}
              selectedSquare={null}
              legalMoves={[]}
              lastMove={null}
              checkSquare={null}
              keySquares={activeLesson.keySquares}
              boardTheme={progressData.settings.boardTheme}
              showCoordinates={progressData.settings.showCoordinates}
              isInteractive={false}
              onSquareClick={() => {}}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            {/* Interactive Move Controls */}
            {moves.length > 0 && (
              <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-neutral-400 font-semibold tracking-wider uppercase">
                    Step {interactiveStep} of {moves.length}
                  </span>
                  <button
                    onClick={handleResetInteractive}
                    className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
                    title="Reset Board"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {currentStepComment ? (
                  <div className="text-xs text-[#f4d068] bg-[#d4af37]/10 border-l-2 border-[#d4af37] p-3 rounded-r-lg mb-4 leading-relaxed">
                    {currentStepComment}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 mb-4">
                    Press "Play Next Move" to walk through the theoretical continuation on the board.
                  </p>
                )}

                <button
                  onClick={handleNextInteractiveStep}
                  disabled={!hasMoreSteps}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                    hasMoreSteps
                      ? 'bg-[#e5c158] hover:bg-[#d4af37] text-black shadow'
                      : 'bg-white/[0.05] text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {hasMoreSteps ? 'Play Next Move' : 'Continuation Complete'}
                </button>
              </div>
            )}

            {/* Strategic Principle */}
            <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                Core Principle
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeLesson.keyIdea}
              </p>
            </div>

            {/* Mistake to Avoid */}
            <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                Pitfall to Avoid
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeLesson.mistakeToAvoid}
              </p>
            </div>

            {/* Complete button */}
            <button
              onClick={handleCompleteAndNext}
              className="w-full py-3 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isCompleted ? 'Next Lesson' : 'Mark as Mastered & Continue'}
            </button>
          </div>
        </div>

        {/* Plans for Openings */}
        {(activeLesson.whitePlan || activeLesson.blackPlan) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
            {activeLesson.whitePlan && (
              <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4">
                <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                  White's Objective
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {activeLesson.whitePlan}
                </p>
              </div>
            )}
            {activeLesson.blackPlan && (
              <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4">
                <div className="text-xs font-bold text-neutral-300 mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-600 inline-block" />
                  Black's Counterplay
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {activeLesson.blackPlan}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // CATEGORY LIST VIEW
  if (selectedCategory) {
    const categoryCompleted = selectedCategory.lessons.filter((l) =>
      completedSet.has(l.id)
    ).length;

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-20 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> All Categories
          </button>
          <span className="text-xs text-[#d4af37] font-semibold">
            {categoryCompleted} of {selectedCategory.lessons.length} Completed
          </span>
        </div>

        <div className="mb-6">
          <h2 className="font-brand text-2xl font-bold text-white mb-1 tracking-wide">
            {selectedCategory.title}
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl">{selectedCategory.description}</p>
        </div>

        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {selectedCategory.lessons.map((lesson, idx) => {
            const isCompleted = completedSet.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => handleOpenLesson(lesson)}
                className="w-full py-4 px-2 hover:bg-white/[0.02] flex items-center justify-between transition text-left group"
              >
                <div className="flex items-center gap-4 pr-4">
                  <span className="font-mono text-xs text-neutral-500 w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#e5c158] transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {lesson.keyIdea}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isCompleted && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Mastered
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // MAIN CURRICULUM OVERVIEW
  const totalLessons = ALL_LESSONS.length;
  const completedLessons = progressData.completedLessons.length;
  const easySolved = progressData.permanentPuzzles.easy.solvedIds.length;
  const medSolved = progressData.permanentPuzzles.medium.solvedIds.length;
  const hardSolved = progressData.permanentPuzzles.hard.solvedIds.length;
  const totalPuzzlesSolved = easySolved + medSolved + hardSolved;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-20">
      {/* Editorial Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold text-[#d4af37] tracking-widest uppercase block mb-1">
            Training Academy
          </span>
          <h2 className="font-brand text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Chess Curriculum
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Structured principles, master strategies, tactical weapons, and endgame theory.
          </p>
        </div>

        {/* Quiet unboxed progress metrics */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div>
            <span className="text-white font-bold tabular-nums text-sm">{completedLessons}</span>
            <span className="text-neutral-500"> / {totalLessons} Lessons</span>
          </div>
          <span className="text-neutral-600">·</span>
          <div onClick={onGoToPuzzles} className="cursor-pointer hover:text-white transition">
            <span className="text-white font-bold tabular-nums text-sm">{totalPuzzlesSolved}</span>
            <span className="text-neutral-500"> / 450 Puzzles</span>
          </div>
        </div>
      </div>

      {/* Resume Card */}
      <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block mb-0.5">
            Continue Where You Left Off
          </span>
          <h3 className="text-base font-bold text-white">{lastLesson.title}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{lastLesson.categoryTitle}</p>
        </div>
        <button
          onClick={() => handleOpenLesson(lastLesson)}
          className="py-2 px-4 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          Resume Lesson <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
          Courses & Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LESSON_CATEGORIES.map((category, idx) => {
            const categoryCompleted = category.lessons.filter((l) =>
              completedSet.has(l.id)
            ).length;
            const pct = Math.round((categoryCompleted / category.lessons.length) * 100);

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="bg-[#12151c] hover:bg-[#161a22] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-5 transition text-left flex flex-col justify-between group h-full shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-[#d4af37] font-semibold">
                      Chapter {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {categoryCompleted} / {category.lessons.length}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#e5c158] transition-colors mb-1">
                    {category.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                  <div className="w-28 bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#e5c158] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-neutral-500 font-mono text-[11px]">{pct}% complete</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

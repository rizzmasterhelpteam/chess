import React, { useState } from 'react';
import { Square, Move } from 'chess.js';
import {
  Puzzle,
  PERMANENT_PUZZLES,
} from '../../data/puzzleDatabase';
import { dailyCycleManager, getTodayDateString } from '../../data/dailyCycleManager';
import { userProgressRepo } from '../../data/userProgressRepository';
import { ChessBoardView } from '../../components/ChessBoardView';
import { ChessRulesService } from '../../chess/ChessRules';
import { soundManager, triggerHaptic } from '../../utils/sound';
import { adsManager } from '../../ads/AdsManager';
import {
  Flame,
  Lightbulb,
  RotateCcw,
  FlipHorizontal,
  ChevronRight,
  Check,
  Calendar,
  Layers,
  ArrowLeft,
  History,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PuzzleTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'permanent' | 'history'>('daily');
  const [playingPuzzle, setPlayingPuzzle] = useState<Puzzle | null>(null);
  const [chessService, setChessService] = useState<ChessRulesService | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [isWrongMove, setIsWrongMove] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isOpponentThinking, setIsOpponentThinking] = useState<boolean>(false);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [activePermanentDifficulty, setActivePermanentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const progressData = userProgressRepo.getData();
  const dailyData = dailyCycleManager.getTodayPuzzles();
  const dailyStats = dailyCycleManager.getStats();

  const startPuzzle = (puzzle: Puzzle) => {
    setPlayingPuzzle(puzzle);
    const service = new ChessRulesService(puzzle.fen);
    setChessService(service);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setHintLevel(0);
    setSolutionStep(0);
    setIsWrongMove(false);
    setIsCompleted(false);
    setIsOpponentThinking(false);
    setBoardOrientation(puzzle.sideToMove === 'w' ? 'white' : 'black');
  };

  const handleSquareClick = (square: Square) => {
    if (!chessService || !playingPuzzle || isCompleted || isOpponentThinking) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const board = chessService.getBoard();
      let clickedPieceColor: string | null = null;
      for (const row of board) {
        for (const sq of row) {
          if (sq && sq.square === square && sq.piece) {
            clickedPieceColor = sq.piece.color;
          }
        }
      }

      if (clickedPieceColor === playingPuzzle.sideToMove) {
        setSelectedSquare(square);
        setLegalMoves(chessService.getLegalMoves(square));
        return;
      }

      const targetExpected = playingPuzzle.solution[solutionStep];
      const isExpected = targetExpected && targetExpected.from === selectedSquare && targetExpected.to === square;

      if (isExpected) {
        const result = chessService.makeMove(selectedSquare, square, targetExpected.promotion);
        if (result.success) {
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          setIsWrongMove(false);
          setHintLevel(0);

          if (result.captured) soundManager.playCapture();
          else soundManager.playMove();
          triggerHaptic('light', progressData.settings.hapticsEnabled);

          const nextStep = solutionStep + 1;
          setSolutionStep(nextStep);

          if (nextStep < playingPuzzle.solution.length) {
            setIsOpponentThinking(true);
            setTimeout(() => {
              const oppMove = playingPuzzle.solution[nextStep];
              const oppRes = chessService.makeMove(oppMove.from as Square, oppMove.to as Square, oppMove.promotion);
              if (oppRes.success) {
                setLastMove({ from: oppMove.from as Square, to: oppMove.to as Square });
                if (oppRes.captured) soundManager.playCapture();
                else soundManager.playMove();
              }
              setSolutionStep(nextStep + 1);
              setIsOpponentThinking(false);

              if (nextStep + 1 >= playingPuzzle.solution.length) {
                handlePuzzleSuccess();
              }
            }, 450);
          } else {
            handlePuzzleSuccess();
          }
        }
      } else {
        setIsWrongMove(true);
        soundManager.playIncorrect();
        triggerHaptic('error', progressData.settings.hapticsEnabled);
        setTimeout(() => setIsWrongMove(false), 800);
        setSelectedSquare(null);
        setLegalMoves([]);

        if (playingPuzzle.track === 'permanent') {
          userProgressRepo.recordPermanentPuzzleAttempt(
            playingPuzzle.difficulty,
            playingPuzzle.id,
            false
          );
        }
      }
    } else {
      const board = chessService.getBoard();
      let pieceColor: string | null = null;
      for (const row of board) {
        for (const sq of row) {
          if (sq && sq.square === square && sq.piece) {
            pieceColor = sq.piece.color;
          }
        }
      }

      if (pieceColor === playingPuzzle.sideToMove) {
        setSelectedSquare(square);
        setLegalMoves(chessService.getLegalMoves(square));
      }
    }
  };

  const handlePuzzleSuccess = () => {
    setIsCompleted(true);
    soundManager.playSuccess();
    triggerHaptic('success', progressData.settings.hapticsEnabled);
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });

    if (!playingPuzzle) return;

    if (playingPuzzle.track === 'daily') {
      const res = dailyCycleManager.markDailyPuzzleSolved(playingPuzzle.difficulty);
      if (res.isNowPerfect) {
        confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
        adsManager.recordDailySetCompleted();
      }
    } else {
      userProgressRepo.recordPermanentPuzzleAttempt(
        playingPuzzle.difficulty,
        playingPuzzle.id,
        true
      );
      adsManager.recordPuzzleCompleted();
    }
  };

  const handleUseHint = () => {
    if (!playingPuzzle || isCompleted) return;
    setHintLevel((h) => Math.min(3, h + 1));
    triggerHaptic('medium', progressData.settings.hapticsEnabled);
  };

  const handleResetPuzzle = () => {
    if (!playingPuzzle) return;
    startPuzzle(playingPuzzle);
  };

  const handleNextPermanentPuzzle = () => {
    if (!playingPuzzle) return;
    const diff = playingPuzzle.difficulty;
    const pool = PERMANENT_PUZZLES[diff];
    const nextIdx = playingPuzzle.trackIndex;
    if (nextIdx < pool.length) {
      startPuzzle(pool[nextIdx]);
    } else {
      setPlayingPuzzle(null);
    }
  };

  // ACTIVE PUZZLE VIEW
  if (playingPuzzle && chessService) {
    const currentExpectedMove = playingPuzzle.solution[solutionStep];
    const hintSquares: { from?: Square; to?: Square } = {};

    if (hintLevel >= 1 && currentExpectedMove) {
      hintSquares.from = currentExpectedMove.from as Square;
    }
    if (hintLevel >= 2 && currentExpectedMove) {
      hintSquares.to = currentExpectedMove.to as Square;
    }

    const checkSquare = chessService.getStatus().isCheck
      ? chessService.findKingSquare(chessService.getTurn())
      : null;

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16 animate-fade-in flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setPlayingPuzzle(null)}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Puzzles
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium uppercase tracking-wider">
              {playingPuzzle.difficulty}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-[#d4af37] font-mono font-bold">
              ★ {playingPuzzle.rating}
            </span>
          </div>
        </div>

        {/* Prompt line */}
        <div className="w-full max-w-[460px] mb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-white mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                playingPuzzle.sideToMove === 'w' ? 'bg-white' : 'bg-neutral-800 border border-neutral-600'
              }`}
            />
            <span>{playingPuzzle.sideToMove === 'w' ? 'White to Move' : 'Black to Move'}</span>
            <span className="text-neutral-500 font-normal">·</span>
            <span className="text-[#d4af37]">{playingPuzzle.theme}</span>
            <span className="text-neutral-500 font-normal">·</span>
            <span className="text-xs font-mono font-semibold text-neutral-300">
              Move {Math.min(Math.floor(solutionStep / 2) + 1, Math.ceil(playingPuzzle.solution.length / 2))} of {Math.ceil(playingPuzzle.solution.length / 2)}
            </span>
          </div>
          <p className="text-xs text-neutral-400">{playingPuzzle.description}</p>
        </div>

        {/* Board View with shake feedback */}
        <div className={`relative ${isWrongMove ? 'animate-shake' : ''}`}>
          <ChessBoardView
            board={chessService.getBoard()}
            orientation={boardOrientation}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            checkSquare={checkSquare}
            hintSquares={hintSquares}
            boardTheme={progressData.settings.boardTheme}
            showCoordinates={progressData.settings.showCoordinates}
            isInteractive={!isCompleted && !isOpponentThinking}
            onSquareClick={handleSquareClick}
          />

          {isOpponentThinking && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#12151c]/95 border border-white/[0.1] text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              Opponent responding...
            </div>
          )}

          {isWrongMove && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Not the winning move. Try again!
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-[460px] flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUseHint}
              disabled={isCompleted || hintLevel >= 3}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                hintLevel >= 3
                  ? 'bg-neutral-800 text-neutral-500 border-neutral-700'
                  : 'bg-[#12151c] text-[#f4d068] border-white/[0.08] hover:bg-[#161a22]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {hintLevel === 0 ? 'Hint' : hintLevel === 1 ? 'Target Square' : 'Show Move'}
            </button>
            <button
              onClick={handleResetPuzzle}
              className="p-2 rounded-lg bg-[#12151c] border border-white/[0.08] text-neutral-400 hover:text-white transition"
              title="Reset Position"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))
              }
              className="p-2 rounded-lg bg-[#12151c] border border-white/[0.08] text-neutral-400 hover:text-white transition"
              title="Flip Board"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          {hintLevel === 3 && currentExpectedMove && (
            <div className="text-xs text-cyan-300 font-mono bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
              Move: {currentExpectedMove.from} → {currentExpectedMove.to}
            </div>
          )}
        </div>

        {/* Completion Panel */}
        {isCompleted && (
          <div className="w-full max-w-[460px] mt-6 bg-[#12151c] border border-emerald-500/30 rounded-xl p-5 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <Check className="w-4 h-4 stroke-[3]" /> Puzzle Solved
            </div>
            <p className="text-xs text-neutral-300 mb-4">
              Tactical execution verified. Well played!
            </p>
            {playingPuzzle.track === 'permanent' ? (
              <button
                onClick={handleNextPermanentPuzzle}
                className="w-full py-2.5 px-4 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
              >
                Next Puzzle <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setPlayingPuzzle(null)}
                className="w-full py-2.5 px-4 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-lg transition"
              >
                Return to Daily Selection
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // MAIN PUZZLE HUB VIEW
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-20">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-[#12151c] border border-white/[0.08] rounded-xl mb-6 max-w-md">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'daily'
              ? 'bg-white/[0.08] text-[#e5c158] font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Daily (3)
        </button>
        <button
          onClick={() => setActiveSubTab('permanent')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'permanent'
              ? 'bg-white/[0.08] text-[#e5c158] font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Tracks (450)
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'bg-white/[0.08] text-[#e5c158] font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" /> History
        </button>
      </div>

      {/* DAILY PUZZLES */}
      {activeSubTab === 'daily' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-widest block mb-1">
                Calendar Rotation
              </span>
              <h3 className="font-brand text-2xl font-bold text-white tracking-wide">
                Today's Daily Challenge
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Solve one puzzle to preserve your streak. Solve all three for a Perfect Day.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e5c158]">
              <Flame className="w-4 h-4 fill-current" />
              <span>{dailyStats.currentStreak}-Day Streak</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{dailyStats.perfectDaysCount} Perfect</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Easy */}
            <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between h-full shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Easy Daily
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    ★ {dailyData.easy.rating}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{dailyData.easy.theme}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {dailyData.easy.description}
                </p>
              </div>

              <button
                onClick={() => startPuzzle(dailyData.easy)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dailyData.record.easyCompleted
                    ? 'bg-white/[0.06] text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#e5c158] hover:bg-[#d4af37] text-black shadow'
                }`}
              >
                {dailyData.record.easyCompleted ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Solved · Replay
                  </>
                ) : (
                  'Solve Puzzle'
                )}
              </button>
            </div>

            {/* Medium */}
            <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between h-full shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#e5c158] uppercase tracking-wider">
                    Medium Daily
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    ★ {dailyData.medium.rating}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{dailyData.medium.theme}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {dailyData.medium.description}
                </p>
              </div>

              <button
                onClick={() => startPuzzle(dailyData.medium)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dailyData.record.mediumCompleted
                    ? 'bg-white/[0.06] text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#e5c158] hover:bg-[#d4af37] text-black shadow'
                }`}
              >
                {dailyData.record.mediumCompleted ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Solved · Replay
                  </>
                ) : (
                  'Solve Puzzle'
                )}
              </button>
            </div>

            {/* Hard */}
            <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between h-full shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Hard Daily
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    ★ {dailyData.hard.rating}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{dailyData.hard.theme}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {dailyData.hard.description}
                </p>
              </div>

              <button
                onClick={() => startPuzzle(dailyData.hard)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  dailyData.record.hardCompleted
                    ? 'bg-white/[0.06] text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#e5c158] hover:bg-[#d4af37] text-black shadow'
                }`}
              >
                {dailyData.record.hardCompleted ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Solved · Replay
                  </>
                ) : (
                  'Solve Puzzle'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT SEQUENTIAL TRACKS */}
      {activeSubTab === 'permanent' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const track = progressData.permanentPuzzles[diff];
              const pct = Math.round((track.solvedIds.length / 150) * 100);
              return (
                <button
                  key={diff}
                  onClick={() => setActivePermanentDifficulty(diff)}
                  className={`py-2 px-4 rounded-lg text-xs font-semibold capitalize transition ${
                    activePermanentDifficulty === diff
                      ? 'bg-white/[0.08] text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {diff} ({track.solvedIds.length}/150 · {pct}%)
                </button>
              );
            })}
          </div>

          {(() => {
            const track = progressData.permanentPuzzles[activePermanentDifficulty];
            const pool = PERMANENT_PUZZLES[activePermanentDifficulty];
            const currentPuzzle = pool[Math.min(149, track.currentIndex - 1)];

            return (
              <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-[#d4af37] uppercase tracking-wider font-semibold block mb-1">
                    Track Progress · Puzzle {track.currentIndex} of 150
                  </span>
                  <h4 className="text-lg font-bold text-white">{currentPuzzle.theme}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{currentPuzzle.description}</p>
                </div>
                <button
                  onClick={() => startPuzzle(currentPuzzle)}
                  className="py-2.5 px-5 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 self-start sm:self-auto"
                >
                  Continue Track (Puzzle #{track.currentIndex})
                </button>
              </div>
            );
          })()}

          {/* Grid selector */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Puzzle Grid (Select to solve or replay)
            </h4>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {PERMANENT_PUZZLES[activePermanentDifficulty].slice(0, 50).map((puzzle) => {
                const track = progressData.permanentPuzzles[activePermanentDifficulty];
                const isSolved = track.solvedIds.includes(puzzle.id);
                const isCurrent = track.currentIndex === puzzle.trackIndex;

                return (
                  <button
                    key={puzzle.id}
                    onClick={() => startPuzzle(puzzle)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 border text-xs font-mono font-semibold transition ${
                      isSolved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isCurrent
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f4d068] ring-2 ring-[#d4af37]/30 font-bold'
                        : 'bg-[#12151c] border-white/[0.08] text-neutral-400 hover:border-white/[0.2]'
                    }`}
                  >
                    <span>{puzzle.trackIndex}</span>
                    <span className="text-[9px] opacity-70">{isSolved ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DAILY HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          <div className="pb-3 border-b border-white/[0.08] mb-4">
            <h4 className="font-brand text-lg font-bold text-white">Daily Archives</h4>
            <p className="text-xs text-neutral-400">Review past daily completions.</p>
          </div>

          <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {dailyCycleManager.getHistoryList().map((record) => (
              <div
                key={record.date}
                className="py-3 px-2 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white mr-3">
                    {record.date === getTodayDateString() ? 'Today' : record.date}
                  </span>
                  <span className="text-neutral-400">
                    Easy {record.easyCompleted ? '✓' : '—'} · Medium {record.mediumCompleted ? '✓' : '—'} · Hard {record.hardCompleted ? '✓' : '—'}
                  </span>
                </div>
                {record.isPerfect && (
                  <span className="text-xs text-[#d4af37] font-semibold">
                    ★ Perfect Day
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

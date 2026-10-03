import React, { useState, useEffect } from 'react';
import { Square, Move, PieceSymbol } from 'chess.js';
import {
  BOT_PROFILES,
  BotLevelId,
  stockfishEngine,
} from '../../chess/StockfishEngine';
import { ChessBoardView } from '../../components/ChessBoardView';
import { ChessRulesService, GameStatus } from '../../chess/ChessRules';
import { userProgressRepo } from '../../data/userProgressRepository';
import { soundManager, triggerHaptic } from '../../utils/sound';
import { adsManager } from '../../ads/AdsManager';
import { ChessPieceSvg } from '../../components/ChessPieceSvg';
import {
  Swords,
  Undo2,
  Flag,
  FlipHorizontal,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlayBotTab: React.FC = () => {
  const [selectedBotId, setSelectedBotId] = useState<BotLevelId>('1000');
  const [playerColorChoice, setPlayerColorChoice] = useState<'white' | 'black' | 'random'>('white');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [actualPlayerColor, setActualPlayerColor] = useState<'w' | 'b'>('w');
  const [chessService, setChessService] = useState<ChessRulesService | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isConfirmResignOpen, setIsConfirmResignOpen] = useState<boolean>(false);
  const [gameRevision, setGameRevision] = useState<number>(0);

  const activeBot = BOT_PROFILES[selectedBotId];
  const progressData = userProgressRepo.getData();

  const startGame = () => {
    let pColor: 'w' | 'b' = 'w';
    if (playerColorChoice === 'random') {
      pColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      pColor = playerColorChoice === 'white' ? 'w' : 'b';
    }

    setActualPlayerColor(pColor);
    setBoardOrientation(pColor === 'w' ? 'white' : 'black');

    const service = new ChessRulesService();
    setChessService(service);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setIsBotThinking(false);
    setGameStatus(service.getStatus());
    setIsPlaying(true);
    setIsGameOverModalOpen(false);
    setGameRevision((r) => r + 1);

    if (pColor === 'b') {
      triggerBotMove(service, pColor);
    }
  };

  const triggerBotMove = async (service: ChessRulesService, playerColor: 'w' | 'b') => {
    setIsBotThinking(true);
    try {
      const fen = service.getFen();
      let botMove = await stockfishEngine.getBestMove(fen, selectedBotId);

      // Fail-safe: if botMove is null or computation aborted, pick top legal move so game never gets stuck
      if (!botMove) {
        const legals = service.getLegalMoves();
        if (legals.length > 0) {
          botMove = legals[0];
        }
      }

      if (!botMove) return;

      const res = service.makeMove(botMove.from as Square, botMove.to as Square, botMove.promotion);
      if (res.success) {
        setLastMove({ from: botMove.from as Square, to: botMove.to as Square });
        setGameRevision((r) => r + 1);

        if (res.isCheckmate) {
          soundManager.playGameEnd(false);
        } else if (res.isCheck) {
          soundManager.playCheck();
        } else if (res.captured) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        const status = service.getStatus();
        setGameStatus(status);

        if (status.winner) {
          handleGameOver(status, playerColor);
        }
      }
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleGameOver = (status: GameStatus, playerColor: 'w' | 'b') => {
    setIsGameOverModalOpen(true);
    const won = status.winner === playerColor;
    const isDraw = status.winner === 'draw';

    if (won) {
      soundManager.playGameEnd(true);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      userProgressRepo.recordBotGame(selectedBotId, 'win');
    } else if (isDraw) {
      soundManager.playMove();
      userProgressRepo.recordBotGame(selectedBotId, 'draw');
    } else {
      soundManager.playGameEnd(false);
      userProgressRepo.recordBotGame(selectedBotId, 'loss');
    }

    adsManager.recordBotGameCompleted();
  };

  const handleSquareClick = (square: Square) => {
    if (!chessService || !isPlaying || isBotThinking || isGameOverModalOpen) return;
    if (chessService.getTurn() !== actualPlayerColor) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const board = chessService.getBoard();
      let pieceColor: string | null = null;
      for (const row of board) {
        for (const sq of row) {
          if (sq && sq.square === square && sq.piece) {
            pieceColor = sq.piece.color;
          }
        }
      }

      if (pieceColor === actualPlayerColor) {
        setSelectedSquare(square);
        setLegalMoves(chessService.getLegalMoves(square));
        return;
      }

      const moves = chessService.getLegalMoves(selectedSquare);
      const isLegal = moves.some((m) => m.to === square);

      if (isLegal) {
        const isPromotion = moves.some((m) => m.to === square && m.promotion);
        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executePlayerMove(selectedSquare, square);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
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

      if (pieceColor === actualPlayerColor) {
        setSelectedSquare(square);
        setLegalMoves(chessService.getLegalMoves(square));
      }
    }
  };

  const executePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (!chessService || isBotThinking || isGameOverModalOpen) return;
    const res = chessService.makeMove(from, to, promotion);
    if (res.success) {
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMoves([]);
      setPendingPromotion(null);
      setGameRevision((r) => r + 1);

      if (res.isCheckmate) {
        soundManager.playGameEnd(true);
      } else if (res.isCheck) {
        soundManager.playCheck();
      } else if (res.captured) {
        soundManager.playCapture();
      } else {
        soundManager.playMove();
      }
      triggerHaptic('light', progressData.settings.hapticsEnabled);

      const status = chessService.getStatus();
      setGameStatus(status);

      if (status.winner) {
        handleGameOver(status, actualPlayerColor);
      } else {
        triggerBotMove(chessService, actualPlayerColor);
      }
    }
  };

  const handleSelectPromotionPiece = (piece: PieceSymbol) => {
    if (pendingPromotion) {
      executePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
    }
  };

  const handleUndo = () => {
    if (!chessService || isBotThinking || isGameOverModalOpen) return;
    chessService.undo();
    chessService.undo();
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameRevision((r) => r + 1);
    setGameStatus(chessService.getStatus());
    soundManager.playMove();
  };

  const handleResign = () => {
    if (progressData.settings.confirmResign) {
      setIsConfirmResignOpen(true);
    } else {
      confirmResign();
    }
  };

  const confirmResign = () => {
    setIsConfirmResignOpen(false);
    if (!chessService) return;
    const status: GameStatus = {
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isThreefoldRepetition: false,
      isInsufficientMaterial: false,
      isFiftyMoveRule: false,
      turn: chessService.getTurn(),
      winner: actualPlayerColor === 'w' ? 'b' : 'w',
      statusText: `${actualPlayerColor === 'w' ? 'White' : 'Black'} resigned.`,
    };
    setGameStatus(status);
    handleGameOver(status, actualPlayerColor);
  };

  useEffect(() => {
    return () => {
      stockfishEngine.cancelCalculation();
    };
  }, []);

  // ACTIVE MATCH VIEW
  if (isPlaying && chessService && gameStatus) {
    const checkSquare = gameStatus.isCheck
      ? chessService.findKingSquare(chessService.getTurn())
      : null;
    const isPlayerTurn = chessService.getTurn() === actualPlayerColor;
    const captured = chessService.getCapturedPieces();

    const opponentCaptured = actualPlayerColor === 'w' ? captured.whiteCaptured : captured.blackCaptured;
    const playerCaptured = actualPlayerColor === 'w' ? captured.blackCaptured : captured.whiteCaptured;

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-16 animate-fade-in flex flex-col items-center">
        {/* Match Top Bar: Opponent Info */}
        <div className="w-full max-w-[460px] bg-[#12151c] border border-white/[0.08] rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-sm text-[#e5c158] border border-white/[0.08]">
              {activeBot.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-tight">{activeBot.name}</span>
                <span className="text-[11px] font-mono text-neutral-400">★ {activeBot.rating}</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                {isBotThinking ? (
                  <span className="text-[#e5c158] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158] animate-ping" /> Calculating...
                  </span>
                ) : !isPlayerTurn ? (
                  'Move ready'
                ) : (
                  'Awaiting your move'
                )}
              </span>
            </div>
          </div>

          {/* Captured pieces by opponent */}
          <div className="flex items-center gap-1 text-xs">
            {opponentCaptured.map((p, idx) => (
              <span key={idx} className="w-4 h-4 inline-block opacity-80">
                <ChessPieceSvg type={p} color={actualPlayerColor} />
              </span>
            ))}
          </div>
        </div>

        {/* Board View */}
        <ChessBoardView
          key={gameRevision}
          board={chessService.getBoard()}
          orientation={boardOrientation}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          checkSquare={checkSquare}
          boardTheme={progressData.settings.boardTheme}
          showCoordinates={progressData.settings.showCoordinates}
          isInteractive={isPlayerTurn && !isBotThinking && !isGameOverModalOpen}
          onSquareClick={handleSquareClick}
          pendingPromotion={pendingPromotion}
          onSelectPromotionPiece={handleSelectPromotionPiece}
          onCancelPromotion={() => setPendingPromotion(null)}
        />

        {/* Player Info Bar */}
        <div className="w-full max-w-[460px] bg-[#12151c] border border-white/[0.08] rounded-xl px-4 py-2.5 mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-sm text-white border border-white/[0.08]">
              ♟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-tight">You</span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                  ({actualPlayerColor === 'w' ? 'White' : 'Black'})
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400">
                {isPlayerTurn ? 'Your turn to move' : 'Opponent turn'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {playerCaptured.map((p, idx) => (
              <span key={idx} className="w-4 h-4 inline-block opacity-80">
                <ChessPieceSvg type={p} color={actualPlayerColor === 'w' ? 'b' : 'w'} />
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-[460px] flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={isBotThinking || isGameOverModalOpen}
              className="py-2 px-3 rounded-lg bg-[#12151c] border border-white/[0.08] text-neutral-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
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

          <button
            onClick={handleResign}
            disabled={isGameOverModalOpen}
            className="py-2 px-3 rounded-lg bg-[#12151c] border border-red-900/30 text-rose-400 hover:bg-rose-950/30 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Flag className="w-3.5 h-3.5" /> Resign
          </button>
        </div>

        {/* Resign confirmation */}
        {isConfirmResignOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12151c] border border-white/[0.1] rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl">
              <h4 className="text-white font-bold text-sm mb-1">Confirm Resignation?</h4>
              <p className="text-xs text-neutral-400 mb-5">
                Concede game against {activeBot.name}?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConfirmResignOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  Keep Playing
                </button>
                <button
                  onClick={confirmResign}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Resign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOverModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#12151c] border border-white/[0.12] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <span className="text-[11px] text-[#d4af37] uppercase tracking-widest font-semibold block mb-1">
                Match Result
              </span>
              <h3 className="font-brand text-2xl font-bold text-white mb-2">
                {gameStatus.winner === actualPlayerColor
                  ? 'Victory'
                  : gameStatus.winner === 'draw'
                  ? 'Draw'
                  : 'Defeat'}
              </h3>
              <p className="text-xs text-neutral-400 mb-6">{gameStatus.statusText}</p>

              <div className="space-y-2">
                <button
                  onClick={startGame}
                  className="w-full py-2.5 bg-[#e5c158] hover:bg-[#d4af37] text-black font-bold text-xs rounded-lg transition"
                >
                  Play Rematch
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setIsGameOverModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 text-xs font-semibold rounded-lg transition"
                >
                  Change Bot / Color
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // BOT SELECTION SCREEN
  const botList = Object.values(BOT_PROFILES);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full pb-20">
      <div className="mb-6 pb-4 border-b border-white/[0.08]">
        <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-widest block mb-1">
          Stockfish Engine Sparring
        </span>
        <h2 className="font-brand text-2xl sm:text-3xl font-bold text-white tracking-wide">
          Offline Chess Bots
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Select bot strength and practice your repertoire completely offline.
        </p>
      </div>

      {/* Bot Persona List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {botList.map((bot) => {
          const isSelected = selectedBotId === bot.id;
          const stats = progressData.botStats[bot.id] || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
          };

          return (
            <div
              key={bot.id}
              onClick={() => setSelectedBotId(bot.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-[#e5c158] bg-[#161a22] shadow-sm ring-1 ring-[#e5c158]/50'
                  : 'border-white/[0.08] bg-[#12151c] hover:border-white/[0.16]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{bot.name}</span>
                    <span className="text-xs text-neutral-400 font-medium">({bot.title})</span>
                  </div>
                  <span className="font-mono text-xs text-[#d4af37] font-bold">
                    ★ {bot.rating}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {bot.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono">
                  {stats.wins}W · {stats.losses}L · {stats.draws}D
                </span>
                <span className="text-[#e5c158] text-[11px] font-semibold">
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Configuration */}
      <div className="bg-[#12151c] border border-white/[0.08] rounded-xl p-5">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Piece Color
        </h4>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setPlayerColorChoice('white')}
            className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
              playerColorChoice === 'white'
                ? 'bg-white text-black border-white shadow'
                : 'bg-white/[0.04] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" />
            White (First)
          </button>
          <button
            onClick={() => setPlayerColorChoice('random')}
            className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
              playerColorChoice === 'random'
                ? 'bg-[#e5c158] text-black border-[#e5c158] shadow'
                : 'bg-white/[0.04] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            Random
          </button>
          <button
            onClick={() => setPlayerColorChoice('black')}
            className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
              playerColorChoice === 'black'
                ? 'bg-neutral-900 text-white border-neutral-600 shadow'
                : 'bg-white/[0.04] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-500" />
            Black
          </button>
        </div>

        <button
          onClick={startGame}
          className="w-full py-3.5 bg-[#e5c158] hover:bg-[#d4af37] text-black font-extrabold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2 tracking-wide"
        >
          <Swords className="w-4 h-4 fill-current" />
          Play vs {activeBot.name} (Rating {activeBot.rating})
        </button>
      </div>
    </div>
  );
};

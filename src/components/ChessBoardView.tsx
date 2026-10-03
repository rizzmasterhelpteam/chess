import React, { useState } from 'react';
import { Square, Move, PieceSymbol } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { BoardSquare } from '../chess/ChessRules';
import { BoardThemeId } from '../data/userProgressRepository';

interface ChessBoardViewProps {
  board: (BoardSquare | null)[][];
  orientation: 'white' | 'black';
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  hintSquares?: { from?: Square; to?: Square };
  keySquares?: string[];
  boardTheme: BoardThemeId;
  showCoordinates: boolean;
  isInteractive: boolean;
  onSquareClick: (square: Square) => void;
  pendingPromotion?: { from: Square; to: Square } | null;
  onSelectPromotionPiece?: (piece: PieceSymbol) => void;
  onCancelPromotion?: () => void;
}

const THEME_COLORS: Record<
  BoardThemeId,
  {
    light: string;
    dark: string;
    frameBg: string;
    lastMoveLight: string;
    lastMoveDark: string;
    selectedLight: string;
    selectedDark: string;
  }
> = {
  green: {
    light: '#eeeed2',
    dark: '#769656',
    frameBg: '#212621',
    lastMoveLight: '#f5f682',
    lastMoveDark: '#baca44',
    selectedLight: '#f7f794',
    selectedDark: '#c5d55b',
  },
  wood: {
    light: '#e8cb9b',
    dark: '#b27d42',
    frameBg: '#241a12',
    lastMoveLight: '#e4c86e',
    lastMoveDark: '#bf9844',
    selectedLight: '#eed484',
    selectedDark: '#cfa64e',
  },
  slate: {
    light: '#dee3e6',
    dark: '#8ca2ad',
    frameBg: '#1c2228',
    lastMoveLight: '#d2df95',
    lastMoveDark: '#a3b45e',
    selectedLight: '#e0ecaa',
    selectedDark: '#b2c46a',
  },
  midnight: {
    light: '#9ca3af',
    dark: '#374151',
    frameBg: '#111827',
    lastMoveLight: '#e5a43b',
    lastMoveDark: '#b8751e',
    selectedLight: '#f3b552',
    selectedDark: '#c98327',
  },
};

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  board,
  orientation,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  hintSquares,
  keySquares = [],
  boardTheme,
  showCoordinates,
  isInteractive,
  onSquareClick,
  pendingPromotion,
  onSelectPromotionPiece,
  onCancelPromotion,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const colors = THEME_COLORS[boardTheme] || THEME_COLORS.green;
  const isFlipped = orientation === 'black';

  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  const getSquareData = (squareName: Square): BoardSquare | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r]?.[c];
        if (sq && sq.square === squareName) return sq;
      }
    }
    return null;
  };

  const legalDestinationSquares = new Set(legalMoves.map((m) => m.to));

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!isInteractive) return;
    setDraggedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    onSquareClick(square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    setDraggedSquare(null);
    if (!isInteractive) return;
    if (draggedSquare && draggedSquare !== targetSquare) {
      onSquareClick(targetSquare);
    }
  };

  return (
    <div
      style={{ backgroundColor: colors.frameBg }}
      className="relative w-full max-w-[480px] lg:max-w-[500px] aspect-square rounded-xl p-2 sm:p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-white/[0.08] select-none touch-manipulation transition-colors duration-200"
    >
      {/* Precision 8x8 Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] relative">
        {ranks.map((rank, rankRowIdx) =>
          files.map((file, fileColIdx) => {
            const squareName = `${file}${rank}` as Square;
            const sqData = getSquareData(squareName);
            const isLightSquare = (file.charCodeAt(0) - 97 + rank) % 2 !== 0;

            const isSelected = selectedSquare === squareName;
            const isLegalDest = legalDestinationSquares.has(squareName);
            const isLastMoveFrom = lastMove?.from === squareName;
            const isLastMoveTo = lastMove?.to === squareName;
            const isCheck = checkSquare === squareName;
            const isHintPiece = hintSquares?.from === squareName;
            const isHintTarget = hintSquares?.to === squareName;
            const isKeySquare = keySquares.includes(squareName);

            let bg = isLightSquare ? colors.light : colors.dark;
            if (isLastMoveFrom || isLastMoveTo) {
              bg = isLightSquare ? colors.lastMoveLight : colors.lastMoveDark;
            }
            if (isSelected) {
              bg = isLightSquare ? colors.selectedLight : colors.selectedDark;
            }

            return (
              <div
                key={squareName}
                onClick={() => isInteractive && onSquareClick(squareName)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, squareName)}
                style={{ backgroundColor: bg }}
                className={`relative flex items-center justify-center cursor-pointer select-none transition-colors duration-150 ${
                  isCheck ? 'radial-check z-10' : ''
                } ${isHintPiece ? 'ring-[3px] ring-inset ring-amber-400 z-10' : ''} ${
                  isKeySquare ? 'ring-2 ring-dashed ring-amber-400/80' : ''
                }`}
              >
                {/* Coordinates in corner */}
                {showCoordinates && fileColIdx === 0 && (
                  <span
                    className="absolute top-0.5 left-1 text-[11px] font-bold pointer-events-none select-none leading-none"
                    style={{
                      color: isLightSquare ? colors.dark : colors.light,
                      opacity: 0.85,
                    }}
                  >
                    {rank}
                  </span>
                )}
                {showCoordinates && rankRowIdx === 7 && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[11px] font-bold pointer-events-none select-none leading-none lowercase"
                    style={{
                      color: isLightSquare ? colors.dark : colors.light,
                      opacity: 0.85,
                    }}
                  >
                    {file}
                  </span>
                )}

                {/* Hint target square */}
                {isHintTarget && (
                  <div className="absolute inset-1.5 rounded-full border-[3px] border-amber-400 animate-ping pointer-events-none z-10 opacity-75" />
                )}

                {/* Legal destination indicators */}
                {isLegalDest && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {sqData?.piece ? (
                      // Capture ring
                      <div className="w-[84%] h-[84%] rounded-full border-[3.5px] border-black/30 dark:border-white/40 scale-95" />
                    ) : (
                      // Move dot
                      <div className="w-3.5 h-3.5 rounded-full bg-black/25 dark:bg-white/30" />
                    )}
                  </div>
                )}

                {/* Piece Rendering */}
                {sqData?.piece && (
                  <div
                    draggable={isInteractive}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    className={`w-[88%] h-[88%] flex items-center justify-center transition-transform duration-100 ${
                      isSelected ? '-translate-y-1 scale-105' : 'hover:scale-[1.03] active:scale-95'
                    }`}
                  >
                    <ChessPieceSvg type={sqData.piece.type} color={sqData.piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Promotion Choice Modal */}
      {pendingPromotion && onSelectPromotionPiece && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 rounded-xl animate-fade-in">
          <div className="bg-[#12151c] border border-white/[0.12] rounded-xl p-5 shadow-2xl max-w-xs w-full text-center">
            <h4 className="text-white font-bold text-sm mb-1 tracking-tight">Pawn Promotion</h4>
            <p className="text-neutral-400 text-xs mb-4">Choose promotion piece:</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceType) => (
                <button
                  key={pieceType}
                  onClick={() => onSelectPromotionPiece(pieceType)}
                  className="aspect-square bg-neutral-800 hover:bg-neutral-700 active:scale-95 border border-white/[0.1] rounded-lg p-2 transition flex items-center justify-center shadow-md"
                >
                  <ChessPieceSvg
                    type={pieceType}
                    color={getSquareData(pendingPromotion.from)?.piece?.color || 'w'}
                  />
                </button>
              ))}
            </div>
            {onCancelPromotion && (
              <button
                onClick={onCancelPromotion}
                className="text-xs text-neutral-400 hover:text-white px-3 py-1 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

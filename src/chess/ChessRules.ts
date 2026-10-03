import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';

export interface BoardSquare {
  square: Square;
  file: string;
  rank: number;
  piece: {
    type: PieceSymbol;
    color: Color;
  } | null;
  isLight: boolean;
}

export interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isFiftyMoveRule: boolean;
  turn: 'w' | 'b';
  winner: 'w' | 'b' | 'draw' | null;
  statusText: string;
}

export interface MoveResult {
  success: boolean;
  san?: string;
  captured?: PieceSymbol;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isPromotion?: boolean;
  from?: Square;
  to?: Square;
  fen?: string;
}

export class ChessRulesService {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public reset(fen?: string) {
    if (fen) {
      this.chess.load(fen);
    } else {
      this.chess.reset();
    }
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  public getLegalMoves(square?: Square): Move[] {
    if (square) {
      return this.chess.moves({ square, verbose: true });
    }
    return this.chess.moves({ verbose: true });
  }

  public isLegalMove(from: Square, to: Square, promotion?: string): boolean {
    const moves = this.chess.moves({ square: from, verbose: true });
    return moves.some(m => m.to === to && (!promotion || m.promotion === promotion));
  }

  public makeMove(from: Square, to: Square, promotion?: string): MoveResult {
    try {
      const piece = this.chess.get(from);
      const isPawn = piece?.type === 'p';
      const toRank = to[1];
      const isPromo = isPawn && (toRank === '8' || toRank === '1');

      const moveArg: { from: Square; to: Square; promotion?: PieceSymbol } = { from, to };
      if (isPromo) {
        moveArg.promotion = (promotion as PieceSymbol) || 'q';
      }

      const move = this.chess.move(moveArg);

      if (!move) {
        return { success: false };
      }

      return {
        success: true,
        san: move.san,
        captured: move.captured,
        isCheck: this.chess.inCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isPromotion: !!move.promotion,
        from: move.from,
        to: move.to,
        fen: this.chess.fen(),
      };
    } catch {
      return { success: false };
    }
  }

  public makeSanMove(san: string): MoveResult {
    try {
      const move = this.chess.move(san);
      if (!move) return { success: false };
      return {
        success: true,
        san: move.san,
        captured: move.captured,
        isCheck: this.chess.inCheck(),
        isCheckmate: this.chess.isCheckmate(),
        from: move.from,
        to: move.to,
        fen: this.chess.fen(),
      };
    } catch {
      return { success: false };
    }
  }

  public undo(): Move | null {
    return this.chess.undo();
  }

  public getStatus(): GameStatus {
    const isCheck = this.chess.inCheck();
    const isCheckmate = this.chess.isCheckmate();
    const isStalemate = this.chess.isStalemate();
    const isThreefold = this.chess.isThreefoldRepetition();
    const isInsufficient = this.chess.isInsufficientMaterial();
    const isFifty = this.chess.isDraw() && !isStalemate && !isThreefold && !isInsufficient;
    const isDraw = this.chess.isDraw();
    const turn = this.chess.turn();

    let winner: 'w' | 'b' | 'draw' | null = null;
    let statusText = turn === 'w' ? "White's turn" : "Black's turn";

    if (isCheckmate) {
      winner = turn === 'w' ? 'b' : 'w';
      statusText = winner === 'w' ? 'Checkmate — White wins!' : 'Checkmate — Black wins!';
    } else if (isStalemate) {
      winner = 'draw';
      statusText = 'Draw by Stalemate';
    } else if (isThreefold) {
      winner = 'draw';
      statusText = 'Draw by Threefold Repetition';
    } else if (isInsufficient) {
      winner = 'draw';
      statusText = 'Draw by Insufficient Material';
    } else if (isFifty) {
      winner = 'draw';
      statusText = 'Draw by 50-move rule';
    } else if (isCheck) {
      statusText = `${turn === 'w' ? 'White' : 'Black'} is in check!`;
    }

    return {
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      isThreefoldRepetition: isThreefold,
      isInsufficientMaterial: isInsufficient,
      isFiftyMoveRule: isFifty,
      turn,
      winner,
      statusText,
    };
  }

  public getCapturedPieces(): { whiteCaptured: PieceSymbol[]; blackCaptured: PieceSymbol[]; materialDiff: number } {
    const history = this.chess.history({ verbose: true });
    const whiteCaptured: PieceSymbol[] = [];
    const blackCaptured: PieceSymbol[] = [];

    const pieceValues: Record<PieceSymbol, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const move of history) {
      if (move.captured) {
        if (move.color === 'w') {
          // White captured black piece
          whiteCaptured.push(move.captured);
          whiteMaterial += pieceValues[move.captured];
        } else {
          blackCaptured.push(move.captured);
          blackMaterial += pieceValues[move.captured];
        }
      }
    }

    return {
      whiteCaptured,
      blackCaptured,
      materialDiff: whiteMaterial - blackMaterial,
    };
  }

  public getBoard(): (BoardSquare | null)[][] {
    const rawBoard = this.chess.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return rawBoard.map((row, rankIdx) => {
      const rank = 8 - rankIdx;
      return row.map((col, fileIdx) => {
        const square = `${files[fileIdx]}${rank}` as Square;
        const isLight = (fileIdx + rankIdx) % 2 === 0;
        return {
          square,
          file: files[fileIdx],
          rank,
          piece: col ? { type: col.type, color: col.color } : null,
          isLight,
        };
      });
    });
  }

  public findKingSquare(color: 'w' | 'b'): Square | null {
    const rawBoard = this.chess.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = rawBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return `${files[c]}${8 - r}` as Square;
        }
      }
    }
    return null;
  }
}

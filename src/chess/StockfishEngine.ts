import { Chess, Square, Move } from 'chess.js';

export type BotLevelId = '600' | '1000' | '1600' | '2200' | 'gm';

export interface BotProfile {
  id: BotLevelId;
  name: string;
  rating: number;
  title: string;
  avatar: string;
  description: string;
  tagline: string;
  color: string;
  depth: number;
  maxComputeMs: number;
  blunderRate: number; // 0 to 1
  thinkDelayMs: number;
}

export const BOT_PROFILES: Record<BotLevelId, BotProfile> = {
  '600': {
    id: '600',
    name: 'Oliver',
    rating: 600,
    title: 'Beginner',
    avatar: '♟️',
    description: 'Makes frequent mistakes, misses tactical traps, and occasionally leaves pieces undefended.',
    tagline: 'Casual learner who plays quick moves and often misses tactical threats.',
    color: '#10b981', // Emerald
    depth: 1,
    maxComputeMs: 80,
    blunderRate: 0.35,
    thinkDelayMs: 350,
  },
  '1000': {
    id: '1000',
    name: 'Maya',
    rating: 1000,
    title: 'Casual',
    avatar: '♞',
    description: 'Understands basic captures and opening goals, but makes tactical slip-ups when pressured.',
    tagline: 'Solid beginner who knows basic opening goals but can get tricked.',
    color: '#3b82f6', // Blue
    depth: 2,
    maxComputeMs: 150,
    blunderRate: 0.15,
    thinkDelayMs: 500,
  },
  '1600': {
    id: '1600',
    name: 'Viktor',
    rating: 1600,
    title: 'Club Player',
    avatar: '♝',
    description: 'Punishes tactical errors, controls the center, and maintains solid piece coordination.',
    tagline: 'Experienced club competitor with a sharp tactical eye and standard opening knowledge.',
    color: '#8b5cf6', // Violet
    depth: 3,
    maxComputeMs: 250,
    blunderRate: 0.03,
    thinkDelayMs: 700,
  },
  '2200': {
    id: '2200',
    name: 'Elena',
    rating: 2200,
    title: 'Master',
    avatar: '♜',
    description: 'Accurate positional play, deep tactical calculation, and relentless endgame resilience.',
    tagline: 'Master-level tactician who anticipates threats moves ahead.',
    color: '#f59e0b', // Amber
    depth: 4,
    maxComputeMs: 350,
    blunderRate: 0.0,
    thinkDelayMs: 900,
  },
  'gm': {
    id: 'gm',
    name: 'Stockfish GM',
    rating: 2800,
    title: 'Grandmaster',
    avatar: '♛',
    description: 'Peak engine calculation with grandmaster opening repertoire and near-flawless endgame conversion.',
    tagline: 'Maximum challenge. Zero mercy.',
    color: '#ef4444', // Red
    depth: 5,
    maxComputeMs: 450,
    blunderRate: 0.0,
    thinkDelayMs: 1100,
  },
};

// Material piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses (Piece-Square Tables)
const PST_PAWN = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const PST_ROOK = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const PST_QUEEN = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

const PST_KING_MIDDLE = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

// Comprehensive ECO Opening Book keyed by "boardFen sideToMove"
const OPENING_BOOK: Record<string, string[]> = {
  // Start position: White moves
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': ['e4', 'd4', 'c4', 'Nf3'],

  // After 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': ['e5', 'c5', 'e6', 'c6', 'd6'],

  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w': ['Nf3', 'Bc4', 'Nc3'],
  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b': ['Nc6', 'Nf6', 'd6'],
  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w': ['Bb5', 'Bc4', 'd4'],
  // Italian: 1. e4 e5 2. Nf3 Nc6 3. Bc4
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b': ['Bc5', 'Nf6'],
  // Ruy Lopez: 1. e4 e5 2. Nf3 Nc6 3. Bb5
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b': ['a6', 'Nf6'],

  // Sicilian: 1. e4 c5
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w': ['Nf3', 'Nc3', 'c3'],
  // Sicilian: 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b': ['d6', 'Nc6', 'e6'],
  // Sicilian: 1. e4 c5 2. Nf3 d6
  'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w': ['d4', 'Bb5+'],
  // Sicilian Open: 1. e4 c5 2. Nf3 d6 3. d4
  'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b': ['cxd4'],
  // Sicilian Open: 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4
  'rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b': ['Nf6'],

  // French: 1. e4 e6
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w': ['d4'],
  // French: 1. e4 e6 2. d4 d5
  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w': ['Nc3', 'Nd2', 'e5'],

  // Caro-Kann: 1. e4 c6
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w': ['d4'],
  // Caro-Kann: 1. e4 c6 2. d4 d5
  'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w': ['Nc3', 'e5'],

  // 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': ['d5', 'Nf6', 'e6'],
  // 1. d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w': ['c4', 'Nf3', 'Bf4'],
  // Queen's Gambit: 1. d4 d5 2. c4
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': ['e6', 'c6', 'dxc4'],
  // 1. d4 Nf6
  'rnbqkbnr/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w': ['c4', 'Nf3', 'Bf4'],
  // 1. d4 Nf6 2. c4
  'rnbqkbnr/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b': ['g6', 'e6', 'c5'],

  // English Opening: 1. c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b': ['e5', 'c5', 'Nf6'],
  // Reti Opening: 1. Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b': ['d5', 'Nf6'],
};

export class StockfishEngineService {
  private currentCalculationId: number = 0;

  public cancelCalculation() {
    this.currentCalculationId++;
  }

  // Evaluates board position in centipawns (positive is White advantage)
  public evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -30000 : 30000;
    }
    if (chess.isDraw()) {
      return 0;
    }

    const board = chess.board();
    let score = 0;
    let whitePiecesCount = 0;
    let blackPiecesCount = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type] || 0;
        const squareIdx = r * 8 + c;
        const flippedIdx = (7 - r) * 8 + c;

        let pstVal = 0;
        if (piece.type === 'p') {
          pstVal = piece.color === 'w' ? PST_PAWN[squareIdx] : PST_PAWN[flippedIdx];
        } else if (piece.type === 'n') {
          pstVal = piece.color === 'w' ? PST_KNIGHT[squareIdx] : PST_KNIGHT[flippedIdx];
        } else if (piece.type === 'b') {
          pstVal = piece.color === 'w' ? PST_BISHOP[squareIdx] : PST_BISHOP[flippedIdx];
        } else if (piece.type === 'r') {
          pstVal = piece.color === 'w' ? PST_ROOK[squareIdx] : PST_ROOK[flippedIdx];
        } else if (piece.type === 'q') {
          pstVal = piece.color === 'w' ? PST_QUEEN[squareIdx] : PST_QUEEN[flippedIdx];
        } else if (piece.type === 'k') {
          pstVal = piece.color === 'w' ? PST_KING_MIDDLE[squareIdx] : PST_KING_MIDDLE[flippedIdx];
        }

        if (piece.color === 'w') {
          score += (val + pstVal);
          whitePiecesCount++;
        } else {
          score -= (val + pstVal);
          blackPiecesCount++;
        }
      }
    }

    return score;
  }

  // Quiescence search for tactical stability on captures
  private quiesce(chess: Chess, alpha: number, beta: number, depth: number, deadline: number): number {
    if (Date.now() > deadline) {
      throw new Error('TIMEOUT');
    }

    const isWhite = chess.turn() === 'w';
    const rawEval = this.evaluatePosition(chess);
    const standPat = isWhite ? rawEval : -rawEval;

    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (depth >= 3) return standPat;

    // Search captures only
    const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
    if (captures.length === 0) return standPat;

    // Order captures by MVV-LVA
    captures.sort((a, b) => {
      const valA = (PIECE_VALUES[a.captured || 'p'] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
      const valB = (PIECE_VALUES[b.captured || 'p'] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
      return valB - valA;
    });

    for (const m of captures) {
      chess.move(m);
      const score = -this.quiesce(chess, -beta, -alpha, depth + 1, deadline);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // Alpha-beta minimax with move ordering and quiescence
  private alphabeta(chess: Chess, depth: number, alpha: number, beta: number, deadline: number): number {
    if (Date.now() > deadline) {
      throw new Error('TIMEOUT');
    }

    if (depth === 0 || chess.isGameOver()) {
      return this.quiesce(chess, alpha, beta, 0, deadline);
    }

    const moves = chess.moves({ verbose: true });
    // Move ordering: captures first (MVV-LVA), then checks, then quiet moves
    moves.sort((a, b) => {
      const aScore = a.captured ? 1000 + (PIECE_VALUES[a.captured] || 0) - (PIECE_VALUES[a.piece] || 0) : (a.san.includes('+') ? 500 : 0);
      const bScore = b.captured ? 1000 + (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[b.piece] || 0) : (b.san.includes('+') ? 500 : 0);
      return bScore - aScore;
    });

    for (const m of moves) {
      chess.move(m);
      const score = -this.alphabeta(chess, depth - 1, -beta, -alpha, deadline);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // Check opening book for instant, natural grandmaster reply
  private getOpeningBookMove(fen: string, legalMoves: Move[]): Move | null {
    const parts = fen.split(' ');
    const key = `${parts[0]} ${parts[1]}`;
    const candidates = OPENING_BOOK[key];

    if (!candidates || candidates.length === 0) return null;

    // Filter to legal moves
    const matchingMoves = legalMoves.filter((m) =>
      candidates.includes(m.san) || candidates.includes(m.lan)
    );

    if (matchingMoves.length === 0) return null;

    // Pick one of the book moves
    return matchingMoves[Math.floor(Math.random() * matchingMoves.length)];
  }

  // Calculate bot move with personality shaping and guaranteed responsiveness
  public async getBestMove(
    fen: string,
    botLevel: BotLevelId,
    onProgress?: (progressText: string) => void
  ): Promise<Move | null> {
    const calcId = ++this.currentCalculationId;
    const profile = BOT_PROFILES[botLevel] || BOT_PROFILES['1000'];
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });

    if (legalMoves.length === 0) return null;

    // 1. Check opening book for 1000, 1600, 2200, and GM
    if (botLevel !== '600' || Math.random() > 0.4) {
      const bookMove = this.getOpeningBookMove(fen, legalMoves);
      if (bookMove) {
        // Natural thinking delay
        const bookDelay = Math.min(600, profile.thinkDelayMs);
        await new Promise((resolve) => setTimeout(resolve, bookDelay));
        if (calcId !== this.currentCalculationId) return null;
        return bookMove;
      }
    }

    // 2. Beginner 600 special blunder logic:
    if (botLevel === '600' && Math.random() < profile.blunderRate) {
      const delay = profile.thinkDelayMs + Math.floor(Math.random() * 150);
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (calcId !== this.currentCalculationId) return null;

      // Pick a random non-tactical move or simple move
      const nonCaptures = legalMoves.filter((m) => !m.captured);
      const pool = nonCaptures.length > 0 ? nonCaptures : legalMoves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 3. Simulated realistic thinking delay
    const delay = profile.thinkDelayMs + Math.floor(Math.random() * 200);
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (calcId !== this.currentCalculationId) return null;

    // 4. Iterative deepening search with strict time bounding
    const deadline = Date.now() + profile.maxComputeMs;
    let bestMove: Move = legalMoves[0];
    const isWhite = chess.turn() === 'w';

    // Prioritize root moves: captures first
    const sortedRootMoves = [...legalMoves].sort((a, b) => {
      const aVal = a.captured ? PIECE_VALUES[a.captured] || 0 : 0;
      const bVal = b.captured ? PIECE_VALUES[b.captured] || 0 : 0;
      return bVal - aVal;
    });

    const targetMaxDepth = profile.depth;

    for (let currentDepth = 1; currentDepth <= targetMaxDepth; currentDepth++) {
      try {
        let depthBestMove = bestMove;
        let depthBestScore = -Infinity;

        for (const m of sortedRootMoves) {
          if (Date.now() > deadline) break;
          chess.move(m);
          // Negamax call
          const score = -this.alphabeta(chess, currentDepth - 1, -Infinity, Infinity, deadline);
          chess.undo();

          if (score > depthBestScore) {
            depthBestScore = score;
            depthBestMove = m;
          }
        }

        bestMove = depthBestMove;

        // Yield execution to keep the browser UI responsive
        await new Promise((r) => setTimeout(r, 0));
        if (calcId !== this.currentCalculationId) return null;
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'TIMEOUT') {
          break; // Stop and return best move found at previous depth
        }
        break;
      }
    }

    // Casual 1000 blunder logic: 15% chance to pick 2nd best move
    if (botLevel === '1000' && Math.random() < profile.blunderRate && sortedRootMoves.length > 1) {
      const alternative = sortedRootMoves.find((m) => m.from !== bestMove.from || m.to !== bestMove.to);
      if (alternative) return alternative;
    }

    return bestMove;
  }
}

export const stockfishEngine = new StockfishEngineService();

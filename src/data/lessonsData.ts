export interface LessonItem {
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  explanation: string;
  keyIdea: string;
  mistakeToAvoid: string;
  initialFen: string;
  orientation: 'white' | 'black';
  keySquares?: string[];
  interactiveMoves?: { from: string; to: string; comment: string }[];
  whitePlan?: string;
  blackPlan?: string;
}

export interface LessonCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: LessonItem[];
}

export const LESSON_CATEGORIES: LessonCategory[] = [
  {
    id: 'basics',
    title: 'Beginner Basics',
    description: 'Master how pieces move, check, checkmate, stalemate, castling, and piece values.',
    icon: '♟️',
    lessons: [
      {
        id: 'basics-moves',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'How Pieces Move',
        explanation: 'Each chess piece possesses unique geometry. Pawns march forward one square (two on their initial move) and capture diagonally. Knights leap in an L-shape over obstacles. Bishops glide along diagonals. Rooks patrol ranks and files. The Queen combines Rook and Bishop powers, while the King steps one square in any direction.',
        keyIdea: 'Harness piece harmony. Place pieces on squares where their movement radiates maximum influence across the board.',
        mistakeToAvoid: 'Moving pieces without a purpose or trapping your own bishop behind fixed pawns.',
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        orientation: 'white',
        keySquares: ['e4', 'd4', 'e5', 'd5'],
        interactiveMoves: [
          { from: 'e2', to: 'e4', comment: 'Advance central pawn two squares to occupy the board center.' },
          { from: 'e7', to: 'e5', comment: 'Black stakes equal claim in the center.' },
          { from: 'g1', to: 'f3', comment: 'Develop the knight towards the center, attacking e5.' }
        ]
      },
      {
        id: 'basics-values',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Piece Values & Economy',
        explanation: 'Understanding relative piece values helps evaluate trades: Pawn = 1, Knight = 3, Bishop = 3, Rook = 5, Queen = 9. The King is invaluable because losing it ends the game.',
        keyIdea: 'Only trade pieces when you gain an equal or greater exchange, or when doing so creates a decisive tactical breakthrough.',
        mistakeToAvoid: 'Giving up a Rook (5 points) for a Knight or Bishop (3 points) without concrete compensation.',
        initialFen: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5',
        orientation: 'white',
        keySquares: ['c3', 'b4', 'f3'],
        interactiveMoves: [
          { from: 'c1', to: 'd2', comment: 'Unpin the knight and neutralize Black bishop threat.' },
          { from: 'b4', to: 'c3', comment: 'Black trades a Bishop (3) for a Knight (3).' },
          { from: 'd2', to: 'c3', comment: 'Recapture cleanly, preserving material equality.' }
        ]
      },
      {
        id: 'basics-check',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Check & Escaping Danger',
        explanation: 'When a piece directly attacks the enemy King, it is in "Check". The player MUST respond immediately by CPR: Capture the checking piece, Protect (block the line of fire), or Run (step to a safe square).',
        keyIdea: 'Check is a powerful tempo tool, but giving checks with no follow-up often just develops enemy pieces.',
        mistakeToAvoid: 'Ignoring threats to your King. If in check, no other move is legal.',
        initialFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
        orientation: 'white',
        keySquares: ['f7', 'e8'],
        interactiveMoves: [
          { from: 'c4', to: 'f7', comment: 'Bishop delivers check directly to the Black King!' },
          { from: 'e8', to: 'e7', comment: 'King must run to e7 as the bishop is defended by the knight.' }
        ]
      },
      {
        id: 'basics-checkmate',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Checkmate: The Ultimate Goal',
        explanation: 'Checkmate occurs when the King is attacked (in check) and has NO legal moves to escape, block, or capture the attacker. The game ends instantly.',
        keyIdea: 'Coordinate multiple pieces against the enemy King to strip all escape squares.',
        mistakeToAvoid: 'Chasing enemy pawns across the board when a mating net is available.',
        initialFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P1n1/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        orientation: 'white',
        keySquares: ['f7', 'e8'],
        interactiveMoves: [
          { from: 'f3', to: 'f7', comment: 'Checkmate! Queen attacks King, defended by Bishop. Scholar’s Mate!' }
        ]
      },
      {
        id: 'basics-stalemate',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Stalemate: The Great Escape',
        explanation: 'If a player whose turn it is has NO legal moves and their King is NOT in check, the game is a Stalemate, which results in an immediate Draw.',
        keyIdea: 'When winning with massive material, always leave the opponent King at least one legal flight square until checkmate is delivered.',
        mistakeToAvoid: 'Mindlessly pushing pawns or trapping the lone King without delivering check, turning a win into a draw.',
        initialFen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
        orientation: 'white',
        keySquares: ['h8', 'f7'],
        interactiveMoves: []
      },
      {
        id: 'basics-castling',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Castling: King Safety & Rook Activation',
        explanation: 'Castling is the only move where two pieces move in a single turn. The King leaps two squares toward a Rook, and that Rook hops over the King. It can be kingside (O-O) or queenside (O-O-O).',
        keyIdea: 'Castle early (usually within the first 6–10 moves) to tuck your King safely behind a shield of pawns.',
        mistakeToAvoid: 'Castling into an open file or moving your King prior to castling (which voids castling rights).',
        initialFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
        orientation: 'white',
        keySquares: ['g1', 'f1', 'e1'],
        interactiveMoves: [
          { from: 'e1', to: 'g1', comment: 'White castles Kingside! King is safe on g1, Rook enters the f-file.' }
        ]
      },
      {
        id: 'basics-en-passant',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'En Passant: The French Pawn Rule',
        explanation: 'When a pawn moves two squares forward from its starting square and lands directly beside an opposing pawn on the 5th rank, the opponent may capture it diagonally "in passing" as if it had only moved one square. This must be done on the very next turn.',
        keyIdea: 'Remember that en passant exists to prevent pawns from bypassing enemy control squares unnoticed.',
        mistakeToAvoid: 'Forgetting that en passant is only valid for ONE move immediately following the double push.',
        initialFen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3',
        orientation: 'white',
        keySquares: ['f6', 'f5', 'e5'],
        interactiveMoves: [
          { from: 'e5', to: 'f6', comment: 'En passant capture! White captures Black pawn on f5 by landing on f6.' }
        ]
      },
      {
        id: 'basics-promotion',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Pawn Promotion',
        explanation: 'When a pawn reaches the eighth rank (or first for Black), it immediately transforms into a Queen, Rook, Bishop, or Knight of the same color.',
        keyIdea: 'In endgames, guiding a passed pawn to the promotion square is often the decisive winning plan.',
        mistakeToAvoid: 'Promoting to Queen automatically when it might cause an accidental stalemate (consider underpromotion if needed).',
        initialFen: '8/4P3/8/8/8/6k1/8/6K1 w - - 0 1',
        orientation: 'white',
        keySquares: ['e8', 'e7'],
        interactiveMoves: [
          { from: 'e7', to: 'e8', comment: 'Pawn reaches 8th rank and promotes to a powerful Queen!' }
        ]
      },
      {
        id: 'basics-center',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Controlling the Center',
        explanation: 'The squares e4, d4, e5, and d5 constitute the center of the chess battlefield. Pieces placed in or aimed at the center have superior mobility and influence more squares than pieces on the rim.',
        keyIdea: 'Stake an early claim on the central squares using pawns and support them with your minor pieces.',
        mistakeToAvoid: 'Developing your knights to the edge of the board (a3/h3) where their vision is halved.',
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        orientation: 'white',
        keySquares: ['e4', 'd4', 'e5', 'd5'],
        interactiveMoves: [
          { from: 'e2', to: 'e4', comment: 'Establish presence in the center and free Queen and Bishop.' },
          { from: 'e7', to: 'e5', comment: 'Black matches central control.' },
          { from: 'd2', to: 'd4', comment: 'Direct confrontation for central dominance.' }
        ]
      },
      {
        id: 'basics-development',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Developing Pieces',
        explanation: 'Development means mobilizing your back-rank pieces (Knights and Bishops first, then Rooks and Queen) into active squares where they threaten and control key areas.',
        keyIdea: 'Knights before Bishops, control the center, and do not move the same piece multiple times in the opening.',
        mistakeToAvoid: 'Starting premature pawn storms before your minor pieces are off the back rank.',
        initialFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        orientation: 'white',
        keySquares: ['f3', 'c4', 'f6', 'c5'],
        interactiveMoves: [
          { from: 'g8', to: 'f6', comment: 'Black develops Knight to f6, pressuring e4.' },
          { from: 'b1', to: 'c3', comment: 'White defends e4 and develops Knight towards the center.' }
        ]
      },
      {
        id: 'basics-king-safety',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'King Safety',
        explanation: 'An exposed King in the center of the board is a target for fast attacks, open files, and pin tactics. Safeguarding your King behind an intact pawn shield is paramount.',
        keyIdea: 'Do not push the f, g, or h pawns in front of your castled King unless there is a concrete defensive necessity.',
        mistakeToAvoid: 'Keeping your King on the uncastled e-file while the center pawns are traded open.',
        initialFen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5',
        orientation: 'white',
        keySquares: ['g1', 'f1', 'e1'],
        interactiveMoves: [
          { from: 'e1', to: 'g1', comment: 'White castles kingside. King is tucked away behind g2 and h2 pawns.' }
        ]
      },
      {
        id: 'basics-hanging-pieces',
        categoryId: 'basics',
        categoryTitle: 'Beginner Basics',
        title: 'Avoiding Hanging Pieces',
        explanation: 'A piece is "hanging" when it is undefended and subject to capture, or attacked by a piece of lower value. Most beginner games are decided purely by hanging pieces.',
        keyIdea: 'Before every move, ask yourself: What did my opponent just threaten? Is my target piece protected?',
        mistakeToAvoid: 'Blundering tactical focus by rushing your moves without doing a board blunder check.',
        initialFen: 'r1bqk1nr/pppp1ppp/2n5/4p3/1b2P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 1 4',
        orientation: 'white',
        keySquares: ['b4', 'c3', 'd2'],
        interactiveMoves: [
          { from: 'c1', to: 'd2', comment: 'Block check with Bishop, preventing loss of material.' }
        ]
      }
    ]
  },
  {
    id: 'opening-principles',
    title: 'Opening Principles',
    description: 'Understand core strategic tenets that govern sound opening play without rote memorization.',
    icon: '🏰',
    lessons: [
      {
        id: 'op-control-center',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Control the Center',
        explanation: 'Controlling e4, d4, e5, and d5 enables your pieces to shift rapidly from kingside to queenside. He who commands the center dictates the pace of battle.',
        keyIdea: 'Occupying or indirectly restraining central squares gives your army room to operate.',
        mistakeToAvoid: 'Pushing flank pawns (a4, h4) while neglecting central pawn tension.',
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        orientation: 'white',
        keySquares: ['d4', 'e4', 'd5', 'e5'],
        interactiveMoves: [
          { from: 'd2', to: 'd4', comment: 'Stakes claim on e5 and c5 with central pawn.' },
          { from: 'd7', to: 'd5', comment: 'Black balances central territory.' }
        ]
      },
      {
        id: 'op-develop-knights-bishops',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Develop Knights & Bishops Early',
        explanation: 'Knights thrive in the center (f3, c3, f6, c6). Bishops need diagonal highways. Develop these minor pieces before launching premature attacks.',
        keyIdea: 'Knights are slower pieces, so getting them mobilized toward central outposts early maximizes their impact.',
        mistakeToAvoid: 'Leaving bishops boxed behind unmoved center pawns.',
        initialFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        orientation: 'white',
        keySquares: ['f3', 'c3', 'c4'],
        interactiveMoves: [
          { from: 'g1', to: 'f3', comment: 'Knight develops with tempo, attacking e5.' },
          { from: 'b8', to: 'c6', comment: 'Knight develops and defends e5.' },
          { from: 'f1', to: 'c4', comment: 'Bishop takes aim at the vulnerable f7 square.' }
        ]
      },
      {
        id: 'op-castle-early',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Castle Early for King Shelter',
        explanation: 'Castling achieves two vital objectives: it safeguards the King in a fortress and activates a corner Rook toward central files.',
        keyIdea: 'Aim to castle within the first 7 to 10 moves of every standard opening.',
        mistakeToAvoid: 'Postponing castling to chase phantom tactical traps in the center.',
        initialFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5',
        orientation: 'white',
        keySquares: ['g1', 'f1', 'e1'],
        interactiveMoves: [
          { from: 'e1', to: 'g1', comment: 'Castling secures White King safely behind g2/h2 pawns.' }
        ]
      },
      {
        id: 'op-dont-move-same-piece',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Avoid Moving the Same Piece Twice',
        explanation: 'Every opening move should mobilize a new soldier. Moving the same piece repeatedly gives your rival free development tempi.',
        keyIdea: 'Time (tempo) in the opening is as valuable as material. Do not waste moves.',
        mistakeToAvoid: 'Hopping a knight 3 times across the board to capture a single pawn while opponent mobilizes 4 pieces.',
        initialFen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2',
        orientation: 'white',
        keySquares: ['e4', 'd5'],
        interactiveMoves: [
          { from: 'e4', to: 'd5', comment: 'Resolve pawn tension with capture.' },
          { from: 'd8', to: 'd5', comment: 'Black prematurely brings out Queen.' },
          { from: 'b1', to: 'c3', comment: 'White develops knight with tempo by attacking the Queen!' }
        ]
      },
      {
        id: 'op-dont-bring-queen-early',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Do Not Bring the Queen Out Too Early',
        explanation: 'The Queen is your most valuable offensive asset. If brought into open play too early, enemy minor pieces will attack her, forcing her to flee while developing their army.',
        keyIdea: 'Keep the Queen in reserve until minor pieces are active and lines are clarified.',
        mistakeToAvoid: 'Playing 2.Qh5 trying for a cheap checkmate against aware opponents.',
        initialFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        orientation: 'white',
        keySquares: ['h5', 'f3', 'c6'],
        interactiveMoves: [
          { from: 'd1', to: 'h5', comment: 'Aggressive but premature queen sally.' },
          { from: 'b8', to: 'c6', comment: 'Black defends e5 calmly.' },
          { from: 'f1', to: 'c4', comment: 'White threatens f7 checkmate.' },
          { from: 'g7', to: 'g6', comment: 'Black kicks queen and prepares fianchetto!' }
        ]
      },
      {
        id: 'op-connect-rooks',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Connect Your Rooks',
        explanation: 'Connecting the rooks signifies the conclusion of the opening phase. Once minor pieces have cleared the back rank and the King has castled, rooks defend one another and prepare to seize open files.',
        keyIdea: 'A connected back rank marks full tactical coordination.',
        mistakeToAvoid: 'Leaving a trapped bishop or knight between your rooks indefinitely.',
        initialFen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7',
        orientation: 'white',
        keySquares: ['d1', 'e2', 'f1', 'a1'],
        interactiveMoves: [
          { from: 'e1', to: 'g1', comment: 'Castle kingside.' },
          { from: 'c8', to: 'e6', comment: 'Black develops bishop.' },
          { from: 'c1', to: 'e3', comment: 'White develops bishop, opening path between a1 and f1 rooks.' }
        ]
      },
      {
        id: 'op-pawn-structure',
        categoryId: 'opening-principles',
        categoryTitle: 'Opening Principles',
        title: 'Pawn Structure Basics',
        explanation: 'Pawns are the soul of chess. Isolated pawns lack pawn defenders, doubled pawns limit mobility, and backward pawns represent permanent outposts for enemy pieces.',
        keyIdea: 'Keep pawn chains intact to create natural strongholds for your knights.',
        mistakeToAvoid: 'Creating isolated pawns without active piece compensation.',
        initialFen: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 4',
        orientation: 'white',
        keySquares: ['c3', 'b4'],
        interactiveMoves: [
          { from: 'b4', to: 'e7', comment: 'Bishop retreats safely, preserving intact black structure.' }
        ]
      }
    ]
  },
  {
    id: 'opening-strategies',
    title: 'Opening Strategies',
    description: 'Learn strategic ideas behind the most popular and dependable classical openings.',
    icon: '📖',
    lessons: [
      {
        id: 'strat-italian',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4)",
        explanation: "One of the oldest recorded chess openings. White targets Black's sensitive f7 pawn while aiming for rapid kingside castling and central control with c3 and d4.",
        keyIdea: "Active piece play aimed directly at Black's kingside weaknesses.",
        mistakeToAvoid: "Allowing Black to freely play d5 and equalize central space.",
        whitePlan: "Castle quickly, support d4 with c3, and launch attacks toward f7.",
        blackPlan: "Develop counterplay with ...Bc5 or ...Nf6 and break in the center with ...d5.",
        initialFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        orientation: 'white',
        keySquares: ['c4', 'f7', 'd4', 'c3'],
        interactiveMoves: [
          { from: 'f8', to: 'c5', comment: 'Black develops bishop to c5 (Giuoco Piano).' },
          { from: 'c2', to: 'c3', comment: 'White prepares the classical d4 central break.' },
          { from: 'g8', to: 'f6', comment: 'Black counter-attacks White’s e4 pawn.' }
        ]
      },
      {
        id: 'strat-ruy-lopez',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5)",
        explanation: "The Spanish Opening puts pressure on the knight defending Black's central e5 pawn. It creates long-term strategic pressure on the board.",
        keyIdea: "Indirect pressure on e5 and building a slow, dominant pawn center with c3 and d4.",
        mistakeToAvoid: "Panicking over ...a6; retreat the bishop to a4 and maintain the bind.",
        whitePlan: "Maintain bishop tension on a4, castle, build up on the e-file with Re1.",
        blackPlan: "Expand on queenside with ...a6 and ...b5, then reinforce e5.",
        initialFen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        orientation: 'white',
        keySquares: ['b5', 'e5', 'c6', 'a4'],
        interactiveMoves: [
          { from: 'a7', to: 'a6', comment: 'Morphy Defense: questions the Spanish bishop.' },
          { from: 'b5', to: 'a4', comment: 'Bishop maintains pressure along the a4-e8 diagonal.' },
          { from: 'g8', to: 'f6', comment: 'Black develops Knight to f6.' }
        ]
      },
      {
        id: 'strat-queens-gambit',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Queen's Gambit (1.d4 d5 2.c4)",
        explanation: "White offers a flank pawn (c4) to divert Black's central d5 pawn, with the goal of establishing a dominant two-pawn center with e4.",
        keyIdea: "Exchange a wing pawn for a center pawn to dictate central control.",
        mistakeToAvoid: "Black trying to cling to the gambited c4 pawn with ...b5 (often leads to disaster).",
        whitePlan: "Regain c4 with Bxc4, control e4, and expand in the center.",
        blackPlan: "Counter in the center with ...c6 (Slav) or ...e6 (QGD) to maintain stability.",
        initialFen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
        orientation: 'white',
        keySquares: ['c4', 'd5', 'e4', 'd4'],
        interactiveMoves: [
          { from: 'e7', to: 'e6', comment: "Queen's Gambit Declined: Black solidly bolsters d5." },
          { from: 'b1', to: 'c3', comment: 'White increases pressure against the d5 stronghold.' },
          { from: 'g8', to: 'f6', comment: 'Black reinforces d5 with Knight development.' }
        ]
      },
      {
        id: 'strat-london-system',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "London System (1.d4 d5 2.Bf4)",
        explanation: "A dependable, solid setup where White develops the dark-squared Bishop to f4 before locking the pawn pyramid with e3 and c3.",
        keyIdea: "Develop the problem bishop outside the pawn chain before playing e3.",
        mistakeToAvoid: "Playing e3 before developing the dark-squared bishop to f4.",
        whitePlan: "Create a rock-solid pawn pyramid on c3-d4-e3 and plant a Knight on e5.",
        blackPlan: "Challenging White's bishop with ...c5 and ...Qb6 targeting b2.",
        initialFen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
        orientation: 'white',
        keySquares: ['f4', 'e5', 'd4', 'c3'],
        interactiveMoves: [
          { from: 'g8', to: 'f6', comment: 'Black develops Knight toward the center.' },
          { from: 'e2', to: 'e3', comment: 'White locks the solid London pawn structure.' },
          { from: 'c7', to: 'c5', comment: 'Black strikes immediately at White’s d4 foundation.' }
        ]
      },
      {
        id: 'strat-kia',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "King's Indian Attack (1.Nf3, 2.g3, 3.Bg2, 4.d3, 5.O-O)",
        explanation: "A versatile universal system for White featuring a kingside fianchetto and e4 expansion, mirroring the King's Indian defense backwards with an extra tempo.",
        keyIdea: "Flexible development followed by e4 and a thematic kingside pawn storm with e5/f4.",
        mistakeToAvoid: "Overcommitting pawns before the kingside is safely castled.",
        whitePlan: "Push e4, Nbd2, Re1, and eventually push e5 to spark a kingside assault.",
        blackPlan: "Grab space on the queenside and clamp down on central breaks.",
        initialFen: 'rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2',
        orientation: 'white',
        keySquares: ['g2', 'e4', 'e5', 'd3'],
        interactiveMoves: [
          { from: 'g8', to: 'f6', comment: 'Black develops Knight to f6.' },
          { from: 'f1', to: 'g2', comment: 'White fianchettos bishop to control the long diagonal.' }
        ]
      },
      {
        id: 'strat-sicilian',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Sicilian Defense (1.e4 c5)",
        explanation: "The most combative and popular reply to 1.e4. Black fights for the center asymmetrically by exchanging a flank c-pawn for White's central d-pawn.",
        keyIdea: "Imbalance and dynamic counter-punching on the c-file.",
        mistakeToAvoid: "Allowing White a swift kingside mating attack without active counterplay.",
        whitePlan: "Open the center with 2.Nf3 and 3.d4, aiming for rapid tactical threats.",
        blackPlan: "Use the semi-open c-file and queenside pawn majority to counter-strike.",
        initialFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
        orientation: 'black',
        keySquares: ['c5', 'd4', 'c4'],
        interactiveMoves: [
          { from: 'g1', to: 'f3', comment: 'White prepares the Open Sicilian with d4.' },
          { from: 'd7', to: 'd6', comment: 'Black secures e5 and prepares Nf6.' },
          { from: 'd2', to: 'd4', comment: 'White opens the center.' },
          { from: 'c5', to: 'd4', comment: 'Black trades flank pawn for central pawn!' }
        ]
      },
      {
        id: 'strat-french',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "French Defense (1.e4 e6 2.d4 d5)",
        explanation: "A resilient semi-open defense. Black allows White an expansive pawn center in exchange for an impenetrable pawn chain and future counter-breaks against d4.",
        keyIdea: "Chip away at White's central pawn base with ...c5 and ...f6.",
        mistakeToAvoid: "Letting your 'bad' French light-squared bishop on c8 stay passive all game.",
        whitePlan: "Advance e5 to lock space advantage, then attack Black's kingside.",
        blackPlan: "Hammer White's pawn base on d4 with ...c5, ...Nc6, and ...Qb6.",
        initialFen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        orientation: 'black',
        keySquares: ['e6', 'd5', 'c5', 'e5'],
        interactiveMoves: [
          { from: 'd2', to: 'd4', comment: 'White occupies the full center.' },
          { from: 'd7', to: 'd5', comment: 'Black immediately contests e4.' },
          { from: 'e4', to: 'e5', comment: 'Advance Variation: White closes the center.' },
          { from: 'c7', to: 'c5', comment: 'Black counters at the d4 pawn base!' }
        ]
      },
      {
        id: 'strat-caro-kann',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Caro-Kann Defense (1.e4 c6 2.d4 d5)",
        explanation: "A rock-solid defense where Black prepares ...d5 without trapping the light-squared bishop (unlike the French Defense).",
        keyIdea: "Extreme structural solidity and frictionless piece development.",
        mistakeToAvoid: "Failing to activate the c8 bishop before playing ...e6.",
        whitePlan: "Push e5 or exchange on d5, seeking space or open attacking lines.",
        blackPlan: "Develop bishop to f5 or g4, anchor with ...e6, and trade into a favorable endgame.",
        initialFen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        orientation: 'black',
        keySquares: ['c6', 'd5', 'f5'],
        interactiveMoves: [
          { from: 'd2', to: 'd4', comment: 'White establishes central occupation.' },
          { from: 'd7', to: 'd5', comment: 'Black challenges e4.' },
          { from: 'b1', to: 'c3', comment: 'Classical Variation: White defends e4.' },
          { from: 'd5', to: 'e4', comment: 'Black trades off the central pawn.' }
        ]
      },
      {
        id: 'strat-kid',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "King's Indian Defense (1.d4 Nf6 2.c4 g6)",
        explanation: "A dynamic hypermodern defense. Black allows White a broad pawn center, then counter-attacks with ...e5 or ...c5 to spark explosive kingside attacks.",
        keyIdea: "Concede the center early, lock it with ...e5, then launch an all-out pawn storm on White's King.",
        mistakeToAvoid: "Passive play; if Black hesitates, White's queenside expansion rolls over them.",
        whitePlan: "Expand relentlessly on the queenside via c5 and open the c-file.",
        blackPlan: "Push ...f5, ...f4, and swing pieces over for a direct mating attack on White's King.",
        initialFen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        orientation: 'black',
        keySquares: ['g7', 'e5', 'f5'],
        interactiveMoves: [
          { from: 'b1', to: 'c3', comment: 'White strengthens d5 and e4 control.' },
          { from: 'f8', to: 'g7', comment: 'Black places bishop on the potent long diagonal.' },
          { from: 'e2', to: 'e4', comment: 'White takes the broad center.' },
          { from: 'd7', to: 'd6', comment: 'Black prepares ...e5 break.' }
        ]
      },
      {
        id: 'strat-qgd',
        categoryId: 'opening-strategies',
        categoryTitle: 'Opening Strategies',
        title: "Queen's Gambit Declined (1.d4 d5 2.c4 e6)",
        explanation: "One of the most classical and trusted defenses in chess history, played in countless World Championship matches.",
        keyIdea: "Uncompromising central fortification with pawns on d5 and e6.",
        mistakeToAvoid: "Letting the c8 bishop become permanently suffocated behind pawns.",
        whitePlan: "Pin Black's knight with Bg5 and exploit the half-open c-file.",
        blackPlan: "Break the pin with ...Be7, castle, and prepare ...c5 or ...e5 break.",
        initialFen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        orientation: 'black',
        keySquares: ['d5', 'e6', 'c5', 'e7'],
        interactiveMoves: [
          { from: 'b1', to: 'c3', comment: 'White applies pressure to d5.' },
          { from: 'g8', to: 'f6', comment: 'Black defends d5.' },
          { from: 'c1', to: 'g5', comment: 'White pins the f6 Knight to Black’s Queen!' }
        ]
      }
    ]
  },
  {
    id: 'tactics',
    title: 'Tactical Concepts',
    description: 'Master the sharp tactical weapons: forks, pins, skewers, discovered attacks, and sacrifices.',
    icon: '⚡',
    lessons: [
      {
        id: 'tac-fork',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'The Fork: Double Threat',
        explanation: 'A fork occurs when a single piece attacks two or more enemy targets at the exact same time. Knights and pawns make devastating forkers because their capture mechanisms differ from other pieces.',
        keyIdea: 'Look for undefended pieces residing on squares of the same color or knight jump distances.',
        mistakeToAvoid: 'Forking pieces when one of the targets can escape with a counter-check.',
        initialFen: 'r1bqk2r/pppp1ppp/2n5/4p3/4n3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
        orientation: 'white',
        keySquares: ['d3', 'e4', 'c6'],
        interactiveMoves: [
          { from: 'd3', to: 'e4', comment: 'Pawn captures knight and removes threat.' }
        ]
      },
      {
        id: 'tac-pin',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'The Pin: Immobilizing the Defender',
        explanation: 'A pin occurs when an attacking piece targets a defender in front of a more valuable piece (such as the King or Queen). An "Absolute Pin" targets the King, making moving the pinned piece illegal.',
        keyIdea: 'Pile pressure on the pinned piece with pawns and lesser pieces until it collapses.',
        mistakeToAvoid: 'Leaving your Queen or King lined up on the same diagonal or file as an enemy Bishop or Rook.',
        initialFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        orientation: 'white',
        keySquares: ['c4', 'f7', 'e8'],
        interactiveMoves: []
      },
      {
        id: 'tac-skewer',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'The Skewer: Reversing the Pin',
        explanation: 'In a skewer, the MORE valuable piece is in FRONT and attacked first. When it flees to safety, the piece behind it is captured.',
        keyIdea: 'Seek opportunities where enemy King and Queen or Rooks align on open lines.',
        mistakeToAvoid: 'Walking your King into an open rank or diagonal occupied by an enemy Rook or Bishop.',
        initialFen: '8/8/4k3/8/8/8/1B6/4K2r w - - 0 1',
        orientation: 'white',
        keySquares: ['b2', 'e6', 'h1'],
        interactiveMoves: []
      },
      {
        id: 'tac-discovered-attack',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Discovered Attack & Check',
        explanation: 'A discovered attack occurs when moving one piece unleashes an attack from another piece behind it. When the revealed attack targets the King, it is a Discovered Check.',
        keyIdea: 'The moving piece can make audacious threats (even sacrifices) because the opponent must answer the revealed danger.',
        mistakeToAvoid: 'Unmasking a piece without checking if the opponent has a forcing counter-threat.',
        initialFen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5',
        orientation: 'white',
        keySquares: ['c4', 'f7', 'e8'],
        interactiveMoves: []
      },
      {
        id: 'tac-double-attack',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Double Attack',
        explanation: 'Creating two simultaneous threats with one move forces the opponent into an unsolvable dilemma: they can only parry one threat.',
        keyIdea: 'Coordination between Queen and minor pieces produces deadly double attacks.',
        mistakeToAvoid: 'Assuming opponent only threatens what their moved piece touches.',
        initialFen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
        orientation: 'white',
        keySquares: ['c4', 'f3', 'd1'],
        interactiveMoves: []
      },
      {
        id: 'tac-deflection',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Deflection & Overloaded Pieces',
        explanation: 'Deflection lures an enemy piece away from defending a crucial square, piece, or checkmate defense.',
        keyIdea: 'Identify overloaded pieces that are carrying too many defensive duties.',
        mistakeToAvoid: 'Depending on a single piece to defend both back rank and a piece.',
        initialFen: '3r2k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1',
        orientation: 'white',
        keySquares: ['d8', 'd1', 'd2'],
        interactiveMoves: []
      },
      {
        id: 'tac-decoy',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'The Decoy Sacrifice',
        explanation: 'A decoy entices or forces an enemy piece (often the King or Queen) onto a poisoned square where it falls victim to a decisive fork, pin, or checkmate.',
        keyIdea: 'Sacrifice material to drag the enemy King onto a fatal square.',
        mistakeToAvoid: 'Sacrificing without calculating the opponent’s escape routes.',
        initialFen: '5rk1/5ppp/8/8/8/8/1Q3PPP/5RK1 w - - 0 1',
        orientation: 'white',
        keySquares: ['b2', 'g7', 'f8'],
        interactiveMoves: []
      },
      {
        id: 'tac-removing-defender',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Removing the Defender',
        explanation: 'When an enemy target is defended by a single guardian, eliminate or drive away that guardian to capture the prize.',
        keyIdea: 'Look at what holds your opponent’s position together and destroy the linchpin.',
        mistakeToAvoid: 'Attacking defended pieces head-on before undermining their support.',
        initialFen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/1b2P3/2NP1N2/PPPBBPPP/R2QK2R w KQ - 0 7',
        orientation: 'white',
        keySquares: ['c3', 'b4', 'd5'],
        interactiveMoves: []
      },
      {
        id: 'tac-zwischenzug',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Zwischenzug (In-Between Move)',
        explanation: 'An unexpected tactical interruption: instead of playing the obvious recapture, you insert a forcing check or threat that shifts the balance decisively.',
        keyIdea: 'Never assume automatic recaptures. Always check for intermediate moves.',
        mistakeToAvoid: 'Blindly recapturing without evaluating Zwischenzug possibilities.',
        initialFen: 'r1bq1rk1/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQ - 1 7',
        orientation: 'white',
        keySquares: ['e4', 'c3', 'c4'],
        interactiveMoves: []
      },
      {
        id: 'tac-back-rank',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Back-Rank Checkmate',
        explanation: 'A King castled behind three unmoved pawns is vulnerable to a Rook or Queen swooping into the 8th rank with checkmate because the pawns block escape.',
        keyIdea: 'Create a "Luft" (escape breathing window) by pushing h3 or g3 in the middlegame.',
        mistakeToAvoid: 'Leaving your back rank completely unattended while attacking.',
        initialFen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
        orientation: 'white',
        keySquares: ['d1', 'd8', 'g8'],
        interactiveMoves: [
          { from: 'd1', to: 'd8', comment: 'Rook delivers Back-Rank Checkmate! King is trapped behind pawns.' }
        ]
      },
      {
        id: 'tac-smothered',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Smothered Mate',
        explanation: 'A spectacular checkmate delivered by a Knight when the enemy King is entirely boxed in and suffocated by its own pieces.',
        keyIdea: 'Use Queen sacrifices on g8/b8 to force an enemy piece to choke its own King.',
        mistakeToAvoid: 'Missing the knight check when the enemy King is trapped in the corner.',
        initialFen: '6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1',
        orientation: 'white',
        keySquares: ['f7', 'h8', 'g8'],
        interactiveMoves: []
      },
      {
        id: 'tac-sacrifice',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'The Art of the Sacrifice',
        explanation: 'Deliberately giving up material to shatter enemy defenses, expose the enemy King, or gain an unstoppable initiative.',
        keyIdea: 'Calculate forcing lines completely before offering valuable pieces.',
        mistakeToAvoid: 'Speculative sacrifices without calculating enemy defensive resources.',
        initialFen: 'r1bq1rk1/ppp2ppp/2n5/2b1p3/2B1Pn2/5N2/PPPP1PPP/RNBQK2R w KQ - 4 8',
        orientation: 'white',
        keySquares: ['c4', 'f7', 'g1'],
        interactiveMoves: []
      },
      {
        id: 'tac-double-check',
        categoryId: 'tactics',
        categoryTitle: 'Tactical Concepts',
        title: 'Double Check',
        explanation: 'The deadliest check in chess: two pieces deliver check at the exact same moment. The King CANNOT block and CANNOT capture both attackers; it MUST run!',
        keyIdea: 'Look for discovered checks where the moving piece also delivers check.',
        mistakeToAvoid: 'Attempting to block a double check (it is physically impossible).',
        initialFen: 'r1bqk2r/ppppbppp/2n5/4N3/2B1n3/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
        orientation: 'white',
        keySquares: ['c4', 'e5', 'f7'],
        interactiveMoves: []
      }
    ]
  },
  {
    id: 'middlegame',
    title: 'Middlegame Strategy',
    description: 'Learn plans, piece harmony, pawn breaks, outposts, and attacking the king.',
    icon: '⚔️',
    lessons: [
      {
        id: 'mid-worst-piece',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Improve Your Worst Piece',
        explanation: 'In quiet middlegame positions without immediate tactics, find your least active piece and reroute it to a dominating outpost.',
        keyIdea: 'An army functions as a collective organism. A single inactive piece handicaps your entire attack.',
        mistakeToAvoid: 'Rushing an attack when half your army is slumbering on the first rank.',
        initialFen: 'r1b2rk1/pp1nqppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B2RK1 w - - 0 10',
        orientation: 'white',
        keySquares: ['c1', 'd2', 'e4'],
        interactiveMoves: []
      },
      {
        id: 'mid-open-files',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Control Open Files with Rooks',
        explanation: 'Rooks belong on open files (files with no pawns) or semi-open files. Doubling rooks on an open file yields crushing pressure on the 7th rank.',
        keyIdea: 'Seize open files and infiltrate the enemy 7th rank ("Pigs on the 7th").',
        mistakeToAvoid: 'Trading off the only open file to the opponent without contest.',
        initialFen: 'r4rk1/pp1nqppp/2p1pn2/8/2PP4/2N2N2/PPQ2PPP/3RR1K1 w - - 0 14',
        orientation: 'white',
        keySquares: ['e1', 'e7', 'd1'],
        interactiveMoves: []
      },
      {
        id: 'mid-outposts',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Knight Outposts',
        explanation: 'An outpost is a central square protected by your pawn that cannot be attacked by any enemy pawn. Knights planted on outposts radiate massive power.',
        keyIdea: 'A knight on the 5th or 6th rank outpost is often worth more than a rook.',
        mistakeToAvoid: 'Trading off an opponent’s outpost piece with an inferior piece.',
        initialFen: 'r1b2rk1/pp2qppp/2n1pn2/2ppN3/3P4/2PBP3/PP1N1PPP/R2QK2R w KQ - 0 10',
        orientation: 'white',
        keySquares: ['e5', 'd4', 'c6'],
        interactiveMoves: []
      },
      {
        id: 'mid-weak-squares',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Identifying Weak Squares',
        explanation: 'When pawns advance, they leave behind "holes" or weak squares that can never again be defended by pawns.',
        keyIdea: 'Identify holes in the enemy camp and anchor your minor pieces into them.',
        mistakeToAvoid: 'Pushing pawns impulsively in front of your King and creating structural holes.',
        initialFen: 'r1bq1rk1/pp2bppp/2np4/2p1p3/4P3/2NP1N2/PPP1BPPP/R2Q1RK1 w - - 0 9',
        orientation: 'white',
        keySquares: ['d5', 'd4'],
        interactiveMoves: []
      },
      {
        id: 'mid-pawn-breaks',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Pawn Breaks',
        explanation: 'Pawn breaks are pawn moves that challenge and dismantle the enemy pawn chain, opening files for your pieces.',
        keyIdea: 'Without pawn breaks, closed positions become deadlocks. Timing your pawn break is crucial.',
        mistakeToAvoid: 'Triggering a pawn break before your pieces are organized to exploit the open lines.',
        initialFen: 'rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 6',
        orientation: 'white',
        keySquares: ['c4', 'd5', 'e4'],
        interactiveMoves: []
      },
      {
        id: 'mid-trading-pieces',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'When to Trade Pieces',
        explanation: 'Trade pieces when you are ahead in material, under heavy attack, or when swapping an inactive piece for an active enemy piece.',
        keyIdea: 'When ahead in material: trade pieces, not pawns.',
        mistakeToAvoid: 'Trading off your most active attacking piece for a passive enemy defender.',
        initialFen: 'r1b2rk1/pp2qppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R2Q1RK1 w - - 0 10',
        orientation: 'white',
        keySquares: ['d4', 'c5', 'f3'],
        interactiveMoves: []
      },
      {
        id: 'mid-good-vs-bad-bishop',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Good vs Bad Bishop',
        explanation: 'A bishop is "bad" when its own central pawns are fixed on squares of its own color, blocking its mobility. A bishop is "good" when its pawns reside on the opposite color.',
        keyIdea: 'Place your pawns on the opposite color of your bishop so it can freely roam.',
        mistakeToAvoid: 'Locking all your pawns onto the same color as your remaining bishop.',
        initialFen: '8/pp3kpp/4p3/3pP3/8/1P2B3/P5PP/6K1 w - - 0 25',
        orientation: 'white',
        keySquares: ['e3', 'e5', 'd5'],
        interactiveMoves: []
      },
      {
        id: 'mid-rook-activity',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Rook Activity & 7th Rank',
        explanation: 'A rook belongs in front of pawns, penetrating enemy territory. A rook on the 7th rank attacks base pawns and restricts the enemy King.',
        keyIdea: 'Activity is worth a pawn. An active rook dominates a passive rook defending pawns from behind.',
        mistakeToAvoid: 'Confining your rook to purely passive babysitting duties.',
        initialFen: '4r1k1/pp3ppp/8/8/8/8/PP3PPP/R4RK1 w - - 0 20',
        orientation: 'white',
        keySquares: ['a1', 'd1', 'e7'],
        interactiveMoves: []
      },
      {
        id: 'mid-attacking-king',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Attacking the Castled King',
        explanation: 'To launch a successful mating assault, open lines against the enemy King, recruit more attackers than defenders, and eliminate the defensive knight on f3 or f6.',
        keyIdea: 'Concentrate superiority of force at the critical focal point before striking.',
        mistakeToAvoid: 'Attacking with 1 or 2 isolated pieces without reinforcements.',
        initialFen: 'r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 9',
        orientation: 'white',
        keySquares: ['h7', 'g7', 'f6'],
        interactiveMoves: []
      },
      {
        id: 'mid-prophylaxis',
        categoryId: 'middlegame',
        categoryTitle: 'Middlegame Strategy',
        title: 'Prophylaxis: Stopping Threats',
        explanation: 'Prophylaxis is preventive thinking: anticipating your opponent’s tactical plans and taking action to neutralize them before they occur.',
        keyIdea: 'Ask before every move: "If it were my opponent\'s turn, what would they do?"',
        mistakeToAvoid: 'Tunnel vision focusing only on your own offensive schemes.',
        initialFen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 0 8',
        orientation: 'white',
        keySquares: ['h3', 'a3', 'b4'],
        interactiveMoves: []
      }
    ]
  },
  {
    id: 'endgames',
    title: 'Essential Endgames',
    description: 'Learn the theoretical fundamentals: King and Queen, King and Rook, opposition, and passed pawns.',
    icon: '👑',
    lessons: [
      {
        id: 'end-kq-vs-k',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'King & Queen vs Lone King',
        explanation: 'Use the Queen like a knight’s distance away to herd the enemy King into a shrinking box toward the edge of the board. Then bring your King to support checkmate.',
        keyIdea: 'Do not deliver check until the King is on the rim. Watch out for stalemate!',
        mistakeToAvoid: 'Cornering the King without check, producing a tragic stalemate.',
        initialFen: '8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1',
        orientation: 'white',
        keySquares: ['g1', 'e5', 'e1'],
        interactiveMoves: [
          { from: 'g1', to: 'g4', comment: 'Queen cuts off the King along the 4th rank, building a pen.' }
        ]
      },
      {
        id: 'end-kr-vs-k',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'King & Rook vs Lone King',
        explanation: 'Drive the enemy King to the edge by cutting off ranks with the Rook and using your King to establish opposition, delivering rolling checks that push them back.',
        keyIdea: 'The Rook cannot deliver checkmate alone; both King and Rook must coordinate step by step.',
        mistakeToAvoid: 'Leaving your Rook unprotected where the enemy King can capture it.',
        initialFen: '8/8/8/4k3/8/8/4K3/R7 w - - 0 1',
        orientation: 'white',
        keySquares: ['a1', 'a4', 'e5'],
        interactiveMoves: [
          { from: 'a1', to: 'a4', comment: 'Rook cuts off the 4th rank. The Black King is trapped on top.' }
        ]
      },
      {
        id: 'end-opposition',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'The Opposition',
        explanation: 'When two Kings face each other on the same file or rank with only one square between them, the player NOT having to move "has the opposition", forcing the other King to yield ground.',
        keyIdea: 'Having the opposition lets you outflank the opponent King and usher your pawn to victory.',
        mistakeToAvoid: 'Ceding the opposition when you can seize it.',
        initialFen: '8/8/4k3/8/4K3/8/8/8 w - - 0 1',
        orientation: 'white',
        keySquares: ['e4', 'e6', 'e5'],
        interactiveMoves: [
          { from: 'e4', to: 'd4', comment: 'White King outflanks to the left.' }
        ]
      },
      {
        id: 'end-king-pawn',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'King & Pawn Endings: Key Squares',
        explanation: 'To promote a pawn with a King, your King must lead IN FRONT of the pawn, not trail behind it. Control the key squares ahead of the pawn to guarantee promotion.',
        keyIdea: 'Put your King in front of your pawn to carve a clear highway to the 8th rank.',
        mistakeToAvoid: 'Pushing the pawn ahead of your King, allowing the defending King to blockade it.',
        initialFen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
        orientation: 'white',
        keySquares: ['e4', 'e3', 'e2'],
        interactiveMoves: [
          { from: 'e3', to: 'e4', comment: 'Take opposition directly in front of the pawn.' }
        ]
      },
      {
        id: 'end-passed-pawns',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'Passed Pawns',
        explanation: 'A passed pawn has no opposing pawns on its file or adjacent files to impede its advance. Passed pawns must be pushed!',
        keyIdea: 'An outside passed pawn distracts the enemy King, leaving their remaining pawns ripe for harvest.',
        mistakeToAvoid: 'Failing to support your passed pawn with your King.',
        initialFen: '8/5pp1/8/p6p/P7/6P1/4kPKP/8 w - - 0 1',
        orientation: 'white',
        keySquares: ['a5', 'a4'],
        interactiveMoves: []
      },
      {
        id: 'end-rule-of-square',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'The Rule of the Square',
        explanation: 'Calculate instantly whether a defending King can catch a runaway passed pawn without moving pieces. Draw a square from the pawn to its promotion square. If the defending King can step inside the square on their turn, they catch it!',
        keyIdea: 'Saves precious clock time and eliminates calculation errors in blitz.',
        mistakeToAvoid: 'Assuming your King can catch a pawn without testing the boundary of the square.',
        initialFen: '8/8/8/8/3P4/8/1k6/4K3 b - - 0 1',
        orientation: 'white',
        keySquares: ['d4', 'd8', 'h8', 'h4'],
        interactiveMoves: [
          { from: 'b2', to: 'c3', comment: 'King steps toward the pawn, entering the square.' }
        ]
      },
      {
        id: 'end-basic-rook',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'Basic Rook Endings & Philidor Position',
        explanation: 'Rook endings are the most common endgames in chess. In the Philidor defense, the defending rook keeps the enemy King at bay on the 6th rank, then drops back to the 1st rank to deliver infinite checks when the pawn pushes.',
        keyIdea: 'Rooks belong BEHIND passed pawns (Tarrasch Rule), whether attacking or defending.',
        mistakeToAvoid: 'Passive defending from the side when you could check from behind.',
        initialFen: '4k3/R7/8/4P3/8/8/8/4K2r w - - 0 1',
        orientation: 'white',
        keySquares: ['a7', 'e5', 'h1'],
        interactiveMoves: []
      },
      {
        id: 'end-activate-king',
        categoryId: 'endgames',
        categoryTitle: 'Essential Endgames',
        title: 'Activate the King in the Endgame',
        explanation: 'Once Queens and most major pieces are off the board, checkmate danger subsides. The King transforms from a sheltered monarch into an aggressive attacking powerhouse!',
        keyIdea: 'Sprint your King directly toward the center as soon as the endgame arrives.',
        mistakeToAvoid: 'Keeping your King timidly tucked in the corner while enemy King sweeps the center.',
        initialFen: '8/pp3kpp/4p3/3p4/3P4/8/PP3PPP/6K1 w - - 0 25',
        orientation: 'white',
        keySquares: ['g1', 'f1', 'e2', 'd3'],
        interactiveMoves: [
          { from: 'g1', to: 'f1', comment: 'King immediately marches into active duty.' }
        ]
      }
    ]
  }
];

export const ALL_LESSONS = LESSON_CATEGORIES.flatMap(c => c.lessons);

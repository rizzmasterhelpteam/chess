package com.grandmaster.chess.chess.rules

import com.grandmaster.chess.chess.model.*
import kotlin.math.abs

class ChessRulesEngine(initialFen: String = STARTING_FEN) {
    private val board = Array<Piece?>(64) { null }
    var currentTurn: PieceColor = PieceColor.WHITE
        private set

    var whiteCanCastleKingside = true
    var whiteCanCastleQueenside = true
    var blackCanCastleKingside = true
    var blackCanCastleQueenside = true
    var enPassantTarget: Square? = null
    var halfmoveClock = 0
    var fullmoveNumber = 1

    private val moveHistory = mutableListOf<Move>()

    init {
        loadFen(initialFen)
    }

    fun getPiece(square: Square): Piece? {
        return board[square.rank * 8 + square.file]
    }

    private fun setPiece(square: Square, piece: Piece?) {
        board[square.rank * 8 + square.file] = piece
    }

    fun loadFen(fen: String) {
        val parts = fen.trim().split(" ")
        val ranks = parts[0].split("/")

        for (r in 0..7) {
            val rankStr = ranks[7 - r]
            var file = 0
            for (ch in rankStr) {
                if (ch.isDigit()) {
                    file += ch.digitToInt()
                } else {
                    val color = if (ch.isUpperCase()) PieceColor.WHITE else PieceColor.BLACK
                    val type = when (ch.lowercaseChar()) {
                        'p' -> PieceType.PAWN
                        'n' -> PieceType.KNIGHT
                        'b' -> PieceType.BISHOP
                        'r' -> PieceType.ROOK
                        'q' -> PieceType.QUEEN
                        'k' -> PieceType.KING
                        else -> PieceType.PAWN
                    }
                    board[r * 8 + file] = Piece(type, color)
                    file++
                }
            }
        }

        currentTurn = if (parts.getOrNull(1) == "b") PieceColor.BLACK else PieceColor.WHITE

        val castling = parts.getOrNull(2) ?: "-"
        whiteCanCastleKingside = castling.contains('K')
        whiteCanCastleQueenside = castling.contains('Q')
        blackCanCastleKingside = castling.contains('k')
        blackCanCastleQueenside = castling.contains('q')

        val ep = parts.getOrNull(3)
        enPassantTarget = if (ep != null && ep != "-") Square.fromName(ep) else null
    }

    fun getFen(): String {
        val sb = StringBuilder()
        for (r in 7 downTo 0) {
            var empty = 0
            for (f in 0..7) {
                val piece = board[r * 8 + f]
                if (piece == null) {
                    empty++
                } else {
                    if (empty > 0) {
                        sb.append(empty)
                        empty = 0
                    }
                    val ch = piece.type.symbol
                    sb.append(if (piece.color == PieceColor.WHITE) ch.uppercaseChar() else ch)
                }
            }
            if (empty > 0) sb.append(empty)
            if (r > 0) sb.append('/')
        }

        sb.append(if (currentTurn == PieceColor.WHITE) " w " else " b ")
        var castle = ""
        if (whiteCanCastleKingside) castle += "K"
        if (whiteCanCastleQueenside) castle += "Q"
        if (blackCanCastleKingside) castle += "k"
        if (blackCanCastleQueenside) castle += "q"
        sb.append(castle.ifEmpty { "-" })
        sb.append(" ")
        sb.append(enPassantTarget?.name ?: "-")
        sb.append(" $halfmoveClock $fullmoveNumber")
        return sb.toString()
    }

    fun generateLegalMoves(from: Square): List<Move> {
        val piece = getPiece(from) ?: return emptyList()
        if (piece.color != currentTurn) return emptyList()

        val pseudo = generatePseudoLegalMoves(from, piece)
        return pseudo.filter { isMoveLegal(it) }
    }

    private fun generatePseudoLegalMoves(from: Square, piece: Piece): List<Move> {
        val moves = mutableListOf<Move>()
        val f = from.file
        val r = from.rank

        when (piece.type) {
            PieceType.PAWN -> {
                val dir = if (piece.color == PieceColor.WHITE) 1 else -1
                val startRank = if (piece.color == PieceColor.WHITE) 1 else 6
                val promoRank = if (piece.color == PieceColor.WHITE) 7 else 0

                // 1 step forward
                if (r + dir in 0..7 && getPiece(Square(f, r + dir)) == null) {
                    val dest = Square(f, r + dir)
                    if (dest.rank == promoRank) {
                        moves.add(Move(from, dest, PieceType.QUEEN))
                        moves.add(Move(from, dest, PieceType.ROOK))
                        moves.add(Move(from, dest, PieceType.BISHOP))
                        moves.add(Move(from, dest, PieceType.KNIGHT))
                    } else {
                        moves.add(Move(from, dest))
                    }

                    // 2 steps forward
                    if (r == startRank && getPiece(Square(f, r + 2 * dir)) == null) {
                        moves.add(Move(from, Square(f, r + 2 * dir)))
                    }
                }

                // Captures
                for (df in listOf(-1, 1)) {
                    val capF = f + df
                    val capR = r + dir
                    if (capF in 0..7 && capR in 0..7) {
                        val targetSq = Square(capF, capR)
                        val targetPiece = getPiece(targetSq)
                        if (targetPiece != null && targetPiece.color != piece.color) {
                            if (targetSq.rank == promoRank) {
                                moves.add(Move(from, targetSq, PieceType.QUEEN, isCapture = true))
                            } else {
                                moves.add(Move(from, targetSq, isCapture = true))
                            }
                        } else if (targetSq == enPassantTarget) {
                            moves.add(Move(from, targetSq, isCapture = true, isEnPassant = true))
                        }
                    }
                }
            }
            PieceType.KNIGHT -> {
                val deltas = listOf(
                    -2 to -1, -2 to 1, -1 to -2, -1 to 2,
                    1 to -2, 1 to 2, 2 to -1, 2 to 1
                )
                for ((df, dr) in deltas) {
                    val nf = f + df
                    val nr = r + dr
                    if (nf in 0..7 && nr in 0..7) {
                        val dest = Square(nf, nr)
                        val target = getPiece(dest)
                        if (target == null) {
                            moves.add(Move(from, dest))
                        } else if (target.color != piece.color) {
                            moves.add(Move(from, dest, isCapture = true))
                        }
                    }
                }
            }
            PieceType.BISHOP -> addRayMoves(from, piece, listOf(-1 to -1, -1 to 1, 1 to -1, 1 to 1), moves)
            PieceType.ROOK -> addRayMoves(from, piece, listOf(0 to 1, 0 to -1, 1 to 0, -1 to 0), moves)
            PieceType.QUEEN -> addRayMoves(from, piece, listOf(
                -1 to -1, -1 to 1, 1 to -1, 1 to 1,
                0 to 1, 0 to -1, 1 to 0, -1 to 0
            ), moves)
            PieceType.KING -> {
                for (df in -1..1) {
                    for (dr in -1..1) {
                        if (df == 0 && dr == 0) continue
                        val nf = f + df
                        val nr = r + dr
                        if (nf in 0..7 && nr in 0..7) {
                            val dest = Square(nf, nr)
                            val target = getPiece(dest)
                            if (target == null) moves.add(Move(from, dest))
                            else if (target.color != piece.color) moves.add(Move(from, dest, isCapture = true))
                        }
                    }
                }
            }
        }
        return moves
    }

    private fun addRayMoves(from: Square, piece: Piece, directions: List<Pair<Int, Int>>, outMoves: MutableList<Move>) {
        for ((df, dr) in directions) {
            var nf = from.file + df
            var nr = from.rank + dr
            while (nf in 0..7 && nr in 0..7) {
                val dest = Square(nf, nr)
                val target = getPiece(dest)
                if (target == null) {
                    outMoves.add(Move(from, dest))
                } else {
                    if (target.color != piece.color) {
                        outMoves.add(Move(from, dest, isCapture = true))
                    }
                    break
                }
                nf += df
                nr += dr
            }
        }
    }

    private fun isMoveLegal(move: Move): Boolean {
        // Execute move on clone/temporary state and verify king is not in check
        val movingPiece = getPiece(move.from) ?: return false
        val capturedPiece = getPiece(move.to)

        setPiece(move.to, movingPiece)
        setPiece(move.from, null)

        val inCheck = isKingInCheck(movingPiece.color)

        // Undo
        setPiece(move.from, movingPiece)
        setPiece(move.to, capturedPiece)

        return !inCheck
    }

    fun isKingInCheck(color: PieceColor): Boolean {
        // Find king square
        var kingSquare: Square? = null
        for (i in 0..63) {
            val p = board[i]
            if (p != null && p.type == PieceType.KING && p.color == color) {
                kingSquare = Square(i % 8, i / 8)
                break
            }
        }
        val kSq = kingSquare ?: return false

        // Check if any opponent piece attacks kSq
        val enemyColor = color.opposite()
        for (i in 0..63) {
            val p = board[i]
            if (p != null && p.color == enemyColor) {
                val sq = Square(i % 8, i / 8)
                val attacks = generatePseudoLegalMoves(sq, p)
                if (attacks.any { it.to == kSq }) {
                    return true
                }
            }
        }
        return false
    }

    fun makeMove(move: Move): Boolean {
        val legalMoves = generateLegalMoves(move.from)
        val matchedMove = legalMoves.find { it.to == move.to && it.promotion == move.promotion }
            ?: return false

        val piece = getPiece(matchedMove.from)!!
        setPiece(matchedMove.to, matchedMove.promotion?.let { Piece(it, piece.color) } ?: piece)
        setPiece(matchedMove.from, null)

        // En passant capture
        if (matchedMove.isEnPassant) {
            val epPawnRank = if (piece.color == PieceColor.WHITE) matchedMove.to.rank - 1 else matchedMove.to.rank + 1
            setPiece(Square(matchedMove.to.file, epPawnRank), null)
        }

        // Set en passant target
        if (piece.type == PieceType.PAWN && abs(matchedMove.to.rank - matchedMove.from.rank) == 2) {
            val epRank = (matchedMove.to.rank + matchedMove.from.rank) / 2
            enPassantTarget = Square(matchedMove.from.file, epRank)
        } else {
            enPassantTarget = null
        }

        moveHistory.add(matchedMove)
        currentTurn = currentTurn.opposite()
        return true
    }

    fun getStatus(): GameStatus {
        val inCheck = isKingInCheck(currentTurn)

        // Check if player has any legal moves
        var hasLegalMove = false
        for (i in 0..63) {
            val p = board[i]
            if (p != null && p.color == currentTurn) {
                if (generateLegalMoves(Square(i % 8, i / 8)).isNotEmpty()) {
                    hasLegalMove = true
                    break
                }
            }
        }

        val checkmate = inCheck && !hasLegalMove
        val stalemate = !inCheck && !hasLegalMove

        val text = when {
            checkmate -> "Checkmate — ${if (currentTurn == PieceColor.WHITE) "Black" else "White"} wins!"
            stalemate -> "Draw by Stalemate"
            inCheck -> "${if (currentTurn == PieceColor.WHITE) "White" else "Black"} is in check!"
            else -> "${if (currentTurn == PieceColor.WHITE) "White" else "Black"}'s turn"
        }

        return GameStatus(
            turn = currentTurn,
            isCheck = inCheck,
            isCheckmate = checkmate,
            isStalemate = stalemate,
            isDraw = stalemate,
            statusText = text
        )
    }

    companion object {
        const val STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    }
}

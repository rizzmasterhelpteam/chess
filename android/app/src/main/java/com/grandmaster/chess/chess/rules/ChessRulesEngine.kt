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
    private val stateHistory = mutableListOf<PositionSnapshot>()
    private val positionHistory = mutableListOf<String>()

    private data class PositionSnapshot(
        val board: Array<Piece?>,
        val turn: PieceColor,
        val whiteKingSide: Boolean,
        val whiteQueenSide: Boolean,
        val blackKingSide: Boolean,
        val blackQueenSide: Boolean,
        val enPassant: Square?,
        val halfmove: Int,
        val fullmove: Int
    )

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

        for (i in board.indices) board[i] = null
        moveHistory.clear()
        stateHistory.clear()
        positionHistory.clear()

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
        halfmoveClock = parts.getOrNull(4)?.toIntOrNull() ?: 0
        fullmoveNumber = parts.getOrNull(5)?.toIntOrNull() ?: 1
        positionHistory.add(positionKey())
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
                                listOf(PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT)
                                    .forEach { promotion ->
                                        moves.add(Move(from, targetSq, promotion, isCapture = true))
                                    }
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

                val homeRank = if (piece.color == PieceColor.WHITE) 0 else 7
                if (from == Square(4, homeRank) && !isKingInCheck(piece.color)) {
                    val kingSideAllowed = if (piece.color == PieceColor.WHITE) whiteCanCastleKingside else blackCanCastleKingside
                    val kingSideRook = getPiece(Square(7, homeRank))
                    if (kingSideAllowed && kingSideRook?.type == PieceType.ROOK && kingSideRook.color == piece.color &&
                        getPiece(Square(5, homeRank)) == null && getPiece(Square(6, homeRank)) == null &&
                        !isSquareAttacked(Square(5, homeRank), piece.color.opposite()) &&
                        !isSquareAttacked(Square(6, homeRank), piece.color.opposite())
                    ) {
                        moves.add(Move(from, Square(6, homeRank), isCastling = true))
                    }

                    val queenSideAllowed = if (piece.color == PieceColor.WHITE) whiteCanCastleQueenside else blackCanCastleQueenside
                    val queenSideRook = getPiece(Square(0, homeRank))
                    if (queenSideAllowed && queenSideRook?.type == PieceType.ROOK && queenSideRook.color == piece.color &&
                        getPiece(Square(1, homeRank)) == null && getPiece(Square(2, homeRank)) == null && getPiece(Square(3, homeRank)) == null &&
                        !isSquareAttacked(Square(3, homeRank), piece.color.opposite()) &&
                        !isSquareAttacked(Square(2, homeRank), piece.color.opposite())
                    ) {
                        moves.add(Move(from, Square(2, homeRank), isCastling = true))
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

        if (move.isEnPassant) {
            val capturedRank = if (movingPiece.color == PieceColor.WHITE) move.to.rank - 1 else move.to.rank + 1
            setPiece(Square(move.to.file, capturedRank), null)
        }
        if (move.isCastling) {
            val rank = move.from.rank
            val rookFrom = if (move.to.file > move.from.file) Square(7, rank) else Square(0, rank)
            val rookTo = if (move.to.file > move.from.file) Square(5, rank) else Square(3, rank)
            setPiece(rookTo, getPiece(rookFrom))
            setPiece(rookFrom, null)
        }

        val inCheck = isKingInCheck(movingPiece.color)

        // Undo
        setPiece(move.from, movingPiece)
        setPiece(move.to, capturedPiece)
        if (move.isEnPassant) {
            val capturedRank = if (movingPiece.color == PieceColor.WHITE) move.to.rank - 1 else move.to.rank + 1
            setPiece(Square(move.to.file, capturedRank), Piece(PieceType.PAWN, movingPiece.color.opposite()))
        }
        if (move.isCastling) {
            val rank = move.from.rank
            val rookFrom = if (move.to.file > move.from.file) Square(7, rank) else Square(0, rank)
            val rookTo = if (move.to.file > move.from.file) Square(5, rank) else Square(3, rank)
            setPiece(rookFrom, getPiece(rookTo))
            setPiece(rookTo, null)
        }

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

        return isSquareAttacked(kSq, color.opposite())
    }

    private fun isSquareAttacked(target: Square, byColor: PieceColor): Boolean {
        for (i in 0..63) {
            val piece = board[i] ?: continue
            if (piece.color != byColor) continue
            val from = Square(i % 8, i / 8)
            val df = abs(target.file - from.file)
            val dr = abs(target.rank - from.rank)
            when (piece.type) {
                PieceType.PAWN -> {
                    val direction = if (byColor == PieceColor.WHITE) 1 else -1
                    if (dr == 1 && target.rank - from.rank == direction && df == 1) return true
                }
                PieceType.KNIGHT -> if ((df == 1 && dr == 2) || (df == 2 && dr == 1)) return true
                PieceType.KING -> if (df <= 1 && dr <= 1 && (df != 0 || dr != 0)) return true
                PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN -> {
                    val diagonal = df == dr && df > 0
                    val straight = (df == 0) != (dr == 0)
                    val matches = when (piece.type) {
                        PieceType.BISHOP -> diagonal
                        PieceType.ROOK -> straight
                        else -> diagonal || straight
                    }
                    if (matches) {
                        val stepFile = (target.file - from.file).compareTo(0)
                        val stepRank = (target.rank - from.rank).compareTo(0)
                        var file = from.file + stepFile
                        var rank = from.rank + stepRank
                        var clear = true
                        while (file != target.file || rank != target.rank) {
                            if (getPiece(Square(file, rank)) != null) {
                                clear = false
                                break
                            }
                            file += stepFile
                            rank += stepRank
                        }
                        if (clear) return true
                    }
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
        stateHistory.add(snapshot())
        val capturedPiece = getPiece(matchedMove.to)
        setPiece(matchedMove.to, matchedMove.promotion?.let { Piece(it, piece.color) } ?: piece)
        setPiece(matchedMove.from, null)

        if (matchedMove.isCastling) {
            val rookFrom = if (matchedMove.to.file > matchedMove.from.file) Square(7, matchedMove.from.rank) else Square(0, matchedMove.from.rank)
            val rookTo = if (matchedMove.to.file > matchedMove.from.file) Square(5, matchedMove.from.rank) else Square(3, matchedMove.from.rank)
            setPiece(rookTo, getPiece(rookFrom))
            setPiece(rookFrom, null)
        }

        // En passant capture
        if (matchedMove.isEnPassant) {
            val epPawnRank = if (piece.color == PieceColor.WHITE) matchedMove.to.rank - 1 else matchedMove.to.rank + 1
            setPiece(Square(matchedMove.to.file, epPawnRank), null)
        }

        when (piece.type) {
            PieceType.KING -> if (piece.color == PieceColor.WHITE) {
                whiteCanCastleKingside = false
                whiteCanCastleQueenside = false
            } else {
                blackCanCastleKingside = false
                blackCanCastleQueenside = false
            }
            PieceType.ROOK -> updateRookRights(matchedMove.from)
            else -> Unit
        }
        if (capturedPiece?.type == PieceType.ROOK) updateRookRights(matchedMove.to)

        // Set en passant target
        if (piece.type == PieceType.PAWN && abs(matchedMove.to.rank - matchedMove.from.rank) == 2) {
            val epRank = (matchedMove.to.rank + matchedMove.from.rank) / 2
            enPassantTarget = Square(matchedMove.from.file, epRank)
        } else {
            enPassantTarget = null
        }

        halfmoveClock = if (piece.type == PieceType.PAWN || matchedMove.isCapture || matchedMove.isEnPassant) 0 else halfmoveClock + 1
        if (piece.color == PieceColor.BLACK) fullmoveNumber++

        moveHistory.add(matchedMove)
        currentTurn = currentTurn.opposite()
        positionHistory.add(positionKey())
        return true
    }

    private fun updateRookRights(square: Square) {
        when (square) {
            Square(0, 0) -> whiteCanCastleQueenside = false
            Square(7, 0) -> whiteCanCastleKingside = false
            Square(0, 7) -> blackCanCastleQueenside = false
            Square(7, 7) -> blackCanCastleKingside = false
        }
    }

    private fun snapshot() = PositionSnapshot(
        board = board.copyOf(),
        turn = currentTurn,
        whiteKingSide = whiteCanCastleKingside,
        whiteQueenSide = whiteCanCastleQueenside,
        blackKingSide = blackCanCastleKingside,
        blackQueenSide = blackCanCastleQueenside,
        enPassant = enPassantTarget,
        halfmove = halfmoveClock,
        fullmove = fullmoveNumber
    )

    private fun restore(snapshot: PositionSnapshot) {
        snapshot.board.copyInto(board)
        currentTurn = snapshot.turn
        whiteCanCastleKingside = snapshot.whiteKingSide
        whiteCanCastleQueenside = snapshot.whiteQueenSide
        blackCanCastleKingside = snapshot.blackKingSide
        blackCanCastleQueenside = snapshot.blackQueenSide
        enPassantTarget = snapshot.enPassant
        halfmoveClock = snapshot.halfmove
        fullmoveNumber = snapshot.fullmove
    }

    fun undo(): Move? {
        if (stateHistory.isEmpty()) return null
        val move = if (moveHistory.isEmpty()) null else moveHistory.removeAt(moveHistory.lastIndex)
        restore(stateHistory.removeAt(stateHistory.lastIndex))
        if (positionHistory.isNotEmpty()) positionHistory.removeAt(positionHistory.lastIndex)
        return move
    }

    private fun positionKey(): String = getFen().split(" ").take(4).joinToString(" ")

    private fun isInsufficientMaterial(): Boolean {
        val pieces = board.filterNotNull().filter { it.type != PieceType.KING }
        if (pieces.isEmpty()) return true
        if (pieces.size == 1 && (pieces[0].type == PieceType.BISHOP || pieces[0].type == PieceType.KNIGHT)) return true
        if (pieces.all { it.type == PieceType.BISHOP }) {
            val bishopColors = board.mapIndexedNotNull { index, piece ->
                if (piece?.type == PieceType.BISHOP) (index % 8 + index / 8) % 2 else null
            }.toSet()
            return bishopColors.size <= 1
        }
        return false
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
        val threefold = positionHistory.groupingBy { it }.eachCount().values.any { it >= 3 }
        val insufficient = isInsufficientMaterial()
        val fiftyMove = halfmoveClock >= 100

        val text = when {
            checkmate -> "Checkmate — ${if (currentTurn == PieceColor.WHITE) "Black" else "White"} wins!"
            stalemate -> "Draw by Stalemate"
            threefold -> "Draw by Threefold Repetition"
            insufficient -> "Draw by Insufficient Material"
            fiftyMove -> "Draw by 50-move Rule"
            inCheck -> "${if (currentTurn == PieceColor.WHITE) "White" else "Black"} is in check!"
            else -> "${if (currentTurn == PieceColor.WHITE) "White" else "Black"}'s turn"
        }

        return GameStatus(
            turn = currentTurn,
            isCheck = inCheck,
            isCheckmate = checkmate,
            isStalemate = stalemate,
            isDraw = stalemate || threefold || insufficient || fiftyMove,
            statusText = text
        )
    }

    companion object {
        const val STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    }
}

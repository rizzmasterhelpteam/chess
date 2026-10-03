package com.grandmaster.chess.chess.model

enum class PieceColor {
    WHITE, BLACK;
    fun opposite() = if (this == WHITE) BLACK else WHITE
}

enum class PieceType(val symbol: Char, val value: Int) {
    PAWN('p', 1),
    KNIGHT('n', 3),
    BISHOP('b', 3),
    ROOK('r', 5),
    QUEEN('q', 9),
    KING('k', 1000)
}

data class Piece(
    val type: PieceType,
    val color: PieceColor
)

data class Square(
    val file: Int, // 0..7 (a..h)
    val rank: Int  // 0..7 (1..8)
) {
    val name: String
        get() = "${('a' + file)}${rank + 1}"

    companion object {
        fun fromName(name: String): Square {
            val file = name[0] - 'a'
            val rank = name[1].digitToInt() - 1
            return Square(file, rank)
        }
    }
}

data class Move(
    val from: Square,
    val to: Square,
    val promotion: PieceType? = null,
    val isCapture: Boolean = false,
    val isCastling: Boolean = false,
    val isEnPassant: Boolean = false
) {
    val uci: String
        get() = "${from.name}${to.name}${promotion?.symbol ?: ""}"
}

data class GameStatus(
    val turn: PieceColor,
    val isCheck: Boolean,
    val isCheckmate: Boolean,
    val isStalemate: Boolean,
    val isDraw: Boolean,
    val statusText: String
)

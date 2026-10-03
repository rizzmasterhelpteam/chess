package com.grandmaster.chess.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.model.*
import com.grandmaster.chess.chess.rules.ChessRulesEngine

@Composable
fun ChessBoard(
    rulesEngine: ChessRulesEngine,
    orientation: PieceColor = PieceColor.WHITE,
    selectedSquare: Square? = null,
    legalDestinations: List<Square> = emptyList(),
    lastMove: Pair<Square, Square>? = null,
    onSquareClick: (Square) -> Unit,
    modifier: Modifier = Modifier
) {
    val lightSquareColor = Color(0xFFEBECCD)
    val darkSquareColor = Color(0xFF779556)
    val highlightColor = Color(0xFFFEF08A)

    val ranks = if (orientation == PieceColor.WHITE) (7 downTo 0).toList() else (0..7).toList()
    val files = if (orientation == PieceColor.WHITE) (0..7).toList() else (7 downTo 0).toList()

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(16.dp))
            .border(3.dp, Color(0xFF262626), RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            for (rank in ranks) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                ) {
                    for (file in files) {
                        val square = Square(file, rank)
                        val piece = rulesEngine.getPiece(square)
                        val isLight = (file + rank) % 2 != 0

                        val isSelected = selectedSquare == square
                        val isLegalDest = legalDestinations.contains(square)
                        val isLastMove = lastMove?.first == square || lastMove?.second == square

                        val bgColor = when {
                            isLastMove -> highlightColor
                            isLight -> lightSquareColor
                            else -> darkSquareColor
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(bgColor)
                                .clickable { onSquareClick(square) }
                                .then(
                                    if (isSelected) Modifier.border(3.dp, Color(0xFFFFB800))
                                    else Modifier
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            // Coordinate label
                            if (file == files.first()) {
                                Text(
                                    text = "${rank + 1}",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isLight) darkSquareColor else lightSquareColor,
                                    modifier = Modifier
                                        .align(Alignment.TopStart)
                                        .padding(2.dp)
                                )
                            }
                            if (rank == ranks.last()) {
                                Text(
                                    text = "${('a' + file)}",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isLight) darkSquareColor else lightSquareColor,
                                    modifier = Modifier
                                        .align(Alignment.BottomEnd)
                                        .padding(2.dp)
                                )
                            }

                            // Legal move indicator
                            if (isLegalDest) {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .background(Color(0x55000000), shape = RoundedCornerShape(6.dp))
                                )
                            }

                            // Chess piece character representation / vector
                            if (piece != null) {
                                val symbol = when (piece.type) {
                                    PieceType.KING -> if (piece.color == PieceColor.WHITE) "♔" else "♚"
                                    PieceType.QUEEN -> if (piece.color == PieceColor.WHITE) "♕" else "♛"
                                    PieceType.ROOK -> if (piece.color == PieceColor.WHITE) "♖" else "♜"
                                    PieceType.BISHOP -> if (piece.color == PieceColor.WHITE) "♗" else "♝"
                                    PieceType.KNIGHT -> if (piece.color == PieceColor.WHITE) "♘" else "♞"
                                    PieceType.PAWN -> if (piece.color == PieceColor.WHITE) "♙" else "♟"
                                }
                                Text(
                                    text = symbol,
                                    fontSize = 32.sp,
                                    color = if (piece.color == PieceColor.WHITE) Color.White else Color.Black
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

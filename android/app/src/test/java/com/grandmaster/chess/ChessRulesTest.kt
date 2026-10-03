package com.grandmaster.chess

import com.grandmaster.chess.chess.model.*
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import org.junit.Assert.*
import org.junit.Test

class ChessRulesTest {

    @Test
    fun testStartingPositionLegalMoves() {
        val engine = ChessRulesEngine()
        // e2 pawn should have 2 legal moves (e3, e4)
        val e2Moves = engine.generateLegalMoves(Square.fromName("e2"))
        assertEquals(2, e2Moves.size)

        // b1 knight should have 2 legal moves (a3, c3)
        val b1Moves = engine.generateLegalMoves(Square.fromName("b1"))
        assertEquals(2, b1Moves.size)
    }

    @Test
    fun testScholarsMateDetection() {
        val engine = ChessRulesEngine()
        // 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#
        engine.makeMove(Move(Square.fromName("e2"), Square.fromName("e4")))
        engine.makeMove(Move(Square.fromName("e7"), Square.fromName("e5")))
        engine.makeMove(Move(Square.fromName("d1"), Square.fromName("h5")))
        engine.makeMove(Move(Square.fromName("b8"), Square.fromName("c6")))
        engine.makeMove(Move(Square.fromName("f1"), Square.fromName("c4")))
        engine.makeMove(Move(Square.fromName("g8"), Square.fromName("f6")))
        engine.makeMove(Move(Square.fromName("h5"), Square.fromName("f7")))

        val status = engine.getStatus()
        assertTrue(status.isCheckmate)
        assertTrue(status.isCheck)
    }

    @Test
    fun testStalematePosition() {
        // Lone black king trapped on h8, white king on g6, queen on f7 (black to move)
        val engine = ChessRulesEngine("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")
        val status = engine.getStatus()
        assertTrue(status.isStalemate)
        assertFalse(status.isCheck)
        assertTrue(status.isDraw)
    }

    @Test
    fun testEnPassantCapture() {
        // Position where white pawn on e5 can capture f5 en passant landing on f6
        val engine = ChessRulesEngine("rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3")
        val e5Moves = engine.generateLegalMoves(Square.fromName("e5"))
        val epMove = e5Moves.find { it.to == Square.fromName("f6") && it.isEnPassant }
        assertNotNull(epMove)

        engine.makeMove(epMove!!)
        // f5 pawn should now be gone
        assertNull(engine.getPiece(Square.fromName("f5")))
    }
}

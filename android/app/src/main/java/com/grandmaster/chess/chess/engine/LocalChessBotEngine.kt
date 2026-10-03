package com.grandmaster.chess.chess.engine

import com.grandmaster.chess.chess.model.Move
import com.grandmaster.chess.chess.model.Square
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.random.Random

/**
 * Offline internal bot. This is deliberately not branded as Stockfish: no Stockfish binary
 * or UCI implementation is included in this repository.
 */
class LocalChessBotEngine {
    suspend fun getBestMove(fen: String, botLevel: BotLevel): Move? = withContext(Dispatchers.Default) {
        val rules = ChessRulesEngine(fen)
        val legalMoves = (0..63).flatMap { index ->
            rules.generateLegalMoves(Square(index % 8, index / 8))
        }
        if (legalMoves.isEmpty()) return@withContext null

        if (botLevel == BotLevel.BOT_600 && Random.nextFloat() < botLevel.blunderRate) {
            val quietMoves = legalMoves.filterNot { it.isCapture }
            return@withContext (quietMoves.ifEmpty { legalMoves }).random()
        }

        val orderedMoves = legalMoves.sortedByDescending { move ->
            (if (move.isCapture) 10 else 0) + (if (move.promotion != null) 20 else 0)
        }
        if (Random.nextFloat() < botLevel.blunderRate && orderedMoves.size > 1) {
            return@withContext orderedMoves[(1 until minOf(3, orderedMoves.size)).random()]
        }
        orderedMoves.first()
    }

    fun stop() = Unit
}

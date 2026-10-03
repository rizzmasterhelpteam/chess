package com.grandmaster.chess.ui.features.bots

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.engine.BotLevel
import com.grandmaster.chess.chess.engine.LocalChessBotEngine
import com.grandmaster.chess.chess.model.PieceColor
import com.grandmaster.chess.chess.model.Square
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import com.grandmaster.chess.ui.components.ChessBoard
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@Composable
fun BotGameScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val engine = remember { LocalChessBotEngine() }
    var selectedBot by remember { mutableStateOf(BotLevel.BOT_1000) }
    var rules by remember { mutableStateOf(ChessRulesEngine()) }
    var selectedSquare by remember { mutableStateOf<Square?>(null) }
    var legalDestinations by remember { mutableStateOf(emptyList<Square>()) }
    var lastMove by remember { mutableStateOf<Pair<Square, Square>?>(null) }
    var isBotThinking by remember { mutableStateOf(false) }
    var statusText by remember { mutableStateOf(rules.getStatus().statusText) }
    var revision by remember { mutableIntStateOf(0) }
    var botJob by remember { mutableStateOf<Job?>(null) }

    fun refreshStatus() {
        statusText = rules.getStatus().statusText
        revision++
    }

    fun restart() {
        botJob?.cancel()
        engine.stop()
        rules = ChessRulesEngine()
        selectedSquare = null
        legalDestinations = emptyList()
        lastMove = null
        isBotThinking = false
        statusText = rules.getStatus().statusText
        revision++
    }

    fun startBotReply() {
        val position = rules
        isBotThinking = true
        botJob?.cancel()
        botJob = scope.launch {
            val move = engine.getBestMove(position.getFen(), selectedBot)
            if (move != null && position === rules && position.makeMove(move)) {
                lastMove = move.from to move.to
                selectedSquare = null
                legalDestinations = emptyList()
                refreshStatus()
            }
            isBotThinking = false
        }
    }

    fun handleSquareClick(square: Square) {
        if (isBotThinking || rules.getStatus().isDraw || rules.getStatus().isCheckmate) return
        val piece = rules.getPiece(square)
        val selected = selectedSquare
        if (selected == null) {
            if (piece?.color == PieceColor.WHITE) {
                selectedSquare = square
                legalDestinations = rules.generateLegalMoves(square).map { it.to }
            }
            return
        }

        val legalMove = rules.generateLegalMoves(selected).firstOrNull { it.to == square }
        if (legalMove != null && rules.makeMove(legalMove)) {
            lastMove = selected to square
            selectedSquare = null
            legalDestinations = emptyList()
            refreshStatus()
            if (!rules.getStatus().isDraw && !rules.getStatus().isCheckmate) startBotReply()
        } else if (piece?.color == PieceColor.WHITE) {
            selectedSquare = square
            legalDestinations = rules.generateLegalMoves(square).map { it.to }
        } else {
            selectedSquare = null
            legalDestinations = emptyList()
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            botJob?.cancel()
            engine.stop()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Choose your opponent", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        LazyRow(
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(BotLevel.values().toList()) { bot ->
                FilterChip(
                    selected = selectedBot == bot,
                    onClick = { selectedBot = bot; restart() },
                    label = { Text("${bot.rating}") }
                )
            }
        }
        Text("${selectedBot.title} · ${selectedBot.description}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        key(revision) {
            ChessBoard(
                rulesEngine = rules,
                selectedSquare = selectedSquare,
                legalDestinations = legalDestinations,
                lastMove = lastMove,
                onSquareClick = ::handleSquareClick
            )
        }
        Spacer(Modifier.height(12.dp))
        Text(if (isBotThinking) "Bot is thinking…" else statusText, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                onClick = {
                    if (!isBotThinking && rules.undo() != null) {
                        rules.undo()
                        lastMove = null
                        refreshStatus()
                    }
                },
                enabled = !isBotThinking
            ) { Text("Undo") }
            OutlinedButton(onClick = ::restart) { Text("Restart") }
            Button(onClick = { botJob?.cancel(); engine.stop(); isBotThinking = false; statusText = "You resigned" }) {
                Text("Resign")
            }
        }
    }
}

package com.grandmaster.chess.ui.features.puzzles

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.model.PieceColor
import com.grandmaster.chess.chess.model.Square
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import com.grandmaster.chess.ui.components.ChessBoard

private const val PRACTICE_FEN = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"

@Composable
fun PuzzlesScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedDifficulty by remember { mutableStateOf("Easy") }
    var orientation by remember { mutableStateOf(PieceColor.WHITE) }
    var selectedSquare by remember { mutableStateOf<Square?>(null) }
    var legalDestinations by remember { mutableStateOf(emptyList<Square>()) }
    var lastMove by remember { mutableStateOf<Pair<Square, Square>?>(null) }
    var hintSquare by remember { mutableStateOf<Square?>(null) }
    var rules by remember { mutableStateOf(ChessRulesEngine(PRACTICE_FEN)) }
    var revision by remember { mutableIntStateOf(0) }

    fun reset() {
        rules.loadFen(PRACTICE_FEN)
        selectedSquare = null
        legalDestinations = emptyList()
        lastMove = null
        hintSquare = null
        revision++
    }

    fun handleSquareClick(square: Square) {
        val piece = rules.getPiece(square)
        val current = selectedSquare
        if (current == null) {
            if (piece?.color == rules.currentTurn) {
                selectedSquare = square
                legalDestinations = rules.generateLegalMoves(square).map { it.to }
            }
            return
        }

        val move = rules.generateLegalMoves(current).firstOrNull { it.to == square }
        if (move != null && rules.makeMove(move)) {
            lastMove = current to square
            selectedSquare = null
            legalDestinations = emptyList()
            hintSquare = null
            revision++
        } else if (piece?.color == rules.currentTurn) {
            selectedSquare = square
            legalDestinations = rules.generateLegalMoves(square).map { it.to }
        } else {
            selectedSquare = null
            legalDestinations = emptyList()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Daily") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Training") })
        }
        Spacer(Modifier.height(16.dp))
        if (selectedTab == 0) {
            Text("Daily Challenge", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("Choose a difficulty and solve today's position.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            Spacer(Modifier.height(10.dp))
            SingleChoiceSegmentedButtonRow {
                listOf("Easy", "Medium", "Hard").forEachIndexed { index, difficulty ->
                    SegmentedButton(
                        selected = selectedDifficulty == difficulty,
                        onClick = { selectedDifficulty = difficulty; reset() },
                        shape = SegmentedButtonDefaults.itemShape(index, 3)
                    ) { Text(difficulty) }
                }
            }
        } else {
            Text("Training Track", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("Practice legal moves on the current position.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        Spacer(Modifier.height(16.dp))
        key(revision) {
            ChessBoard(
                rulesEngine = rules,
                orientation = orientation,
                selectedSquare = selectedSquare,
                legalDestinations = legalDestinations,
                lastMove = lastMove,
                onSquareClick = ::handleSquareClick
            )
        }
        hintSquare?.let { hint ->
            Text("Try moving to ${hint.name}", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = {
                val candidate = (0..63).asSequence()
                    .map { Square(it % 8, it / 8) }
                    .flatMap { rules.generateLegalMoves(it).asSequence() }
                    .firstOrNull()
                hintSquare = candidate?.to
            }) { Text("Hint") }
            OutlinedButton(onClick = ::reset) { Text("Reset") }
            OutlinedButton(onClick = { orientation = orientation.opposite() }) { Text("Flip") }
        }
    }
}

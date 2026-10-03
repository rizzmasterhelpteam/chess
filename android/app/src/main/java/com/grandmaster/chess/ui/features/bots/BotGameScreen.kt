package com.grandmaster.chess.ui.features.bots

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.engine.BotLevel
import com.grandmaster.chess.chess.model.PieceColor
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import com.grandmaster.chess.ui.components.ChessBoard

@Composable
fun BotGameScreen() {
    var selectedBot by remember { mutableStateOf(BotLevel.BOT_1000) }
    val rules = remember { ChessRulesEngine() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Opponent info
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(selectedBot.avatar, fontSize = 24.sp)
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        "${selectedBot.displayName} (${selectedBot.rating})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Text(selectedBot.description, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Chessboard
        ChessBoard(
            rulesEngine = rules,
            orientation = PieceColor.WHITE,
            onSquareClick = { /* Handle move and Stockfish calculation */ }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(onClick = { /* Undo */ }) {
                Text("Undo")
            }
            Button(onClick = { /* Resign */ }) {
                Text("Resign")
            }
        }
    }
}

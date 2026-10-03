package com.grandmaster.chess.ui.features.puzzles

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import com.grandmaster.chess.ui.components.ChessBoard

@Composable
fun PuzzlesScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    val rules = remember { ChessRulesEngine("6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Daily Puzzles") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Permanent (450)") })
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (selectedTab == 0) {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "TODAY'S DAILY PUZZLES",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text("3,000 Deterministic Shuffled Pool", fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Interactive Board for Daily Puzzle
            ChessBoard(
                rulesEngine = rules,
                onSquareClick = { /* Handle move and multi-step reply */ },
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(onClick = { /* Hint 1, 2, 3 */ }) {
                    Text("Hint")
                }
                OutlinedButton(onClick = { /* Restart */ }) {
                    Text("Reset")
                }
            }
        } else {
            Text("Permanent 450 sequential puzzles track")
        }
    }
}

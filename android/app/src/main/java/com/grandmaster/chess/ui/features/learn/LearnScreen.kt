package com.grandmaster.chess.ui.features.learn

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grandmaster.chess.chess.model.Square
import com.grandmaster.chess.chess.rules.ChessRulesEngine
import com.grandmaster.chess.ui.components.ChessBoard

private data class LessonUiModel(
    val id: String,
    val title: String,
    val explanation: String,
    val keyIdea: String,
    val mistake: String,
    val initialFen: String = ChessRulesEngine.STARTING_FEN
)

private data class CategoryUiModel(
    val id: String,
    val title: String,
    val description: String,
    val lessons: List<LessonUiModel>
)

private val categories = listOf(
    "basics" to ("Beginner Basics" to "Piece moves, checks, and simple tactics"),
    "opening_principles" to ("Opening Principles" to "Build a safe, active position"),
    "opening_strategies" to ("Opening Strategies" to "Turn principles into practical plans"),
    "tactics" to ("Tactical Concepts" to "Spot forcing moves and tactical patterns"),
    "middlegame" to ("Middlegame Strategy" to "Improve pieces and attack weaknesses"),
    "endgames" to ("Essential Endgames" to "Convert an advantage with confidence")
).map { (id, info) ->
    CategoryUiModel(
        id = id,
        title = info.first,
        description = info.second,
        lessons = listOf("Core idea", "Practical example", "Review and apply").mapIndexed { index, title ->
            LessonUiModel(
                id = "${id}_$index",
                title = title,
                explanation = "Learn the practical idea, then try it on the board before moving on.",
                keyIdea = "Look for the most forcing improvement before calculating variations.",
                mistake = "Moving automatically without checking checks, captures, and threats."
            )
        }
    )
}

private fun completedLessons(context: Context): Set<String> =
    context.getSharedPreferences("learn_progress_v1", Context.MODE_PRIVATE)
        .getStringSet("completed", emptySet())?.toSet() ?: emptySet()

@Composable
fun LearnScreen(onNavigateToPuzzles: () -> Unit) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf<CategoryUiModel?>(null) }
    var selectedLesson by remember { mutableStateOf<LessonUiModel?>(null) }
    var completed by remember { mutableStateOf(completedLessons(context)) }
    val allLessons = categories.flatMap { it.lessons }
    val nextLesson = allLessons.firstOrNull { it.id !in completed } ?: allLessons.first()

    when {
        selectedLesson != null -> LessonDetail(
            lesson = selectedLesson!!,
            isCompleted = selectedLesson!!.id in completed,
            onBack = { selectedLesson = null },
            onComplete = {
                val updated = completed + selectedLesson!!.id
                completed = updated
                context.getSharedPreferences("learn_progress_v1", Context.MODE_PRIVATE)
                    .edit().putStringSet("completed", updated).apply()
            }
        )
        selectedCategory != null -> CategoryLessons(
            category = selectedCategory!!,
            completed = completed,
            onBack = { selectedCategory = null },
            onSelectLesson = { selectedLesson = it }
        )
        else -> LearnHome(
            categories = categories,
            completed = completed,
            nextLesson = nextLesson,
            onContinue = { selectedLesson = nextLesson },
            onSelectCategory = { selectedCategory = it }
        )
    }
}

@Composable
private fun LearnHome(
    categories: List<CategoryUiModel>,
    completed: Set<String>,
    nextLesson: LessonUiModel,
    onContinue: () -> Unit,
    onSelectCategory: (CategoryUiModel) -> Unit
) {
    val total = categories.sumOf { it.lessons.size }
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Learn Chess", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text("Build better habits one lesson at a time.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            Card(modifier = Modifier.fillMaxWidth(), onClick = onContinue) {
                Column(Modifier.padding(16.dp)) {
                    Text("CONTINUE LEARNING", color = MaterialTheme.colorScheme.primary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(nextLesson.title, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Text("${completed.size} of $total lessons complete", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
            }
        }
        item { Text("Curriculum Tracks", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        items(categories) { category ->
            val done = category.lessons.count { it.id in completed }
            Card(modifier = Modifier.fillMaxWidth().clickable { onSelectCategory(category) }) {
                Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(28.dp))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(category.title, fontWeight = FontWeight.Bold)
                        Text(category.description, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("$done/${category.lessons.size} complete", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = "Open ${category.title}")
                }
            }
        }
    }
}

@Composable
private fun CategoryLessons(
    category: CategoryUiModel,
    completed: Set<String>,
    onBack: () -> Unit,
    onSelectLesson: (LessonUiModel) -> Unit
) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") }
        Text(category.title, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(category.description, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(category.lessons) { lesson ->
                Card(modifier = Modifier.fillMaxWidth().clickable { onSelectLesson(lesson) }) {
                    Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(lesson.title, fontWeight = FontWeight.Bold)
                            Text(if (lesson.id in completed) "Completed" else "Ready to learn", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = "Open lesson")
                    }
                }
            }
        }
    }
}

@Composable
private fun LessonDetail(
    lesson: LessonUiModel,
    isCompleted: Boolean,
    onBack: () -> Unit,
    onComplete: () -> Unit
) {
    val rules = remember(lesson.id) { ChessRulesEngine(lesson.initialFen) }
    var selected by remember(lesson.id) { mutableStateOf<Square?>(null) }
    var destinations by remember(lesson.id) { mutableStateOf(emptyList<Square>()) }
    var lastMove by remember(lesson.id) { mutableStateOf<Pair<Square, Square>?>(null) }
    var revision by remember(lesson.id) { mutableIntStateOf(0) }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") }
        Text(lesson.title, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(lesson.explanation, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        key(revision) {
            ChessBoard(
                rulesEngine = rules,
                selectedSquare = selected,
                legalDestinations = destinations,
                lastMove = lastMove,
                onSquareClick = { square ->
                    val piece = rules.getPiece(square)
                    if (selected == null && piece?.color == rules.currentTurn) {
                        selected = square
                        destinations = rules.generateLegalMoves(square).map { it.to }
                    } else if (selected != null) {
                        val move = rules.generateLegalMoves(selected!!).firstOrNull { it.to == square }
                        if (move != null && rules.makeMove(move)) {
                            lastMove = selected!! to square
                            revision++
                        } else if (piece?.color == rules.currentTurn) {
                            selected = square
                            destinations = rules.generateLegalMoves(square).map { it.to }
                        }
                        if (move != null) {
                            selected = null
                            destinations = emptyList()
                        }
                    }
                }
            )
        }
        Spacer(Modifier.height(12.dp))
        Text("Key concept", fontWeight = FontWeight.Bold)
        Text(lesson.keyIdea, fontSize = 13.sp)
        Spacer(Modifier.height(8.dp))
        Text("Mistake to avoid", fontWeight = FontWeight.Bold)
        Text(lesson.mistake, fontSize = 13.sp)
        Spacer(Modifier.height(16.dp))
        Button(onClick = onComplete, modifier = Modifier.fillMaxWidth(), enabled = !isCompleted) {
            Text(if (isCompleted) "Completed" else "Mark Complete")
        }
    }
}

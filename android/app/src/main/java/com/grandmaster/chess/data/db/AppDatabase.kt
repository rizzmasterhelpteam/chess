package com.grandmaster.chess.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.grandmaster.chess.data.db.dao.*
import com.grandmaster.chess.data.db.entity.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        LessonEntity::class,
        PuzzleEntity::class,
        DailyRecordEntity::class,
        BotStatEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun lessonDao(): LessonDao
    abstract fun puzzleDao(): PuzzleDao
    abstract fun dailyDao(): DailyDao
    abstract fun botStatDao(): BotStatDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context, scope).also { INSTANCE = it }
            }
        }

        private fun buildDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            lateinit var database: AppDatabase
            database = Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "grandmaster_chess_database"
            )
                .addCallback(object : RoomDatabase.Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        scope.launch(Dispatchers.IO) {
                            database.lessonDao().insertLessons(starterLessons())
                            database.puzzleDao().insertPuzzles(starterPuzzles())
                        }
                    }
                })
                .fallbackToDestructiveMigration()
                .build()
            return database
        }

        private fun starterLessons(): List<LessonEntity> {
            val categories = listOf(
                "basics" to "Beginner Basics",
                "opening_principles" to "Opening Principles",
                "opening_strategies" to "Opening Strategies",
                "tactics" to "Tactical Concepts",
                "middlegame" to "Middlegame Strategy",
                "endgames" to "Essential Endgames"
            )
            return categories.flatMap { (categoryId, categoryTitle) ->
                listOf("Core idea", "Practical example", "Review and apply").mapIndexed { index, title ->
                    LessonEntity(
                        id = "${categoryId}_$index",
                        categoryId = categoryId,
                        categoryTitle = categoryTitle,
                        title = title,
                        explanation = "Learn the practical idea, then try it on the board.",
                        keyIdea = "Look for checks, captures, and threats before moving.",
                        mistakeToAvoid = "Moving automatically without checking the opponent's reply.",
                        initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                        orientation = "white"
                    )
                }
            }
        }

        private fun starterPuzzles(): List<PuzzleEntity> = listOf(
            PuzzleEntity(
                id = "starter_easy_1", track = "permanent", difficulty = "easy", trackIndex = 1,
                fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", sideToMove = "w",
                theme = "Rook activity", rating = 600, description = "Practice finding an active rook move.", solutionJson = "[]"
            ),
            PuzzleEntity(
                id = "starter_medium_1", track = "permanent", difficulty = "medium", trackIndex = 1,
                fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", sideToMove = "w",
                theme = "Rook activity", rating = 1000, description = "Practice finding an active rook move.", solutionJson = "[]"
            ),
            PuzzleEntity(
                id = "starter_hard_1", track = "permanent", difficulty = "hard", trackIndex = 1,
                fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", sideToMove = "w",
                theme = "Rook activity", rating = 1400, description = "Practice finding an active rook move.", solutionJson = "[]"
            )
        )
    }
}

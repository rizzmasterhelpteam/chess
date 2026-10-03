package com.grandmaster.chess.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.grandmaster.chess.data.db.dao.*
import com.grandmaster.chess.data.db.entity.*
import kotlinx.coroutines.CoroutineScope

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
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "grandmaster_chess_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

package com.grandmaster.chess.data.db.dao

import androidx.room.*
import com.grandmaster.chess.data.db.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LessonDao {
    @Query("SELECT * FROM lessons")
    fun getAllLessons(): Flow<List<LessonEntity>>

    @Query("SELECT * FROM lessons WHERE id = :id")
    suspend fun getLessonById(id: String): LessonEntity?

    @Query("SELECT * FROM lessons WHERE categoryId = :catId")
    fun getLessonsByCategory(catId: String): Flow<List<LessonEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessons(lessons: List<LessonEntity>)

    @Query("UPDATE lessons SET isCompleted = 1 WHERE id = :id")
    suspend fun markLessonCompleted(id: String)
}

@Dao
interface PuzzleDao {
    @Query("SELECT * FROM puzzles WHERE track = 'permanent' AND difficulty = :difficulty ORDER BY trackIndex ASC")
    fun getPermanentPuzzles(difficulty: String): Flow<List<PuzzleEntity>>

    @Query("SELECT * FROM puzzles WHERE id = :id")
    suspend fun getPuzzleById(id: String): PuzzleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPuzzles(puzzles: List<PuzzleEntity>)

    @Query("UPDATE puzzles SET isSolved = 1, attempts = attempts + 1 WHERE id = :id")
    suspend fun markPuzzleSolved(id: String)

    @Query("UPDATE puzzles SET failedAttempts = failedAttempts + 1, attempts = attempts + 1 WHERE id = :id")
    suspend fun recordFailedAttempt(id: String)
}

@Dao
interface DailyDao {
    @Query("SELECT * FROM daily_records WHERE date = :date")
    suspend fun getDailyRecord(date: String): DailyRecordEntity?

    @Query("SELECT * FROM daily_records ORDER BY date DESC")
    fun getAllDailyRecords(): Flow<List<DailyRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateDailyRecord(record: DailyRecordEntity)
}

@Dao
interface BotStatDao {
    @Query("SELECT * FROM bot_stats WHERE botId = :botId")
    suspend fun getBotStat(botId: String): BotStatEntity?

    @Query("SELECT * FROM bot_stats")
    fun getAllBotStats(): Flow<List<BotStatEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stat: BotStatEntity)
}

package com.grandmaster.chess.data.repository

import android.content.Context
import com.grandmaster.chess.data.datastore.UserPreferencesDataStore
import com.grandmaster.chess.data.db.dao.*
import com.grandmaster.chess.data.db.entity.*
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

class LessonRepository(private val lessonDao: LessonDao) {
    fun getAllLessons(): Flow<List<LessonEntity>> = lessonDao.getAllLessons()
    suspend fun markLessonCompleted(id: String) = lessonDao.markLessonCompleted(id)
}

class PuzzleRepository(private val puzzleDao: PuzzleDao) {
    fun getPermanentPuzzles(difficulty: String): Flow<List<PuzzleEntity>> =
        puzzleDao.getPermanentPuzzles(difficulty)

    suspend fun markPuzzleSolved(id: String) = puzzleDao.markPuzzleSolved(id)
    suspend fun recordFailedAttempt(id: String) = puzzleDao.recordFailedAttempt(id)
}

class DailyCycleRepository(
    private val dailyDao: DailyDao,
    private val context: Context
) {
    // Generates deterministic shuffled order of 1,000 puzzles for Easy, Medium, Hard
    private fun generateShuffledOrder(cycle: Int, seedOffset: Int, forbiddenFirst: Int?): List<Int> {
        val list = (0 until 1000).toMutableList()
        var s = ((cycle * 7919 + seedOffset) xor 0x5deece66).toLong()
        fun nextRand(): Float {
            s = (s * 1664525L + 1013904223L) and 0xffffffffL
            return (s.toDouble() / 4294967296.0).toFloat()
        }

        for (i in 999 downTo 1) {
            val j = (nextRand() * (i + 1)).toInt()
            val temp = list[i]
            list[i] = list[j]
            list[j] = temp
        }

        if (forbiddenFirst != null && list[0] == forbiddenFirst) {
            val t = list[0]
            list[0] = list[1]
            list[1] = t
        }
        return list
    }

    suspend fun getTodayDailyRecord(date: LocalDate = LocalDate.now()): DailyRecordEntity {
        val dateStr = date.toString()
        val existing = dailyDao.getDailyRecord(dateStr)
        if (existing != null) return existing

        val easyShuffled = generateShuffledOrder(1, 101, null)
        val medShuffled = generateShuffledOrder(1, 202, null)
        val hardShuffled = generateShuffledOrder(1, 303, null)

        val dayOfYear = date.dayOfYear % 1000
        val newRecord = DailyRecordEntity(
            date = dateStr,
            easyPuzzleId = "daily_easy_${easyShuffled[dayOfYear] + 1}",
            mediumPuzzleId = "daily_med_${medShuffled[dayOfYear] + 1}",
            hardPuzzleId = "daily_hard_${hardShuffled[dayOfYear] + 1}"
        )
        dailyDao.insertOrUpdateDailyRecord(newRecord)
        return newRecord
    }

    fun getAllDailyRecords(): Flow<List<DailyRecordEntity>> = dailyDao.getAllDailyRecords()
}

class SettingsRepository(context: Context) {
    private val dataStore = UserPreferencesDataStore(context)
    val userSettingsFlow = dataStore.userSettingsFlow

    suspend fun updateTheme(theme: String) = dataStore.updateTheme(theme)
    suspend fun updateBoardTheme(theme: String) = dataStore.updateBoardTheme(theme)
    suspend fun updateSound(enabled: Boolean) = dataStore.updateSoundEnabled(enabled)
    suspend fun updateHaptics(enabled: Boolean) = dataStore.updateHapticsEnabled(enabled)
}

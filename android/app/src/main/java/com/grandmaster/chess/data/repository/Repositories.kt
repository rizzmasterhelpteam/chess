package com.grandmaster.chess.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.grandmaster.chess.data.datastore.UserPreferencesDataStore
import com.grandmaster.chess.data.db.dao.*
import com.grandmaster.chess.data.db.entity.*
import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
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
    private data class CycleState(
        var cycle: Int,
        var sequenceIndex: Int,
        var shuffledIndices: List<Int>,
        var lastDateAssigned: String,
        var currentPuzzleId: String
    )

    private val prefs: SharedPreferences
        get() = context.getSharedPreferences("daily_cycle_state_v1", Context.MODE_PRIVATE)

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

    private fun loadCycleState(difficulty: String, seedOffset: Int): CycleState {
        val key = "cycle_$difficulty"
        val savedSequence = prefs.getString("${key}_sequence", null)
        val sequence = savedSequence?.let {
            runCatching {
                val json = JSONArray(it)
                List(json.length()) { index -> json.getInt(index) }
                    .takeIf { values -> values.size == 1000 && values.toSet().size == 1000 }
            }.getOrNull()
        } ?: generateShuffledOrder(1, seedOffset, null)

        return CycleState(
            cycle = prefs.getInt("${key}_cycle", 1),
            sequenceIndex = prefs.getInt("${key}_index", -1),
            shuffledIndices = sequence,
            lastDateAssigned = prefs.getString("${key}_date", "") ?: "",
            currentPuzzleId = prefs.getString("${key}_puzzle", "") ?: ""
        )
    }

    private fun saveCycleState(difficulty: String, state: CycleState) {
        val key = "cycle_$difficulty"
        val sequence = JSONArray()
        state.shuffledIndices.forEach(sequence::put)
        prefs.edit()
            .putInt("${key}_cycle", state.cycle)
            .putInt("${key}_index", state.sequenceIndex)
            .putString("${key}_sequence", sequence.toString())
            .putString("${key}_date", state.lastDateAssigned)
            .putString("${key}_puzzle", state.currentPuzzleId)
            .apply()
    }

    private fun advanceCycle(
        difficulty: String,
        prefix: String,
        date: String,
        seedOffset: Int,
        state: CycleState
    ): String {
        if (state.lastDateAssigned == date && state.currentPuzzleId.isNotBlank()) {
            return state.currentPuzzleId
        }

        var nextIndex = if (state.lastDateAssigned.isBlank()) 0 else state.sequenceIndex + 1
        if (nextIndex >= 1000) {
            val previousLast = state.shuffledIndices.last()
            state.cycle += 1
            state.shuffledIndices = generateShuffledOrder(state.cycle, seedOffset, previousLast)
            nextIndex = 0
        }

        state.sequenceIndex = nextIndex
        state.lastDateAssigned = date
        state.currentPuzzleId = "${prefix}_${state.shuffledIndices[nextIndex] + 1}"
        saveCycleState(difficulty, state)
        return state.currentPuzzleId
    }

    suspend fun getTodayDailyRecord(date: LocalDate = LocalDate.now()): DailyRecordEntity {
        val dateStr = date.toString()
        val existing = dailyDao.getDailyRecord(dateStr)
        if (existing != null) return existing

        val easyState = loadCycleState("easy", 101)
        val mediumState = loadCycleState("medium", 202)
        val hardState = loadCycleState("hard", 303)
        val newRecord = DailyRecordEntity(
            date = dateStr,
            easyPuzzleId = advanceCycle("easy", "daily_easy", dateStr, 101, easyState),
            mediumPuzzleId = advanceCycle("medium", "daily_med", dateStr, 202, mediumState),
            hardPuzzleId = advanceCycle("hard", "daily_hard", dateStr, 303, hardState)
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

package com.grandmaster.chess.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "lessons")
data class LessonEntity(
    @PrimaryKey val id: String,
    val categoryId: String,
    val categoryTitle: String,
    val title: String,
    val explanation: String,
    val keyIdea: String,
    val mistakeToAvoid: String,
    val initialFen: String,
    val orientation: String,
    val isCompleted: Boolean = false
)

@Entity(tableName = "puzzles")
data class PuzzleEntity(
    @PrimaryKey val id: String,
    val track: String, // "permanent" or "daily"
    val difficulty: String, // "easy", "medium", "hard"
    val trackIndex: Int,
    val fen: String,
    val sideToMove: String,
    val theme: String,
    val rating: Int,
    val description: String,
    val solutionJson: String,
    val isSolved: Boolean = false,
    val attempts: Int = 0,
    val failedAttempts: Int = 0
)

@Entity(tableName = "daily_records")
data class DailyRecordEntity(
    @PrimaryKey val date: String, // YYYY-MM-DD
    val easyPuzzleId: String,
    val mediumPuzzleId: String,
    val hardPuzzleId: String,
    val easyCompleted: Boolean = false,
    val mediumCompleted: Boolean = false,
    val hardCompleted: Boolean = false,
    val isPerfect: Boolean = false,
    val isActive: Boolean = false
)

@Entity(tableName = "bot_stats")
data class BotStatEntity(
    @PrimaryKey val botId: String,
    val gamesPlayed: Int = 0,
    val wins: Int = 0,
    val losses: Int = 0,
    val draws: Int = 0
)

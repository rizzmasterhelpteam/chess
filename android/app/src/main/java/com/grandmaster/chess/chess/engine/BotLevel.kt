package com.grandmaster.chess.chess.engine

enum class BotLevel(
    val id: String,
    val displayName: String,
    val rating: Int,
    val title: String,
    val avatar: String,
    val description: String,
    val depth: Int,
    val blunderRate: Float,
    val skillLevel: Int
) {
    BOT_600(
        id = "600",
        displayName = "Oliver",
        rating = 600,
        title = "Beginner",
        avatar = "♟️",
        description = "Makes frequent mistakes and misses hanging pieces.",
        depth = 1,
        blunderRate = 0.40f,
        skillLevel = 0
    ),
    BOT_1000(
        id = "1000",
        displayName = "Maya",
        rating = 1000,
        title = "Casual",
        avatar = "♞",
        description = "Understands basic tactics with occasional missed threats.",
        depth = 3,
        blunderRate = 0.20f,
        skillLevel = 5
    ),
    BOT_1600(
        id = "1600",
        displayName = "Viktor",
        rating = 1600,
        title = "Club Player",
        avatar = "♝",
        description = "Punishes obvious mistakes with solid tactical play.",
        depth = 6,
        blunderRate = 0.05f,
        skillLevel = 12
    ),
    BOT_2200(
        id = "2200",
        displayName = "Elena",
        rating = 2200,
        title = "Master",
        avatar = "♜",
        description = "Accurate positional and tactical calculation.",
        depth = 10,
        blunderRate = 0.01f,
        skillLevel = 18
    ),
    BOT_GM(
        id = "gm",
        displayName = "Grandmaster Bot",
        rating = 2800,
        title = "Grandmaster",
        avatar = "♛",
        description = "Maximum engine precision and endgame mastery.",
        depth = 16,
        blunderRate = 0.0f,
        skillLevel = 20
    );

    companion object {
        fun fromId(id: String): BotLevel = values().find { it.id == id } ?: BOT_1000
    }
}

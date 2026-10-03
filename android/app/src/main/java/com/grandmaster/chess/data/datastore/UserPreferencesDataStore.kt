package com.grandmaster.chess.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

data class UserSettingsModel(
    val theme: String = "system",
    val boardTheme: String = "green",
    val showCoordinates: Boolean = true,
    val showMoveHints: Boolean = true,
    val soundEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val confirmResign: Boolean = true
)

class UserPreferencesDataStore(private val context: Context) {
    companion object {
        val KEY_THEME = stringPreferencesKey("theme")
        val KEY_BOARD_THEME = stringPreferencesKey("board_theme")
        val KEY_SHOW_COORDINATES = booleanPreferencesKey("show_coordinates")
        val KEY_SHOW_MOVE_HINTS = booleanPreferencesKey("show_move_hints")
        val KEY_SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
        val KEY_HAPTICS_ENABLED = booleanPreferencesKey("haptics_enabled")
        val KEY_CONFIRM_RESIGN = booleanPreferencesKey("confirm_resign")
    }

    val userSettingsFlow: Flow<UserSettingsModel> = context.dataStore.data.map { pref ->
        UserSettingsModel(
            theme = pref[KEY_THEME] ?: "system",
            boardTheme = pref[KEY_BOARD_THEME] ?: "green",
            showCoordinates = pref[KEY_SHOW_COORDINATES] ?: true,
            showMoveHints = pref[KEY_SHOW_MOVE_HINTS] ?: true,
            soundEnabled = pref[KEY_SOUND_ENABLED] ?: true,
            hapticsEnabled = pref[KEY_HAPTICS_ENABLED] ?: true,
            confirmResign = pref[KEY_CONFIRM_RESIGN] ?: true
        )
    }

    suspend fun updateTheme(theme: String) {
        context.dataStore.edit { it[KEY_THEME] = theme }
    }

    suspend fun updateBoardTheme(boardTheme: String) {
        context.dataStore.edit { it[KEY_BOARD_THEME] = boardTheme }
    }

    suspend fun updateSoundEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_SOUND_ENABLED] = enabled }
    }

    suspend fun updateHapticsEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_HAPTICS_ENABLED] = enabled }
    }

    suspend fun updateCoordinates(enabled: Boolean) {
        context.dataStore.edit { it[KEY_SHOW_COORDINATES] = enabled }
    }

    suspend fun updateConfirmResign(enabled: Boolean) {
        context.dataStore.edit { it[KEY_CONFIRM_RESIGN] = enabled }
    }
}

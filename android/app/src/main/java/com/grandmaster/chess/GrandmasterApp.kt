package com.grandmaster.chess

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.grandmaster.chess.ads.AdsManager
import com.grandmaster.chess.core.sound.SoundManager
import com.grandmaster.chess.data.db.AppDatabase
import com.grandmaster.chess.data.repository.LessonRepository
import com.grandmaster.chess.data.repository.PuzzleRepository
import com.grandmaster.chess.data.repository.DailyCycleRepository
import com.grandmaster.chess.data.repository.SettingsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class GrandmasterApp : Application() {
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }
    val soundManager by lazy { SoundManager(this) }
    val adsManager by lazy { AdsManager(this) }

    val lessonRepository by lazy { LessonRepository(database.lessonDao()) }
    val puzzleRepository by lazy { PuzzleRepository(database.puzzleDao()) }
    val dailyCycleRepository by lazy { DailyCycleRepository(database.dailyDao(), this) }
    val settingsRepository by lazy { SettingsRepository(this) }

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize Google Mobile Ads SDK (AdMob)
        applicationScope.launch(Dispatchers.IO) {
            try {
                MobileAds.initialize(this@GrandmasterApp) {}
            } catch (e: Exception) {
                // Non-fatal if offline
            }
        }
    }

    companion object {
        lateinit var instance: GrandmasterApp
            private set
    }
}

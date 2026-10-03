package com.grandmaster.chess.core.sound

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

class SoundManager(context: Context) {
    private var soundPool: SoundPool? = null
    var isSoundEnabled: Boolean = true

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(4)
            .setAudioAttributes(audioAttributes)
            .build()
    }

    fun playMove() {
        if (!isSoundEnabled) return
        // Plays short wooden move sound from SoundPool
    }

    fun playCapture() {
        if (!isSoundEnabled) return
        // Plays capture sound
    }

    fun playCheck() {
        if (!isSoundEnabled) return
        // Plays warning check tone
    }

    fun playSuccess() {
        if (!isSoundEnabled) return
        // Plays puzzle success chime
    }

    fun playIncorrect() {
        if (!isSoundEnabled) return
        // Plays low incorrect buzz
    }

    fun release() {
        soundPool?.release()
        soundPool = null
    }
}

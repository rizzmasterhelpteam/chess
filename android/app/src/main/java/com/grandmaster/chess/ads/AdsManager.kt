package com.grandmaster.chess.ads

import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class AdsManager(private val context: Context) {
    private var interstitialAd: InterstitialAd? = null
    private var isLoadingInterstitial = false
    private var lastInterstitialTime = 0L

    var permanentPuzzlesCompletedSinceLastAd = 0
    var botGamesCompletedSinceLastAd = 0

    // Frequency cap: minimum 2 minutes (120,000 ms) between interstitials
    private val minInterstitialCooldownMs = 120_000L

    // Test Ad Unit IDs
    val bannerAdUnitId: String = "ca-app-pub-3940256099942544/6300978111"
    val interstitialAdUnitId: String = "ca-app-pub-3940256099942544/1033173712"

    init {
        loadInterstitial()
    }

    fun loadInterstitial() {
        if (isLoadingInterstitial || interstitialAd != null) return
        isLoadingInterstitial = true

        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(
            context,
            interstitialAdUnitId,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isLoadingInterstitial = false
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    interstitialAd = null
                    isLoadingInterstitial = false
                }
            }
        )
    }

    fun canShowInterstitial(): Boolean {
        val now = System.currentTimeMillis()
        val timeSinceLast = now - lastInterstitialTime
        return interstitialAd != null && timeSinceLast >= minInterstitialCooldownMs
    }

    fun onPermanentPuzzleCompleted(activity: Activity): Boolean {
        permanentPuzzlesCompletedSinceLastAd++
        if (permanentPuzzlesCompletedSinceLastAd >= 6) {
            return showInterstitialIfEligible(activity)
        }
        return false
    }

    fun onDailySetCompleted(activity: Activity): Boolean {
        return showInterstitialIfEligible(activity)
    }

    fun onBotGameCompleted(activity: Activity): Boolean {
        botGamesCompletedSinceLastAd++
        if (botGamesCompletedSinceLastAd >= 3) {
            return showInterstitialIfEligible(activity)
        }
        return false
    }

    private fun showInterstitialIfEligible(activity: Activity): Boolean {
        if (canShowInterstitial()) {
            interstitialAd?.show(activity)
            interstitialAd = null
            lastInterstitialTime = System.currentTimeMillis()
            permanentPuzzlesCompletedSinceLastAd = 0
            botGamesCompletedSinceLastAd = 0
            loadInterstitial()
            return true
        }
        return false
    }
}

// Centralized AdsManager for Android Google Mobile Ads (AdMob)
export interface AdConfig {
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  testMode: boolean;
  minInterstitialIntervalSeconds: number; // 120-180 seconds (2-3 minutes)
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  // Official Google AdMob Android test ad unit IDs
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  testMode: true,
  minInterstitialIntervalSeconds: 150,
};

type AdEventListener = (event: 'banner_loaded' | 'interstitial_shown' | 'interstitial_dismissed') => void;

class AdsManager {
  private lastInterstitialTime: number = 0;
  private puzzlesCompletedSinceLastAd: number = 0;
  private botGamesCompletedSinceLastAd: number = 0;
  private isInterstitialLoading: boolean = false;
  private isInterstitialReady: boolean = true;
  private listeners: Set<AdEventListener> = new Set();
  private isAdShowing: boolean = false;

  constructor() {
    this.lastInterstitialTime = Date.now();
  }

  public addListener(listener: AdEventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: 'banner_loaded' | 'interstitial_shown' | 'interstitial_dismissed') {
    this.listeners.forEach((l) => l(event));
  }

  public recordPuzzleCompleted(): boolean {
    this.puzzlesCompletedSinceLastAd++;
    if (this.puzzlesCompletedSinceLastAd >= 6) {
      return this.checkAndShowInterstitial('puzzle_milestone');
    }
    return false;
  }

  public recordDailySetCompleted(): boolean {
    return this.checkAndShowInterstitial('daily_set_complete');
  }

  public recordBotGameCompleted(): boolean {
    this.botGamesCompletedSinceLastAd++;
    if (this.botGamesCompletedSinceLastAd >= 3) {
      return this.checkAndShowInterstitial('bot_game_milestone');
    }
    return false;
  }

  public canShowInterstitial(): boolean {
    const elapsedSeconds = (Date.now() - this.lastInterstitialTime) / 1000;
    return elapsedSeconds >= DEFAULT_AD_CONFIG.minInterstitialIntervalSeconds && !this.isAdShowing;
  }

  public checkAndShowInterstitial(triggerReason: string): boolean {
    if (!this.canShowInterstitial()) {
      return false;
    }

    this.isAdShowing = true;
    this.lastInterstitialTime = Date.now();
    this.puzzlesCompletedSinceLastAd = 0;
    this.botGamesCompletedSinceLastAd = 0;
    this.notify('interstitial_shown');
    return true;
  }

  public dismissInterstitial() {
    this.isAdShowing = false;
    this.notify('interstitial_dismissed');
  }

  public isShowingAd(): boolean {
    return this.isAdShowing;
  }

  public getDebugStats() {
    return {
      lastInterstitialTime: new Date(this.lastInterstitialTime).toLocaleTimeString(),
      elapsedSeconds: Math.floor((Date.now() - this.lastInterstitialTime) / 1000),
      cooldownSeconds: DEFAULT_AD_CONFIG.minInterstitialIntervalSeconds,
      puzzlesSinceLastAd: this.puzzlesCompletedSinceLastAd,
      botGamesSinceLastAd: this.botGamesCompletedSinceLastAd,
      canShowNow: this.canShowInterstitial(),
    };
  }
}

export const adsManager = new AdsManager();

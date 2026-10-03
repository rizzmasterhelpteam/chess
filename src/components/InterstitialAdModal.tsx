import React, { useState, useEffect } from 'react';
import { adsManager, DEFAULT_AD_CONFIG } from '../ads/AdsManager';

export const InterstitialAdModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const unsub = adsManager.addListener((event) => {
      if (event === 'interstitial_shown') {
        setIsOpen(true);
        setCountdown(3);
      } else if (event === 'interstitial_dismissed') {
        setIsOpen(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none animate-fade-in">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            AdMob Test Interstitial
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            {DEFAULT_AD_CONFIG.interstitialAdUnitId}
          </span>
        </div>
        <button
          onClick={() => adsManager.dismissInterstitial()}
          disabled={countdown > 0}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            countdown > 0
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          {countdown > 0 ? `Skip in ${countdown}s` : 'Close (✕)'}
        </button>
      </div>

      {/* Main Ad Content */}
      <div className="text-center max-w-sm my-auto bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
          ♟️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Learn Chess: Tips, Puzzles & Play</h3>
        <p className="text-sm text-neutral-400 mb-6">
          Level up your tactical vision with offline puzzles, comprehensive lessons, and local bot play.
        </p>
        <div className="bg-neutral-800/80 rounded-xl p-3 text-xs text-neutral-300 border border-neutral-700">
          Natural Break Milestone Reached • Frequency Capped (2-3 min)
        </div>
      </div>

      {/* Bottom status */}
      <div className="text-neutral-500 text-xs text-center">
        Offline Google Mobile Ads Mock SDK • Production-ready native wrapper
      </div>
    </div>
  );
};

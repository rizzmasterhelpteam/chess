import React, { useState } from 'react';
import { adsManager, DEFAULT_AD_CONFIG } from '../ads/AdsManager';
import { X } from 'lucide-react';

interface BannerAdViewProps {
  screenName: string;
}

export const BannerAdView: React.FC<BannerAdViewProps> = ({ screenName }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-[#0e1117] border-t border-white/[0.06] px-4 py-1.5 flex items-center justify-between text-[11px] text-neutral-400 select-none">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#d4af37] font-semibold tracking-wider uppercase">
          AdMob
        </span>
        <span className="text-neutral-400 text-xs">
          Adaptive Banner Space
        </span>
        <span className="text-neutral-600 hidden sm:inline">·</span>
        <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
          {DEFAULT_AD_CONFIG.bannerAdUnitId.slice(0, 20)}...
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-neutral-500 hover:text-neutral-300 p-1"
        title="Hide banner preview"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { MainTab, BottomNavBar } from './components/BottomNavBar';
import { TopAppBar } from './components/TopAppBar';
import { BannerAdView } from './components/BannerAdView';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './features/settings/SettingsModal';
import { StatisticsModal } from './features/settings/StatisticsModal';
import { AndroidProjectExportModal } from './components/AndroidProjectExportModal';

import { LearnTab } from './features/learn/LearnTab';
import { PuzzleTab } from './features/puzzles/PuzzleTab';
import { PlayBotTab } from './features/bots/PlayBotTab';

import { userProgressRepo } from './data/userProgressRepository';
import { dailyCycleManager } from './data/dailyCycleManager';

export function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('learn');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const progressData = userProgressRepo.getData();
  const [showOnboarding, setShowOnboarding] = useState(!progressData.hasCompletedOnboarding);

  const dailyStats = dailyCycleManager.getStats();

  const handleRefreshState = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#06080a] text-neutral-100 antialiased selection:bg-[#d4af37] selection:text-black">
      {/* Responsive master workspace: full-width presence on tablet/desktop, sleek on mobile */}
      <div className="w-full max-w-6xl h-[100dvh] flex flex-col bg-[#090b0e] overflow-hidden relative shadow-2xl border-x border-white/[0.06]">
        {/* Top Navigation Bar */}
        <TopAppBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          streak={dailyStats.currentStreak}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenAndroidExport={() => setIsExportOpen(true)}
        />

        {/* Tab Content Body (State preserved across tabs) */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#090b0e]">
          <div className={`flex-1 flex flex-col h-full ${currentTab === 'learn' ? 'block' : 'hidden'}`}>
            <LearnTab onGoToPuzzles={() => setCurrentTab('puzzles')} />
          </div>

          <div className={`flex-1 flex flex-col h-full ${currentTab === 'puzzles' ? 'block' : 'hidden'}`}>
            <PuzzleTab />
          </div>

          <div className={`flex-1 flex flex-col h-full ${currentTab === 'play' ? 'block' : 'hidden'}`}>
            <PlayBotTab />
          </div>
        </main>

        {/* Discrete Adaptive AdMob Banner Area */}
        <BannerAdView screenName={currentTab} />

        {/* Bottom Navigation */}
        <BottomNavBar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Modals & Overlays */}
        <InterstitialAdModal />

        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onRefreshState={handleRefreshState}
        />

        <StatisticsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
        />

        <AndroidProjectExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;

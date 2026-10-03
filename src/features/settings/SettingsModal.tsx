import React, { useState } from 'react';
import {
  userProgressRepo,
  BoardThemeId,
} from '../../data/userProgressRepository';
import { dailyCycleManager } from '../../data/dailyCycleManager';
import { adsManager } from '../../ads/AdsManager';
import {
  X,
  Volume2,
  Smartphone,
  Shield,
  Eye,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshState: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'licenses' | 'debug'>('settings');
  const [confirmResetType, setConfirmResetType] = useState<'puzzles' | 'bots' | null>(null);

  const progressData = userProgressRepo.getData();
  const settings = progressData.settings;

  if (!isOpen) return null;

  const handleUpdate = (updates: Partial<typeof settings>) => {
    userProgressRepo.updateSettings(updates);
    onRefreshState();
  };

  const handleConfirmReset = () => {
    if (confirmResetType === 'puzzles') {
      userProgressRepo.resetPuzzleProgress();
    } else if (confirmResetType === 'bots') {
      userProgressRepo.resetBotStats();
    }
    setConfirmResetType(null);
    onRefreshState();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#12151c] border border-white/[0.1] rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex gap-1.5 bg-black/30 p-1 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeSubTab === 'settings'
                  ? 'bg-white/[0.1] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveSubTab('licenses')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeSubTab === 'licenses'
                  ? 'bg-white/[0.1] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Licenses
            </button>
            <button
              onClick={() => setActiveSubTab('debug')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeSubTab === 'debug'
                  ? 'bg-white/[0.1] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tools
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeSubTab === 'settings' && (
            <>
              {/* Board Theme */}
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                  Board Theme
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'green', label: 'Tournament Forest', light: '#ece6da', dark: '#56794d' },
                      { id: 'wood', label: 'Classic Walnut', light: '#eedec4', dark: '#93643d' },
                      { id: 'slate', label: 'Modern Slate', light: '#edf1f5', dark: '#586f82' },
                      { id: 'midnight', label: 'Midnight Blue', light: '#475569', dark: '#1e293b' },
                    ] as const
                  ).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleUpdate({ boardTheme: theme.id })}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition text-left ${
                        settings.boardTheme === theme.id
                          ? 'border-[#e5c158] bg-white/[0.04]'
                          : 'border-white/[0.08] hover:border-white/[0.16] bg-[#0c0e12]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md grid grid-cols-2 grid-rows-2 overflow-hidden border border-white/[0.1] flex-shrink-0">
                        <div style={{ backgroundColor: theme.light }} />
                        <div style={{ backgroundColor: theme.dark }} />
                        <div style={{ backgroundColor: theme.dark }} />
                        <div style={{ backgroundColor: theme.light }} />
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
                  Audio & Tactile
                </label>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c0e12] border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#e5c158]" />
                    <div>
                      <div className="text-xs font-semibold text-white">Synthesized Audio</div>
                      <div className="text-[11px] text-neutral-400">Tactile move, capture & check sounds</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleUpdate({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c0e12] border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-[#e5c158]" />
                    <div>
                      <div className="text-xs font-semibold text-white">Haptic Vibration</div>
                      <div className="text-[11px] text-neutral-400">Tactile feedback on move & success</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hapticsEnabled}
                    onChange={(e) => handleUpdate({ hapticsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c0e12] border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-[#e5c158]" />
                    <div>
                      <div className="text-xs font-semibold text-white">Board Coordinates</div>
                      <div className="text-[11px] text-neutral-400">Engraved a-h and 1-8 labels</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showCoordinates}
                    onChange={(e) => handleUpdate({ showCoordinates: e.target.checked })}
                    className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c0e12] border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#e5c158]" />
                    <div>
                      <div className="text-xs font-semibold text-white">Confirm Resign</div>
                      <div className="text-[11px] text-neutral-400">Prevent accidental concessions</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.confirmResign}
                    onChange={(e) => handleUpdate({ confirmResign: e.target.checked })}
                    className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                  />
                </div>
              </div>

              {/* Data Reset */}
              <div className="pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                  Progress Management
                </label>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmResetType('puzzles')}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium transition"
                  >
                    Reset Puzzles
                  </button>
                  <button
                    onClick={() => setConfirmResetType('bots')}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium transition"
                  >
                    Reset Bot Stats
                  </button>
                </div>
              </div>
            </>
          )}

          {activeSubTab === 'licenses' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="bg-[#0c0e12] p-4 rounded-xl border border-white/[0.08]">
                <h4 className="font-bold text-white mb-1.5">Stockfish Chess Engine</h4>
                <p className="text-neutral-400 text-xs mb-2">
                  Stockfish is distributed under the GNU General Public License v3.0 (GPL-3.0). Bundled locally for zero-latency, private offline evaluation and play.
                </p>
                <span className="text-[11px] text-[#e5c158] font-mono">
                  GPL-3.0 License · Copyright (C) Stockfish Developers
                </span>
              </div>

              <div className="bg-[#0c0e12] p-4 rounded-xl border border-white/[0.08]">
                <h4 className="font-bold text-white mb-1.5">Vector Art & Rules</h4>
                <p className="text-neutral-400 text-xs">
                  World-standard Staunton vector piece geometry inspired by the Colin M.L. Burnett public domain collection. Rules and positions conform strictly to FIDE chess standards.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'debug' && (
            <div className="space-y-4">
              <div className="bg-[#0c0e12] p-4 rounded-xl border border-white/[0.08] text-xs text-neutral-300">
                <h4 className="font-bold text-[#e5c158] mb-2">Daily Puzzle Cycle Testing</h4>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      dailyCycleManager.debugAdvanceDate(1);
                      onRefreshState();
                    }}
                    className="flex-1 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-white font-semibold transition"
                  >
                    Advance +1 Day
                  </button>
                  <button
                    onClick={() => {
                      dailyCycleManager.debugAdvanceDate(7);
                      onRefreshState();
                    }}
                    className="flex-1 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-white font-semibold transition"
                  >
                    Advance +7 Days
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tests non-repeating calendar day rotation through the 3,000 puzzle pool.
                </p>
              </div>

              <div className="bg-[#0c0e12] p-4 rounded-xl border border-white/[0.08] text-xs text-neutral-300">
                <h4 className="font-bold text-[#e5c158] mb-2">AdMob Interstitial Break</h4>
                <button
                  onClick={() => {
                    adsManager.checkAndShowInterstitial('manual_debug');
                    onClose();
                  }}
                  className="w-full py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-lg font-semibold transition"
                >
                  Simulate Natural Break Ad
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmResetType && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-5">
            <div className="bg-[#12151c] border border-white/[0.12] rounded-2xl p-6 max-w-xs w-full text-center">
              <h4 className="text-white font-bold text-sm mb-1">Confirm Reset</h4>
              <p className="text-xs text-neutral-400 mb-5">
                Reset {confirmResetType === 'puzzles' ? 'puzzle progression' : 'bot win/loss history'}? This action is irreversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmResetType(null)}
                  className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

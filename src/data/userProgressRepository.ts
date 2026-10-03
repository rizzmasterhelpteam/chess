import { soundManager } from '../utils/sound';

export type AppTheme = 'system' | 'light' | 'dark';
export type BoardThemeId = 'wood' | 'slate' | 'green' | 'midnight';
export type PieceStyleId = 'classic' | 'modern' | 'neo';

export interface BotStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface UserSettings {
  theme: AppTheme;
  boardTheme: BoardThemeId;
  pieceStyle: PieceStyleId;
  showCoordinates: boolean;
  showMoveHints: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  confirmResign: boolean;
}

export interface PermanentTrackProgress {
  currentIndex: number; // 1 to 150
  solvedIds: string[];
  attempts: Record<string, number>;
  failedAttempts: Record<string, number>;
}

export interface UserProgressData {
  completedLessons: string[];
  lastLessonId: string | null;
  permanentPuzzles: {
    easy: PermanentTrackProgress;
    medium: PermanentTrackProgress;
    hard: PermanentTrackProgress;
  };
  botStats: Record<string, BotStats>;
  settings: UserSettings;
  hasCompletedOnboarding: boolean;
}

const STORAGE_KEY = 'grandmaster_user_progress_v1';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  boardTheme: 'green',
  pieceStyle: 'classic',
  showCoordinates: true,
  showMoveHints: true,
  soundEnabled: true,
  hapticsEnabled: true,
  confirmResign: true,
};

function createDefaultTrack(): PermanentTrackProgress {
  return {
    currentIndex: 1,
    solvedIds: [],
    attempts: {},
    failedAttempts: {},
  };
}

function restoreTrack(value: Partial<PermanentTrackProgress> | undefined): PermanentTrackProgress {
  return {
    currentIndex: typeof value?.currentIndex === 'number' ? value.currentIndex : 1,
    solvedIds: Array.isArray(value?.solvedIds) ? [...value.solvedIds] : [],
    attempts: { ...(value?.attempts || {}) },
    failedAttempts: { ...(value?.failedAttempts || {}) },
  };
}

export class UserProgressRepository {
  private data: UserProgressData;

  constructor() {
    this.data = this.load();
    soundManager.setSoundEnabled(this.data.settings.soundEnabled);
  }

  private load(): UserProgressData {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            completedLessons: parsed.completedLessons || [],
            lastLessonId: parsed.lastLessonId || null,
            permanentPuzzles: {
              easy: restoreTrack(parsed.permanentPuzzles?.easy),
              medium: restoreTrack(parsed.permanentPuzzles?.medium),
              hard: restoreTrack(parsed.permanentPuzzles?.hard),
            },
            botStats: parsed.botStats || {
              '600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
              '1000': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
              '1600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
              '2200': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
              'gm': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
            },
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
            hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
          };
        }
      } catch {
        // Fallback
      }
    }

    return {
      completedLessons: [],
      lastLessonId: null,
      permanentPuzzles: {
        easy: createDefaultTrack(),
        medium: createDefaultTrack(),
        hard: createDefaultTrack(),
      },
      botStats: {
        '600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
        '1000': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
        '1600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
        '2200': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
        'gm': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      },
      settings: { ...DEFAULT_SETTINGS },
      hasCompletedOnboarding: false,
    };
  }

  private save() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch {
        // Safe failover
      }
    }
  }

  public getData(): UserProgressData {
    return this.data;
  }

  // Lessons
  public markLessonComplete(lessonId: string) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
    }
    this.data.lastLessonId = lessonId;
    this.save();
  }

  public isLessonCompleted(lessonId: string): boolean {
    return this.data.completedLessons.includes(lessonId);
  }

  public getLastLessonId(): string | null {
    return this.data.lastLessonId;
  }

  // Permanent Puzzles
  public getPermanentTrack(difficulty: 'easy' | 'medium' | 'hard'): PermanentTrackProgress {
    return this.data.permanentPuzzles[difficulty];
  }

  public recordPermanentPuzzleAttempt(difficulty: 'easy' | 'medium' | 'hard', puzzleId: string, success: boolean) {
    const track = this.data.permanentPuzzles[difficulty];
    track.attempts[puzzleId] = (track.attempts[puzzleId] || 0) + 1;

    if (!success) {
      track.failedAttempts[puzzleId] = (track.failedAttempts[puzzleId] || 0) + 1;
    } else {
      if (!track.solvedIds.includes(puzzleId)) {
        track.solvedIds.push(puzzleId);
      }
      // If user solved the current active puzzle, advance to next puzzle
      const puzzleIndexMatch = puzzleId.match(/\d+$/);
      if (puzzleIndexMatch) {
        const solvedNum = parseInt(puzzleIndexMatch[0], 10);
        if (solvedNum >= track.currentIndex && track.currentIndex < 150) {
          track.currentIndex = solvedNum + 1;
        }
      }
    }
    this.save();
  }

  // Bot Statistics
  public recordBotGame(botLevelId: string, result: 'win' | 'loss' | 'draw') {
    if (!this.data.botStats[botLevelId]) {
      this.data.botStats[botLevelId] = { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 };
    }
    const stats = this.data.botStats[botLevelId];
    stats.gamesPlayed++;
    if (result === 'win') stats.wins++;
    else if (result === 'loss') stats.losses++;
    else stats.draws++;
    this.save();
  }

  // Settings
  public updateSettings(updates: Partial<UserSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    if (updates.soundEnabled !== undefined) {
      soundManager.setSoundEnabled(updates.soundEnabled);
    }
    this.save();
  }

  public completeOnboarding() {
    this.data.hasCompletedOnboarding = true;
    this.save();
  }

  // Resets
  public resetPuzzleProgress() {
    this.data.permanentPuzzles = {
      easy: createDefaultTrack(),
      medium: createDefaultTrack(),
      hard: createDefaultTrack(),
    };
    this.save();
  }

  public resetBotStats() {
    this.data.botStats = {
      '600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      '1000': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      '1600': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      '2200': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      'gm': { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 },
    };
    this.save();
  }
}

export const userProgressRepo = new UserProgressRepository();

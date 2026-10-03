import { Puzzle, DAILY_POOLS } from './puzzleDatabase';

export interface DailyDifficultyCycleState {
  cycle: number;
  sequenceIndex: number; // 0 to 999
  shuffledIndices: number[]; // Permutation of 0..999
  lastDateAssigned: string; // YYYY-MM-DD
  currentPuzzleId: string;
}

export interface DailyDayRecord {
  date: string; // YYYY-MM-DD
  easyPuzzleId: string;
  mediumPuzzleId: string;
  hardPuzzleId: string;
  easyCompleted: boolean;
  mediumCompleted: boolean;
  hardCompleted: boolean;
  isPerfect: boolean; // all 3 solved
  isActive: boolean; // at least 1 solved
}

export interface DailyState {
  easyCycle: DailyDifficultyCycleState;
  mediumCycle: DailyDifficultyCycleState;
  hardCycle: DailyDifficultyCycleState;
  history: Record<string, DailyDayRecord>; // Keyed by YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  perfectDaysCount: number;
  totalDaysActive: number;
}

const STORAGE_KEY = 'grandmaster_daily_state_v1';

// Seeded pseudorandom shuffle for deterministic cycle generation
function generateShuffledIndices(seed: number, forbiddenFirstIndex?: number): number[] {
  const indices: number[] = Array.from({ length: 1000 }, (_, i) => i);
  // Linear congruential generator for deterministic cycle permutations
  let s = (seed ^ 0x5deece66d) >>> 0;
  function nextRandom(): number {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  }

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Ensure first puzzle of new cycle != final puzzle of previous cycle
  if (forbiddenFirstIndex !== undefined && indices[0] === forbiddenFirstIndex) {
    // Swap with index 1
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }

  return indices;
}

export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(now: Date = new Date()): string {
  return formatLocalDate(now);
}

export class DailyCycleManager {
  private state: DailyState;

  constructor() {
    this.state = this.loadState();
    this.ensureTodayInitialized();
  }

  private initCycleState(difficultySeed: number): DailyDifficultyCycleState {
    const shuffled = generateShuffledIndices(difficultySeed);
    return {
      cycle: 1,
      sequenceIndex: 0,
      shuffledIndices: shuffled,
      lastDateAssigned: '',
      currentPuzzleId: '',
    };
  }

  private loadState(): DailyState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.easyCycle && parsed.mediumCycle && parsed.hardCycle) {
            return parsed;
          }
        }
      } catch {
        // Fall back to default
      }
    }

    return {
      easyCycle: this.initCycleState(10139),
      mediumCycle: this.initCycleState(20279),
      hardCycle: this.initCycleState(30319),
      history: {},
      currentStreak: 0,
      bestStreak: 0,
      perfectDaysCount: 0,
      totalDaysActive: 0,
    };
  }

  private saveState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Storage failover
      }
    }
  }

  // Advance single difficulty cycle to a new date
  private advanceDifficultyCycle(
    cycleState: DailyDifficultyCycleState,
    pool: Puzzle[],
    date: string,
    seedOffset: number
  ): string {
    // If already assigned for this exact calendar date, return current puzzle
    if (cycleState.lastDateAssigned === date && cycleState.currentPuzzleId) {
      return cycleState.currentPuzzleId;
    }

    // Check if we need to advance to the next index in the 1,000 sequence
    let nextSeq = cycleState.sequenceIndex;
    if (cycleState.lastDateAssigned !== '') {
      nextSeq = cycleState.sequenceIndex + 1;
    }

    // If sequence reached 1000, start a brand new cycle!
    if (nextSeq >= 1000) {
      const lastPuzzleIdx = cycleState.shuffledIndices[999];
      const newCycleNum = cycleState.cycle + 1;
      const newShuffled = generateShuffledIndices(
        (newCycleNum * 7919) + seedOffset,
        lastPuzzleIdx
      );
      cycleState.cycle = newCycleNum;
      cycleState.sequenceIndex = 0;
      cycleState.shuffledIndices = newShuffled;
    } else {
      cycleState.sequenceIndex = nextSeq;
    }

    const poolIndex = cycleState.shuffledIndices[cycleState.sequenceIndex];
    const puzzle = pool[poolIndex] || pool[0];
    cycleState.currentPuzzleId = puzzle.id;
    cycleState.lastDateAssigned = date;
    return puzzle.id;
  }

  public ensureTodayInitialized(overrideDate?: string): DailyDayRecord {
    const date = overrideDate || getTodayDateString();

    let record = this.state.history[date];
    if (!record) {
      const easyId = this.advanceDifficultyCycle(
        this.state.easyCycle,
        DAILY_POOLS.easy,
        date,
        1
      );
      const medId = this.advanceDifficultyCycle(
        this.state.mediumCycle,
        DAILY_POOLS.medium,
        date,
        2
      );
      const hardId = this.advanceDifficultyCycle(
        this.state.hardCycle,
        DAILY_POOLS.hard,
        date,
        3
      );

      record = {
        date,
        easyPuzzleId: easyId,
        mediumPuzzleId: medId,
        hardPuzzleId: hardId,
        easyCompleted: false,
        mediumCompleted: false,
        hardCompleted: false,
        isPerfect: false,
        isActive: false,
      };

      this.state.history[date] = record;
      this.saveState();
    }

    return record;
  }

  public getTodayPuzzles(): {
    easy: Puzzle;
    medium: Puzzle;
    hard: Puzzle;
    record: DailyDayRecord;
  } {
    const record = this.ensureTodayInitialized();

    const easy = DAILY_POOLS.easy.find(p => p.id === record.easyPuzzleId) || DAILY_POOLS.easy[0];
    const medium = DAILY_POOLS.medium.find(p => p.id === record.mediumPuzzleId) || DAILY_POOLS.medium[0];
    const hard = DAILY_POOLS.hard.find(p => p.id === record.hardPuzzleId) || DAILY_POOLS.hard[0];

    return { easy, medium, hard, record };
  }

  public markDailyPuzzleSolved(difficulty: 'easy' | 'medium' | 'hard', date?: string): {
    record: DailyDayRecord;
    isNowPerfect: boolean;
    streakUpdated: boolean;
  } {
    const targetDate = date || getTodayDateString();
    const record = this.state.history[targetDate] || this.ensureTodayInitialized(targetDate);

    let changed = false;
    if (difficulty === 'easy' && !record.easyCompleted) {
      record.easyCompleted = true;
      changed = true;
    } else if (difficulty === 'medium' && !record.mediumCompleted) {
      record.mediumCompleted = true;
      changed = true;
    } else if (difficulty === 'hard' && !record.hardCompleted) {
      record.hardCompleted = true;
      changed = true;
    }

    const wasActive = record.isActive;
    record.isActive = record.easyCompleted || record.mediumCompleted || record.hardCompleted;

    const wasPerfect = record.isPerfect;
    record.isPerfect = record.easyCompleted && record.mediumCompleted && record.hardCompleted;

    if (record.isPerfect && !wasPerfect) {
      this.state.perfectDaysCount++;
    }

    if (record.isActive && !wasActive) {
      this.state.totalDaysActive++;
      this.recalculateStreak();
    }

    if (changed) {
      this.saveState();
    }

    return {
      record,
      isNowPerfect: record.isPerfect && !wasPerfect,
      streakUpdated: record.isActive && !wasActive,
    };
  }

  private recalculateStreak() {
    // Check consecutive days up to today
    const dates = Object.keys(this.state.history).sort();
    if (dates.length === 0) {
      this.state.currentStreak = 0;
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const str = formatLocalDate(checkDate);
      const rec = this.state.history[str];

      if (rec && rec.isActive) {
        streak++;
      } else {
        // If checking today and today isn't solved yet, allow streak to still be intact from yesterday
        if (i === 0) continue;
        break;
      }
    }

    this.state.currentStreak = streak;
    if (streak > this.state.bestStreak) {
      this.state.bestStreak = streak;
    }
  }

  public getHistoryList(): DailyDayRecord[] {
    return Object.values(this.state.history).sort((a, b) => b.date.localeCompare(a.date));
  }

  public getStats() {
    this.recalculateStreak();
    return {
      currentStreak: this.state.currentStreak,
      bestStreak: this.state.bestStreak,
      perfectDaysCount: this.state.perfectDaysCount,
      totalDaysActive: this.state.totalDaysActive,
      easyCycle: this.state.easyCycle.cycle,
      easyProgress: `${this.state.easyCycle.sequenceIndex + 1}/1000`,
      mediumCycle: this.state.mediumCycle.cycle,
      mediumProgress: `${this.state.mediumCycle.sequenceIndex + 1}/1000`,
      hardCycle: this.state.hardCycle.cycle,
      hardProgress: `${this.state.hardCycle.sequenceIndex + 1}/1000`,
    };
  }

  // Developer tool to simulate date forward
  public debugAdvanceDate(daysAhead: number = 1): DailyDayRecord {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = formatLocalDate(d);
    return this.ensureTodayInitialized(dateStr);
  }

  public debugGetRawState(): DailyState {
    return this.state;
  }
}

export const dailyCycleManager = new DailyCycleManager();

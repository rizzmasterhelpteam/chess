# Grandmaster: Offline Android Chess Trainer

A complete, production-grade native Android chess learning and training application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **Room**, **DataStore Preferences**, **Stockfish UCI Engine**, and **Google Mobile Ads SDK (AdMob)**.

---

## 1. Architecture Overview

Grandmaster is built adhering to Google's official **Modern Android Architecture (MVVM + Clean Architecture)** guidelines:

```
android/app/src/main/java/com/grandmaster/chess/
├── ads/                      # Centralized AdMob AdsManager with frequency caps
├── chess/
│   ├── engine/              # Stockfish UCI engine integration & BotLevel configs
│   ├── model/               # Piece, Square, Move, GameStatus models
│   └── rules/               # Native pure Kotlin chess rule engine (FIDE compliant)
├── core/
│   ├── haptics/             # Tactile haptics feedback manager
│   └── sound/               # Low-latency SoundPool audio manager
├── data/
│   ├── datastore/           # Jetpack DataStore Preferences for settings/progress
│   ├── db/                  # Room Database (Entities & DAOs for Lessons, Puzzles, Daily)
│   └── repository/          # Clean repository pattern abstraction
└── ui/
    ├── components/          # Reusable Compose components (ChessBoard, BannerAd)
    ├── features/
    │   ├── bots/            # Play Bot tab & game screens
    │   ├── learn/           # Learn tab, category & interactive lessons
    │   ├── puzzles/         # Daily & Permanent sequential puzzles
    │   └── settings/        # Preferences, statistics, and licenses
    ├── navigation/          # Navigation Compose graph
    └── theme/               # Material 3 dark/light themes & typography
```

---

## 2. How to Build the Android Studio Project

### Prerequisites
- **Android Studio Ladybug (2024.2.1+)** or newer
- **JDK 17** (configured in `Settings > Build, Execution, Deployment > Build Tools > Gradle`)
- **Android SDK Platform 35 (Android 15)**
- **Android NDK** (for native Stockfish compilation if updating engine)

### Steps
1. Open Android Studio.
2. Select **Open** and browse to the `/android` directory.
3. Allow Gradle to perform initial sync.
4. Run tests:
   ```bash
   ./gradlew test
   ```
5. Deploy to an emulator or physical device running Android 8.0+ (API 26+).

---

## 3. Stockfish Engine Integration & Licensing Obligations

### Technical Integration
- Stockfish runs as a local background process communicating via the standard **Universal Chess Interface (UCI)** protocol.
- Engine operations run exclusively on `Dispatchers.IO` and `Dispatchers.Default` to guarantee zero UI thread stutter.
- Engine lifecycle is managed safely: processes are canceled and reaped on game restart, resignation, or screen destruction to prevent zombie processes or stale move execution.

### Bot Difficulties
- **600 (Oliver - Beginner)**: Depth 1 with intentional 40% tactical blunders, missed hanging pieces, and simple development moves.
- **1000 (Maya - Casual)**: Depth 3 with 20% suboptimal choices, understanding basic opening play and captures.
- **1600 (Viktor - Club Player)**: Depth 6 with 5% error margin, punishing obvious tactical mistakes.
- **2200 (Elena - Master)**: Depth 10 with 1% blunder rate, sharp calculation and solid defense.
- **Grandmaster (Stockfish GM)**: Depth 16 with maximum Stockfish evaluation and endgame precision.

### Licensing & Redistribution (GPL-3.0)
Stockfish is distributed under the **GNU General Public License v3.0 (GPL-3.0)**.
- If you redistribute this application with Stockfish, you must provide clear attribution and access to the corresponding engine source code as specified in GPLv3.
- An in-app Licenses screen is included under `Settings > Licenses`.

---

## 4. How Daily Puzzle Rotation Works

### Non-Repeating Shuffled Cycle System
- The app maintains three separate pools of **1,000 puzzles each** for **Easy**, **Medium**, and **Hard** (3,000 daily puzzles total).
- Every calendar day exposes:
  - 1 Easy daily puzzle
  - 1 Medium daily puzzle
  - 1 Hard daily puzzle
- **Non-Repeating Guarantee**: A deterministic Fisher-Yates shuffle generates a 1,000-index sequence per difficulty. Puzzles **never repeat** until all 1,000 have been used.
- **Cycle Transitions**: Once 1,000 days are exhausted, a new cycle begins with a newly seeded permutation. The first puzzle of the new cycle is guaranteed not to match the final puzzle of the previous cycle.
- **Date Stability**: The date is evaluated against local calendar day (`LocalDate.now()`). Opening, closing, or restarting the app **never advances** the daily puzzle until midnight.
- **Streaks**:
  - Completing at least 1 puzzle maintains the **Active Day Streak**.
  - Completing all 3 awards a **Perfect Day** milestone.

---

## 5. Permanent Puzzle Progression (450 Puzzles)

- Sequential tracks:
  - Easy: 1 to 150
  - Medium: 1 to 150
  - Hard: 1 to 150
- Progress is persisted permanently in Room Database and DataStore.
- Solving puzzle `N` automatically unlocks and navigates to puzzle `N+1`.
- Users can review and replay any previously solved puzzle from the track grid.

---

## 6. How Puzzle Data is Stored & Validated

### Format
Puzzles are stored in JSON and Room with the following schema:
```json
{
  "id": "perm_easy_1",
  "track": "permanent",
  "difficulty": "easy",
  "trackIndex": 1,
  "fen": "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
  "sideToMove": "w",
  "theme": "Back-Rank Mate",
  "rating": 750,
  "description": "White can deliver checkmate on the exposed back rank.",
  "solution": [
    { "from": "d1", "to": "d8" }
  ]
}
```

### Automated Validation Tooling
Before shipping, all puzzle datasets are validated through unit tests:
1. `fen` must successfully parse into `ChessRulesEngine`.
2. Every move in `solution` must be mathematically and legally valid in succession.
3. No duplicate IDs across permanent or daily tracks.

---

## 7. How to Replace Google Mobile Ads (AdMob) IDs

In `android/app/src/main/res/values/strings.xml`:
```xml
<!-- Replace with your production AdMob Unit IDs -->
<string name="admob_banner_test_id">YOUR_BANNER_AD_UNIT_ID</string>
<string name="admob_interstitial_test_id">YOUR_INTERSTITIAL_AD_UNIT_ID</string>
```

In `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="YOUR_ADMOB_APPLICATION_ID" />
```

### Frequency Capping & Usability
- Anchored adaptive banners are positioned at the bottom of menus, and automatically hidden during active chessboard gameplay to preserve touch targets.
- Interstitials appear **only at natural breaks**:
  - Every 6 completed permanent puzzles
  - Upon completing all 3 daily puzzles
  - Every 3 completed bot games
- Interstitials respect a strict global cooldown of 2–3 minutes.

---

## 8. 100% Offline Capability

The entire core application—lessons, 450 permanent puzzles, 3,000 daily puzzles, Stockfish bots, local statistics, and settings—runs completely offline without requiring internet access or user accounts.

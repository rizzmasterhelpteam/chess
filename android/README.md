# Learn Chess Android app

This directory contains the native Kotlin/Jetpack Compose implementation of Learn Chess: Tips, Puzzles & Play.

## Current scope

- Compose navigation for Learn, Puzzles, and Play.
- Local lesson progress stored in device preferences.
- Interactive chessboard backed by the Kotlin rules engine.
- Local bot play with five approximate strength labels: 600, 1000, 1600, 2200, and Grandmaster.
- Room schema for lessons, puzzles, daily records, and bot statistics.
- Persistent daily-cycle state with independent deterministic 1,000-entry permutations per difficulty.

The bundled bot is an internal heuristic implementation. It is not Stockfish and does not use the UCI protocol. No Stockfish binary or GPL-licensed engine is distributed by this repository.

## Build

Open this directory in Android Studio with JDK 17 and Android SDK Platform 35. The project targets API 35 and supports API 26+.

Run from this directory:

```bash
./gradlew test
./gradlew assembleDebug
./gradlew lint
```

The release build is intentionally unsigned by default. Configure a private release signing configuration in Gradle/CI; do not add keystores or credentials to source control.

## Daily cycle behavior

Each difficulty keeps its own persisted shuffled permutation of indexes `0..999`. A new local calendar date advances that difficulty by one entry; reopening the app on the same date returns the same puzzle. After the 1,000th entry, a new deterministic cycle is generated and its first entry is prevented from matching the previous cycle's last entry.

## Data and production readiness

The Room schema is ready for asset-backed lesson and puzzle imports, but this repository does not currently claim a validated 3,450-puzzle native dataset or a bundled engine. Release claims must be updated when those assets and validations are added.

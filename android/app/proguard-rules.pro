# Grandmaster Chess ProGuard Rules

# Keep Room entities and DAOs
-keep class androidx.room.** { *; }
-keep class com.grandmaster.chess.data.db.entity.** { *; }
-keep class com.grandmaster.chess.data.db.dao.** { *; }

# Google Mobile Ads
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Stockfish UCI engine process
-keep class com.grandmaster.chess.chess.engine.** { *; }

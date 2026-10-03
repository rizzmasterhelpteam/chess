package com.grandmaster.chess.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val AmberPrimary = Color(0xFFFFB800)
val AmberDark = Color(0xFFD99B00)
val DarkBackground = Color(0xFF0A0A0A)
val DarkSurface = Color(0xFF171717)
val DarkSurfaceVariant = Color(0xFF262626)
val TextPrimaryDark = Color(0xFFEDEDED)
val TextSecondaryDark = Color(0xFFA3A3A3)

private val DarkColorScheme = darkColorScheme(
    primary = AmberPrimary,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF332500),
    onPrimaryContainer = AmberPrimary,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    onSurfaceVariant = TextSecondaryDark
)

private val LightColorScheme = lightColorScheme(
    primary = AmberDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFE6A3),
    onPrimaryContainer = Color(0xFF4A3400),
    background = Color(0xFFF9F9F9),
    surface = Color.White,
    surfaceVariant = Color(0xFFECECEC),
    onBackground = Color(0xFF1C1C1C),
    onSurface = Color(0xFF1C1C1C),
    onSurfaceVariant = Color(0xFF5A5A5A)
)

@Composable
fun GrandmasterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

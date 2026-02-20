package org.bsa.campcard.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ── BSA Brand Colors ───────────────────────────────────────────────────────
val BsaRed    = Color(0xFFCE1126)   // Scout primary / global app primary
val BsaBlue   = Color(0xFF003F87)   // TroopLeader primary / secondary
val BsaGold   = Color(0xFFFFD700)   // Tab active accent
val BsaAmber  = Color(0xFFF59E0B)   // Parent primary (matches RN theme.ts)
val BsaDarkRed = Color(0xFF8B0000)

// ── Semantic Colors (match RN theme.ts) ────────────────────────────────────
val ColorSuccess = Color(0xFF4CAF50)
val ColorWarning = Color(0xFFFF9800)
val ColorInfo    = Color(0xFF2196F3)
val ColorError   = Color(0xFFF44336)

// ── Neutral Palette (match RN theme.ts) ────────────────────────────────────
val ColorBackground  = Color(0xFFF5F5F5)   // Screen bg — was 0xFFFDFBFF
val ColorSurface     = Color(0xFFFFFFFF)   // Card / elevated surface
val ColorBorder      = Color(0xFFE0E0E0)   // Dividers & outlines
val ColorTextPrimary = Color(0xFF212121)
val ColorTextSecond  = Color(0xFF757575)
val ColorDisabled    = Color(0xFFBDBDBD)

private val LightColorScheme = lightColorScheme(
    primary            = BsaRed,
    onPrimary          = Color.White,
    primaryContainer   = Color(0xFFFFDAD6),
    onPrimaryContainer = Color(0xFF410002),
    secondary          = BsaBlue,
    onSecondary        = Color.White,
    secondaryContainer = Color(0xFFD9E2FF),
    onSecondaryContainer = Color(0xFF001356),
    background         = ColorBackground,
    onBackground       = ColorTextPrimary,
    surface            = ColorSurface,
    onSurface          = ColorTextPrimary,
    surfaceVariant     = ColorBorder,
    onSurfaceVariant   = ColorTextSecond,
    error              = ColorError,
    onError            = Color.White,
    errorContainer     = Color(0xFFFFDAD6),
    onErrorContainer   = Color(0xFF410002),
    outline            = ColorBorder
)

private val DarkColorScheme = darkColorScheme(
    primary            = Color(0xFFFFB3AD),
    onPrimary          = Color(0xFF680012),
    primaryContainer   = Color(0xFF920020),
    onPrimaryContainer = Color(0xFFFFDAD6),
    secondary          = Color(0xFFB3C5FF),
    onSecondary        = Color(0xFF00237F),
    secondaryContainer = Color(0xFF00358F),
    onSecondaryContainer = Color(0xFFDBE1FF),
    background         = Color(0xFF1A1C1E),
    onBackground       = Color(0xFFE2E2E6),
    surface            = Color(0xFF2C2C2E),
    onSurface          = Color(0xFFE2E2E6),
    surfaceVariant     = Color(0xFF44474F),
    onSurfaceVariant   = Color(0xFFC4C6D0),
    error              = Color(0xFFFFB4AB),
    onError            = Color(0xFF690005),
    errorContainer     = Color(0xFF93000A),
    onErrorContainer   = Color(0xFFFFDAD6),
    outline            = Color(0xFF8E9099)
)

@Composable
fun CampCardTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

// ── Role-specific accent colors (match RN roleColors in theme.ts) ──────────
fun roleColor(role: String): Color = when (role) {
    "SCOUT"        -> BsaRed
    "TROOP_LEADER" -> BsaBlue
    "PARENT"       -> BsaAmber   // was BsaBlue — now matches RN #F59E0B
    else           -> BsaRed
}

fun roleTabColor(role: String): Color = when (role) {
    "SCOUT"        -> BsaRed
    "TROOP_LEADER" -> BsaBlue
    "PARENT"       -> BsaGold    // Gold #FFD700 matches RN parentTab
    else           -> BsaRed
}

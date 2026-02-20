package org.bsa.campcard.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer brush
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun shimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerTranslate"
    )

    val shimmerColors = listOf(
        MaterialTheme.colorScheme.surfaceVariant,
        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        MaterialTheme.colorScheme.surfaceVariant
    )

    return Brush.linearGradient(
        colors = shimmerColors,
        start = Offset(translateAnim - 300f, 0f),
        end = Offset(translateAnim, 0f)
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Base skeleton block
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun SkeletonBlock(
    modifier: Modifier = Modifier,
    height: Dp = 14.dp,
    cornerRadius: Dp = 6.dp
) {
    Box(
        modifier = modifier
            .height(height)
            .clip(RoundedCornerShape(cornerRadius))
            .background(shimmerBrush())
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Offer grid card skeleton
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun SkeletonOfferCard(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(160.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(shimmerBrush())
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Merchant list row skeleton
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun SkeletonMerchantRow(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(shimmerBrush())
        )
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.weight(1f)
        ) {
            Spacer(Modifier.height(4.dp))
            SkeletonBlock(modifier = Modifier.fillMaxWidth(0.6f), height = 14.dp)
            SkeletonBlock(modifier = Modifier.fillMaxWidth(0.4f), height = 10.dp)
        }
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(shimmerBrush())
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification row skeleton
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun SkeletonNotificationRow(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(shimmerBrush())
        )
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.weight(1f)
        ) {
            SkeletonBlock(modifier = Modifier.fillMaxWidth(0.8f), height = 13.dp)
            SkeletonBlock(modifier = Modifier.fillMaxWidth(), height = 10.dp)
            SkeletonBlock(modifier = Modifier.fillMaxWidth(0.4f), height = 9.dp)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scout dashboard skeleton
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun SkeletonScoutDashboard() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // Active card placeholder
        item {
            Box(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(shimmerBrush())
            )
        }
        // Quick actions header + row
        item {
            Spacer(Modifier.height(16.dp))
            SkeletonBlock(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .width(120.dp),
                height = 16.dp
            )
            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                repeat(3) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(80.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(shimmerBrush())
                    )
                }
            }
        }
        // Featured offers header
        item {
            Spacer(Modifier.height(24.dp))
            SkeletonBlock(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .width(140.dp),
                height = 16.dp
            )
            Spacer(Modifier.height(12.dp))
            // Horizontal row of offer card skeletons
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(3) {
                    Box(
                        modifier = Modifier
                            .width(200.dp)
                            .height(180.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(shimmerBrush())
                    )
                }
            }
        }
    }
}

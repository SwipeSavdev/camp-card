package org.bsa.campcard.features.scout

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.bsa.campcard.ui.theme.BsaRed

// RedemptionSuccessScreen — shown after a successful offer redemption.
// Route: scout_redemption_success?offerTitle={title}&merchantName={name}&discount={discount}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RedemptionSuccessScreen(
    offerTitle: String,
    merchantName: String,
    discount: String,
    onDone: () -> Unit
) {
    var animStarted by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (animStarted) 1f else 0.5f,
        animationSpec = tween(durationMillis = 400),
        label = "success_scale"
    )

    LaunchedEffect(Unit) { animStarted = true }

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Animated checkmark
            Surface(
                shape = CircleShape,
                color = Color(0xFF4CAF50).copy(alpha = 0.12f),
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Redeemed successfully",
                        tint = Color(0xFF4CAF50),
                        modifier = Modifier.size(72.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            Text(
                text = "Offer Redeemed!",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Offer summary card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = discount,
                        style = MaterialTheme.typography.displaySmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = BsaRed
                        )
                    )
                    Text(
                        text = offerTitle,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = merchantName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "A portion of this sale supports your BSA troop's fundraising goal.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = onDone,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Done", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

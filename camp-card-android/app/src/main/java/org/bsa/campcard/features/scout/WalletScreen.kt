package org.bsa.campcard.features.scout

import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.Spring
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.R
import org.bsa.campcard.core.models.CampCard
import org.bsa.campcard.core.models.MyCardsResponse
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaGold
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// QR helper
// ---------------------------------------------------------------------------

private fun generateQrBitmap(content: String, size: Int = 512): ImageBitmap? {
    return try {
        val matrix = MultiFormatWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (matrix[x, y]) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        bitmap.asImageBitmap()
    } catch (e: Exception) { null }
}

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class WalletUiState(
    val isLoading: Boolean = false,
    val cards: MyCardsResponse? = null,
    val activatingCardId: Int? = null,
    val error: String? = null
)

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(WalletUiState())
    val uiState = _uiState.asStateFlow()

    init { viewModelScope.launch { load() } }

    fun refresh() { viewModelScope.launch { load() } }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        try {
            val cards = api.myCards()
            _uiState.update { it.copy(isLoading = false, cards = cards) }
        } catch (e: Exception) {
            _uiState.update { it.copy(isLoading = false, error = e.message ?: "Failed to load cards") }
        }
    }

    fun activateCard(cardId: Int) {
        _uiState.update { it.copy(activatingCardId = cardId) }
        viewModelScope.launch {
            try {
                api.activateCard(cardId)
                load()
            } catch (e: Exception) {
                _uiState.update { it.copy(activatingCardId = null, error = e.message ?: "Failed to activate card") }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    onNavigateToQrCode: () -> Unit,
    onNavigateToCardInventory: () -> Unit = {},
    onNavigateToRedemptionHistory: () -> Unit = {},
    onNavigateToNearbyMerchants: () -> Unit = {},
    viewModel: WalletViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(uiState.error) {
        uiState.error?.let { scope.launch { snackbarHostState.showSnackbar(it, duration = SnackbarDuration.Short) } }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Wallet", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)) },
                actions = { IconButton(onClick = { viewModel.refresh() }) { Icon(Icons.Default.Refresh, "Refresh") } }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        if (uiState.isLoading && uiState.cards == null) {
            Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BsaRed)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(paddingValues),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                if (uiState.isLoading) {
                    item { LinearProgressIndicator(Modifier.fillMaxWidth(), color = BsaRed) }
                }

                // Quick Actions
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AssistChip(onClick = onNavigateToRedemptionHistory, label = { Text("History") },
                            leadingIcon = { Icon(Icons.Default.History, null, Modifier.size(16.dp)) },
                            modifier = Modifier.weight(1f))
                        AssistChip(onClick = onNavigateToNearbyMerchants, label = { Text("Nearby") },
                            leadingIcon = { Icon(Icons.Default.CheckCircle, null, Modifier.size(16.dp)) },
                            modifier = Modifier.weight(1f))
                        AssistChip(onClick = onNavigateToCardInventory, label = { Text("All Cards") },
                            leadingIcon = { Icon(Icons.Default.CreditCard, null, Modifier.size(16.dp)) },
                            modifier = Modifier.weight(1f))
                    }
                }

                // Active Card section
                item {
                    SectionHeader(Icons.Default.CreditCard, "Active Card",
                        Modifier.padding(horizontal = 16.dp, vertical = 12.dp))
                }

                val activeCard = uiState.cards?.activeCard
                if (activeCard != null) {
                    item {
                        FlipCard(
                            card = activeCard,
                            onShowQrCode = onNavigateToQrCode,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                } else {
                    item {
                        EmptySection(
                            message = "No active card",
                            subMessage = "Activate one of your unused cards below",
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }

                // Unused Cards
                val unusedCards = uiState.cards?.unusedCards.orEmpty()
                if (unusedCards.isNotEmpty()) {
                    item { SectionHeader(Icons.Default.CreditCard, "Unused Cards (${unusedCards.size})",
                        Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) }
                    items(unusedCards, key = { it.id }) { card ->
                        CardListItem(card = card, statusLabel = "Unused",
                            statusColor = MaterialTheme.colorScheme.tertiary,
                            actionLabel = "Activate",
                            isActionLoading = uiState.activatingCardId == card.id,
                            onAction = { viewModel.activateCard(card.id) },
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
                    }
                }

                // Gifted Cards
                val giftedCards = uiState.cards?.giftedCards.orEmpty()
                if (giftedCards.isNotEmpty()) {
                    item { SectionHeader(Icons.Default.CardGiftcard, "Gifted Cards (${giftedCards.size})",
                        Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) }
                    items(giftedCards, key = { "gift_${it.id}" }) { card ->
                        CardListItem(card = card, statusLabel = "Gifted", statusColor = BsaGold,
                            actionLabel = null, isActionLoading = false, onAction = {},
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                            subtitle = card.giftedToEmail?.let { "To: $it" })
                    }
                }

                // Expired Cards
                val expiredCards = uiState.cards?.expiredCards.orEmpty()
                if (expiredCards.isNotEmpty()) {
                    item { SectionHeader(Icons.Default.History, "Expired Cards (${expiredCards.size})",
                        Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) }
                    items(expiredCards, key = { "exp_${it.id}" }) { card ->
                        CardListItem(card = card, statusLabel = "Expired",
                            statusColor = MaterialTheme.colorScheme.outline,
                            actionLabel = null, isActionLoading = false, onAction = {},
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Flip card (front = campcard_skin.jpg, back = navy with details)
// ---------------------------------------------------------------------------

@Composable
private fun FlipCard(
    card: CampCard,
    onShowQrCode: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isFlipped by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = Spring.StiffnessMedium),
        label = "cardFlip"
    )

    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.586f) // standard card ratio
        ) {
            // Front face
            CardFront(
                card = card,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        rotationY = rotation
                        cameraDistance = 12f * density
                        alpha = if (rotation <= 90f) 1f else 0f
                    }
            )
            // Back face
            CardBack(
                card = card,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        rotationY = rotation - 180f
                        cameraDistance = 12f * density
                        alpha = if (rotation > 90f) 1f else 0f
                    }
            )
        }

        Spacer(Modifier.height(8.dp))

        // Flip button
        Surface(
            onClick = { isFlipped = !isFlipped },
            shape = RoundedCornerShape(20.dp),
            color = BsaRed.copy(alpha = 0.12f),
            modifier = Modifier.height(34.dp)
        ) {
            Box(Modifier.padding(horizontal = 20.dp), contentAlignment = Alignment.Center) {
                Text(
                    text = if (isFlipped) "View Front" else "Flip",
                    style = MaterialTheme.typography.labelMedium.copy(
                        color = BsaRed, fontWeight = FontWeight.SemiBold
                    )
                )
            }
        }

        Spacer(Modifier.height(8.dp))

        FilledTonalButton(onClick = onShowQrCode, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Default.QrCode, null, Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Show Full-Screen QR")
        }
    }
}

@Composable
private fun CardFront(card: CampCard, modifier: Modifier = Modifier) {
    val statusColor = when (card.status.uppercase()) {
        "ACTIVE" -> Color(0xFF27AE60)
        "PENDING" -> Color(0xFFF39C12)
        else -> Color(0xFF95A5A6)
    }

    Box(modifier = modifier.clip(RoundedCornerShape(16.dp))) {
        Image(
            painter = painterResource(R.drawable.campcard_skin),
            contentDescription = "Camp Card",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        // Status badge top-right
        Surface(
            color = statusColor,
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.align(Alignment.TopEnd).padding(12.dp)
        ) {
            Text(
                text = card.status.replaceFirstChar { it.uppercase() },
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color.White, fontWeight = FontWeight.Bold
                )
            )
        }
    }
}

@Composable
private fun CardBack(card: CampCard, modifier: Modifier = Modifier) {
    val qrBitmap = remember(card.uuid) { generateQrBitmap(card.uuid, 200) }
    val navy = Color(0xFF001A3A)

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(navy)
            .graphicsLayer { rotationY = 180f } // mirror so text reads correctly when flipped
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Magnetic strip
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp)
                    .height(40.dp)
                    .background(Color(0xFF1A1A1A))
            )

            // Card details
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val number = card.cardNumber?.chunked(4)?.joinToString(" ") ?: card.uuid.take(16)
                CardDetailRow("NUMBER", number)
                val name = listOfNotNull(card.scoutName).firstOrNull() ?: "Camp Card Member"
                CardDetailRow("MEMBER", name)
                card.expiresAt?.take(10)?.let { CardDetailRow("VALID THRU", it) }
                card.activatedAt?.take(10)?.let { CardDetailRow("MEMBER SINCE", it) }
                card.totalSavings?.let {
                    CardDetailRow("TOTAL SAVINGS", "$${String.format("%.2f", it)}")
                }
            }
        }

        // QR code bottom-right
        if (qrBitmap != null) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(12.dp)
                    .background(Color.White, RoundedCornerShape(4.dp))
                    .padding(4.dp)
            ) {
                Image(
                    bitmap = qrBitmap,
                    contentDescription = "Card QR",
                    modifier = Modifier.size(60.dp)
                )
            }
        }
    }
}

@Composable
private fun CardDetailRow(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall.copy(
            color = Color.White.copy(alpha = 0.5f), fontSize = 9.sp, letterSpacing = 1.sp))
        Text(value, style = MaterialTheme.typography.bodySmall.copy(
            color = Color.White, fontWeight = FontWeight.SemiBold))
    }
}

// ---------------------------------------------------------------------------
// Card list item (unused / gifted / expired)
// ---------------------------------------------------------------------------

@Composable
private fun CardListItem(
    card: CampCard,
    statusLabel: String,
    statusColor: Color,
    actionLabel: String?,
    isActionLoading: Boolean,
    onAction: () -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null
) {
    Card(modifier = modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.CreditCard, null, tint = statusColor, modifier = Modifier.size(32.dp))
                Column {
                    Text(card.cardNumber ?: card.uuid.take(12) + "...",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                        maxLines = 1, overflow = TextOverflow.Ellipsis)
                    if (subtitle != null) {
                        Text(subtitle, style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    Surface(color = statusColor.copy(alpha = 0.12f), shape = MaterialTheme.shapes.extraSmall) {
                        Text(statusLabel, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall, color = statusColor)
                    }
                }
            }
            if (actionLabel != null) {
                if (isActionLoading) {
                    CircularProgressIndicator(Modifier.size(24.dp), color = BsaRed, strokeWidth = 2.dp)
                } else {
                    FilledTonalButton(onClick = onAction, contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)) {
                        Text(actionLabel, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

@Composable
private fun SectionHeader(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    modifier: Modifier = Modifier
) {
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Icon(icon, null, tint = BsaRed, modifier = Modifier.size(20.dp))
        Text(title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold))
    }
}

@Composable
private fun EmptySection(message: String, subMessage: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.CreditCard, null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(32.dp))
            Spacer(Modifier.height(8.dp))
            Text(message, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold))
            Text(subMessage, style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

package org.bsa.campcard.features.scout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil.compose.AsyncImage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.core.models.CampCard
import org.bsa.campcard.core.models.MyCardsResponse
import org.bsa.campcard.core.models.Offer
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.components.SkeletonScoutDashboard
import org.bsa.campcard.ui.theme.BsaDarkRed
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class ScoutHomeUiState(
    val isLoading: Boolean = false,
    val cards: MyCardsResponse? = null,
    val featuredOffers: List<Offer> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class ScoutHomeViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScoutHomeUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch { load() }
    }

    fun refresh() {
        viewModelScope.launch { load() }
    }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        try {
            val cardsDeferred = viewModelScope.async { api.myCards() }
            val offersDeferred = viewModelScope.async { api.getFeaturedOffers() }
            val cards = cardsDeferred.await()
            val offers = offersDeferred.await().content
            _uiState.update {
                it.copy(
                    isLoading = false,
                    cards = cards,
                    featuredOffers = offers
                )
            }
        } catch (e: Exception) {
            _uiState.update {
                it.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load dashboard"
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScoutHomeScreen(
    authViewModel: AuthViewModel,
    onNavigateToQrCode: () -> Unit,
    onNavigateToWallet: () -> Unit,
    onNavigateToReferral: () -> Unit,
    viewModel: ScoutHomeViewModel = hiltViewModel()
) {
    val authState by authViewModel.state.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    val firstName = authState.user?.firstName ?: "Scout"
    val activeCard = uiState.cards?.activeCard

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Welcome back,",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = firstName,
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (uiState.isLoading && uiState.cards == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                SkeletonScoutDashboard()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                // Loading indicator at top when refreshing
                if (uiState.isLoading) {
                    item {
                        LinearProgressIndicator(
                            modifier = Modifier.fillMaxWidth(),
                            color = BsaRed
                        )
                    }
                }

                // Error banner
                uiState.error?.let { error ->
                    item {
                        Surface(
                            color = MaterialTheme.colorScheme.errorContainer,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = error,
                                modifier = Modifier.padding(12.dp),
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }

                // Active card preview
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    ActiveCardPreview(
                        card = activeCard,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }

                // Quick actions
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = "Quick Actions",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    QuickActionsRow(
                        onMyCards = onNavigateToWallet,
                        onReferrals = onNavigateToReferral,
                        onQrCode = onNavigateToQrCode,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }

                // Featured offers
                if (uiState.featuredOffers.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                        Row(
                            modifier = Modifier.padding(horizontal = 16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Star,
                                contentDescription = null,
                                tint = BsaRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Featured Offers",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    item {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(uiState.featuredOffers) { offer ->
                                FeaturedOfferCard(offer = offer)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Active card preview component
// ---------------------------------------------------------------------------

@Composable
private fun ActiveCardPreview(
    card: CampCard?,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(180.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(BsaRed, BsaDarkRed)
                )
            )
            .padding(20.dp)
    ) {
        if (card != null) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = "Camp Card",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White.copy(alpha = 0.25f)
                    ) {
                        Text(
                            text = "ACTIVE",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }

                Column {
                    Text(
                        text = card.cardNumber
                            ?.chunked(4)?.joinToString(" ")
                            ?: "\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022",
                        style = MaterialTheme.typography.titleLarge.copy(
                            color = Color.White,
                            letterSpacing = 2.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        val offersUsed = card.offersUsed ?: 0
                        val totalOffers = card.totalOffers ?: 0
                        Text(
                            text = "$offersUsed / $totalOffers offers used",
                            style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.85f))
                        )
                        card.expiresAt?.let { expiry ->
                            Text(
                                text = "Exp: ${expiry.take(10)}",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.85f))
                            )
                        }
                    }
                }
            }
        } else {
            // No active card placeholder
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.CreditCard,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.size(40.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "No active card",
                    style = MaterialTheme.typography.bodyLarge.copy(color = Color.White.copy(alpha = 0.85f))
                )
                Text(
                    text = "Purchase a Camp Card to get started",
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.65f))
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Quick actions row
// ---------------------------------------------------------------------------

private data class QuickAction(
    val label: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)

@Composable
private fun QuickActionsRow(
    onMyCards: () -> Unit,
    onReferrals: () -> Unit,
    onQrCode: () -> Unit,
    modifier: Modifier = Modifier
) {
    val actions = listOf(
        QuickAction("My Cards", Icons.Default.CreditCard, onMyCards),
        QuickAction("Referrals", Icons.Default.People, onReferrals),
        QuickAction("QR Code", Icons.Default.QrCode, onQrCode)
    )

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        actions.forEach { action ->
            Card(
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClickLabel = action.label, onClick = action.onClick),
                colors = CardDefaults.cardColors(
                    containerColor = BsaRed.copy(alpha = 0.08f)
                ),
                shape = MaterialTheme.shapes.medium
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = action.icon,
                        contentDescription = null,
                        tint = BsaRed,
                        modifier = Modifier.size(28.dp)
                    )
                    Text(
                        text = action.label,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Featured offer card
// ---------------------------------------------------------------------------

@Composable
private fun FeaturedOfferCard(offer: Offer) {
    Card(
        modifier = Modifier.width(200.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Merchant logo / image
            if (!offer.imageUrl.isNullOrBlank()) {
                AsyncImage(
                    model = offer.imageUrl,
                    contentDescription = offer.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                )
            } else if (!offer.merchantLogoUrl.isNullOrBlank()) {
                AsyncImage(
                    model = offer.merchantLogoUrl,
                    contentDescription = offer.merchantName,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .background(
                            color = BsaRed.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocalOffer,
                        contentDescription = null,
                        tint = BsaRed,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Column(modifier = Modifier.padding(12.dp)) {
                // Discount badge
                Surface(
                    color = BsaRed,
                    shape = MaterialTheme.shapes.extraSmall
                ) {
                    Text(
                        text = offer.displayDiscount,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = offer.title,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = offer.merchantName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

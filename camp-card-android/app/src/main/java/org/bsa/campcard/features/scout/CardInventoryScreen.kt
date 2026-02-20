package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.CampCard
import org.bsa.campcard.core.models.MyCardsResponse
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class CardInventoryUiState(
    val isLoading: Boolean = false,
    val cards: MyCardsResponse? = null,
    val error: String? = null
)

@HiltViewModel
class CardInventoryViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {

    private val _uiState = MutableStateFlow(CardInventoryUiState())
    val uiState = _uiState.asStateFlow()

    init { viewModelScope.launch { load() } }

    fun refresh() { viewModelScope.launch { load() } }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        try {
            val cards = api.myCards()
            _uiState.update { it.copy(isLoading = false, cards = cards) }
        } catch (e: Exception) {
            _uiState.update { it.copy(isLoading = false, error = e.message) }
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CardInventoryScreen(
    onNavigateBack: () -> Unit,
    onGiftCard: (cardId: Int) -> Unit,
    onReplenishCard: (cardId: Int) -> Unit,
    viewModel: CardInventoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Group cards by status
    val allCards = buildList {
        uiState.cards?.activeCard?.let { add(it) }
        addAll(uiState.cards?.unusedCards ?: emptyList())
        addAll(uiState.cards?.giftedCards ?: emptyList())
        addAll(uiState.cards?.expiredCards ?: emptyList())
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Cards") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.Refresh, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoading && uiState.cards == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BsaRed)
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (uiState.isLoading) {
                item { LinearProgressIndicator(modifier = Modifier.fillMaxWidth(), color = BsaRed) }
            }

            uiState.error?.let { err ->
                item {
                    Surface(
                        color = MaterialTheme.colorScheme.errorContainer,
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            err,
                            modifier = Modifier.padding(12.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }

            if (allCards.isEmpty() && !uiState.isLoading) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.CardGiftcard,
                                null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(Modifier.height(12.dp))
                            Text(
                                "No cards yet",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                "Purchase a Camp Card to get started.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            }

            items(allCards) { card ->
                CardInventoryItem(
                    card = card,
                    onGift = { onGiftCard(card.id) },
                    onReplenish = { onReplenishCard(card.id) }
                )
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Card row
// ---------------------------------------------------------------------------

@Composable
private fun CardInventoryItem(
    card: CampCard,
    onGift: () -> Unit,
    onReplenish: () -> Unit
) {
    val statusColor = when (card.status.uppercase()) {
        "ACTIVE" -> Color(0xFF4CAF50)
        "UNUSED" -> BsaRed
        "GIFTED" -> Color(0xFF9C27B0)
        "EXPIRED" -> Color(0xFF9E9E9E)
        "REDEEMED" -> Color(0xFF2196F3)
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = card.cardNumber?.let { "•••• ${it.takeLast(4)}" } ?: "Camp Card",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                    )
                    Text(
                        text = "${card.offersUsed ?: 0} / ${card.totalOffers ?: 0} offers used",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = statusColor.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = card.status,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = statusColor,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            card.expiresAt?.let { expiry ->
                Text(
                    text = "Expires: ${expiry.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Actions
            if (card.status == "ACTIVE" || card.status == "UNUSED") {
                Row(
                    modifier = Modifier.padding(top = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onGift,
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        Text("Gift Card", style = MaterialTheme.typography.labelMedium)
                    }
                    if (card.status == "UNUSED") {
                        Button(
                            onClick = onReplenish,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            Text("Activate", style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        }
    }
}

package org.bsa.campcard.features.parent

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardMembership
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.Merchant
import org.bsa.campcard.core.models.Offer
import org.bsa.campcard.core.models.User
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaAmber
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaRed
import org.bsa.campcard.ui.theme.BsaGold
import java.util.Locale
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class ParentHomeState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val featuredOffers: List<Offer> = emptyList(),
    val merchants: List<Merchant> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class ParentHomeViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(ParentHomeState())
    val state: StateFlow<ParentHomeState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val userDeferred = async { api.getProfile() }
                val offersDeferred = async { api.getFeaturedOffers() }
                val merchantsDeferred = async { api.getMerchants(size = 5) }

                val user = userDeferred.await()
                val offers = offersDeferred.await().content
                val merchants = merchantsDeferred.await().content

                _state.update {
                    it.copy(
                        isLoading = false,
                        user = user,
                        featuredOffers = offers,
                        merchants = merchants
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load") }
            }
        }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParentHomeScreen(
    viewModel: ParentHomeViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Camp Card", color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaAmber)
            )
        }
    ) { innerPadding ->
        when {
            state.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = BsaAmber)
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    // Greeting
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 20.dp)
                        ) {
                            val name = state.user?.firstName ?: "there"
                            Text(
                                text = "Welcome back, $name!",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = BsaAmber
                            )
                            Text(
                                text = "Support your scout's fundraising today.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Subscription upsell banner (shown if no active subscription)
                    val hasSubscription = state.user?.hasActiveSubscription == true
                    if (!hasSubscription) {
                        item {
                            SubscriptionUpsellBanner(
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }

                    // Featured Offers section
                    if (state.featuredOffers.isNotEmpty()) {
                        item {
                            SectionHeader(
                                title = "Featured Offers",
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(state.featuredOffers) { offer ->
                                    FeaturedOfferCard(offer = offer)
                                }
                            }
                            Spacer(modifier = Modifier.height(20.dp))
                        }
                    }

                    // Recent Merchants section
                    if (state.merchants.isNotEmpty()) {
                        item {
                            SectionHeader(
                                title = "Merchants Near You",
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                        items(state.merchants) { merchant ->
                            MerchantListItem(
                                merchant = merchant,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                            )
                        }
                    }

                    if (state.error != null) {
                        item {
                            Text(
                                text = state.error ?: "",
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SubscriptionUpsellBanner(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = BsaGold),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.CardMembership,
                contentDescription = null,
                tint = BsaBlue,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Get a Camp Card",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = BsaAmber
                )
                Text(
                    text = "Support your scout and save at local merchants.",
                    style = MaterialTheme.typography.bodySmall,
                    color = BsaBlue.copy(alpha = 0.8f)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = { /* Navigate to subscription */ },
                colors = ButtonDefaults.buttonColors(containerColor = BsaAmber),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text("Get Card", color = Color.White, style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

@Composable
private fun FeaturedOfferCard(offer: Offer) {
    Card(
        modifier = Modifier
            .width(200.dp)
            .height(140.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Discount badge
            Card(
                shape = RoundedCornerShape(6.dp),
                colors = CardDefaults.cardColors(containerColor = BsaAmber)
            ) {
                Text(
                    text = offer.displayDiscount,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = offer.title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2
            )
            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = offer.merchantName,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun MerchantListItem(merchant: Merchant, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Filled.Store,
                    contentDescription = null,
                    tint = BsaBlue,
                    modifier = Modifier.size(32.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = merchant.businessName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                merchant.category?.let { category ->
                    Text(
                        text = category,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            val locationCount = merchant.locations?.size ?: 0
            Text(
                text = "$locationCount loc${if (locationCount != 1) "s" else ""}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SectionHeader(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = BsaAmber,
        modifier = modifier
    )
}

package org.bsa.campcard.features.shared

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import org.bsa.campcard.core.models.MerchantLocation
import org.bsa.campcard.core.models.Offer
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaBlue
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class MerchantDetailState(
    val isLoading: Boolean = false,
    val merchant: Merchant? = null,
    val offers: List<Offer> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class MerchantDetailViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(MerchantDetailState())
    val state: StateFlow<MerchantDetailState> = _state.asStateFlow()

    fun loadMerchant(merchantId: Int) {
        if (_state.value.merchant?.id == merchantId) return
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val merchantDeferred = async { api.getMerchant(merchantId) }
                val offersDeferred = async { api.getOffers(merchantId = merchantId) }

                val merchant = merchantDeferred.await()
                val offers = offersDeferred.await().content

                _state.update {
                    it.copy(isLoading = false, merchant = merchant, offers = offers)
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load merchant") }
            }
        }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MerchantDetailScreen(
    merchantId: Int,
    onNavigateBack: () -> Unit,
    onNavigateToOffer: (Int) -> Unit = {},
    viewModel: MerchantDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(merchantId) {
        viewModel.loadMerchant(merchantId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = state.merchant?.businessName ?: "Merchant",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue)
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
                    CircularProgressIndicator(color = BsaBlue)
                }
            }

            state.merchant != null -> {
                MerchantDetailContent(
                    merchant = state.merchant!!,
                    offers = state.offers,
                    onOfferClick = onNavigateToOffer,
                    modifier = Modifier.padding(innerPadding)
                )
            }

            state.error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = state.error ?: "Error", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
private fun MerchantDetailContent(
    merchant: Merchant,
    offers: List<Offer>,
    onOfferClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        // Merchant header
        item {
            MerchantHeaderCard(merchant = merchant)
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Locations section
        if (!merchant.locations.isNullOrEmpty()) {
            item {
                SectionTitle(
                    title = "Locations (${merchant.locations.size})",
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                )
            }
            items(merchant.locations) { location ->
                LocationCard(
                    location = location,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
        }

        // Divider
        item { HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) }

        // Offers from this merchant
        if (offers.isNotEmpty()) {
            item {
                SectionTitle(
                    title = "Offers (${offers.size})",
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
            items(offers, key = { it.id }) { offer ->
                MerchantOfferRow(
                    offer = offer,
                    onClick = { onOfferClick(offer.id) },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
        } else {
            item {
                Text(
                    text = "No active offers from this merchant.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun MerchantHeaderCard(merchant: Merchant) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BsaBlue),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Card(
                modifier = Modifier.size(64.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.2f))
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.Store,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.size(16.dp))
            Column {
                Text(
                    text = merchant.businessName,
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                merchant.category?.let { category ->
                    Text(
                        text = category,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.85f)
                    )
                }
                merchant.description?.let { desc ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = desc,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.75f),
                        maxLines = 2
                    )
                }
            }
        }
    }
}

@Composable
private fun LocationCard(location: MerchantLocation, modifier: Modifier = Modifier) {
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
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                Icons.Filled.LocationOn,
                contentDescription = null,
                tint = BsaBlue,
                modifier = Modifier
                    .size(20.dp)
                    .padding(top = 2.dp)
            )
            Spacer(modifier = Modifier.size(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                location.locationName?.let { name ->
                    Text(
                        text = name,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Text(
                    text = "${location.streetAddress}, ${location.city}, ${location.state} ${location.zipCode}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                location.phone?.let { phone ->
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.Phone,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.size(4.dp))
                        Text(
                            text = phone,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                location.hours?.let { hours ->
                    Text(
                        text = hours,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MerchantOfferRow(offer: Offer, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Card(
        onClick = onClick,
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
            Card(
                shape = RoundedCornerShape(6.dp),
                colors = CardDefaults.cardColors(containerColor = BsaBlue)
            ) {
                Text(
                    text = offer.displayDiscount,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
            Spacer(modifier = Modifier.size(10.dp))
            Text(
                text = offer.title,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.weight(1f),
                maxLines = 2
            )
        }
    }
}

@Composable
private fun SectionTitle(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = BsaBlue,
        modifier = modifier
    )
}

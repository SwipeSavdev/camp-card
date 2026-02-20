package org.bsa.campcard.features.shared

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Intent
import android.net.Uri
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.Merchant
import org.bsa.campcard.core.models.MerchantLocation
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

@HiltViewModel
class NearbyMerchantsViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {
    data class UiState(
        val isLoading: Boolean = false,
        val merchants: List<Merchant> = emptyList(),
        val error: String? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadMerchants()
    }

    fun loadMerchants() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val page = api.getMerchants(page = 0, size = 100)
                _uiState.update { it.copy(isLoading = false, merchants = page.content) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "Could not load merchants.") }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NearbyMerchantsScreen(
    onMerchantClick: (Int) -> Unit = {},
    onNavigateBack: () -> Unit
) {
    val viewModel: NearbyMerchantsViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nearby Merchants", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaRed)
            )
        }
    ) { padding ->
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = BsaRed)
                }
            }

            uiState.error != null -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(Icons.Default.Store, null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(56.dp))
                        Text(uiState.error!!, textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.error)
                        Button(
                            onClick = { viewModel.loadMerchants() },
                            colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
                        ) {
                            Text("Retry")
                        }
                    }
                }
            }

            uiState.merchants.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(Icons.Default.Store, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(64.dp))
                        Spacer(Modifier.height(12.dp))
                        Text("No merchants available", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(uiState.merchants) { merchant ->
                        MerchantLocationCard(
                            merchant = merchant,
                            onClick = { onMerchantClick(merchant.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MerchantLocationCard(
    merchant: Merchant,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    val primaryLocation = merchant.locations?.firstOrNull { it.primaryLocation == true }
        ?: merchant.locations?.firstOrNull()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable(onClick = onClick)
            .semantics { contentDescription = merchant.businessName },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = BsaRed.copy(alpha = 0.1f),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Store, null, tint = BsaRed, modifier = Modifier.size(22.dp))
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(merchant.businessName, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
                    merchant.category?.let { cat ->
                        Text(cat, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            if (primaryLocation != null) {
                Spacer(Modifier.height(10.dp))
                LocationRow(
                    location = primaryLocation,
                    onMapClick = {
                        val addr = Uri.encode("${primaryLocation.streetAddress}, ${primaryLocation.city}, ${primaryLocation.state}")
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$addr"))
                        context.startActivity(intent)
                    }
                )
                primaryLocation.phone?.let { phone ->
                    Spacer(Modifier.height(6.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
                            context.startActivity(intent)
                        }
                    ) {
                        Icon(Icons.Default.Phone, null, tint = BsaRed, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(phone, style = MaterialTheme.typography.bodySmall, color = BsaRed)
                    }
                }
            }
        }
    }
}

@Composable
private fun LocationRow(location: MerchantLocation, onMapClick: () -> Unit) {
    val addressLine = "${location.streetAddress}, ${location.city}, ${location.state} ${location.zipCode}"
    Row(
        verticalAlignment = Alignment.Top,
        modifier = Modifier.clickable { onMapClick() }
    ) {
        Icon(Icons.Default.LocationOn, null, tint = BsaRed, modifier = Modifier.size(16.dp).padding(top = 2.dp))
        Spacer(Modifier.width(6.dp))
        Text(
            addressLine,
            style = MaterialTheme.typography.bodySmall,
            color = BsaRed
        )
    }
}

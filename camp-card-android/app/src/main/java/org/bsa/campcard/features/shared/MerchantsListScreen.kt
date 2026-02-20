package org.bsa.campcard.features.shared

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SearchBar
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.Merchant
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.components.SkeletonMerchantRow
import org.bsa.campcard.ui.theme.BsaBlue
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class MerchantsListState(
    val isLoading: Boolean = false,
    val allMerchants: List<Merchant> = emptyList(),
    val filteredMerchants: List<Merchant> = emptyList(),
    val searchQuery: String = "",
    val error: String? = null
)

@HiltViewModel
class MerchantsListViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(MerchantsListState())
    val state: StateFlow<MerchantsListState> = _state.asStateFlow()

    init {
        loadMerchants()
    }

    fun loadMerchants() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val merchants = api.getMerchants(size = 100).content
                _state.update {
                    it.copy(isLoading = false, allMerchants = merchants, filteredMerchants = merchants)
                }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load merchants") }
            }
        }
    }

    fun onSearchQueryChange(query: String) {
        _state.update { it.copy(searchQuery = query) }
        val current = _state.value
        val filtered = if (query.isBlank()) {
            current.allMerchants
        } else {
            val q = query.lowercase()
            current.allMerchants.filter { merchant ->
                merchant.businessName.lowercase().contains(q) ||
                    merchant.category?.lowercase()?.contains(q) == true ||
                    merchant.description?.lowercase()?.contains(q) == true
            }
        }
        _state.update { it.copy(filteredMerchants = filtered) }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MerchantsListScreen(
    navController: NavController,
    outerNavController: NavController,
    viewModel: MerchantsListViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var isSearchActive by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            if (!isSearchActive) {
                TopAppBar(
                    title = { Text("Merchants", color = Color.White, fontWeight = FontWeight.Bold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue)
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Search bar
            SearchBar(
                query = state.searchQuery,
                onQueryChange = { viewModel.onSearchQueryChange(it) },
                onSearch = { isSearchActive = false },
                active = isSearchActive,
                onActiveChange = { isSearchActive = it },
                placeholder = { Text("Search merchants") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = if (isSearchActive) 0.dp else 16.dp, vertical = 8.dp),
                colors = SearchBarDefaults.colors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                // No suggestions overlay
            }

            when {
                state.isLoading -> {
                    LazyColumn(
                        contentPadding = PaddingValues(vertical = 8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(count = 8) {
                            SkeletonMerchantRow()
                        }
                    }
                }

                state.error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = state.error ?: "Error", color = MaterialTheme.colorScheme.error)
                    }
                }

                state.filteredMerchants.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No merchants found.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(state.filteredMerchants, key = { it.id }) { merchant ->
                            MerchantCard(
                                merchant = merchant,
                                onClick = {
                                    outerNavController.navigate("merchant_detail/${merchant.id}")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MerchantCard(merchant: Merchant, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Logo placeholder
            Card(
                modifier = Modifier.size(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.Store,
                        contentDescription = null,
                        tint = BsaBlue,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = merchant.businessName,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold
                )
                merchant.category?.let { category ->
                    Text(
                        text = category,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                val locationCount = merchant.locations?.size ?: 0
                if (locationCount > 0) {
                    Text(
                        text = "$locationCount location${if (locationCount != 1) "s" else ""}",
                        style = MaterialTheme.typography.labelSmall,
                        color = BsaBlue
                    )
                }
            }

            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

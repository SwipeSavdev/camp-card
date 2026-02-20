package org.bsa.campcard.features.shared

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
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
import org.bsa.campcard.core.models.Offer
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.components.SkeletonOfferCard
import org.bsa.campcard.ui.theme.BsaBlue
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class OffersListState(
    val isLoading: Boolean = false,
    val allOffers: List<Offer> = emptyList(),
    val filteredOffers: List<Offer> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: String? = null,
    val error: String? = null
)

private val OFFER_CATEGORIES = listOf(
    "All", "Food", "Retail", "Services", "Entertainment", "Health", "Auto", "Other"
)

@HiltViewModel
class OffersListViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(OffersListState())
    val state: StateFlow<OffersListState> = _state.asStateFlow()

    init {
        loadOffers()
    }

    fun loadOffers() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val offers = api.getOffers(size = 100).content
                _state.update { it.copy(isLoading = false, allOffers = offers) }
                applyFilters()
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load offers") }
            }
        }
    }

    fun onSearchQueryChange(query: String) {
        _state.update { it.copy(searchQuery = query) }
        applyFilters()
    }

    fun onCategorySelected(category: String?) {
        val resolved = if (category == "All") null else category
        _state.update { it.copy(selectedCategory = resolved) }
        applyFilters()
    }

    private fun applyFilters() {
        val current = _state.value
        var filtered = current.allOffers

        if (current.searchQuery.isNotBlank()) {
            val query = current.searchQuery.lowercase()
            filtered = filtered.filter { offer ->
                offer.title.lowercase().contains(query) ||
                    offer.merchantName.lowercase().contains(query) ||
                    (offer.description.lowercase().contains(query))
            }
        }

        current.selectedCategory?.let { category ->
            filtered = filtered.filter { it.category?.equals(category, ignoreCase = true) == true }
        }

        _state.update { it.copy(filteredOffers = filtered) }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OffersListScreen(
    navController: NavController,
    outerNavController: NavController,
    viewModel: OffersListViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var isSearchActive by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            if (!isSearchActive) {
                TopAppBar(
                    title = { Text("Offers", color = Color.White, fontWeight = FontWeight.Bold) },
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
                placeholder = { Text("Search offers or merchants") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = if (isSearchActive) 0.dp else 16.dp, vertical = 8.dp),
                colors = SearchBarDefaults.colors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                // No search suggestions overlay needed
            }

            // Category filter chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(OFFER_CATEGORIES) { category ->
                    val isSelected = when (category) {
                        "All" -> state.selectedCategory == null
                        else -> state.selectedCategory == category
                    }
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.onCategorySelected(category) },
                        label = { Text(category) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BsaBlue,
                            selectedLabelColor = Color.White,
                            selectedLeadingIconColor = Color.White
                        )
                    )
                }
            }

            when {
                state.isLoading -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(count = 6) {
                            SkeletonOfferCard()
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

                state.filteredOffers.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No offers found.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                else -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(state.filteredOffers, key = { it.id }) { offer ->
                            OfferGridCard(
                                offer = offer,
                                onClick = {
                                    outerNavController.navigate("offer_detail/${offer.id}")
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
fun OfferGridCard(offer: Offer, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .semantics { contentDescription = "${offer.title} by ${offer.merchantName}, ${offer.displayDiscount} discount" },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
        ) {
            // Discount badge
            Card(
                shape = RoundedCornerShape(6.dp),
                colors = CardDefaults.cardColors(containerColor = BsaBlue)
            ) {
                Text(
                    text = offer.displayDiscount,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }

            // Title
            Text(
                text = offer.title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                modifier = Modifier
                    .padding(top = 8.dp)
                    .weight(1f)
            )

            // Merchant name
            Text(
                text = offer.merchantName,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1
            )
        }
    }
}

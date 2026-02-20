package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import org.bsa.campcard.core.models.RedemptionRecord
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

@HiltViewModel
class RedemptionHistoryViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {

    data class UiState(
        val isLoading: Boolean = false,
        val records: List<RedemptionRecord> = emptyList(),
        val error: String? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState = _uiState.asStateFlow()

    init { viewModelScope.launch { load() } }

    fun refresh() { viewModelScope.launch { load() } }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        try {
            val me = api.me()
            val page = api.getRedemptionHistory(userId = me.id)
            _uiState.update { it.copy(isLoading = false, records = page.content) }
        } catch (e: Exception) {
            _uiState.update { it.copy(isLoading = false, error = e.message) }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RedemptionHistoryScreen(
    onNavigateBack: () -> Unit,
    viewModel: RedemptionHistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Redemption History") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.History, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.History, "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoading && uiState.records.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BsaRed)
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (uiState.isLoading) {
                item { LinearProgressIndicator(modifier = Modifier.fillMaxWidth(), color = BsaRed) }
            }

            if (uiState.records.isEmpty() && !uiState.isLoading) {
                item {
                    Box(
                        Modifier.fillMaxWidth().padding(vertical = 48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.History,
                                null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(Modifier.height(12.dp))
                            Text(
                                "No redemptions yet",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                "Redeemed offers will appear here.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            }

            items(uiState.records) { record ->
                RedemptionRow(record)
            }
        }
    }
}

@Composable
private fun RedemptionRow(record: RedemptionRecord) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val discountDisplay = when (record.discountType) {
                "PERCENTAGE" -> "${record.discountValue.toInt()}% Off"
                "FIXED_AMOUNT" -> "$${String.format("%.2f", record.discountValue)} Off"
                else -> "${record.discountValue.toInt()} Off"
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = record.offerTitle,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                    maxLines = 1
                )
                Text(
                    text = record.merchantName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = record.redeemedAt.take(10),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = BsaRed.copy(alpha = 0.1f)
            ) {
                Text(
                    text = discountDisplay,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = BsaRed,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}

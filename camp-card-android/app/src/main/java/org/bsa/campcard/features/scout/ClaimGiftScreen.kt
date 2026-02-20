package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.GiftDetailsResponse
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

@HiltViewModel
class ClaimGiftViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {
    data class UiState(
        val isLoadingDetails: Boolean = false,
        val isClaiming: Boolean = false,
        val giftDetails: GiftDetailsResponse? = null,
        val success: Boolean = false,
        val error: String? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState = _uiState.asStateFlow()

    fun loadDetails(token: String) {
        _uiState.update { it.copy(isLoadingDetails = true, error = null) }
        viewModelScope.launch {
            try {
                val details = api.getGiftDetails(token)
                _uiState.update { it.copy(isLoadingDetails = false, giftDetails = details) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoadingDetails = false, error = "Invalid or expired gift link.") }
            }
        }
    }

    fun claim(token: String) {
        _uiState.update { it.copy(isClaiming = true, error = null) }
        viewModelScope.launch {
            try {
                api.claimGift(token)
                _uiState.update { it.copy(isClaiming = false, success = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isClaiming = false, error = e.message ?: "Claim failed") }
            }
        }
    }

    fun clearError() { _uiState.update { it.copy(error = null) } }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClaimGiftScreen(
    token: String,
    onSuccess: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: ClaimGiftViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) { viewModel.loadDetails(token) }
    LaunchedEffect(uiState.success) { if (uiState.success) onSuccess() }
    LaunchedEffect(uiState.error) {
        uiState.error?.let { err ->
            scope.launch { snackbarHostState.showSnackbar(err); viewModel.clearError() }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Claim Gift Card") },
                navigationIcon = { IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.CardGiftcard, "Back")
                } }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (uiState.isLoadingDetails) {
                CircularProgressIndicator(color = BsaRed)
                return@Column
            }

            val details = uiState.giftDetails
            if (details == null) {
                Icon(Icons.Default.CardGiftcard, null, tint = BsaRed, modifier = Modifier.size(64.dp))
                Spacer(Modifier.height(16.dp))
                Text("Gift not found", style = MaterialTheme.typography.titleLarge)
                Text(
                    "This gift link may be invalid or already claimed.",
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                Icon(Icons.Default.CardGiftcard, null, tint = BsaRed, modifier = Modifier.size(64.dp))
                Spacer(Modifier.height(20.dp))

                Text(
                    "You've received a Camp Card!",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    "From: ${details.giftedBy.ifBlank { "A friend" }}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                details.giftMessage?.let { msg ->
                    Spacer(Modifier.height(12.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "\"$msg\"",
                            modifier = Modifier.padding(14.dp),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(Modifier.height(32.dp))

                Button(
                    onClick = { viewModel.claim(token) },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = !uiState.isClaiming,
                    colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (uiState.isClaiming) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Text("Claim Card", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

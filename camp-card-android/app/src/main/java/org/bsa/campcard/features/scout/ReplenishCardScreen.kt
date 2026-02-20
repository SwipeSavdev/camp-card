package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import org.bsa.campcard.core.models.CampCard
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

@HiltViewModel
class ReplenishCardViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {
    data class UiState(
        val isLoading: Boolean = false,
        val success: Boolean = false,
        val activatedCard: CampCard? = null,
        val error: String? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState = _uiState.asStateFlow()

    fun activate(cardId: Int) {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val card = api.activateCard(cardId)
                _uiState.update { it.copy(isLoading = false, success = true, activatedCard = card) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Activation failed") }
            }
        }
    }

    fun clearError() { _uiState.update { it.copy(error = null) } }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReplenishCardScreen(
    cardId: Int,
    onSuccess: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: ReplenishCardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(uiState.success) {
        if (uiState.success) onSuccess()
    }

    LaunchedEffect(uiState.error) {
        uiState.error?.let { err ->
            scope.launch {
                snackbarHostState.showSnackbar(err)
                viewModel.clearError()
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Activate Card") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = BsaRed.copy(alpha = 0.08f),
                modifier = Modifier.size(96.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text("🎴", style = MaterialTheme.typography.displaySmall)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                "Activate Your Card",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                "This will activate the card and add it to your active wallet. You can then use it to redeem offers at participating merchants.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { viewModel.activate(cardId) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Activate Card", fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = onNavigateBack,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = !uiState.isLoading,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Cancel")
            }
        }
    }
}

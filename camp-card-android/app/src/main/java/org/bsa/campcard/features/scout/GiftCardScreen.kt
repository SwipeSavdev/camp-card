package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
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
import org.bsa.campcard.core.models.GiftCardRequest
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

@HiltViewModel
class GiftCardViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {
    data class UiState(
        val isLoading: Boolean = false,
        val success: Boolean = false,
        val error: String? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState = _uiState.asStateFlow()

    fun giftCard(cardId: Int, recipientEmail: String, message: String?) {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                api.giftCard(
                    cardId,
                    GiftCardRequest(
                        recipientEmail = recipientEmail.trim().lowercase(),
                        giftMessage = message?.trim()?.ifBlank { null }
                    )
                )
                _uiState.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Gift failed") }
            }
        }
    }

    fun clearError() { _uiState.update { it.copy(error = null) } }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GiftCardScreen(
    cardId: Int,
    onSuccess: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: GiftCardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    var recipientEmail by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }

    val isValid = recipientEmail.contains("@") && recipientEmail.contains(".")

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
                title = { Text("Gift a Card") },
                navigationIcon = { IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.CardGiftcard, "Back")
                } }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(Modifier.height(8.dp))

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = BsaRed.copy(alpha = 0.08f),
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.CardGiftcard, null, tint = BsaRed, modifier = Modifier.size(36.dp))
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Gift a Camp Card",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        textAlign = TextAlign.Center
                    )
                    Text(
                        "The recipient will receive an email with instructions to claim their card.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            OutlinedTextField(
                value = recipientEmail,
                onValueChange = { recipientEmail = it },
                label = { Text("Recipient Email") },
                leadingIcon = { Icon(Icons.Default.Email, null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                enabled = !uiState.isLoading
            )

            OutlinedTextField(
                value = message,
                onValueChange = { message = it },
                label = { Text("Personal Message (optional)") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                maxLines = 4,
                enabled = !uiState.isLoading
            )

            Button(
                onClick = { viewModel.giftCard(cardId, recipientEmail, message.ifBlank { null }) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = isValid && !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text("Send Gift Card", fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

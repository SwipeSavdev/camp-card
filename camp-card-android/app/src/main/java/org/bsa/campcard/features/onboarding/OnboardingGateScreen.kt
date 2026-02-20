package org.bsa.campcard.features.onboarding

import androidx.compose.foundation.Image
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import org.bsa.campcard.R
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryPurchasesParams
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.bsa.campcard.core.storage.SecureStorage
import org.bsa.campcard.features.iap.BillingService
import org.bsa.campcard.ui.theme.BsaBlue
import javax.inject.Inject

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class OnboardingGateState(
    val isCheckingEntitlement: Boolean = true,
    val pendingProductId: String? = null,
    val isRestoring: Boolean = false,
    val restoreMessage: String? = null
)

@HiltViewModel
class OnboardingGateViewModel @Inject constructor(
    private val secureStorage: SecureStorage,
    private val billingService: BillingService
) : ViewModel() {

    private val _state = MutableStateFlow(OnboardingGateState())
    val state = _state.asStateFlow()

    init {
        viewModelScope.launch { checkPendingPurchase() }
    }

    private suspend fun checkPendingPurchase() {
        // Check SecureStorage for interrupted onboarding
        val stored = secureStorage.pendingPurchaseProductId
        if (stored != null && !secureStorage.accountCreated) {
            _state.value = OnboardingGateState(isCheckingEntitlement = false, pendingProductId = stored)
            return
        }
        _state.value = _state.value.copy(isCheckingEntitlement = false)
    }

    fun restore(onRestored: (String?) -> Unit) {
        _state.value = _state.value.copy(isRestoring = true, restoreMessage = null)
        viewModelScope.launch {
            // Query existing subscriptions and in-app purchases
            val subs = billingService.queryExistingPurchases()
            val productId = subs.firstOrNull()?.products?.firstOrNull()
            _state.value = _state.value.copy(
                isRestoring = false,
                restoreMessage = if (productId != null)
                    "Purchase found! Please sign in to restore access."
                else
                    "No previous purchases found for this Google account."
            )
            onRestored(productId)
        }
    }

    fun clearRestoreMessage() {
        _state.value = _state.value.copy(restoreMessage = null)
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@Composable
fun OnboardingGateScreen(
    onGetStarted: () -> Unit,
    onSignIn: () -> Unit,
    onResumeAccountCreation: (productId: String) -> Unit,
    viewModel: OnboardingGateViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Auto-route if interrupted purchase found on cold launch
    LaunchedEffect(state.pendingProductId) {
        val productId = state.pendingProductId
        if (productId != null && !state.isCheckingEntitlement) {
            onResumeAccountCreation(productId)
        }
    }

    // Show restore message in snackbar
    LaunchedEffect(state.restoreMessage) {
        state.restoreMessage?.let { msg ->
            scope.launch {
                snackbarHostState.showSnackbar(msg, duration = SnackbarDuration.Long)
                viewModel.clearRestoreMessage()
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        if (state.isCheckingEntitlement) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BsaBlue)
            }
            return@Scaffold
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // BSA Blue gradient background
            androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF003F87),
                            Color(0xFF001A3A)
                        )
                    )
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(80.dp))

                Image(
                    painter = painterResource(id = R.drawable.campcard_icon),
                    contentDescription = "Camp Card Logo",
                    modifier = Modifier
                        .size(96.dp)
                        .clip(RoundedCornerShape(22.dp))
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Camp Card",
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                )
                Text(
                    text = "BSA Scout Fundraising",
                    style = MaterialTheme.typography.bodyLarge.copy(
                        color = Color.White.copy(alpha = 0.75f)
                    )
                )

                Spacer(modifier = Modifier.height(48.dp))

                // Glass card CTAs
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White.copy(alpha = 0.12f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Get Started
                        Button(
                            onClick = onGetStarted,
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.White,
                                contentColor = Color(0xFF003F87)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                "Get Started",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }

                        // Sign In
                        OutlinedButton(
                            onClick = onSignIn,
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.White
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp, Color.White.copy(alpha = 0.4f)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                "Sign In",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }

                        // Restore Purchases
                        TextButton(
                            onClick = { viewModel.restore(onRestored = { _ -> }) },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !state.isRestoring
                        ) {
                            if (state.isRestoring) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(18.dp),
                                    color = Color.White.copy(alpha = 0.7f),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    "Restore Purchases",
                                    color = Color.White.copy(alpha = 0.65f),
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Legal footer
                Text(
                    text = "By continuing, you agree to our Terms of Service and Privacy Policy",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = Color.White.copy(alpha = 0.5f),
                        textAlign = TextAlign.Center
                    )
                )

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

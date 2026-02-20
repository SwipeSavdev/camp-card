package org.bsa.campcard.features.onboarding

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.billingclient.api.ProductDetails
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import org.bsa.campcard.features.iap.BillingService
import org.bsa.campcard.features.iap.IapProducts
import org.bsa.campcard.features.iap.PurchaseResult
import org.bsa.campcard.ui.theme.BsaAmber
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class PlanSelectionUiState(
    val products: List<ProductDetails> = emptyList(),
    val isLoading: Boolean = true,
    val isPurchasing: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class PlanSelectionViewModel @Inject constructor(
    val billingService: BillingService
) : ViewModel() {

    private val _uiState = MutableStateFlow(PlanSelectionUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            billingService.state.collectLatest { billingState ->
                _uiState.value = _uiState.value.copy(
                    products = billingState.products,
                    isLoading = billingState.isLoading
                )
            }
        }
        viewModelScope.launch { billingService.loadProducts() }
    }

    fun purchase(
        activity: Activity,
        product: ProductDetails,
        userId: String?,
        onResult: (PurchaseResult) -> Unit
    ) {
        _uiState.value = _uiState.value.copy(isPurchasing = true)
        billingService.launchPurchaseFlow(activity, product, userId) { result ->
            _uiState.value = _uiState.value.copy(isPurchasing = false)
            onResult(result)
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlanSelectionScreen(
    role: String,
    onPurchaseSuccess: (productId: String) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: PlanSelectionViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val activity = LocalContext.current as Activity
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val isLeader = role == OnboardingRole.TROOP_LEADER.key
    val accentColor = when (role) {
        OnboardingRole.SCOUT.key -> BsaRed
        OnboardingRole.TROOP_LEADER.key -> BsaBlue
        else -> BsaAmber
    }

    val relevantProducts = if (isLeader) {
        uiState.products.filter { IapProducts.SUBSCRIPTIONS.contains(it.productId) }
    } else {
        uiState.products.filter { IapProducts.CONSUMABLES.contains(it.productId) }
    }.sortedBy {
        it.oneTimePurchaseOfferDetails?.priceAmountMicros
            ?: it.subscriptionOfferDetails?.firstOrNull()?.pricingPhases
                ?.pricingPhaseList?.firstOrNull()?.priceAmountMicros
            ?: 0L
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text(if (isLeader) "Choose Plan" else "Get Camp Cards") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(16.dp))

                // Header
                Text(
                    text = if (isLeader) "Unlock Your Troop Dashboard" else "Choose Your Card Pack",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (isLeader)
                        "Manage scouts, view analytics, and access exclusive offers."
                    else
                        "Each card gives unique merchant discounts for the whole community.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                if (uiState.isLoading) {
                    CircularProgressIndicator(color = accentColor)
                } else if (relevantProducts.isEmpty()) {
                    Text(
                        "Plans unavailable. Please try again later.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                } else {
                    relevantProducts.forEach { product ->
                        ProductCard(
                            product = product,
                            isLeader = isLeader,
                            accentColor = accentColor,
                            isPurchasing = uiState.isPurchasing,
                            onTap = {
                                viewModel.purchase(activity, product, null) { result ->
                                    when (result) {
                                        is PurchaseResult.Success ->
                                            onPurchaseSuccess(product.productId)
                                        is PurchaseResult.Cancelled -> { /* silent */ }
                                        is PurchaseResult.Error ->
                                            scope.launch {
                                                snackbarHostState.showSnackbar(result.message)
                                            }
                                    }
                                }
                            }
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Legal footer
                if (isLeader) {
                    Text(
                        text = "Subscription auto-renews annually. Cancel anytime in Google Play → Subscriptions.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                TextButton(onClick = { /* Restore handled by Play automatically; show info */ }) {
                    Text(
                        "Restore Purchases",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                Spacer(modifier = Modifier.height(40.dp))
            }

            // Purchase overlay
            if (uiState.isPurchasing) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black.copy(alpha = 0.4f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Surface(shape = RoundedCornerShape(16.dp)) {
                            Column(
                                modifier = Modifier.padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                CircularProgressIndicator(color = accentColor)
                                Text("Processing…", style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------

@Composable
private fun ProductCard(
    product: ProductDetails,
    isLeader: Boolean,
    accentColor: Color,
    isPurchasing: Boolean,
    onTap: () -> Unit
) {
    val displayPrice = product.oneTimePurchaseOfferDetails?.formattedPrice
        ?: product.subscriptionOfferDetails?.firstOrNull()
            ?.pricingPhases?.pricingPhaseList?.firstOrNull()?.formattedPrice
        ?: "—"

    val cardCount = when (product.productId) {
        IapProducts.CARDS_1 -> 1
        IapProducts.CARDS_3 -> 3
        IapProducts.CARDS_5 -> 5
        IapProducts.CARDS_10 -> 10
        else -> 0
    }

    val isBestValue = product.productId == IapProducts.CARDS_10

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        border = if (isBestValue) androidx.compose.foundation.BorderStroke(1.5.dp, accentColor.copy(alpha = 0.4f))
                 else null,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (isBestValue) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = accentColor
                ) {
                    Text(
                        "Best Value",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (cardCount > 0) "$cardCount ${if (cardCount == 1) "Card" else "Cards"}"
                               else product.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                    )
                    if (!isLeader && cardCount > 0) {
                        Text(
                            text = "$${String.format("%.2f", displayPrice.replace("[^0-9.]".toRegex(), "").toDoubleOrNull()?.div(cardCount) ?: 0.0)}/card",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Text(
                    text = displayPrice,
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = accentColor
                    )
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onTap,
                modifier = Modifier.fillMaxWidth().height(44.dp),
                enabled = !isPurchasing,
                colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (isLeader) "Subscribe — $displayPrice/yr" else "Buy Now — $displayPrice",
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

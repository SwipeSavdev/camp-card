package org.bsa.campcard.features.iap

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.billingclient.api.ProductDetails
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.SubscriptionStatus
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

data class SubscriptionUiState(
    val status: SubscriptionStatus? = null,
    val products: List<ProductDetails> = emptyList(),
    val isLoading: Boolean = false,
    val purchaseResult: PurchaseResult? = null,
    val error: String? = null
)

@HiltViewModel
class SubscriptionViewModel @Inject constructor(
    private val api: CampCardApi,
    val billingService: BillingService
) : ViewModel() {

    private val _uiState = MutableStateFlow(SubscriptionUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            load()
        }
        // Observe billing products
        viewModelScope.launch {
            billingService.state.collect { billingState ->
                val subscriptionProducts = billingState.products.filter { product ->
                    IapProducts.SUBSCRIPTIONS.contains(product.productId)
                }
                _uiState.value = _uiState.value.copy(products = subscriptionProducts)
            }
        }
    }

    private suspend fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true)
        try {
            val status = api.getSubscriptionStatus()
            _uiState.value = _uiState.value.copy(status = status, isLoading = false)
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
        }
    }

    fun purchase(activity: Activity, product: ProductDetails, userId: String?) {
        billingService.launchPurchaseFlow(activity, product, userId) { result ->
            _uiState.value = _uiState.value.copy(purchaseResult = result)
            if (result is PurchaseResult.Success) {
                viewModelScope.launch { load() }
            }
        }
    }

    fun cancelSubscription() {
        viewModelScope.launch {
            try {
                api.cancelSubscription()
                load()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message)
            }
        }
    }

    fun restorePurchases() {
        viewModelScope.launch { billingService.loadProducts() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubscriptionScreen(
    onNavigateBack: () -> Unit,
    viewModel: SubscriptionViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val activity = context as? Activity
    val snackbarHostState = remember { SnackbarHostState() }

    var showDisclosure by remember { mutableStateOf(false) }
    var selectedProduct by remember { mutableStateOf<ProductDetails?>(null) }

    LaunchedEffect(uiState.purchaseResult) {
        when (val result = uiState.purchaseResult) {
            is PurchaseResult.Success -> snackbarHostState.showSnackbar("Subscription activated!")
            is PurchaseResult.Error -> snackbarHostState.showSnackbar("Purchase failed: ${result.message}")
            is PurchaseResult.Cancelled -> { /* no-op */ }
            null -> { /* no-op */ }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Subscription") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BsaBlue)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Current status
                uiState.status?.let { status ->
                    CurrentSubscriptionCard(status = status, onCancel = { viewModel.cancelSubscription() })
                }

                // Available plans
                if (uiState.status?.status != "active") {
                    Text("Available Plans", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    uiState.products.forEach { product ->
                        SubscriptionProductCard(
                            product = product,
                            onSubscribe = {
                                selectedProduct = product
                                showDisclosure = true
                            }
                        )
                    }
                }

                // Restore button
                OutlinedButton(
                    onClick = { viewModel.restorePurchases() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Restore Purchases")
                }

                // Legal links
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    TextButton(onClick = {}) { Text("Privacy Policy", style = MaterialTheme.typography.bodySmall) }
                    TextButton(onClick = {}) { Text("Terms of Service", style = MaterialTheme.typography.bodySmall) }
                }
            }
        }
    }

    if (showDisclosure && selectedProduct != null) {
        SubscriptionDisclosureDialog(
            product = selectedProduct!!,
            onConfirm = {
                showDisclosure = false
                activity?.let { act ->
                    viewModel.purchase(act, selectedProduct!!, null)
                }
            },
            onDismiss = { showDisclosure = false }
        )
    }
}

@Composable
private fun CurrentSubscriptionCard(status: SubscriptionStatus, onCancel: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = if (status.status == "active") Color(0xFF4CAF50) else Color.Gray)
                Spacer(Modifier.width(8.dp))
                Text(
                    text = if (status.status == "active") "Active Subscription" else "No Active Subscription",
                    fontWeight = FontWeight.Bold
                )
            }
            status.plan?.let { plan ->
                Text("Plan: ${plan.name}", style = MaterialTheme.typography.bodyMedium)
                Text("$${String.format("%.2f", plan.price)}/${plan.interval}", style = MaterialTheme.typography.bodyMedium, color = BsaBlue)
            }
            status.currentPeriodEnd?.let {
                Text("Renews: $it", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (status.status == "active") {
                TextButton(onClick = onCancel, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                    Text("Cancel Subscription")
                }
            }
        }
    }
}

@Composable
private fun SubscriptionProductCard(product: ProductDetails, onSubscribe: () -> Unit) {
    val price = product.subscriptionOfferDetails?.firstOrNull()
        ?.pricingPhases?.pricingPhaseList?.firstOrNull()
        ?.formattedPrice ?: "$14.99"

    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(product.name, fontWeight = FontWeight.Bold)
                Text(product.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("$price / year", color = BsaBlue, fontWeight = FontWeight.SemiBold)
            }
            Button(
                onClick = onSubscribe,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
            ) {
                Text("Subscribe")
            }
        }
    }
}

@Composable
private fun SubscriptionDisclosureDialog(
    product: ProductDetails,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    val price = product.subscriptionOfferDetails?.firstOrNull()
        ?.pricingPhases?.pricingPhaseList?.firstOrNull()
        ?.formattedPrice ?: "$14.99"

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Subscribe to ${product.name}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("$price per year, billed annually")
                Text("Auto-renews each year. Cancel anytime in Google Play.")
                Text("Payment will be charged to your Google Play account.")
                HorizontalDivider()
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    TextButton(onClick = {}) { Text("Privacy Policy", style = MaterialTheme.typography.bodySmall) }
                    TextButton(onClick = {}) { Text("Terms", style = MaterialTheme.typography.bodySmall) }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
            ) { Text("Subscribe") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

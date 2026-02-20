package org.bsa.campcard.features.iap

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import kotlinx.coroutines.launch
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

data class CardProduct(
    val productId: String,
    val cardCount: Int,
    val displayPrice: String,
    val savingsText: String?,
    val productDetails: ProductDetails?
)

@HiltViewModel
class BuyMoreCardsViewModel @Inject constructor(
    val billingService: BillingService
) : ViewModel() {

    private val _cardProducts = MutableStateFlow<List<CardProduct>>(emptyList())
    val cardProducts = _cardProducts.asStateFlow()

    private val _purchaseResult = MutableStateFlow<PurchaseResult?>(null)
    val purchaseResult = _purchaseResult.asStateFlow()

    init {
        viewModelScope.launch {
            billingService.state.collect { billingState ->
                val cards = listOf(
                    Triple(IapProducts.CARDS_1, 1, null),
                    Triple(IapProducts.CARDS_3, 3, "Save 33%"),
                    Triple(IapProducts.CARDS_5, 5, "Save 50%"),
                    Triple(IapProducts.CARDS_10, 10, "Best Value")
                ).map { (productId, count, savings) ->
                    val details = billingState.products.firstOrNull { it.productId == productId }
                    val price = details?.oneTimePurchaseOfferDetails?.formattedPrice
                        ?: defaultPrice(count)
                    CardProduct(productId, count, price, savings, details)
                }
                _cardProducts.value = cards
            }
        }
    }

    private fun defaultPrice(count: Int) = when (count) {
        1 -> "$14.99"
        3 -> "$44.99"
        5 -> "$74.99"
        10 -> "$149.99"
        else -> "—"
    }

    fun purchase(activity: Activity, cardProduct: CardProduct, userId: String?) {
        val productDetails = cardProduct.productDetails ?: return
        billingService.launchPurchaseFlow(activity, productDetails, userId) { result ->
            _purchaseResult.value = result
        }
    }

    fun clearResult() { _purchaseResult.value = null }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuyMoreCardsScreen(
    onNavigateBack: () -> Unit,
    userId: String? = null,
    viewModel: BuyMoreCardsViewModel = hiltViewModel()
) {
    val cardProducts by viewModel.cardProducts.collectAsState()
    val purchaseResult by viewModel.purchaseResult.collectAsState()
    val context = LocalContext.current
    val activity = context as? Activity
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(purchaseResult) {
        when (val result = purchaseResult) {
            is PurchaseResult.Success -> {
                val cards = result.response.cardsPurchased ?: 0
                snackbarHostState.showSnackbar("Success! $cards card(s) added to your account.")
                viewModel.clearResult()
            }
            is PurchaseResult.Error -> {
                snackbarHostState.showSnackbar("Purchase failed: ${result.message}")
                viewModel.clearResult()
            }
            is PurchaseResult.Cancelled -> viewModel.clearResult()
            null -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Buy Camp Cards") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BsaRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                "Each Camp Card gives you access to exclusive discounts at participating merchants.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cardProducts) { cardProduct ->
                    CardOptionItem(
                        cardProduct = cardProduct,
                        onClick = {
                            activity?.let { act ->
                                viewModel.purchase(act, cardProduct, userId)
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CardOptionItem(cardProduct: CardProduct, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            cardProduct.savingsText?.let { savings ->
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = BsaRed
                ) {
                    Text(
                        savings,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
            } ?: Spacer(Modifier.height(20.dp))

            Text(
                "${cardProduct.cardCount}",
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
                color = BsaBlue
            )
            Text(
                if (cardProduct.cardCount == 1) "Card" else "Cards",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                cardProduct.displayPrice,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )
            Button(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed),
                enabled = cardProduct.productDetails != null
            ) {
                Text("Buy")
            }
        }
    }
}

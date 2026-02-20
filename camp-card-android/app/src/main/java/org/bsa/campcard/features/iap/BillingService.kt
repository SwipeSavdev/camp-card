package org.bsa.campcard.features.iap

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import org.bsa.campcard.core.models.VerifyReceiptRequest
import org.bsa.campcard.core.models.VerifyReceiptResponse
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.core.storage.SecureStorage
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume

data class BillingState(
    val products: List<ProductDetails> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val lastPurchaseResult: PurchaseResult? = null
)

sealed class PurchaseResult {
    data class Success(val response: VerifyReceiptResponse) : PurchaseResult()
    object Cancelled : PurchaseResult()
    data class Error(val message: String) : PurchaseResult()
}

// IAP Product IDs
object IapProducts {
    const val SUBSCRIPTION_ANNUAL = "org.bsa.campcard.subscription.annual"
    const val SUBSCRIPTION_ANNUAL_SCOUT = "campcard.subscription.annual.scout" // 40-char limit
    const val CARDS_1 = "org.bsa.campcard.cards.1"
    const val CARDS_3 = "org.bsa.campcard.cards.3"
    const val CARDS_5 = "org.bsa.campcard.cards.5"
    const val CARDS_10 = "org.bsa.campcard.cards.10"

    val ALL_PRODUCTS = listOf(
        SUBSCRIPTION_ANNUAL, SUBSCRIPTION_ANNUAL_SCOUT,
        CARDS_1, CARDS_3, CARDS_5, CARDS_10
    )

    val SUBSCRIPTIONS = listOf(SUBSCRIPTION_ANNUAL, SUBSCRIPTION_ANNUAL_SCOUT)
    val CONSUMABLES = listOf(CARDS_1, CARDS_3, CARDS_5, CARDS_10)
}

@Singleton
class BillingService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: CampCardApi,
    private val secureStorage: SecureStorage
) : PurchasesUpdatedListener {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _state = MutableStateFlow(BillingState())
    val state: StateFlow<BillingState> = _state.asStateFlow()

    /** Emits the product ID immediately after a successful purchase.
     *  Observed by the onboarding flow to navigate to AccountCreationScreen.
     *  Cleared (null) once account creation is complete. */
    private val _postPurchaseProductId = MutableStateFlow<String?>(null)
    val postPurchaseProductId: StateFlow<String?> = _postPurchaseProductId.asStateFlow()

    private var pendingPurchaseCallback: ((PurchaseResult) -> Unit)? = null

    private val billingClient: BillingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .build()

    init {
        connect()
    }

    private fun connect() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    scope.launch { loadProducts() }
                }
            }
            override fun onBillingServiceDisconnected() {
                // Retry connection after delay
                scope.launch { connect() }
            }
        })
    }

    suspend fun loadProducts() {
        _state.value = _state.value.copy(isLoading = true)

        // Query subscriptions
        val subParams = QueryProductDetailsParams.newBuilder()
            .setProductList(
                IapProducts.SUBSCRIPTIONS.map { productId ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                }
            ).build()

        // Query in-app products
        val iapParams = QueryProductDetailsParams.newBuilder()
            .setProductList(
                IapProducts.CONSUMABLES.map { productId ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()
                }
            ).build()

        val allProducts = mutableListOf<ProductDetails>()

        billingClient.queryProductDetails(subParams).productDetailsList
            ?.let { allProducts.addAll(it) }
        billingClient.queryProductDetails(iapParams).productDetailsList
            ?.let { allProducts.addAll(it) }

        _state.value = _state.value.copy(products = allProducts, isLoading = false)
    }

    fun launchPurchaseFlow(
        activity: Activity,
        productDetails: ProductDetails,
        userId: String?,
        onResult: (PurchaseResult) -> Unit
    ) {
        pendingPurchaseCallback = onResult

        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .apply {
                // For subscriptions, use the first offer token
                if (productDetails.productType == BillingClient.ProductType.SUBS) {
                    productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken?.let {
                        setOfferToken(it)
                    }
                }
            }.build()

        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParams))
            .apply {
                if (userId != null) setObfuscatedAccountId(userId)
            }
            .build()

        billingClient.launchBillingFlow(activity, flowParams)
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: List<Purchase>?) {
        val callback = pendingPurchaseCallback ?: return
        pendingPurchaseCallback = null

        when (result.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                purchases?.firstOrNull()?.let { purchase ->
                    scope.launch {
                        handlePurchase(purchase, callback)
                    }
                } ?: callback(PurchaseResult.Error("No purchase data"))
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                callback(PurchaseResult.Cancelled)
            }
            else -> {
                callback(PurchaseResult.Error("Purchase failed: ${result.debugMessage}"))
            }
        }
    }

    private suspend fun handlePurchase(purchase: Purchase, callback: (PurchaseResult) -> Unit) {
        try {
            val productId = purchase.products.firstOrNull() ?: return
            val purchaseToken = purchase.purchaseToken

            // Verify with backend
            val response = api.verifyGoogleReceipt(
                VerifyReceiptRequest(
                    receiptData = purchaseToken,
                    productId = productId,
                    transactionId = purchase.orderId ?: purchase.purchaseToken
                )
            )

            if (response.valid) {
                // Acknowledge consumable purchases
                if (IapProducts.CONSUMABLES.contains(productId)) {
                    val consumeParams = ConsumeParams.newBuilder()
                        .setPurchaseToken(purchaseToken)
                        .build()
                    billingClient.consumePurchase(consumeParams)
                } else {
                    // Acknowledge subscription
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED && !purchase.isAcknowledged) {
                        val ackParams = AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchaseToken)
                            .build()
                        billingClient.acknowledgePurchase(ackParams)
                    }
                }
                // Persist for onboarding resume on cold launch; cleared after account creation
                secureStorage.pendingPurchaseProductId = productId
                _postPurchaseProductId.value = productId
                callback(PurchaseResult.Success(response))
            } else {
                callback(PurchaseResult.Error("Receipt verification failed"))
            }
        } catch (e: Exception) {
            callback(PurchaseResult.Error(e.message ?: "Unknown error"))
        }
    }

    fun getProductById(productId: String): ProductDetails? =
        _state.value.products.firstOrNull { it.productId == productId }

    /** Called after successful account creation to clear the post-purchase routing signal. */
    fun clearPostPurchaseProductId() {
        _postPurchaseProductId.value = null
    }

    /** Returns all active/unacknowledged purchases across subs and consumables.
     *  Used by the onboarding restore flow. */
    suspend fun queryExistingPurchases(): List<Purchase> {
        val result = mutableListOf<Purchase>()
        result += billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS).build()
        ).purchasesList
        result += billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP).build()
        ).purchasesList
        return result
    }
}

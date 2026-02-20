import Foundation
import StoreKit

// MARK: - StoreService

@MainActor
final class StoreService: ObservableObject {

    static let shared = StoreService()

    @Published var products: [Product] = []
    @Published var purchasedProductIds: Set<String> = []
    @Published var isLoading = false
    @Published var error: String?
    /// Set immediately after a successful purchase. Observed by onboarding
    /// to trigger the post-purchase → AccountCreation route. Cleared once
    /// the account is created.
    @Published var postPurchaseProductId: String? = nil

    private let api = APIClient.shared
    private var updatesTask: Task<Void, Never>?

    private let allProductIds = APIConstants.IAP.allProductIds

    private init() {
        updatesTask = Task { [weak self] in
            await self?.listenForTransactionUpdates()
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    // MARK: - Load Products

    func loadProducts() async {
        isLoading = true
        error = nil
        do {
            let fetched = try await Product.products(for: allProductIds)
            products = fetched.sorted { $0.price < $1.price }
        } catch {
            self.error = "Failed to load products: \(error.localizedDescription)"
        }
        isLoading = false
    }

    // MARK: - Purchase

    /// Returns `true` if the purchase completed successfully, `false` if cancelled or pending.
    /// Throws on genuine errors.
    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try handleVerification(result: verification)
            await sendReceiptToBackend(transaction: transaction, product: product)
            purchasedProductIds.insert(transaction.productID)
            // Persist for onboarding resume on cold-launch; cleared after account creation
            KeychainService.shared.pendingPurchaseProductId = transaction.productID
            postPurchaseProductId = transaction.productID
            await transaction.finish()
            return true

        case .userCancelled:
            return false

        case .pending:
            return false

        @unknown default:
            return false
        }
    }

    // MARK: - Restore Purchases

    func restorePurchases() async throws {
        try await AppStore.sync()
        // Re-validate current entitlements after sync
        for await verification in Transaction.currentEntitlements {
            if let transaction = try? handleVerification(result: verification) {
                purchasedProductIds.insert(transaction.productID)
            }
        }
    }

    // MARK: - Subscription Product Check

    func isSubscriptionProduct(_ productId: String) -> Bool {
        return productId == APIConstants.IAP.subscriptionAnnual ||
               productId == APIConstants.IAP.subscriptionAnnualScout
    }

    // MARK: - Product Helpers

    func product(for productId: String) -> Product? {
        products.first { $0.id == productId }
    }

    func subscriptionProducts() -> [Product] {
        products.filter { isSubscriptionProduct($0.id) }
    }

    func cardProducts() -> [Product] {
        products.filter { !isSubscriptionProduct($0.id) }
    }

    // MARK: - Private Helpers

    private func handleVerification(result: VerificationResult<Transaction>) throws -> Transaction {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let transaction):
            return transaction
        }
    }

    private func sendReceiptToBackend(transaction: Transaction, product: Product) async {
        guard let userId = await AuthViewModel.shared.user?.id else { return }
        // StoreKit 2 uses JWS tokens; encode the json payload as base64 for backend
        let jwsToken = transaction.jsonRepresentation.base64EncodedString()
        let request = VerifyReceiptRequest(
            receiptData: jwsToken,
            productId: product.id,
            transactionId: String(transaction.id),
            userId: userId
        )
        do {
            let _: VerifyReceiptResponse = try await api.request(.verifyAppleReceipt(request))
        } catch {
            // Log error but don't block the purchase — StoreKit is source of truth
            print("[StoreService] Backend receipt verification failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Transaction Update Listener

    private func listenForTransactionUpdates() async {
        for await verification in Transaction.updates {
            guard let transaction = try? handleVerification(result: verification) else { continue }
            purchasedProductIds.insert(transaction.productID)
            await transaction.finish()
        }
    }
}

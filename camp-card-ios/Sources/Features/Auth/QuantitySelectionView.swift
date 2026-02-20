import SwiftUI
import StoreKit

// MARK: - QuantitySelectionView
// Step 2 of the new-user onboarding funnel.
// Shows the appropriate IAP products for the chosen role:
//   Scout / Parent → Card packs (1, 3, 5, 10)
//   Troop Leader   → Annual subscription
// On successful purchase routes to AccountCreationView.

struct QuantitySelectionView: View {
    let role: OnboardingRole

    @StateObject private var store = StoreService.shared
    @State private var purchasingProductId: String? = nil
    @State private var showAccountCreation = false
    @State private var purchasedProductId: String? = nil
    @State private var purchaseError: String? = nil
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private let columns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        ZStack {
            ScrollView {
                VStack(spacing: 28) {
                    headerSection
                    if store.isLoading {
                        ProgressView("Loading plans…")
                            .padding(.top, 32)
                    } else {
                        if role == .troopLeader {
                            subscriptionSection
                        } else {
                            cardPackSection
                        }
                        legalFooter
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 48)
            }

            // Full-screen purchase overlay
            if purchasingProductId != nil {
                Color.black.opacity(0.4).ignoresSafeArea()
                VStack(spacing: 16) {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .scaleEffect(1.4)
                        .tint(.white)
                    Text("Processing…")
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .fontWeight(.medium)
                }
                .padding(32)
                .background(CCColor.disabled.opacity(0.92))
                .clipShape(RoundedRectangle(cornerRadius: CCRadius.lg))
            }
        }
        .navigationTitle(role == .troopLeader ? "Choose Plan" : "Get Camp Cards")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .task { await store.loadProducts() }
        .navigationDestination(isPresented: $showAccountCreation) {
            AccountCreationView(preselectedRole: role, pendingProductId: purchasedProductId)
        }
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(role.accentColor.opacity(0.12))
                    .frame(width: 72, height: 72)
                Image(systemName: role == .troopLeader ? "star.circle.fill" : "creditcard.fill")
                    .font(.system(size: 30))
                    .foregroundColor(role.accentColor)
            }
            .padding(.top, 16)
            .accessibilityHidden(true)

            Text(role == .troopLeader ? "Unlock Your Troop Dashboard" : "Choose Your Card Pack")
                .font(.system(size: CCFont.xl, weight: .bold))
                .multilineTextAlignment(.center)
                .accessibilityAddTraits(.isHeader)

            Text(role == .troopLeader
                 ? "A subscription unlocks offers, scout management, and troop analytics."
                 : "Each card gives your scout unique offer discounts to share with the community.")
                .font(.system(size: CCFont.sm))
                .foregroundColor(CCColor.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)

            if let error = purchaseError {
                ErrorBanner(message: error)
            }
        }
    }

    private var subscriptionSection: some View {
        VStack(spacing: 12) {
            ForEach(store.subscriptionProducts(), id: \.id) { product in
                SubscriptionOptionCell(
                    product: product,
                    isPurchasing: purchasingProductId == product.id,
                    accentColor: role.accentColor,
                    onTap: { Task { await purchase(product) } }
                )
            }
            if store.subscriptionProducts().isEmpty {
                Text("Plans unavailable. Please try again later.")
                    .foregroundColor(CCColor.textSecondary)
                    .font(.subheadline)
                    .padding()
            }
        }
    }

    private var cardPackSection: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(store.cardProducts(), id: \.id) { product in
                CardPackCell(
                    product: product,
                    isPurchasing: purchasingProductId == product.id,
                    accentColor: role.accentColor,
                    onTap: { Task { await purchase(product) } }
                )
            }
        }
    }

    private var legalFooter: some View {
        VStack(spacing: 6) {
            if role == .troopLeader {
                Text("Subscription auto-renews annually. Cancel anytime in Settings → Subscriptions.")
                    .font(.system(size: CCFont.xs))
                    .foregroundColor(CCColor.textSecondary)
                    .multilineTextAlignment(.center)
            }
            Button("Restore Purchases") {
                Task {
                    purchasingProductId = "restoring"
                    try? await store.restorePurchases()
                    purchasingProductId = nil
                }
            }
            .font(.system(size: CCFont.sm))
            .foregroundColor(CCColor.textSecondary)
            .accessibilityLabel("Restore previous App Store purchases")
        }
        .padding(.top, 8)
    }

    // MARK: - Purchase

    private func purchase(_ product: Product) async {
        purchasingProductId = product.id
        purchaseError = nil
        do {
            let completed = try await store.purchase(product)
            if completed {
                purchasedProductId = product.id
                // StoreService has already persisted to Keychain and set postPurchaseProductId
                showAccountCreation = true
            }
            // false = user cancelled — stay on screen, no error shown
        } catch {
            purchaseError = "Purchase failed. Please try again."
        }
        purchasingProductId = nil
    }
}

// MARK: - SubscriptionOptionCell

private struct SubscriptionOptionCell: View {
    let product: Product
    let isPurchasing: Bool
    let accentColor: Color
    let onTap: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.displayName)
                        .font(.system(size: CCFont.base, weight: .semibold))
                    Text(product.description)
                        .font(.system(size: CCFont.sm))
                        .foregroundColor(CCColor.textSecondary)
                }
                Spacer()
                Text(product.displayPrice)
                    .font(.system(size: CCFont.xl, weight: .bold))
                    .foregroundColor(accentColor)
            }

            Button(action: onTap) {
                Group {
                    if isPurchasing {
                        ProgressView().progressViewStyle(.circular).tint(.white)
                    } else {
                        Text("Subscribe — \(product.displayPrice)/yr")
                            .font(.system(size: CCFont.base, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
            }
            .buttonStyle(.borderedProminent)
            .tint(accentColor)
            .disabled(isPurchasing)
            .accessibilityLabel("Subscribe for \(product.displayPrice) per year")
        }
        .padding(16)
        .background(CCColor.card)
        .clipShape(RoundedRectangle(cornerRadius: CCRadius.md))
        .overlay(RoundedRectangle(cornerRadius: CCRadius.md).stroke(accentColor.opacity(0.3), lineWidth: 1.5))
    }
}

// MARK: - CardPackCell

private struct CardPackCell: View {
    let product: Product
    let isPurchasing: Bool
    let accentColor: Color
    let onTap: () -> Void

    private var cardCount: Int { APIConstants.IAP.cardCount(for: product.id) }

    private var isBestValue: Bool { product.id == APIConstants.IAP.cards10 }

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 10) {
                if isBestValue {
                    Text("Best Value")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10).padding(.vertical, 4)
                        .background(accentColor)
                        .clipShape(Capsule())
                } else {
                    Color.clear.frame(height: 22)
                }

                ZStack {
                    RoundedRectangle(cornerRadius: CCRadius.icon)
                        .fill(accentColor.opacity(0.1))
                        .frame(width: 56, height: 56)
                    VStack(spacing: 2) {
                        Text("\(cardCount)")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(accentColor)
                        Text(cardCount == 1 ? "Card" : "Cards")
                            .font(.system(size: 10))
                            .foregroundColor(accentColor)
                    }
                }
                .accessibilityLabel("\(cardCount) \(cardCount == 1 ? "card" : "cards")")

                Text(product.displayPrice)
                    .font(.system(size: CCFont.base, weight: .bold))

                if isPurchasing {
                    ProgressView().progressViewStyle(.circular).frame(height: 34)
                } else {
                    Text("Buy Now")
                        .font(.system(size: CCFont.sm, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 34)
                        .background(accentColor)
                        .clipShape(RoundedRectangle(cornerRadius: CCRadius.sm))
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(CCColor.card)
            .clipShape(RoundedRectangle(cornerRadius: CCRadius.md))
            .overlay(
                RoundedRectangle(cornerRadius: CCRadius.md)
                    .stroke(isBestValue ? accentColor.opacity(0.4) : Color.clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
        .disabled(isPurchasing)
        .accessibilityLabel("\(cardCount) \(cardCount == 1 ? "camp card" : "camp cards") for \(product.displayPrice)")
    }
}

import SwiftUI
import StoreKit

// MARK: - BuyMoreCardsView
// Scout-only screen to purchase additional camp cards (1, 3, 5, or 10).

struct BuyMoreCardsView: View {

    @StateObject private var store = StoreService.shared
    @EnvironmentObject private var auth: AuthViewModel

    @State private var purchasingProductId: String?
    @State private var showSuccess = false
    @State private var successMessage = ""
    @State private var errorMessage: String?

    private let cardOptions: [CardOption] = [
        CardOption(productId: APIConstants.IAP.cards1,  count: 1,  price: "$14.99", tag: nil),
        CardOption(productId: APIConstants.IAP.cards3,  count: 3,  price: "$44.99", tag: "Save 0%"),
        CardOption(productId: APIConstants.IAP.cards5,  count: 5,  price: "$74.99", tag: "Save 1%"),
        CardOption(productId: APIConstants.IAP.cards10, count: 10, price: "$149.99", tag: "Best Value")
    ]

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                ScrollView {
                    VStack(spacing: 24) {
                        headerSection
                        cardGrid
                        infoSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 40)
                }

                // Full-screen loading overlay during purchase
                if purchasingProductId != nil {
                    Color.black.opacity(0.35)
                        .ignoresSafeArea()
                    VStack(spacing: 16) {
                        ProgressView()
                            .progressViewStyle(.circular)
                            .scaleEffect(1.4)
                            .tint(.white)
                        Text("Processing purchase...")
                            .font(.subheadline)
                            .foregroundColor(.white)
                            .fontWeight(.medium)
                    }
                    .padding(32)
                    .background(CCColor.disabled.opacity(0.9))
                    .cornerRadius(16)
                }
            }
            .navigationTitle("Buy More Cards")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await store.loadProducts()
            }
            .alert("Purchase Complete", isPresented: $showSuccess) {
                Button("Great!", role: .cancel) {}
            } message: {
                Text(successMessage)
            }
            .alert("Purchase Failed", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(CCColor.primary.opacity(0.1))
                    .frame(width: 64, height: 64)
                Image(systemName: "creditcard.fill")
                    .font(.system(size: 28))
                    .foregroundColor(CCColor.primary)
            }
            .padding(.top, 16)

            Text("Buy Camp Cards")
                .font(.title2)
                .fontWeight(.bold)

            Text("Each card unlocks exclusive merchant offers\nand supports BSA fundraising.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var cardGrid: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(cardOptions) { option in
                CardOptionCell(
                    option: option,
                    storeProduct: store.product(for: option.productId),
                    isPurchasing: purchasingProductId == option.productId,
                    onTap: { product in
                        Task { await purchase(product, option: option) }
                    }
                )
            }
        }
    }

    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("How Camp Cards Work", systemImage: "info.circle.fill")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(Color(hex: "#003F87"))

            VStack(alignment: .leading, spacing: 6) {
                infoBullet(icon: "qrcode", text: "Each card has a unique QR code for offer redemption.")
                infoBullet(icon: "gift", text: "Cards can be gifted to friends and family.")
                infoBullet(icon: "dollarsign.circle", text: "A portion of every card sale supports your BSA troop.")
                infoBullet(icon: "calendar", text: "Cards are valid for the current fundraising season.")
            }
        }
        .padding(16)
        .background(Color(hex: "#003F87").opacity(0.06))
        .cornerRadius(14)
    }

    private func infoBullet(icon: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(Color(hex: "#003F87"))
                .frame(width: 14)
                .padding(.top, 1)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    // MARK: - Purchase

    private func purchase(_ product: Product, option: CardOption) async {
        purchasingProductId = product.id
        errorMessage = nil
        do {
            let completed = try await store.purchase(product)
            if completed {
                let cardCount = APIConstants.IAP.cardCount(for: product.id)
                successMessage = cardCount == 1
                    ? "Your new camp card has been added to your account!"
                    : "\(cardCount) camp cards have been added to your account!"
                showSuccess = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        purchasingProductId = nil
    }
}

// MARK: - CardOption Model

private struct CardOption: Identifiable {
    let productId: String
    let count: Int
    let price: String
    let tag: String?
    var id: String { productId }
}

// MARK: - CardOptionCell

private struct CardOptionCell: View {

    let option: CardOption
    let storeProduct: Product?
    let isPurchasing: Bool
    let onTap: (Product) -> Void

    var displayPrice: String {
        storeProduct?.displayPrice ?? option.price
    }

    var body: some View {
        Button {
            guard let product = storeProduct else { return }
            onTap(product)
        } label: {
            VStack(spacing: 10) {
                // Badge tag (e.g., "Best Value")
                if let tag = option.tag {
                    Text(tag)
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(tag == "Best Value" ? CCColor.primary : Color(hex: "#003F87"))
                        .cornerRadius(8)
                } else {
                    Text("") // Spacer for alignment
                        .font(.caption2)
                        .padding(.vertical, 4)
                }

                // Card count icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(CCColor.primary.opacity(0.1))
                        .frame(width: 56, height: 56)

                    VStack(spacing: 2) {
                        Text("\(option.count)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(CCColor.primary)
                        Text(option.count == 1 ? "Card" : "Cards")
                            .font(.caption2)
                            .foregroundColor(CCColor.primary)
                    }
                }

                // Price
                Text(displayPrice)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)

                Text(perCardPrice)
                    .font(.caption)
                    .foregroundColor(.secondary)

                // Buy button / loading
                if isPurchasing {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .frame(height: 36)
                } else if storeProduct != nil {
                    Text("Buy Now")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 36)
                        .background(CCColor.primary)
                        .cornerRadius(8)
                } else {
                    Text("Unavailable")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(height: 36)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(CCColor.surface)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(option.tag == "Best Value" ? CCColor.primary.opacity(0.4) : Color.clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
        .disabled(storeProduct == nil || isPurchasing)
    }

    private var perCardPrice: String {
        guard let product = storeProduct else { return "" }
        let perCard = product.price / Decimal(option.count)
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = product.priceFormatStyle.currencyCode
        formatter.maximumFractionDigits = 2
        if let str = formatter.string(from: perCard as NSDecimalNumber) {
            return "\(str)/card"
        }
        return ""
    }
}

import SwiftUI
import StoreKit

/// Shown during onboarding after signup so new users can optionally subscribe
@MainActor
final class SubscriptionSelectionViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var isPurchasing = false
    @Published var selectedProductId: String?
    @Published var error: String?

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let ids = [APIConstants.IAP.subscriptionAnnual, APIConstants.IAP.subscriptionAnnualScout]
            products = try await Product.products(for: ids)
                .sorted { $0.price < $1.price }
        } catch {
            self.error = "Could not load subscription options."
        }
    }

    func purchase(_ product: Product) async -> Bool {
        isPurchasing = true
        defer { isPurchasing = false }
        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    await transaction.finish()
                    return true
                case .unverified:
                    return false
                }
            case .userCancelled:
                return false
            case .pending:
                return false
            @unknown default:
                return false
            }
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}

struct SubscriptionSelectionView: View {
    let onComplete: () -> Void
    @StateObject private var vm = SubscriptionSelectionViewModel()
    @State private var showDisclosure = false
    @State private var pendingProduct: Product?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    headerSection
                    if vm.isLoading {
                        ProgressView().padding(.top, 40)
                    } else {
                        ForEach(vm.products, id: \.id) { product in
                            SubscriptionPlanCard(product: product) {
                                pendingProduct = product
                                showDisclosure = true
                            }
                        }
                        skipButton
                    }
                    Spacer(minLength: 40)
                }
                .padding()
            }
            .navigationTitle("Choose a Plan")
            .navigationBarTitleDisplayMode(.inline)
            .task { await vm.loadProducts() }
            .sheet(isPresented: $showDisclosure) {
                if let product = pendingProduct {
                    SubscriptionDisclosureView(product: product, onConfirm: {
                        showDisclosure = false
                        Task {
                            let success = await vm.purchase(product)
                            if success { onComplete() }
                        }
                    }, onCancel: {
                        showDisclosure = false
                    })
                }
            }
            .alert("Error", isPresented: .constant(vm.error != nil)) {
                Button("OK") { vm.error = nil }
            } message: { Text(vm.error ?? "") }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "medal.fill")
                .font(.system(size: 50))
                .foregroundColor(Color(hex: "#FFD700"))
            Text("Unlock Full Access")
                .font(.title2).fontWeight(.bold)
            Text("Subscribe to access all offers, merchant deals, and premium Scout features.")
                .font(.subheadline).foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }

    private var skipButton: some View {
        Button("Skip for Now") { onComplete() }
            .font(.subheadline)
            .foregroundColor(.secondary)
            .padding(.top, 8)
    }
}

private struct SubscriptionPlanCard: View {
    let product: Product
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(product.displayName).font(.headline).foregroundColor(.primary)
                        Text(product.description).font(.caption).foregroundColor(.secondary)
                    }
                    Spacer()
                    Text(product.displayPrice)
                        .font(.title3).fontWeight(.bold).foregroundColor(Color(hex: "#003F87"))
                }
                Text("Subscribe \(product.displayPrice)/year")
                    .frame(maxWidth: .infinity).frame(height: 44)
                    .background(Color(hex: "#003F87"))
                    .foregroundColor(.white).fontWeight(.semibold)
                    .cornerRadius(12)
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "#003F87"), lineWidth: 2))
        }
    }
}

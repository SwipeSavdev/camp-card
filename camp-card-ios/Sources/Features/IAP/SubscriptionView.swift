import SwiftUI
import StoreKit

// MARK: - SubscriptionViewModel

@MainActor
final class SubscriptionViewModel: ObservableObject {

    @Published var subscriptionStatus: SubscriptionStatus?
    @Published var plans: [SubscriptionPlan] = []
    @Published var isLoading = false
    @Published var isPurchasing = false
    @Published var error: String?
    @Published var successMessage: String?
    @Published var showCancelConfirm = false

    private let api = APIClient.shared

    func load() async {
        isLoading = true
        error = nil
        async let statusTask: SubscriptionStatus = api.request(.mySubscription)
        async let plansTask: [SubscriptionPlan] = api.request(.subscriptionPlans)
        do {
            let (status, plans) = try await (statusTask, plansTask)
            subscriptionStatus = status
            self.plans = plans
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func cancelSubscription() async {
        isLoading = true
        error = nil
        do {
            try await api.requestVoid(.cancelSubscription)
            // Refresh status
            subscriptionStatus = try await api.request(.mySubscription)
            successMessage = "Your subscription has been cancelled and will remain active until the end of the billing period."
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - SubscriptionView

struct SubscriptionView: View {

    @StateObject private var vm = SubscriptionViewModel()
    @StateObject private var store = StoreService.shared
    @EnvironmentObject private var auth: AuthViewModel

    @State private var disclosureProduct: Product?
    @State private var pendingPurchaseProduct: Product?

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.plans.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            currentStatusCard
                            plansSection
                            restoreButton
                            legalLinks
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationTitle("Subscription")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await vm.load()
                await store.loadProducts()
            }
            .refreshable {
                await vm.load()
                await store.loadProducts()
            }
            .alert("Error", isPresented: Binding(
                get: { vm.error != nil },
                set: { if !$0 { vm.error = nil } }
            )) {
                Button("OK", role: .cancel) { vm.error = nil }
            } message: {
                Text(vm.error ?? "")
            }
            .alert("Success", isPresented: Binding(
                get: { vm.successMessage != nil },
                set: { if !$0 { vm.successMessage = nil } }
            )) {
                Button("OK", role: .cancel) { vm.successMessage = nil }
            } message: {
                Text(vm.successMessage ?? "")
            }
            .confirmationDialog(
                "Cancel Subscription",
                isPresented: $vm.showCancelConfirm,
                titleVisibility: .visible
            ) {
                Button("Cancel Subscription", role: .destructive) {
                    Task { await vm.cancelSubscription() }
                }
                Button("Keep Subscription", role: .cancel) {}
            } message: {
                Text("Your subscription will remain active until the end of the current billing period.")
            }
            // Disclosure sheet before purchase
            .sheet(item: $disclosureProduct) { product in
                SubscriptionDisclosureView(
                    product: product,
                    onConfirm: {
                        disclosureProduct = nil
                        pendingPurchaseProduct = product
                        Task { await executePurchase(product) }
                    },
                    onCancel: {
                        disclosureProduct = nil
                    }
                )
            }
        }
    }

    // MARK: - Current Status Card

    @ViewBuilder
    private var currentStatusCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your Subscription")
                .font(.headline)

            if let status = vm.subscriptionStatus, status.status == "active" {
                activeStatusContent(status: status)
            } else {
                inactiveStatusContent
            }
        }
        .padding(16)
        .background(CCColor.surface)
        .cornerRadius(14)
        .padding(.top, 8)
    }

    private func activeStatusContent(status: SubscriptionStatus) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(.green)
                Text("Active")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
                Spacer()
                if let planName = status.plan?.name {
                    Text(planName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if let periodEnd = status.currentPeriodEnd {
                Text("Renews on \(formatDate(periodEnd))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            if status.cancelAtPeriodEnd == true {
                Label("Cancels at end of period", systemImage: "exclamationmark.circle")
                    .font(.caption)
                    .foregroundColor(.orange)
            }

            Button(role: .destructive) {
                vm.showCancelConfirm = true
            } label: {
                Text("Cancel Subscription")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.red)
            }
        }
    }

    private var inactiveStatusContent: some View {
        HStack(spacing: 10) {
            Image(systemName: "star.slash")
                .foregroundColor(.secondary)
            VStack(alignment: .leading, spacing: 2) {
                Text("No Active Subscription")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("Subscribe to unlock all offers and features.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    // MARK: - Plans Section

    @ViewBuilder
    private var plansSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Choose a Plan")
                .font(.headline)

            if vm.plans.isEmpty && !vm.isLoading {
                Text("No plans available")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 16)
            } else {
                ForEach(vm.plans) { plan in
                    PlanCard(
                        plan: plan,
                        storeProduct: store.product(for: plan.productId ?? ""),
                        isCurrentPlan: vm.subscriptionStatus?.plan?.id == plan.id && vm.subscriptionStatus?.status == "active",
                        isPurchasing: pendingPurchaseProduct?.id == plan.productId,
                        onSubscribe: { product in
                            // Show disclosure before purchasing
                            disclosureProduct = product
                        }
                    )
                }
            }
        }
    }

    // MARK: - Restore Button

    private var restoreButton: some View {
        Button {
            Task {
                do {
                    try await store.restorePurchases()
                    vm.successMessage = "Purchases restored successfully."
                } catch {
                    vm.error = error.localizedDescription
                }
            }
        } label: {
            HStack {
                Image(systemName: "arrow.clockwise")
                Text("Restore Purchases")
                    .fontWeight(.medium)
            }
            .font(.subheadline)
            .foregroundColor(Color(hex: "#003F87"))
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(Color(hex: "#003F87").opacity(0.08))
            .cornerRadius(10)
        }
    }

    // MARK: - Legal Links

    private var legalLinks: some View {
        HStack(spacing: 24) {
            Link(destination: URL(string: "https://campcardapp.org/privacy")!) {
                Text("Privacy Policy")
                    .font(.caption)
                    .foregroundColor(Color(hex: "#003F87"))
                    .underline()
            }
            Link(destination: URL(string: "https://campcardapp.org/terms")!) {
                Text("Terms of Service")
                    .font(.caption)
                    .foregroundColor(Color(hex: "#003F87"))
                    .underline()
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 4)
    }

    // MARK: - Purchase Execution

    private func executePurchase(_ product: Product) async {
        pendingPurchaseProduct = product
        vm.error = nil
        do {
            let completed = try await store.purchase(product)
            if completed {
                vm.successMessage = "Thank you! Your subscription is now active."
                await vm.load()
                // Update AuthViewModel user subscription status
                let updatedUser: User = try await APIClient.shared.request(.me)
                auth.updateUser(updatedUser)
            }
        } catch {
            vm.error = error.localizedDescription
        }
        pendingPurchaseProduct = nil
    }

    // MARK: - Helpers

    private func formatDate(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: isoString) {
            let display = DateFormatter()
            display.dateStyle = .medium
            return display.string(from: date)
        }
        // Fallback: try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: isoString) {
            let display = DateFormatter()
            display.dateStyle = .medium
            return display.string(from: date)
        }
        return isoString
    }
}

// MARK: - Plan Card

private struct PlanCard: View {

    let plan: SubscriptionPlan
    let storeProduct: Product?
    let isCurrentPlan: Bool
    let isPurchasing: Bool
    let onSubscribe: (Product) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(plan.name)
                            .font(.headline)
                        if isCurrentPlan {
                            Text("Current")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.green)
                                .cornerRadius(6)
                        }
                    }
                    Text(plan.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(3)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(storeProduct?.displayPrice ?? "$\(String(format: "%.2f", plan.price))")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(CCColor.primary)
                    Text("/ \(plan.intervalCount == 1 ? plan.interval.lowercased() : "\(plan.intervalCount) \(plan.interval.lowercased())s")")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if !isCurrentPlan {
                if let product = storeProduct {
                    Button {
                        onSubscribe(product)
                    } label: {
                        Group {
                            if isPurchasing {
                                HStack(spacing: 8) {
                                    ProgressView().progressViewStyle(.circular).tint(.white)
                                    Text("Processing...")
                                }
                            } else {
                                Text("Subscribe")
                                    .fontWeight(.semibold)
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(CCColor.primary)
                        .cornerRadius(10)
                    }
                    .disabled(isPurchasing)
                } else {
                    Text("Not available on this device")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isCurrentPlan ? Color.green : CCColor.border, lineWidth: isCurrentPlan ? 2 : 1)
        )
        .background(CCColor.card.cornerRadius(14))
    }
}

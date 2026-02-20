import SwiftUI

// MARK: - ViewModel

@MainActor
final class ParentHomeViewModel: ObservableObject {
    @Published var myCards: MyCardsResponse?
    @Published var referralStats: ReferralStats?
    @Published var featuredOffers: [Offer] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func load() async {
        isLoading = true; error = nil
        do {
            async let cardsResult: MyCardsResponse = api.request(.myCards)
            async let referralResult: ReferralStats = api.request(.referralStats)
            async let offersPage: Page<Offer> = api.request(.featuredOffers)
            let (c, r, o) = try await (cardsResult, referralResult, offersPage)
            myCards = c
            referralStats = r
            featuredOffers = Array(o.content.prefix(3))
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - ParentHomeView

struct ParentHomeView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var vm = ParentHomeViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {

                // Role-colored header (matches RN CustomerDashboard)
                DashboardHeader(
                    firstName: auth.user?.firstName ?? "there",
                    role: auth.user?.role
                )

                VStack(alignment: .leading, spacing: 20) {
                    if vm.isLoading {
                        SkeletonDashboard()
                    } else if let err = vm.error {
                        errorView(err)
                    } else {
                        activeCampCardSection
                        savingsOverviewCard
                        statsGrid
                        quickActionsSection
                        featuredOffersSection
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 20)
                .padding(.bottom, 32)
            }
        }
        .ignoresSafeArea(.container, edges: .top)
        .navigationBarHidden(true)
        .ccScreenBackground()
        .task { await vm.load() }
        .refreshable { await vm.load() }
    }

    // MARK: - Error state

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 36))
                .foregroundColor(CCColor.error)
            Text(message)
                .font(.subheadline)
                .foregroundColor(CCColor.textSecondary)
                .multilineTextAlignment(.center)
            Button("Retry") { Task { await vm.load() } }
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(CCColor.primary)
                .cornerRadius(8)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(CCColor.surface)
        .cornerRadius(12)
    }

    // MARK: - Active Camp Card section

    @ViewBuilder
    private var activeCampCardSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("My Camp Card")
                .font(.system(size: 18, weight: .semibold))

            if let card = vm.myCards?.activeCard {
                NavigationLink(destination: OffersListView()) {
                    ZStack {
                        LinearGradient(
                            colors: [CCColor.primary, Color(hex: "#8B0000")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        .cornerRadius(16)

                        VStack(alignment: .leading, spacing: 0) {
                            HStack {
                                Text("CAMP CARD")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white.opacity(0.85))
                                    .tracking(2)
                                Spacer()
                                Text("ACTIVE")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(CCColor.primary)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(Color.white)
                                    .cornerRadius(10)
                            }
                            Spacer()
                            if let n = card.cardNumber {
                                Text("•••• •••• •••• \(String(n.suffix(4)))")
                                    .font(.system(size: 16, weight: .semibold, design: .monospaced))
                                    .foregroundColor(.white)
                                    .tracking(2)
                            }
                            Spacer()
                            HStack(alignment: .bottom) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("OFFERS USED")
                                        .font(.system(size: 8, weight: .medium))
                                        .foregroundColor(.white.opacity(0.65))
                                        .tracking(1)
                                    Text("\(card.offersUsed ?? 0) / \(card.totalOffers ?? 0)")
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(.white)
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("SAVED")
                                        .font(.system(size: 8, weight: .medium))
                                        .foregroundColor(.white.opacity(0.65))
                                        .tracking(1)
                                    Text("$\(String(format: "%.2f", card.totalSavings ?? 0))")
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(.white)
                                }
                            }
                        }
                        .padding(18)
                    }
                    .frame(height: 160)
                    .shadow(color: CCColor.primary.opacity(0.4), radius: 12, x: 0, y: 6)
                }
                .buttonStyle(.plain)
            } else {
                NavigationLink(destination: SubscriptionView()) {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(CCColor.primary.opacity(0.1))
                                .frame(width: 52, height: 52)
                            Image(systemName: "creditcard.and.123")
                                .font(.system(size: 22))
                                .foregroundColor(CCColor.primary)
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Get Your Camp Card")
                                .font(.system(size: 15, weight: .semibold))
                            Text("Subscribe to access exclusive offers")
                                .font(.system(size: 13))
                                .foregroundColor(CCColor.textSecondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(CCColor.textSecondary)
                    }
                    .padding(16)
                    .background(CCColor.surface)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Savings Overview Card

    private var savingsOverviewCard: some View {
        let activeCard = vm.myCards?.activeCard
        let totalSavings = activeCard?.totalSavings ?? 0
        let offersRedeemed = activeCard?.offersUsed ?? 0

        return HStack(spacing: 0) {
            VStack(spacing: 4) {
                Text("$\(String(format: "%.2f", totalSavings))")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(CCColor.primary)
                Text("Total Savings")
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
            }
            .frame(maxWidth: .infinity)

            Rectangle()
                .fill(CCColor.border)
                .frame(width: 1, height: 40)

            VStack(spacing: 4) {
                Text("\(offersRedeemed)")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(CCColor.secondary)
                Text("Offers Redeemed")
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(18)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }

    // MARK: - Stats 2x2 Grid

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
            StatCard(
                value: "\(vm.myCards?.activeCard?.offersUsed ?? 0)",
                label: "Offers Used",
                icon: "tag.fill",
                color: CCColor.primary
            )
            StatCard(
                value: "$\(String(format: "%.0f", vm.myCards?.activeCard?.totalSavings ?? 0))",
                label: "Total Saved",
                icon: "dollarsign.circle.fill",
                color: CCColor.secondary
            )
            StatCard(
                value: "\(vm.referralStats?.referralCount ?? 0)",
                label: "Referrals",
                icon: "person.2.fill",
                color: CCColor.primary
            )
            StatCard(
                value: "\(vm.myCards?.totalCards ?? 0)",
                label: "Active Cards",
                icon: "creditcard.fill",
                color: CCColor.secondary
            )
        }
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.system(size: 18, weight: .semibold))
            HStack(spacing: 10) {
                NavigationLink(destination: OffersListView()) {
                    ParentActionChip(icon: "tag.fill", label: "Browse Offers")
                }
                .buttonStyle(.plain)

                NavigationLink(destination: MerchantsListView()) {
                    ParentActionChip(icon: "storefront.fill", label: "View Merchants")
                }
                .buttonStyle(.plain)

                NavigationLink(destination: ScoutQRCodeView()) {
                    ParentActionChip(icon: "qrcode", label: "My QR Code")
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Featured Offers

    private var featuredOffersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Featured Offers")
                    .font(.system(size: 18, weight: .semibold))
                Spacer()
                NavigationLink(destination: OffersListView()) {
                    Text("See All")
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.primary)
                }
            }

            if vm.featuredOffers.isEmpty {
                Text("No featured offers available")
                    .font(.subheadline)
                    .foregroundColor(CCColor.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
            } else {
                VStack(spacing: 10) {
                    ForEach(vm.featuredOffers) { offer in
                        NavigationLink(destination: OfferDetailView(offerId: offer.id)) {
                            OfferRowCard(offer: offer)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}

// MARK: - ParentActionChip

struct ParentActionChip: View {
    let icon: String
    let label: String

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(CCColor.primary.opacity(0.1))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(CCColor.primary)
            }
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(CCColor.text)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .padding(.horizontal, 8)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - OfferTileCard (horizontal scroll card — kept for backward compatibility)

struct OfferTileCard: View {
    let offer: Offer

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: offer.imageUrl ?? "")) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    CCColor.border
                        .overlay(Image(systemName: "tag.fill").foregroundColor(.secondary))
                }
                .frame(width: 160, height: 100)
                .clipped()
                .cornerRadius(10)

                Text(offer.displayDiscount)
                    .font(.caption2).fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(CCColor.primary)
                    .cornerRadius(6)
                    .padding(6)
            }
            Text(offer.merchantName)
                .font(.caption).foregroundColor(.secondary)
            Text(offer.title)
                .font(.caption).fontWeight(.medium)
                .lineLimit(2)
        }
        .frame(width: 160)
    }
}

// MARK: - MerchantRowItem (kept for backward compatibility)

struct MerchantRowItem: View {
    let merchant: Merchant

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: merchant.logoUrl ?? "")) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                CCColor.border
                    .overlay(Image(systemName: "storefront").foregroundColor(.secondary))
            }
            .frame(width: 44, height: 44)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text(merchant.businessName)
                    .font(.subheadline).fontWeight(.medium)
                if let category = merchant.category {
                    Text(category)
                        .font(.caption).foregroundColor(.secondary)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption).foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

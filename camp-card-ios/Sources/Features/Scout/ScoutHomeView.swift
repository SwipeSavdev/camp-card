import SwiftUI

// MARK: - ViewModel

@MainActor
final class ScoutHomeViewModel: ObservableObject {
    @Published var referralStats: ReferralStats?
    @Published var featuredOffers: [Offer] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func load() async {
        isLoading = true; error = nil
        do {
            async let stats: ReferralStats = api.request(.referralStats)
            async let offersPage: Page<Offer> = api.request(.featuredOffers)
            let (s, o) = try await (stats, offersPage)
            referralStats = s
            featuredOffers = Array(o.content.prefix(3))
        } catch { self.error = error.localizedDescription }
        isLoading = false
    }
}

// MARK: - ScoutHomeView

struct ScoutHomeView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var vm = ScoutHomeViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {

                DashboardHeader(
                    firstName: auth.user?.firstName ?? "Scout",
                    role: .scout
                )

                VStack(alignment: .leading, spacing: 20) {
                    if vm.isLoading {
                        SkeletonDashboard()
                    } else {
                        earningsCard
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

    // MARK: - Earnings Card (matches RN earnings progress card)

    private var earningsCard: some View {
        ZStack(alignment: .bottomTrailing) {
            LinearGradient(
                colors: [CCColor.primary, Color(hex: "#8B0000")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .cornerRadius(16)

            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("SCOUT EARNINGS")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white.opacity(0.85))
                        .tracking(2)
                    Spacer()
                    Image(systemName: "star.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.6))
                }
                Spacer()
                Text("$\(String(format: "%.2f", vm.referralStats?.totalEarnings ?? 0))")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                Text("Total Earned")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.75))
                    .padding(.top, 2)
                Spacer()
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("REFERRALS")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(.white.opacity(0.65))
                            .tracking(1)
                        Text("\(vm.referralStats?.referralCount ?? 0)")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("QR SCANS")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(.white.opacity(0.65))
                            .tracking(1)
                        Text("\(vm.referralStats?.qrScans ?? 0)")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding(20)
        }
        .frame(height: 180)
        .shadow(color: CCColor.primary.opacity(0.4), radius: 12, x: 0, y: 6)
        .accessibilityLabel("Earnings card: $\(String(format: "%.2f", vm.referralStats?.totalEarnings ?? 0)) total earned")
    }

    // MARK: - Stats Grid (2×2, matches RN stat cards)

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(
                value: "\(vm.referralStats?.linkClicks ?? 0)",
                label: "Link Clicks",
                icon: "link",
                color: CCColor.primary
            )
            StatCard(
                value: "\(vm.referralStats?.qrScans ?? 0)",
                label: "QR Scans",
                icon: "qrcode.viewfinder",
                color: CCColor.secondary
            )
            StatCard(
                value: "\(vm.referralStats?.referralCount ?? 0)",
                label: "Referrals",
                icon: "person.2.fill",
                color: CCColor.success
            )
            StatCard(
                value: "$\(String(format: "%.0f", vm.referralStats?.totalEarnings ?? 0))",
                label: "Earned",
                icon: "dollarsign.circle.fill",
                color: Color(hex: "#F59E0B")
            )
        }
    }

    // MARK: - Quick Actions (matches RN linkButtons style)

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.system(size: 18, weight: .semibold))
            HStack(spacing: 12) {
                NavigationLink(destination: ReferralView()) {
                    ScoutActionChip(icon: "square.and.arrow.up", label: "Share Link")
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Share Referral Link")

                NavigationLink(destination: OffersListView()) {
                    ScoutActionChip(icon: "tag.fill", label: "View Offers")
                }
                .buttonStyle(.plain)
                .accessibilityLabel("View Offers")

                NavigationLink(destination: SubscriptionView()) {
                    ScoutActionChip(icon: "star.circle.fill", label: "Subscription")
                }
                .buttonStyle(.plain)
                .accessibilityLabel("My Subscription")
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
                Text("No featured offers")
                    .font(.subheadline)
                    .foregroundColor(CCColor.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 16)
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

// MARK: - ScoutActionChip
// Matches RN's linkButtons / actionCard style (icon container + label)

struct ScoutActionChip: View {
    let icon: String
    let label: String

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(CCColor.primary.opacity(0.12))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(CCColor.primary)
            }
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(CCColor.text)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

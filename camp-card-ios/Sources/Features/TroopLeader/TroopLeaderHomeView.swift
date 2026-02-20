import SwiftUI

// MARK: - ViewModel

@MainActor
final class TroopLeaderHomeViewModel: ObservableObject {
    @Published var dashboard: TroopDashboard?
    @Published var scouts: [Scout] = []
    @Published var isLoading = false
    @Published var error: String?

    func load() async {
        isLoading = true; error = nil
        async let dashResult: TroopDashboard = APIClient.shared.request(.troopDashboard)
        async let scoutsResult: [Scout] = APIClient.shared.request(.troopScouts)
        do {
            let (d, s) = try await (dashResult, scoutsResult)
            dashboard = d; scouts = Array(s.prefix(3))
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - TroopLeaderHomeView

struct TroopLeaderHomeView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var vm = TroopLeaderHomeViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {

                // BSA Blue header — matches RN UnitLeaderDashboard
                DashboardHeader(
                    firstName: auth.user?.firstName ?? "Leader",
                    role: .troopLeader
                )

                VStack(alignment: .leading, spacing: 20) {
                    if vm.isLoading {
                        SkeletonDashboard()
                    } else if let err = vm.error {
                        retryView(err)
                    } else {
                        if let d = vm.dashboard { progressCard(d) }
                        statsGrid
                        quickActionsSection
                        scoutsSection
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

    // MARK: - Retry view

    private func retryView(_ message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 36))
                .foregroundColor(CCColor.error)
            Text(message)
                .font(.subheadline)
                .foregroundColor(CCColor.textSecondary)
                .multilineTextAlignment(.center)
            Button("Try Again") { Task { await vm.load() } }
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 10)
                .background(CCColor.secondary)
                .cornerRadius(8)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(CCColor.surface)
        .cornerRadius(12)
    }

    // MARK: - Fundraising Progress Card (matches RN progressCard)

    private func progressCard(_ d: TroopDashboard) -> some View {
        ZStack(alignment: .bottomTrailing) {
            LinearGradient(
                colors: [CCColor.secondary, Color(hex: "#001A3A")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .cornerRadius(16)

            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("FUNDRAISING PROGRESS")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white.opacity(0.85))
                            .tracking(2)
                        Text("$\(String(format: "%.0f", d.totalRaised ?? 0)) raised")
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.75))
                    }
                    Spacer()
                    if let raised = d.totalRaised, let goal = d.goal, goal > 0 {
                        Text("\(Int(min((raised / goal), 1.0) * 100))%")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                Spacer()

                // Progress bar
                if let raised = d.totalRaised, let goal = d.goal, goal > 0 {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.25))
                                .frame(height: 8)
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white)
                                .frame(width: geo.size.width * min(raised / goal, 1.0), height: 8)
                        }
                    }
                    .frame(height: 8)
                    .padding(.bottom, 8)

                    HStack {
                        Text("$\(String(format: "%.0f", raised)) raised")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.7))
                        Spacer()
                        Text("Goal: $\(String(format: "%.0f", goal))")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
            }
            .padding(20)
        }
        .frame(height: 160)
        .shadow(color: CCColor.secondary.opacity(0.4), radius: 12, x: 0, y: 6)
    }

    // MARK: - Stats Grid (2×2, matches RN stat cards)

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(
                value: "\(vm.dashboard?.totalScouts ?? 0)",
                label: "Active Scouts",
                icon: "person.3.fill",
                color: CCColor.secondary
            )
            StatCard(
                value: "\(vm.dashboard?.activeCards ?? 0)",
                label: "Active Cards",
                icon: "creditcard.fill",
                color: CCColor.primary
            )
            StatCard(
                value: "\(vm.dashboard?.redemptionsThisMonth ?? 0)",
                label: "Redemptions This Month",
                icon: "tag.fill",
                color: CCColor.secondary
            )
            StatCard(
                value: goalAchievedPercent,
                label: "Goal Achieved",
                icon: "target",
                color: CCColor.primary
            )
        }
    }

    private var goalAchievedPercent: String {
        guard let raised = vm.dashboard?.totalRaised,
              let goal = vm.dashboard?.goal,
              goal > 0 else { return "0%" }
        return "\(Int(min(raised / goal, 1.0) * 100))%"
    }

    // MARK: - Quick Actions (3 chips — matches RN linkButtons)

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.system(size: 18, weight: .semibold))
            HStack(spacing: 10) {
                NavigationLink(destination: ManageScoutsView()) {
                    LeaderActionChip(icon: "person.3.fill", label: "Manage Scouts", color: CCColor.secondary)
                }
                .buttonStyle(.plain)

                NavigationLink(destination: TroopStatsView()) {
                    LeaderActionChip(icon: "chart.bar.fill", label: "View Stats", color: CCColor.secondary)
                }
                .buttonStyle(.plain)

                NavigationLink(destination: OffersListView()) {
                    LeaderActionChip(icon: "tag.fill", label: "View Offers", color: CCColor.secondary)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Scouts Preview section

    private var scoutsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Scouts")
                    .font(.system(size: 18, weight: .semibold))
                Spacer()
                NavigationLink(destination: ManageScoutsView()) {
                    Text("View All")
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.secondary)
                }
            }

            if vm.scouts.isEmpty {
                VStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(CCColor.secondary.opacity(0.1))
                            .frame(width: 64, height: 64)
                        Image(systemName: "person.3")
                            .font(.system(size: 28))
                            .foregroundColor(CCColor.secondary)
                    }
                    Text("No scouts yet")
                        .font(.system(size: 15, weight: .semibold))
                    NavigationLink(destination: ManageScoutsView()) {
                        Text("Invite Scouts")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(CCColor.secondary)
                            .cornerRadius(8)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .background(CCColor.surface)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(vm.scouts.enumerated()), id: \.element.userId) { idx, scout in
                        scoutRow(scout: scout)
                        if idx < vm.scouts.count - 1 {
                            Divider().padding(.leading, 62)
                        }
                    }
                }
                .background(CCColor.surface)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
            }
        }
    }

    private func scoutRow(scout: Scout) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(CCColor.secondary)
                    .frame(width: 40, height: 40)
                Text(String(scout.firstName.prefix(1)).uppercased())
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(scout.fullName)
                    .font(.system(size: 15, weight: .medium))
                Text(scout.rank ?? scout.email)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("$\(String(format: "%.0f", scout.totalSales ?? 0))")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(CCColor.secondary)
                Text("\(scout.cardsSold ?? 0) sold")
                    .font(.system(size: 11))
                    .foregroundColor(CCColor.textSecondary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(scout.fullName), \(scout.cardsSold ?? 0) cards sold, $\(Int(scout.totalSales ?? 0)) in sales")
    }
}

// MARK: - LeaderActionChip

struct LeaderActionChip: View {
    let icon: String
    let label: String
    var color: Color = CCColor.secondary

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(color.opacity(0.12))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
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

// MARK: - StatCard
// Shared reusable component — matches RN stat card style (icon container + value + label)

struct StatCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(color.opacity(0.12))
                    .frame(width: 40, height: 40)
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(CCColor.text)
                Text(label)
                    .font(.system(size: 11))
                    .foregroundColor(CCColor.textSecondary)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }
}

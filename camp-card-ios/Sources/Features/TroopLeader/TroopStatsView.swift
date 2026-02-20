import SwiftUI

// MARK: - ViewModel

@MainActor
final class TroopStatsViewModel: ObservableObject {
    @Published var dashboard: TroopDashboard?
    @Published var isLoading = false
    @Published var error: String?

    func load() async {
        isLoading = true; error = nil
        do {
            dashboard = try await APIClient.shared.request(.troopDashboard)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - TroopStatsView

struct TroopStatsView: View {
    @StateObject private var vm = TroopStatsViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if vm.isLoading {
                    SkeletonDashboard()
                        .padding(.top, 8)
                } else if let d = vm.dashboard {
                    statsGrid(d: d)
                    progressCard(d: d)
                    fundraisingBreakdown(d: d)
                } else if let err = vm.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(CCColor.textSecondary)
                        Text(err)
                            .font(.subheadline)
                            .foregroundColor(CCColor.textSecondary)
                            .multilineTextAlignment(.center)
                        Button("Try Again") { Task { await vm.load() } }
                            .buttonStyle(.borderedProminent)
                            .tint(CCColor.primary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(32)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 32)
        }
        .navigationTitle("Troop Stats")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .task { await vm.load() }
        .refreshable { await vm.load() }
    }

    // MARK: - Stats Grid (uses shared StatCard)

    private func statsGrid(d: TroopDashboard) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(
                value: "$\(String(format: "%.0f", d.totalRaised ?? 0))",
                label: "Total Raised",
                icon: "dollarsign.circle.fill",
                color: CCColor.secondary
            )
            StatCard(
                value: "$\(String(format: "%.0f", d.goal ?? 0))",
                label: "Goal",
                icon: "target",
                color: CCColor.primary
            )
            StatCard(
                value: "\(d.totalScouts ?? 0)",
                label: "Scouts",
                icon: "person.3.fill",
                color: CCColor.secondary
            )
            StatCard(
                value: "\(d.activeCards ?? 0)",
                label: "Active Cards",
                icon: "creditcard.fill",
                color: CCColor.primary
            )
            StatCard(
                value: "\(d.redemptionsThisMonth ?? 0)",
                label: "Redemptions",
                icon: "tag.fill",
                color: CCColor.success
            )
            StatCard(
                value: goalPercent(d: d),
                label: "Goal %",
                icon: "chart.bar.fill",
                color: Color(hex: "#F59E0B")
            )
        }
    }

    // MARK: - Progress Card

    private func progressCard(d: TroopDashboard) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 18))
                    .foregroundColor(CCColor.secondary)
                Text("Progress to Goal")
                    .font(.system(size: 17, weight: .semibold))
                Spacer()
                Text(goalPercent(d: d))
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(CCColor.secondary)
            }

            let raised = d.totalRaised ?? 0
            let goal = max(d.goal ?? 1, 1)
            let progress = min(raised / goal, 1.0)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(CCColor.border)
                        .frame(height: 12)
                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(
                                colors: [CCColor.secondary, Color(hex: "#0066CC")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * progress, height: 12)
                }
            }
            .frame(height: 12)

            HStack {
                Text("$\(String(format: "%.2f", d.totalRaised ?? 0)) raised")
                    .font(.system(size: 13))
                    .foregroundColor(CCColor.textSecondary)
                Spacer()
                Text("Goal: $\(String(format: "%.2f", d.goal ?? 0))")
                    .font(.system(size: 13))
                    .foregroundColor(CCColor.textSecondary)
            }
        }
        .padding(20)
        .background(CCColor.card)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }

    // MARK: - Fundraising Breakdown

    private func fundraisingBreakdown(d: TroopDashboard) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Fundraising Summary")
                .font(.system(size: 17, weight: .semibold))

            BreakdownRow(label: "Total Scouts", value: "\(d.totalScouts ?? 0) scouts")
            Divider()
            BreakdownRow(label: "Active Camp Cards", value: "\(d.activeCards ?? 0) cards")
            Divider()
            BreakdownRow(label: "Redemptions This Month", value: "\(d.redemptionsThisMonth ?? 0)")
            Divider()
            BreakdownRow(
                label: "Avg. Raised per Scout",
                value: avgPerScout(d: d)
            )
        }
        .padding(20)
        .background(CCColor.card)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }

    // MARK: - Helpers

    private func goalPercent(d: TroopDashboard) -> String {
        guard let raised = d.totalRaised, let goal = d.goal, goal > 0 else { return "0%" }
        return "\(Int((raised / goal) * 100))%"
    }

    private func avgPerScout(d: TroopDashboard) -> String {
        guard let raised = d.totalRaised,
              let scouts = d.totalScouts, scouts > 0 else { return "$0.00" }
        return "$\(String(format: "%.2f", raised / Double(scouts)))"
    }
}

// MARK: - BreakdownRow

private struct BreakdownRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(CCColor.textSecondary)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(CCColor.text)
        }
    }
}

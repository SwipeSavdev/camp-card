import SwiftUI

// MARK: - ViewModel

@MainActor
final class ReferralViewModel: ObservableObject {
    @Published var stats: ReferralStats?
    @Published var referralCode: ReferralCode?
    @Published var isLoading = false
    @Published var copyToastVisible = false

    func load() async {
        isLoading = true
        async let statsResult: ReferralStats = APIClient.shared.request(.referralStats)
        async let codeResult: ReferralCode = APIClient.shared.request(.referralCode)
        do {
            let (s, c) = try await (statsResult, codeResult)
            stats = s; referralCode = c
        } catch {}
        isLoading = false
    }

    var referralURL: String {
        referralCode.map { $0.url ?? "https://campcardapp.org/ref/\($0.code)" } ?? ""
    }

    func copyLink() {
        guard !referralURL.isEmpty else { return }
        UIPasteboard.general.string = referralURL
        withAnimation { copyToastVisible = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { self.copyToastVisible = false }
        }
    }

    func shareLink() {
        guard !referralURL.isEmpty else { return }
        let text = "Save money with Camp Card! Use my referral link: \(referralURL)"
        let vc = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
            .first?.windows.first?.rootViewController?.present(vc, animated: true)
    }
}

// MARK: - ReferralView

struct ReferralView: View {
    @StateObject private var vm = ReferralViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if vm.isLoading {
                    SkeletonDashboard()
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                } else {
                    // Stats grid
                    if let stats = vm.stats {
                        statsGrid(stats: stats)
                    }

                    // Referral link card
                    referralLinkCard

                    // How it works
                    howItWorksSection
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 32)
        }
        .navigationTitle("Referrals")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .overlay(alignment: .top) {
            if vm.copyToastVisible {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Link copied!")
                        .font(.system(size: 14, weight: .medium))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(CCColor.surface)
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.12), radius: 8, x: 0, y: 4)
                .padding(.top, 8)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .animation(.spring(), value: vm.copyToastVisible)
    }

    // MARK: - Stats Grid

    private func statsGrid(stats: ReferralStats) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(
                value: "\(stats.referralCount)",
                label: "Referrals",
                icon: "person.2.fill",
                color: CCColor.primary
            )
            StatCard(
                value: "\(stats.linkClicks)",
                label: "Link Clicks",
                icon: "link",
                color: CCColor.secondary
            )
            StatCard(
                value: "\(stats.qrScans)",
                label: "QR Scans",
                icon: "qrcode.viewfinder",
                color: CCColor.success
            )
            StatCard(
                value: "$\(String(format: "%.2f", stats.totalEarnings))",
                label: "Earnings",
                icon: "dollarsign.circle.fill",
                color: Color(hex: "#F59E0B")
            )
        }
    }

    // MARK: - Referral Link Card

    private var referralLinkCard: some View {
        VStack(spacing: 16) {
            // Title
            HStack {
                Image(systemName: "link.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(CCColor.primary)
                Text("Your Referral Link")
                    .font(.system(size: 17, weight: .semibold))
                Spacer()
            }

            // URL row
            HStack(spacing: 12) {
                Text(vm.referralURL)
                    .font(.system(size: 13))
                    .foregroundColor(CCColor.textSecondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Button(action: vm.copyLink) {
                    Text("Copy")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(CCColor.primary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(CCColor.primary.opacity(0.1))
                        .cornerRadius(8)
                }
                .accessibilityLabel("Copy referral link")
            }
            .padding(14)
            .background(CCColor.background)
            .cornerRadius(10)

            // Share button
            Button(action: vm.shareLink) {
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                    Text("Share Your Referral Link")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(CCColor.primary)
                .cornerRadius(12)
            }
            .accessibilityLabel("Share your referral link")
        }
        .padding(20)
        .background(CCColor.card)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }

    // MARK: - How It Works

    private var howItWorksSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How It Works")
                .font(.system(size: 17, weight: .semibold))

            VStack(spacing: 12) {
                HowItWorksStep(
                    step: "1",
                    icon: "square.and.arrow.up",
                    title: "Share Your Link",
                    description: "Share your unique referral link with friends and family"
                )
                HowItWorksStep(
                    step: "2",
                    icon: "person.badge.plus",
                    title: "They Sign Up",
                    description: "Your friends create an account using your referral link"
                )
                HowItWorksStep(
                    step: "3",
                    icon: "dollarsign.circle.fill",
                    title: "You Earn",
                    description: "Earn rewards for every successful referral you make"
                )
            }
        }
        .padding(20)
        .background(CCColor.card)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }
}

// MARK: - HowItWorksStep

private struct HowItWorksStep: View {
    let step: String
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            ZStack {
                Circle()
                    .fill(CCColor.primary.opacity(0.1))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(CCColor.primary)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(CCColor.text)
                Text(description)
                    .font(.system(size: 13))
                    .foregroundColor(CCColor.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Step \(step): \(title). \(description)")
    }
}

// StatCard is defined in TroopLeaderHomeView.swift (shared across app)

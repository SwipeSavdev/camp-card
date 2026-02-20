import SwiftUI
import CoreImage.CIFilterBuiltins

// MARK: - ViewModel

@MainActor
final class WalletViewModel: ObservableObject {
    @Published var myCards: MyCardsResponse?
    @Published var recentRedemptions: [RedemptionRecord] = []
    @Published var isLoading = false
    @Published var error: String?

    func load() async {
        isLoading = true
        error = nil
        do {
            async let cardsResult: MyCardsResponse = APIClient.shared.request(.myCards)
            async let historyResult: Page<RedemptionRecord> = APIClient.shared.request(.redemptionHistory(page: 0, size: 5))
            let (c, h) = try await (cardsResult, historyResult)
            myCards = c
            recentRedemptions = Array(h.content.prefix(5))
        } catch {
            // Fallback — try cards only
            if let cards = try? await APIClient.shared.request(.myCards) as MyCardsResponse {
                myCards = cards
            }
            self.error = nil  // suppress to avoid blank state on partial success
        }
        isLoading = false
    }
}

// MARK: - WalletView

struct WalletView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var vm = WalletViewModel()
    @State private var showGiftSheet = false
    @State private var isFlipped = false

    var body: some View {
        Group {
            if vm.isLoading && vm.myCards == nil {
                SkeletonDashboard()
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
            } else {
                walletContent
            }
        }
        .navigationTitle("My Wallet")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
        .refreshable { await vm.load() }
    }

    // MARK: - Main content

    private var walletContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Active card section
                if let active = vm.myCards?.activeCard {
                    activeCardSection(card: active)
                } else {
                    emptyActiveCard
                }

                // Stats grid
                if let active = vm.myCards?.activeCard {
                    statsGrid(card: active)
                }

                // Quick Actions
                quickActionsSection

                // Recent Redemptions
                if !vm.recentRedemptions.isEmpty {
                    recentRedemptionsSection
                }

                // Other cards
                if let unused = vm.myCards?.unusedCards, !unused.isEmpty {
                    otherCardsSection(title: "Unused Cards", cards: unused)
                }
                if let gifted = vm.myCards?.giftedCards, !gifted.isEmpty {
                    otherCardsSection(title: "Gifted Cards", cards: gifted)
                }
                if let expired = vm.myCards?.expiredCards, !expired.isEmpty {
                    otherCardsSection(title: "Expired Cards", cards: expired)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
            .padding(.bottom, 32)
        }
        .ccScreenBackground()
    }

    // MARK: - Flip Card (matches RN campcard_skin design)

    private func activeCardSection(card: CampCard) -> some View {
        let screenW = UIScreen.main.bounds.width
        let cardW   = screenW - 32   // 16pt padding each side
        let cardH   = cardW * 0.63   // standard card ratio

        return VStack(spacing: 12) {
            // Card
            ZStack {
                cardFront(card: card, width: cardW, height: cardH)
                    .rotation3DEffect(.degrees(isFlipped ? 180 : 0),
                                      axis: (x: 0, y: 1, z: 0), perspective: 0.4)
                    .opacity(isFlipped ? 0 : 1)

                cardBack(card: card, width: cardW, height: cardH)
                    .rotation3DEffect(.degrees(isFlipped ? 0 : -180),
                                      axis: (x: 0, y: 1, z: 0), perspective: 0.4)
                    .opacity(isFlipped ? 1 : 0)
            }
            .frame(width: cardW, height: cardH)
            .shadow(color: .black.opacity(0.25), radius: 16, x: 0, y: 8)
            .animation(.spring(duration: 0.5, bounce: 0.1), value: isFlipped)

            // Flip button (matches RN style)
            Button {
                isFlipped.toggle()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.triangle.2.circlepath")
                        .font(.system(size: 14, weight: .semibold))
                    Text(isFlipped ? "View Front" : "Flip")
                        .font(.system(size: 13, weight: .semibold))
                }
                .foregroundColor(CCColor.primary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(CCColor.primary.opacity(0.12))
                .cornerRadius(16)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Card Front (campcard_skin.jpg background)

    private func cardFront(card: CampCard, width: CGFloat, height: CGFloat) -> some View {
        ZStack(alignment: .topTrailing) {
            // Background — the physical card skin image
            if let path = Bundle.main.path(forResource: "campcard_skin", ofType: "jpg"),
               let uiImg = UIImage(contentsOfFile: path) {
                Image(uiImage: uiImg)
                    .resizable()
                    .scaledToFill()
                    .frame(width: width, height: height)
                    .clipped()
            } else {
                // Fallback gradient if image not found
                LinearGradient(colors: [CCColor.primary, Color(hex: "#8B0000")],
                               startPoint: .topLeading, endPoint: .bottomTrailing)
            }

            // Status badge (top-right)
            let (statusText, statusColor) = cardStatusInfo(card)
            Text(statusText)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 5)
                .background(statusColor)
                .cornerRadius(12)
                .padding(14)
        }
        .frame(width: width, height: height)
        .cornerRadius(16)
        .clipped()
    }

    // MARK: - Card Back (navy + details + QR)

    private func cardBack(card: CampCard, width: CGFloat, height: CGFloat) -> some View {
        ZStack(alignment: .bottomTrailing) {
            // Navy background
            Color(hex: "#001a3a")

            VStack(spacing: 0) {
                // Magnetic strip
                Color(hex: "#1a1a1a")
                    .frame(height: 40)
                    .padding(.top, 20)

                // Card details
                VStack(alignment: .leading, spacing: 8) {
                    backDetailRow(label: "CARD NUMBER",
                                  value: card.cardNumber ?? "—")
                    backDetailRow(label: "MEMBER NAME",
                                  value: auth.user?.fullName ?? "—")
                    backDetailRow(label: "EMAIL",
                                  value: auth.user?.email ?? "—")

                    HStack(spacing: 0) {
                        VStack(alignment: .leading, spacing: 2) {
                            backLabel("VALID THRU")
                            backValue(cardExpiryString(card))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        VStack(alignment: .leading, spacing: 2) {
                            backLabel("MEMBER SINCE")
                            backValue(memberSinceString(card))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    HStack(spacing: 0) {
                        VStack(alignment: .leading, spacing: 2) {
                            backLabel("COUNCIL")
                            backValue(auth.user?.councilId.map { "Council \($0)" } ?? "Not assigned")
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        VStack(alignment: .leading, spacing: 2) {
                            backLabel("SUBSCRIPTION")
                            backValue(auth.user?.subscriptionStatus?.capitalized ?? "None")
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)

                Spacer()
            }
            .frame(width: width, height: height)

            // QR code — bottom-right
            if let qrImg = generateQR(from: card.cardNumber ?? card.uuid) {
                Image(uiImage: qrImg)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .padding(6)
                    .background(.white)
                    .cornerRadius(8)
                    .padding(16)
                    .accessibilityLabel("QR code: \(card.cardNumber ?? card.uuid)")
            }
        }
        .frame(width: width, height: height)
        .cornerRadius(16)
        .clipped()
    }

    // MARK: - Card back helpers

    private func backLabel(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 9, weight: .semibold))
            .foregroundColor(.white.opacity(0.6))
            .tracking(0.5)
    }

    private func backValue(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(.white)
            .lineLimit(1)
    }

    private func backDetailRow(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            backLabel(label)
            backValue(value)
        }
    }

    private func cardStatusInfo(_ card: CampCard) -> (String, Color) {
        switch card.status {
        case .active:    return ("Active",  Color(hex: "#4CAF50"))
        case .available: return ("Pending", Color(hex: "#FF9800"))
        default:         return ("Expired", Color(hex: "#F44336"))
        }
    }

    private func cardExpiryString(_ card: CampCard) -> String {
        guard let raw = card.expiresAt else { return "—" }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withFullDate, .withDashSeparatorInDate]
        if let date = iso.date(from: raw) ?? ISO8601DateFormatter().date(from: raw) {
            let f = DateFormatter()
            f.dateFormat = "MM/yy"
            return f.string(from: date)
        }
        return String(raw.prefix(7)).replacingOccurrences(of: "-", with: "/")
    }

    private func memberSinceString(_ card: CampCard) -> String {
        let raw = card.activatedAt ?? card.createdAt
        guard let raw else { return "—" }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withFullDate, .withDashSeparatorInDate]
        if let date = iso.date(from: raw) ?? ISO8601DateFormatter().date(from: raw) {
            let f = DateFormatter()
            f.dateFormat = "MMM yyyy"
            return f.string(from: date)
        }
        return String(raw.prefix(7))
    }

    private var emptyActiveCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "creditcard.and.123")
                .font(.system(size: 48))
                .foregroundColor(CCColor.textSecondary)
            Text("No Active Card")
                .font(.headline)
            Text("Purchase a Camp Card to get started.")
                .font(.subheadline)
                .foregroundColor(CCColor.textSecondary)
                .multilineTextAlignment(.center)
            NavigationLink(destination: BuyMoreCardsView()) {
                Text("Buy a Card")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
            }
            .buttonStyle(.borderedProminent)
            .tint(CCColor.primary)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(CCColor.surface)
        .cornerRadius(16)
    }

    // MARK: - Stats Grid (2x2, matching RN stat cards)

    private func statsGrid(card: CampCard) -> some View {
        let offersUsed = card.offersUsed ?? 0
        let totalOffers = card.totalOffers ?? 0
        let totalSaved = card.totalSavings ?? 0
        let allCards = [
            vm.myCards?.activeCard,
            vm.myCards?.unusedCards?.first,
        ].compactMap { $0 }

        return LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
            WalletStatCard(value: "\(offersUsed)", label: "Offers Used", icon: "tag.fill", color: CCColor.primary)
            WalletStatCard(value: "\(totalOffers - offersUsed)", label: "Remaining", icon: "gift.fill", color: CCColor.secondary)
            WalletStatCard(value: "$\(String(format: "%.0f", totalSaved))", label: "Total Saved", icon: "dollarsign.circle.fill", color: Color(hex: "#4CAF50"))
            WalletStatCard(value: "\(allCards.count)", label: "Cards Owned", icon: "creditcard.fill", color: CCColor.textSecondary)
        }
    }

    // MARK: - Quick Actions (2x2 grid, matching RN quick actions)

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.system(size: 18, weight: .semibold))

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                // Gift Card
                if let active = vm.myCards?.activeCard {
                    NavigationLink(destination: GiftCardView(card: active)) {
                        WalletActionCard(icon: "gift.fill", label: "Gift Card", color: CCColor.secondary)
                    }
                    .buttonStyle(.plain)
                } else {
                    WalletActionCard(icon: "gift.fill", label: "Gift Card", color: CCColor.secondary)
                        .opacity(0.4)
                }

                // Buy More
                NavigationLink(destination: BuyMoreCardsView()) {
                    WalletActionCard(icon: "cart.badge.plus", label: "Buy Cards", color: CCColor.primary)
                }
                .buttonStyle(.plain)

                // Redemption History
                NavigationLink(destination: RedemptionHistoryView()) {
                    WalletActionCard(icon: "clock.fill", label: "History", color: Color(hex: "#757575"))
                }
                .buttonStyle(.plain)

                // All Cards
                NavigationLink(destination: CardInventoryView()) {
                    WalletActionCard(icon: "wallet.pass.fill", label: "All Cards", color: Color(hex: "#9C27B0"))
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Recent Redemptions

    private var recentRedemptionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Redemptions")
                    .font(.system(size: 18, weight: .semibold))
                Spacer()
                NavigationLink(destination: RedemptionHistoryView()) {
                    Text("See All")
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.primary)
                }
            }

            VStack(spacing: 0) {
                ForEach(Array(vm.recentRedemptions.enumerated()), id: \.element.id) { idx, record in
                    redemptionRow(record: record)
                    if idx < vm.recentRedemptions.count - 1 {
                        Divider().padding(.leading, 68)
                    }
                }
            }
            .background(CCColor.surface)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
        }
    }

    private func redemptionRow(record: RedemptionRecord) -> some View {
        let savings = record.discountType == "PERCENTAGE"
            ? "\(Int(record.discountValue))% Off"
            : "$\(String(format: "%.2f", record.discountValue)) Off"

        return HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hex: "#4CAF50").opacity(0.12))
                    .frame(width: 40, height: 40)
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 18))
                    .foregroundColor(Color(hex: "#4CAF50"))
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(record.offerTitle)
                    .font(.system(size: 15, weight: .semibold))
                    .lineLimit(1)
                Text(record.merchantName)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(savings)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Color(hex: "#4CAF50"))
                Text(record.redeemedAt.prefix(10))
                    .font(.system(size: 11))
                    .foregroundColor(CCColor.textSecondary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }

    // MARK: - Other card sections

    private func otherCardsSection(title: String, cards: [CampCard]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))

            VStack(spacing: 8) {
                ForEach(cards) { card in
                    otherCardRow(card: card)
                }
            }
        }
    }

    private func otherCardRow(card: CampCard) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(CCColor.primary.opacity(0.1))
                    .frame(width: 40, height: 40)
                Image(systemName: "creditcard")
                    .font(.system(size: 18))
                    .foregroundColor(CCColor.primary)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(card.cardNumber.map { "•••• \(String($0.suffix(4)))" } ?? "Camp Card")
                    .font(.system(size: 15, weight: .medium))
                Text(card.status.rawValue.capitalized)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
            }
            Spacer()
            if card.status == .available {
                Button("Activate") { Task { await activate(card: card) } }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(CCColor.primary)
                    .cornerRadius(8)
            }
        }
        .padding(12)
        .background(CCColor.surface)
        .cornerRadius(10)
    }

    // MARK: - QR generator

    private func generateQR(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        guard let ciImage = filter.outputImage else { return nil }
        let scaled = ciImage.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }

    private func activate(card: CampCard) async {
        do {
            let _: CampCard = try await APIClient.shared.request(Endpoint.activateCard(id: card.id))
            await vm.load()
        } catch {}
    }
}

// MARK: - WalletStatCard

struct WalletStatCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(CCColor.text)
                Text(label)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

// MARK: - WalletActionCard

struct WalletActionCard: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
            }
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(CCColor.text)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity)
        .background(CCColor.surface)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}

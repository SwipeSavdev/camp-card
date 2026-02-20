import SwiftUI

// MARK: - ViewModel

@MainActor
final class OfferDetailViewModel: ObservableObject {
    @Published var offer: Offer?
    @Published var isLoading = false
    @Published var error: String?
    @Published var showQRScanner = false
    @Published var isRedeeming = false
    @Published var isRedeemSuccess = false
    @Published var redemptionError: String?

    private let api = APIClient.shared
    private var activeCardId: Int?

    func load(offerId: Int) async {
        isLoading = true; error = nil
        do {
            async let offerResult: Offer = api.request(.offer(id: offerId))
            async let cardsResult: MyCardsResponse = api.request(.myCards)
            let (o, cards) = try await (offerResult, cardsResult)
            offer = o
            activeCardId = cards.activeCard?.id
        } catch {
            if let o = try? await api.request(.offer(id: offerId)) as Offer {
                offer = o
            } else {
                self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
            }
        }
        isLoading = false
    }

    func initiateRedemption() {
        guard let offer = offer else { return }
        if offer.requiresQrVerification == true {
            showQRScanner = true
        } else {
            Task { await performRedemption() }
        }
    }

    func performRedemption() async {
        guard let offer = offer, let cardId = activeCardId else {
            redemptionError = "No active card found. Please activate a card first."
            return
        }
        isRedeeming = true; redemptionError = nil
        do {
            try await api.requestVoid(.redeemOffer(offerId: offer.id, cardId: cardId))
            isRedeemSuccess = true
        } catch {
            redemptionError = (error as? NetworkError)?.errorDescription ?? "Redemption failed. Please try again."
        }
        isRedeeming = false
    }
}

// MARK: - OfferDetailView

struct OfferDetailView: View {
    let offerId: Int

    @StateObject private var vm = OfferDetailViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if vm.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = vm.error {
                errorView(message: error)
            } else if let offer = vm.offer {
                offerContentView(offer: offer)
            }
        }
        .navigationTitle("Offer Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if let offer = vm.offer {
                    Button { shareOffer(offer) } label: {
                        Image(systemName: "square.and.arrow.up")
                    }
                    .accessibilityLabel("Share this offer")
                }
            }
        }
        .task { await vm.load(offerId: offerId) }
        .alert("Redemption Error", isPresented: .constant(vm.redemptionError != nil)) {
            Button("OK") { vm.redemptionError = nil }
        } message: {
            Text(vm.redemptionError ?? "")
        }
        .fullScreenCover(isPresented: $vm.showQRScanner) {
            QRScannerContainerView(onCodeScanned: { _ in
                vm.showQRScanner = false
                Task { await vm.performRedemption() }
            })
        }
    }

    // MARK: - Content

    private func offerContentView(offer: Offer) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Hero image
                heroImageSection(offer: offer)

                VStack(alignment: .leading, spacing: 20) {
                    // Merchant + discount badge row
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(offer.merchantName)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Text(offer.title)
                                .font(.title2)
                                .fontWeight(.bold)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer()
                        Text(offer.displayDiscount)
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(CCColor.primary)
                            .cornerRadius(10)
                    }

                    // Category chip
                    if let category = offer.category {
                        Text(category)
                            .font(.caption)
                            .foregroundColor(Color(hex: "#003F87"))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 5)
                            .background(Color(hex: "#003F87").opacity(0.1))
                            .cornerRadius(20)
                    }

                    Divider()

                    // Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text("About this Offer")
                            .font(.headline)
                        Text(offer.description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    // Terms
                    if let terms = offer.terms, !terms.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Terms & Conditions")
                                .font(.headline)
                            Text(terms)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(14)
                        .background(CCColor.surface)
                        .cornerRadius(10)
                    }

                    // Status badges
                    statusBadges(offer: offer)

                    // Redeem button
                    redeemButton(offer: offer)
                }
                .padding(20)
            }
        }
    }

    private func heroImageSection(offer: Offer) -> some View {
        ZStack(alignment: .bottomLeading) {
            AsyncImage(url: URL(string: offer.imageUrl ?? offer.merchantLogoUrl ?? "")) { image in
                image
                    .resizable()
                    .scaledToFill()
            } placeholder: {
                CCColor.border
                    .overlay(
                        Image(systemName: "tag.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                    )
            }
            .frame(maxWidth: .infinity)
            .frame(height: 220)
            .clipped()

            // Gradient overlay
            LinearGradient(
                gradient: Gradient(colors: [.clear, .black.opacity(0.4)]),
                startPoint: .center,
                endPoint: .bottom
            )
            .frame(height: 220)
        }
    }

    @ViewBuilder
    private func statusBadges(offer: Offer) -> some View {
        HStack(spacing: 8) {
            if offer.isRedeemed == true {
                StatusPill(label: "Redeemed", color: .green)
            }
            if offer.userHasReachedLimit == true {
                StatusPill(label: "Limit Reached", color: .orange)
            }
            if offer.status != "ACTIVE" {
                StatusPill(label: offer.status.capitalized, color: .secondary)
            }
        }
    }

    private func redeemButton(offer: Offer) -> some View {
        let alreadyUsed = vm.isRedeemSuccess
            || offer.isRedeemed == true
            || offer.userHasReachedLimit == true
        let inactive = offer.status.uppercased() != "ACTIVE"
        let isDisabled = alreadyUsed || inactive

        return Button(action: vm.initiateRedemption) {
            HStack(spacing: 8) {
                if vm.isRedeeming {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(.white)
                    Text("Redeeming...")
                        .fontWeight(.semibold)
                } else if vm.isRedeemSuccess {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 18))
                    Text("Offer Redeemed!")
                        .fontWeight(.semibold)
                } else {
                    Image(systemName: offer.requiresQrVerification == true
                          ? "qrcode.viewfinder" : "checkmark.seal.fill")
                    Text(offer.requiresQrVerification == true ? "Scan to Redeem" : "Redeem Offer")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .foregroundColor(.white)
            .background(vm.isRedeemSuccess ? CCColor.success : (isDisabled ? CCColor.disabled : CCColor.primary))
            .cornerRadius(12)
        }
        .disabled(isDisabled || vm.isRedeeming)
        .animation(.easeInOut(duration: 0.2), value: vm.isRedeemSuccess)
    }

    // MARK: - Share

    private func shareOffer(_ offer: Offer) {
        let text = "Check out this offer from \(offer.merchantName): \(offer.title) — \(offer.displayDiscount). Get the Camp Card app at https://campcardapp.org"
        let vc = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows.first?.rootViewController?
            .present(vc, animated: true)
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.secondary)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button("Try Again") {
                Task { await vm.load(offerId: offerId) }
            }
            .buttonStyle(.borderedProminent)
            .tint(CCColor.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - StatusPill

struct StatusPill: View {
    let label: String
    let color: Color

    var body: some View {
        Text(label)
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundColor(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(color.opacity(0.12))
            .cornerRadius(20)
    }
}

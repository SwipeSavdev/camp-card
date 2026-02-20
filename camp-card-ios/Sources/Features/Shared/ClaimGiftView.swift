import SwiftUI

@MainActor
final class ClaimGiftViewModel: ObservableObject {
    @Published var giftDetails: CampCard?
    @Published var isLoading = false
    @Published var isClaiming = false
    @Published var claimed = false
    @Published var error: String?

    func loadDetails(token: String) async {
        isLoading = true
        defer { isLoading = false }
        giftDetails = try? await APIClient.shared.request(.giftDetails(token: token))
    }

    func claim(token: String) async {
        isClaiming = true
        defer { isClaiming = false }
        do {
            let _: CampCard = try await APIClient.shared.request(.claimGift(token: token))
            claimed = true
        } catch {
            self.error = "Failed to claim gift: \(error.localizedDescription)"
        }
    }
}

struct ClaimGiftView: View {
    let token: String
    @StateObject private var vm = ClaimGiftViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView("Loading gift details…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.claimed {
                    successState
                } else if let card = vm.giftDetails {
                    claimState(card: card)
                } else if let error = vm.error {
                    errorState(message: error)
                } else {
                    ProgressView()
                }
            }
            .navigationTitle("Gift Card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
            }
            .task { await vm.loadDetails(token: token) }
        }
    }

    private func claimState(card: CampCard) -> some View {
        VStack(spacing: 24) {
            Image(systemName: "gift.fill")
                .font(.system(size: 60)).foregroundColor(CCColor.primary)

            VStack(spacing: 8) {
                Text("You've Received a Gift!").font(.title2).fontWeight(.bold)
                Text("A camp card has been gifted to you. Claim it to add it to your wallet.")
                    .font(.subheadline).foregroundColor(.secondary)
                    .multilineTextAlignment(.center).padding(.horizontal)
            }

            VStack(spacing: 4) {
                Text("Card Number").font(.caption).foregroundColor(.secondary)
                Text(card.cardNumber ?? "Camp Card").font(.title3).fontWeight(.semibold)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(12)
            }

            Button {
                Task { await vm.claim(token: token) }
            } label: {
                Group {
                    if vm.isClaiming {
                        ProgressView().tint(.white)
                    } else {
                        Text("Claim Gift Card")
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(hex: "#003F87"))
            .disabled(vm.isClaiming)
            .padding(.horizontal, 32)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var successState: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 70)).foregroundColor(.green)
            Text("Gift Claimed!").font(.title).fontWeight(.bold)
            Text("Your camp card is now in your wallet. Start redeeming offers!")
                .foregroundColor(.secondary).multilineTextAlignment(.center)
            Button("View Wallet") { dismiss() }
                .buttonStyle(.borderedProminent).tint(Color(hex: "#003F87"))
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func errorState(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle").font(.largeTitle).foregroundColor(.red)
            Text("Error").font(.headline)
            Text(message).foregroundColor(.secondary).multilineTextAlignment(.center)
            Button("Try Again") { Task { await vm.loadDetails(token: token) } }
                .buttonStyle(.borderedProminent).tint(Color(hex: "#003F87"))
        }
        .padding()
    }
}

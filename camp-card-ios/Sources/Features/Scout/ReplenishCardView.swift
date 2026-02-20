import SwiftUI

@MainActor
final class ReplenishCardViewModel: ObservableObject {
    @Published var unusedCards: [CampCard] = []
    @Published var isLoading = false
    @Published var isActivating = false
    @Published var activatedCard: CampCard?
    @Published var error: String?

    func load() async {
        isLoading = true
        defer { isLoading = false }
        let cards: [CampCard] = (try? await APIClient.shared.request(.myCards)) ?? []
        unusedCards = cards.filter { $0.status == .available }
    }

    func activate(card: CampCard) async {
        isActivating = true
        defer { isActivating = false }
        do {
            let activated: CampCard = try await APIClient.shared.request(.activateCard(id: card.id))
            activatedCard = activated
            unusedCards.removeAll { $0.id == card.id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}

struct ReplenishCardView: View {
    @StateObject private var vm = ReplenishCardViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView().frame(maxWidth: .infinity, minHeight: 200)
                } else if vm.unusedCards.isEmpty {
                    emptyState
                } else {
                    cardList
                }
            }
            .navigationTitle("Activate a Card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .task { await vm.load() }
            .alert("Error", isPresented: .constant(vm.error != nil)) {
                Button("OK") { vm.error = nil }
            } message: {
                Text(vm.error ?? "")
            }
            .sheet(item: $vm.activatedCard) { card in
                RedemptionSuccessView(
                    message: "Card Activated!",
                    detail: "Card #\(card.cardNumber ?? String(card.id)) is now active."
                )
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "creditcard.trianglebadge.exclamationmark")
                .font(.system(size: 50)).foregroundColor(.secondary)
            Text("No Unused Cards").font(.headline)
            Text("You don't have any unused camp cards to activate.")
                .font(.subheadline).foregroundColor(.secondary).multilineTextAlignment(.center)
            Button("Buy More Cards") { dismiss() }
                .buttonStyle(.borderedProminent).tint(CCColor.primary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var cardList: some View {
        List(vm.unusedCards) { card in
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(card.cardNumber ?? "Card #\(card.id)")
                        .font(.headline)
                    if let created = card.createdAt {
                        Text("Purchased \(created)")
                            .font(.caption).foregroundColor(.secondary)
                    }
                }
                Spacer()
                Button {
                    Task { await vm.activate(card: card) }
                } label: {
                    if vm.isActivating {
                        ProgressView().tint(.white)
                    } else {
                        Text("Activate")
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(CCColor.primary)
                .disabled(vm.isActivating)
            }
            .padding(.vertical, 4)
        }
    }
}

import SwiftUI

struct CardInventoryView: View {
    @State private var myCards: MyCardsResponse?
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView().frame(maxWidth: .infinity, minHeight: 200)
                } else if let cards = myCards {
                    List {
                        if let active = cards.activeCard {
                            Section("Active") { CardRow(card: active) }
                        }
                        if let unused = cards.unusedCards, !unused.isEmpty {
                            Section("Unused") { ForEach(unused) { CardRow(card: $0) } }
                        }
                        if let gifted = cards.giftedCards, !gifted.isEmpty {
                            Section("Gifted") { ForEach(gifted) { CardRow(card: $0) } }
                        }
                        if let expired = cards.expiredCards, !expired.isEmpty {
                            Section("Expired") { ForEach(expired) { CardRow(card: $0) } }
                        }
                    }
                } else {
                    Text("No cards found").foregroundColor(.secondary)
                }
            }
            .navigationTitle("My Cards").navigationBarTitleDisplayMode(.inline)
            .task { await load() }
            .refreshable { await load() }
        }
    }

    private func load() async {
        isLoading = true
        myCards = try? await APIClient.shared.request(.myCards)
        isLoading = false
    }
}

struct CardRow: View {
    let card: CampCard

    var statusColor: Color {
        switch card.status {
        case .active: return .green
        case .expired, .revoked: return .red
        case .gifted: return .purple
        default: return .secondary
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(card.cardNumber.map { "**** \(String($0.suffix(4)))" } ?? "Card \(card.id)")
                    .font(.subheadline).fontWeight(.medium)
                Text(card.status.rawValue).font(.caption).foregroundColor(statusColor)
            }
            Spacer()
            if card.status == .active {
                Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
            }
        }
        .padding(.vertical, 4)
    }
}

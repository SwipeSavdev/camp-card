import SwiftUI

@MainActor
final class SelectScoutForSubscriptionViewModel: ObservableObject {
    @Published var scouts: [Scout] = []
    @Published var selectedScout: Scout?
    @Published var isLoading = false

    func load() async {
        isLoading = true
        scouts = (try? await APIClient.shared.request(.troopScouts)) ?? []
        isLoading = false
    }
}

struct SelectScoutForSubscriptionView: View {
    let onSelect: (Scout) -> Void
    @StateObject private var vm = SelectScoutForSubscriptionViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView().frame(maxWidth: .infinity, minHeight: 200)
                } else if vm.scouts.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "person.3").font(.largeTitle).foregroundColor(.secondary)
                        Text("No scouts in your troop yet.").foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(vm.scouts) { scout in
                        Button {
                            onSelect(scout)
                            dismiss()
                        } label: {
                            HStack {
                                Circle()
                                    .fill(Color(hex: "#003F87"))
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Text(String(scout.firstName.prefix(1)))
                                            .foregroundColor(.white).fontWeight(.bold)
                                    )
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(scout.fullName).font(.subheadline).fontWeight(.medium)
                                    Text(scout.email).font(.caption).foregroundColor(.secondary)
                                }
                                Spacer()
                                Image(systemName: "chevron.right").foregroundColor(.secondary)
                            }
                        }
                        .foregroundColor(.primary)
                    }
                }
            }
            .navigationTitle("Select a Scout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .task { await vm.load() }
        }
    }
}

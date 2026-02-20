import SwiftUI

// MARK: - ViewModel

@MainActor
final class ManageScoutsViewModel: ObservableObject {
    @Published var scouts: [Scout] = []
    @Published var isLoading = false
    @Published var showInviteSheet = false
    @Published var scoutToRemove: Scout?
    @Published var showRemoveAlert = false

    func load() async {
        isLoading = true
        scouts = (try? await APIClient.shared.request(.troopScouts)) ?? []
        isLoading = false
    }

    func remove(scout: Scout) async {
        do {
            try await APIClient.shared.requestVoid(.removeScout(userId: scout.userId))
            scouts.removeAll { $0.id == scout.id }
        } catch {}
    }
}

// MARK: - ManageScoutsView

struct ManageScoutsView: View {
    @StateObject private var vm = ManageScoutsViewModel()

    var body: some View {
        Group {
            if vm.isLoading {
                SkeletonList(count: 5) { SkeletonScoutRow() }
                    .padding(.top, 8)
            } else if vm.scouts.isEmpty {
                emptyState
            } else {
                scoutsList
            }
        }
        .navigationTitle("Manage Scouts")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    vm.showInviteSheet = true
                } label: {
                    Image(systemName: "person.badge.plus")
                        .foregroundColor(CCColor.primary)
                }
                .accessibilityLabel("Invite a Scout")
            }
        }
        .sheet(isPresented: $vm.showInviteSheet) {
            NavigationStack { InviteScoutView() }
        }
        .alert("Remove Scout", isPresented: $vm.showRemoveAlert, presenting: vm.scoutToRemove) { scout in
            Button("Remove", role: .destructive) {
                Task { await vm.remove(scout: scout) }
            }
            Button("Cancel", role: .cancel) {}
        } message: { scout in
            Text("Are you sure you want to remove \(scout.fullName) from your troop?")
        }
        .task { await vm.load() }
        .refreshable { await vm.load() }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(CCColor.secondary.opacity(0.1))
                    .frame(width: 80, height: 80)
                Image(systemName: "person.3.fill")
                    .font(.system(size: 36))
                    .foregroundColor(CCColor.secondary)
            }
            VStack(spacing: 8) {
                Text("No Scouts Yet")
                    .font(.system(size: 20, weight: .bold))
                Text("Invite scouts to join your troop and start tracking their fundraising progress.")
                    .font(.system(size: 14))
                    .foregroundColor(CCColor.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            Button {
                vm.showInviteSheet = true
            } label: {
                Label("Invite a Scout", systemImage: "person.badge.plus")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(CCColor.secondary)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.bottom, 80)
    }

    // MARK: - Scouts List

    private var scoutsList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(vm.scouts) { scout in
                    ScoutRow(scout: scout) {
                        vm.scoutToRemove = scout
                        vm.showRemoveAlert = true
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 32)
        }
        .refreshable { await vm.load() }
    }
}

// MARK: - ScoutRow

private struct ScoutRow: View {
    let scout: Scout
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 14) {
            // Avatar with initials
            ZStack {
                Circle()
                    .fill(CCColor.secondary)
                    .frame(width: 48, height: 48)
                Text(String(scout.firstName.prefix(1)).uppercased())
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                Text(scout.fullName)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(CCColor.text)
                Text(scout.email)
                    .font(.system(size: 12))
                    .foregroundColor(CCColor.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            // Cards sold badge
            VStack(spacing: 2) {
                Text("\(scout.cardsSold ?? 0)")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(CCColor.secondary)
                Text("cards")
                    .font(.system(size: 10))
                    .foregroundColor(CCColor.textSecondary)
            }

            // Remove button
            Button(action: onRemove) {
                Image(systemName: "minus.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(CCColor.error)
            }
            .accessibilityLabel("Remove \(scout.fullName) from troop")
        }
        .padding(14)
        .background(CCColor.card)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(scout.fullName), \(scout.email), \(scout.cardsSold ?? 0) cards sold")
    }
}

// MARK: - SkeletonScoutRow

struct SkeletonScoutRow: View {
    var body: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(CCColor.border)
                .frame(width: 48, height: 48)
                .shimmer()
            VStack(alignment: .leading, spacing: 6) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(CCColor.border)
                    .frame(width: 130, height: 14)
                    .shimmer()
                RoundedRectangle(cornerRadius: 4)
                    .fill(CCColor.border)
                    .frame(width: 90, height: 11)
                    .shimmer()
            }
            Spacer()
        }
        .padding(14)
        .background(CCColor.card)
        .cornerRadius(12)
    }
}

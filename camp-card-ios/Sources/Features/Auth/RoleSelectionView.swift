import SwiftUI

// MARK: - RoleSelectionView
// Step 1 of the new-user onboarding funnel.
// User picks their role; the next screen (QuantitySelectionView) adapts
// to show the correct product for that role.

struct RoleSelectionView: View {
    @State private var selectedRole: OnboardingRole? = nil
    @State private var showQuantitySelection = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {

                // MARK: Header
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(CCColor.primary.opacity(0.1))
                            .frame(width: 72, height: 72)
                        Image(systemName: "person.3.fill")
                            .font(.system(size: 30))
                            .foregroundColor(CCColor.primary)
                    }
                    .padding(.top, 32)
                    .accessibilityHidden(true)

                    Text("Who are you?")
                        .font(.system(size: CCFont.xxl, weight: .bold))
                        .accessibilityAddTraits(.isHeader)

                    Text("Choose your role to get started with the right plan.")
                        .font(.system(size: CCFont.base))
                        .foregroundColor(CCColor.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)
                }

                // MARK: Role Cards
                VStack(spacing: 14) {
                    ForEach(OnboardingRole.allCases) { role in
                        RoleCard(
                            role: role,
                            isSelected: selectedRole == role,
                            onTap: { selectedRole = role }
                        )
                    }
                }
                .padding(.horizontal, 24)

                // MARK: Continue
                Button {
                    guard selectedRole != nil else { return }
                    showQuantitySelection = true
                } label: {
                    Text("Continue")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                }
                .buttonStyle(.borderedProminent)
                .tint(CCColor.primary)
                .disabled(selectedRole == nil)
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
                .accessibilityLabel(selectedRole == nil ? "Select a role to continue" : "Continue as \(selectedRole!.title)")
            }
        }
        .navigationTitle("Get Started")
        .navigationBarTitleDisplayMode(.inline)
        .ccScreenBackground()
        .navigationDestination(isPresented: $showQuantitySelection) {
            if let role = selectedRole {
                QuantitySelectionView(role: role)
            }
        }
    }
}

// MARK: - OnboardingRole

enum OnboardingRole: String, CaseIterable, Identifiable {
    case scout
    case troopLeader
    case parent

    var id: String { rawValue }

    var title: String {
        switch self {
        case .scout: return "Scout"
        case .troopLeader: return "Troop / Unit Leader"
        case .parent: return "Parent or Supporter"
        }
    }

    var subtitle: String {
        switch self {
        case .scout: return "Sell camp cards to earn funds for your troop"
        case .troopLeader: return "Manage your unit's fundraising campaign"
        case .parent: return "Support a scout's fundraising efforts"
        }
    }

    var icon: String {
        switch self {
        case .scout: return "star.fill"
        case .troopLeader: return "person.badge.shield.checkmark"
        case .parent: return "heart.fill"
        }
    }

    var accentColor: Color {
        switch self {
        case .scout: return CCColor.scoutPrimary
        case .troopLeader: return CCColor.leaderPrimary
        case .parent: return CCColor.parentPrimary
        }
    }

    var userRole: UserRole {
        switch self {
        case .scout: return .scout
        case .troopLeader: return .troopLeader
        case .parent: return .parent
        }
    }
}

// MARK: - RoleCard

private struct RoleCard: View {
    let role: OnboardingRole
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: CCRadius.icon)
                        .fill(role.accentColor.opacity(isSelected ? 1 : 0.12))
                        .frame(width: 52, height: 52)
                    Image(systemName: role.icon)
                        .font(.system(size: 22))
                        .foregroundColor(isSelected ? .white : role.accentColor)
                }
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 4) {
                    Text(role.title)
                        .font(.system(size: CCFont.base, weight: .semibold))
                        .foregroundColor(CCColor.text)
                    Text(role.subtitle)
                        .font(.system(size: CCFont.sm))
                        .foregroundColor(CCColor.textSecondary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(isSelected ? role.accentColor : CCColor.disabled)
                    .accessibilityHidden(true)
            }
            .padding(16)
            .background(CCColor.card)
            .clipShape(RoundedRectangle(cornerRadius: CCRadius.md))
            .overlay(
                RoundedRectangle(cornerRadius: CCRadius.md)
                    .stroke(isSelected ? role.accentColor : CCColor.border, lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(role.title)
        .accessibilityHint(role.subtitle)
        .accessibilityAddTraits(isSelected ? [.isSelected, .isButton] : .isButton)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}

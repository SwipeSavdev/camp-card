import SwiftUI

// MARK: - Design Tokens (mirrors React Native theme.ts)

enum CCColor {
    // BSA Brand
    static let primary     = Color(hex: "#CE1126")   // BSA Red
    static let secondary   = Color(hex: "#003F87")   // BSA Blue
    static let accent      = Color(hex: "#FFD700")   // BSA Gold

    // Semantic
    static let success     = Color(hex: "#4CAF50")
    static let warning     = Color(hex: "#FF9800")
    static let error       = Color(hex: "#F44336")
    static let info        = Color(hex: "#2196F3")

    // Surfaces (light)
    static let background  = Color(hex: "#F5F5F5")   // screen background
    static let surface     = Color(hex: "#FFFFFF")   // card / sheet surface
    static let card        = Color(hex: "#FFFFFF")

    // Text (light)
    static let text        = Color(hex: "#212121")
    static let textSecondary = Color(hex: "#757575")
    static let textOnPrimary = Color(hex: "#FFFFFF")

    // UI Elements (light)
    static let border      = Color(hex: "#E0E0E0")
    static let disabled    = Color(hex: "#BDBDBD")
    static let navy        = Color(hex: "#003F87")

    // Role-based accents
    static let scoutPrimary  = Color(hex: "#CE1126")
    static let leaderPrimary = Color(hex: "#003F87")
    static let parentPrimary = Color(hex: "#F59E0B")   // Amber
    static let parentTab     = Color(hex: "#FFD700")   // Gold tab active
}

enum CCSpacing {
    static let xs: CGFloat   = 4
    static let sm: CGFloat   = 8
    static let md: CGFloat   = 12
    static let base: CGFloat = 16
    static let lg: CGFloat   = 20
    static let xl: CGFloat   = 24
    static let xxl: CGFloat  = 32
}

enum CCRadius {
    static let sm: CGFloat     = 6
    static let md: CGFloat     = 12   // cards, buttons, inputs
    static let lg: CGFloat     = 16   // featured cards
    static let badge: CGFloat  = 20   // pill badges
    static let icon: CGFloat   = 10   // icon containers
}

enum CCFont {
    static let xs:   CGFloat = 11
    static let sm:   CGFloat = 13
    static let md:   CGFloat = 14
    static let base: CGFloat = 16
    static let lg:   CGFloat = 18
    static let xl:   CGFloat = 24
    static let xxl:  CGFloat = 26
    static let hero: CGFloat = 42
}

// MARK: - Reusable Modifiers

struct CCCardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(CCColor.card)
            .cornerRadius(CCRadius.md)
            .overlay(RoundedRectangle(cornerRadius: CCRadius.md).stroke(CCColor.border, lineWidth: 1))
    }
}

extension View {
    func ccCard() -> some View { modifier(CCCardStyle()) }
    func ccScreenBackground() -> some View { background(CCColor.background.ignoresSafeArea()) }
}

// MARK: - Role header colors (matches RN roleColors.ROLE.headerBg)

enum CCRoleColor {
    static func headerBg(for role: UserRole?) -> Color {
        switch role {
        case .scout:                      return CCColor.scoutPrimary    // #CE1126
        case .troopLeader:                return CCColor.leaderPrimary   // #003F87
        case .parent, .councilAdmin, .nationalAdmin: return CCColor.parentPrimary  // #F59E0B
        case nil:                         return CCColor.primary
        }
    }
    static func roleTag(for role: UserRole?) -> String {
        switch role {
        case .scout:        return "Scout"
        case .troopLeader:  return "Unit Leader"
        case .parent:       return "Parent Dashboard"
        case .councilAdmin: return "Council Admin"
        case .nationalAdmin:return "National Admin"
        case nil:           return ""
        }
    }
}

// MARK: - Shared Dashboard Header (matches RN HomeScreen header pattern)

struct DashboardHeader: View {
    let firstName: String
    let role: UserRole?
    var onNotificationsTap: (() -> Void)? = nil

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Hello, \(firstName)!")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)
                    .accessibilityAddTraits(.isHeader)
                Text(CCRoleColor.roleTag(for: role))
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.8))
            }
            Spacer()
            Button {
                onNotificationsTap?()
            } label: {
                Image(systemName: "bell.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
            .accessibilityLabel("Notifications")
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 20)
        .frame(maxWidth: .infinity)
        .background(
            // Extend role color behind status bar for a full-bleed header
            CCRoleColor.headerBg(for: role)
                .ignoresSafeArea(.container, edges: .top)
        )
    }
}

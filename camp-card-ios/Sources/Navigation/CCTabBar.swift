import SwiftUI

// MARK: - CCTabItem

struct CCTabItem {
    let tag: Int
    let icon: String
    let label: String
}

// MARK: - CCTabBar
// Fully custom SwiftUI tab bar — avoids iOS 18+ UIKit appearance quirks
// where UITabBarItemAppearance styling stops applying to SwiftUI TabView.

struct CCTabBar: View {
    @Binding var selection: Int
    let items: [CCTabItem]
    var tint: Color = CCColor.primary   // defaults to BSA Red

    private let unselected = Color(hex: "#757575")

    var body: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(CCColor.border)
                .frame(height: 0.5)
            HStack(spacing: 0) {
                ForEach(items, id: \.tag) { item in
                    Button {
                        selection = item.tag
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: item.icon)
                                .font(.system(size: 22))
                            Text(item.label)
                                .font(.system(size: 10,
                                              weight: selection == item.tag ? .semibold : .medium))
                        }
                        .foregroundColor(selection == item.tag ? tint : unselected)
                        .frame(maxWidth: .infinity)
                        .frame(height: 49)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(item.label)
                    .accessibilityAddTraits(selection == item.tag ? .isSelected : [])
                }
            }
            .background(
                Color.white
                    .ignoresSafeArea(edges: .bottom)
            )
        }
        .background(Color.white.ignoresSafeArea(edges: .bottom))
    }
}

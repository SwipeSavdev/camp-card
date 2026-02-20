import SwiftUI

struct ParentTabView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var deepLink = DeepLinkHandler.shared

    @State private var selectedTab = Int(ProcessInfo.processInfo.environment["SCREENSHOT_TAB"] ?? "0") ?? 0
    @State private var showSubscription = false

    private let tabItems: [CCTabItem] = [
        CCTabItem(tag: 0, icon: "house.fill",        label: "Home"),
        CCTabItem(tag: 1, icon: "wallet.pass.fill",  label: "My Card"),
        CCTabItem(tag: 2, icon: "tag.fill",          label: "Offers"),
        CCTabItem(tag: 3, icon: "storefront.fill",   label: "Merchants"),
        CCTabItem(tag: 4, icon: "person.fill",       label: "Profile"),
    ]

    var body: some View {
        ZStack {
            NavigationStack { ParentHomeView() }
                .opacity(selectedTab == 0 ? 1 : 0).allowsHitTesting(selectedTab == 0)
            NavigationStack { WalletView() }
                .opacity(selectedTab == 1 ? 1 : 0).allowsHitTesting(selectedTab == 1)
            NavigationStack { OffersListView() }
                .opacity(selectedTab == 2 ? 1 : 0).allowsHitTesting(selectedTab == 2)
            NavigationStack { MerchantsListView() }
                .opacity(selectedTab == 3 ? 1 : 0).allowsHitTesting(selectedTab == 3)
            NavigationStack { ProfileView() }
                .opacity(selectedTab == 4 ? 1 : 0).allowsHitTesting(selectedTab == 4)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            CCTabBar(selection: $selectedTab, items: tabItems,
                     tint: CCColor.primary)  // BSA Red for parent
        }
        .onReceive(deepLink.$pendingRoute) { route in
            guard let route else { return }
            switch route {
            case .offer:         selectedTab = 2
            case .merchant:      selectedTab = 3
            case .subscription:  showSubscription = true
            default: break
            }
            deepLink.pendingRoute = nil
        }
        .sheet(isPresented: $showSubscription) { SubscriptionView() }
    }
}

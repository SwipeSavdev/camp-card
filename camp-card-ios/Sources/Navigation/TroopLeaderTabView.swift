import SwiftUI

struct TroopLeaderTabView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var deepLink = DeepLinkHandler.shared

    @State private var selectedTab = 0
    @State private var showSubscription = false

    private var hasSubscription: Bool { auth.user?.hasActiveSubscription ?? false }

    private var tabItems: [CCTabItem] {
        var items = [CCTabItem(tag: 0, icon: "house.fill", label: "Home")]
        if hasSubscription {
            items.append(CCTabItem(tag: 1, icon: "tag.fill", label: "Offers"))
        }
        items += [
            CCTabItem(tag: 2, icon: "chart.line.uptrend.xyaxis", label: "Unit"),
            CCTabItem(tag: 3, icon: "person.2.fill",              label: "Scouts"),
            CCTabItem(tag: 4, icon: "person.fill",                label: "Profile"),
        ]
        return items
    }

    var body: some View {
        ZStack {
            NavigationStack { TroopLeaderHomeView() }
                .opacity(selectedTab == 0 ? 1 : 0).allowsHitTesting(selectedTab == 0)
            if hasSubscription {
                NavigationStack { OffersListView() }
                    .opacity(selectedTab == 1 ? 1 : 0).allowsHitTesting(selectedTab == 1)
            }
            NavigationStack { TroopStatsView() }
                .opacity(selectedTab == 2 ? 1 : 0).allowsHitTesting(selectedTab == 2)
            NavigationStack { ManageScoutsView() }
                .opacity(selectedTab == 3 ? 1 : 0).allowsHitTesting(selectedTab == 3)
            NavigationStack { ProfileView() }
                .opacity(selectedTab == 4 ? 1 : 0).allowsHitTesting(selectedTab == 4)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            CCTabBar(selection: $selectedTab, items: tabItems,
                     tint: CCColor.secondary)  // BSA Blue for troop leader
        }
        .onReceive(deepLink.$pendingRoute) { route in
            guard let route else { return }
            if case .subscription = route { showSubscription = true }
            deepLink.pendingRoute = nil
        }
        .sheet(isPresented: $showSubscription) { SubscriptionView() }
    }
}

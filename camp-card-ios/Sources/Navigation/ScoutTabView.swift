import SwiftUI

struct ScoutTabView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @StateObject private var deepLink = DeepLinkHandler.shared

    @State private var selectedTab = 0
    @State private var offerToShow: OfferIDWrapper?
    @State private var showSubscription = false
    @State private var claimToken: ClaimToken?

    private let tabItems: [CCTabItem] = [
        CCTabItem(tag: 0, icon: "house.fill",         label: "Home"),
        CCTabItem(tag: 1, icon: "wallet.pass.fill",   label: "My Card"),
        CCTabItem(tag: 2, icon: "qrcode.viewfinder",  label: "My QR"),
        CCTabItem(tag: 3, icon: "person.fill",        label: "Profile"),
    ]

    var body: some View {
        ZStack {
            NavigationStack { ScoutHomeView() }
                .opacity(selectedTab == 0 ? 1 : 0).allowsHitTesting(selectedTab == 0)
            NavigationStack { WalletView() }
                .opacity(selectedTab == 1 ? 1 : 0).allowsHitTesting(selectedTab == 1)
            NavigationStack { ScoutQRCodeView() }
                .opacity(selectedTab == 2 ? 1 : 0).allowsHitTesting(selectedTab == 2)
            NavigationStack { ProfileView() }
                .opacity(selectedTab == 3 ? 1 : 0).allowsHitTesting(selectedTab == 3)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            CCTabBar(selection: $selectedTab, items: tabItems)
        }
        .onReceive(deepLink.$pendingRoute) { route in
            guard let route else { return }
            handleDeepLink(route)
            deepLink.pendingRoute = nil
        }
        .sheet(item: $offerToShow) { wrapper in
            NavigationStack { OfferDetailView(offerId: wrapper.id) }
        }
        .sheet(isPresented: $showSubscription) {
            SubscriptionView()
        }
        .sheet(item: $claimToken) { wrapper in
            ClaimGiftView(token: wrapper.token)
        }
    }

    private func handleDeepLink(_ route: DeepLinkRoute) {
        switch route {
        case .offer(let id):   offerToShow = OfferIDWrapper(id: id)
        case .subscription:    showSubscription = true
        case .claimGift(let token): claimToken = ClaimToken(token: token)
        case .referral:        selectedTab = 0
        default: break
        }
    }
}

private struct OfferIDWrapper: Identifiable { let id: Int }
private struct ClaimToken: Identifiable {
    let token: String
    var id: String { token }
}

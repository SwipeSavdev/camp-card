import SwiftUI

// MARK: - RootView

/// Entry point view. Handles auth gate -> consent gate -> role navigator.
struct RootView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @Environment(\.horizontalSizeClass) private var hSizeClass

    var body: some View {
        Group {
            if auth.isInitializing {
                SplashView()
            } else if !auth.isAuthenticated {
                // Direct to Login screen — matches RN app (no separate onboarding screen)
                NavigationStack {
                    LoginView()
                }
                .background(CCColor.background.ignoresSafeArea(.all))
            } else if let user = auth.user, user.needsConsentBlock {
                ConsentPendingView()
            } else if let user = auth.user {
                if hSizeClass == .regular {
                    // iPad: use NavigationSplitView for adaptive sidebar layout
                    iPadRoleNavigator(role: user.role)
                } else {
                    RoleNavigator(role: user.role)
                }
            } else {
                LoginView()
            }
        }
        .background(CCColor.background.ignoresSafeArea())
        .animation(.easeInOut(duration: 0.3), value: auth.isAuthenticated)
    }

    @ViewBuilder
    private func iPadRoleNavigator(role: UserRole) -> some View {
        // iPad uses a split-view where the sidebar lists navigation items
        // and the detail shows content. For each role, we use NavigationSplitView.
        switch role {
        case .scout:
            NavigationSplitView {
                ScoutSidebarView()
                    .environmentObject(auth)
            } detail: {
                ScoutHomeView()
                    .environmentObject(auth)
            }
        case .troopLeader:
            NavigationSplitView {
                TroopLeaderSidebarView()
                    .environmentObject(auth)
            } detail: {
                TroopLeaderHomeView()
            }
        case .parent, .councilAdmin, .nationalAdmin:
            NavigationSplitView {
                ParentSidebarView()
                    .environmentObject(auth)
            } detail: {
                ParentHomeView()
                    .environmentObject(auth)
            }
        }
    }
}

// MARK: - Sidebar views (iPad only)

struct ScoutSidebarView: View {
    @EnvironmentObject private var auth: AuthViewModel

    var body: some View {
        List {
            NavigationLink("Dashboard", destination: ScoutHomeView().environmentObject(auth))
            NavigationLink("My Cards", destination: CardInventoryView())
            NavigationLink("QR Code", destination: ScoutQRCodeView())
            NavigationLink("Referrals", destination: ReferralView())
            NavigationLink("Buy Cards", destination: BuyMoreCardsView())
            NavigationLink("Notifications", destination: NotificationsView())
            NavigationLink("Profile", destination: ProfileView().environmentObject(auth))
        }
        .navigationTitle("Camp Card")
        .listStyle(.sidebar)
    }
}

struct TroopLeaderSidebarView: View {
    @EnvironmentObject private var auth: AuthViewModel

    var body: some View {
        List {
            NavigationLink("Dashboard", destination: TroopLeaderHomeView())
            NavigationLink("Offers", destination: OffersListView())
            NavigationLink("Manage Scouts", destination: ManageScoutsView())
            NavigationLink("Troop Stats", destination: TroopStatsView())
            NavigationLink("Merchants", destination: MerchantsListView())
            NavigationLink("Notifications", destination: NotificationsView())
            NavigationLink("Profile", destination: ProfileView().environmentObject(auth))
        }
        .navigationTitle("Camp Card")
        .listStyle(.sidebar)
    }
}

struct ParentSidebarView: View {
    @EnvironmentObject private var auth: AuthViewModel

    var body: some View {
        List {
            NavigationLink("Dashboard", destination: ParentHomeView().environmentObject(auth))
            NavigationLink("Offers", destination: OffersListView())
            NavigationLink("Merchants", destination: MerchantsListView())
            NavigationLink("Notifications", destination: NotificationsView())
            NavigationLink("Profile", destination: ProfileView().environmentObject(auth))
        }
        .navigationTitle("Camp Card")
        .listStyle(.sidebar)
    }
}

// MARK: - SplashView

struct SplashView: View {
    var body: some View {
        ZStack {
            Color(hex: "#003F87").ignoresSafeArea()
            VStack(spacing: 20) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
                    .accessibilityHidden(true)
                Text("Camp Card")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(.white)
                    .accessibilityLabel("Loading")
            }
        }
    }
}

// MARK: - RoleNavigator (phone)

struct RoleNavigator: View {
    let role: UserRole

    var body: some View {
        switch role {
        case .scout:
            ScoutTabView()
        case .troopLeader:
            TroopLeaderTabView()
        case .parent:
            ParentTabView()
        case .councilAdmin, .nationalAdmin:
            ParentTabView()
        }
    }
}

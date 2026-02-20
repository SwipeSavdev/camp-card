import SwiftUI

// MARK: - ProfileView
// Role-aware profile and settings screen for Scout, Parent, and TroopLeader.

struct ProfileView: View {

    @EnvironmentObject private var auth: AuthViewModel
    @State private var showEditProfile = false
    @State private var showChangePassword = false
    @State private var showSubscription = false
    @State private var showNotifications = false
    @State private var showWallet = false
    @State private var showQRCode = false
    @State private var showReferrals = false
    @State private var showPrivacyPolicy = false
    @State private var showTerms = false
    @State private var showSignOutConfirm = false

    private var user: User? { auth.user }

    private var themeColor: Color {
        Color(hex: user?.role.themeColor ?? "#003F87")
    }

    var body: some View {
        List {
            // Account Header
            Section {
                accountHeader
            }

            // Account Section
            Section("Account") {
                menuRow(icon: "person.fill", label: "Edit Profile", color: themeColor) {
                    showEditProfile = true
                }
                menuRow(icon: "lock.fill", label: "Change Password", color: .gray) {
                    showChangePassword = true
                }
            }

            // Subscription
            Section("Subscription") {
                menuRow(icon: "star.circle.fill", label: "Manage Subscription", color: CCColor.primary) {
                    showSubscription = true
                }
            }

            // My Camp Card — Scout and Parent only
            if shouldShowScoutParentExtras {
                Section("My Camp Card") {
                    menuRow(icon: "wallet.pass.fill", label: "Wallet", color: CCColor.primary) {
                        showWallet = true
                    }
                    menuRow(icon: "qrcode", label: "My QR Code", color: CCColor.secondary) {
                        showQRCode = true
                    }
                    menuRow(icon: "person.2.fill", label: "Referrals", color: CCColor.primary) {
                        showReferrals = true
                    }
                }
            }

            // Notifications
            Section("Notifications") {
                menuRow(icon: "bell.fill", label: "Notifications", color: .orange) {
                    showNotifications = true
                }
            }

            // Legal
            Section("Legal") {
                menuRow(icon: "hand.raised.fill", label: "Privacy Policy", color: .gray) {
                    showPrivacyPolicy = true
                }
                menuRow(icon: "doc.text.fill", label: "Terms of Service", color: .gray) {
                    showTerms = true
                }
            }

            // Sign Out
            Section {
                Button(role: .destructive) {
                    showSignOutConfirm = true
                } label: {
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 7)
                                .fill(Color.red)
                                .frame(width: 30, height: 30)
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        Text("Sign Out")
                            .foregroundColor(.red)
                        Spacer()
                    }
                }
                .buttonStyle(.plain)
            }

            // Version Footer
            Section {
                HStack {
                    Spacer()
                    Text("Camp Card v\(APIConstants.appVersion) (\(APIConstants.buildNumber))")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
            .listRowBackground(Color.clear)
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showEditProfile) {
            EditProfileView()
        }
        .navigationDestination(isPresented: $showWallet) {
            WalletView()
        }
        .navigationDestination(isPresented: $showChangePassword) {
            ChangePasswordView()
        }
        .navigationDestination(isPresented: $showSubscription) {
            SubscriptionView()
        }
        .navigationDestination(isPresented: $showNotifications) {
            NotificationsSettingsView()
        }
        .navigationDestination(isPresented: $showQRCode) {
            ScoutQRCodeView()
        }
        .navigationDestination(isPresented: $showReferrals) {
            ReferralView()
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            NavigationStack {
                PrivacyPolicyView()
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Done") { showPrivacyPolicy = false }
                        }
                    }
            }
        }
        .sheet(isPresented: $showTerms) {
            NavigationStack {
                TermsOfServiceView()
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Done") { showTerms = false }
                        }
                    }
            }
        }
        .confirmationDialog("Sign Out", isPresented: $showSignOutConfirm, titleVisibility: .visible) {
            Button("Sign Out", role: .destructive) {
                auth.logout()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out of Camp Card?")
        }
    }

    // MARK: - Account Header

    private var accountHeader: some View {
        HStack(spacing: 16) {
            // Avatar circle with initials — 80x80 to match spec
            ZStack {
                Circle()
                    .fill(themeColor)
                    .frame(width: 80, height: 80)
                Text(initials)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 4) {
                Text(user?.fullName ?? "")
                    .font(.system(size: 20, weight: .bold))
                Text(user?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                Text(roleLabel)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(themeColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 3)
                    .background(themeColor.opacity(0.12))
                    .cornerRadius(20)
                    .padding(.top, 2)
            }

            Spacer()
        }
        .padding(.vertical, 6)
    }

    // MARK: - Menu Row Builder

    private func menuRow(icon: String, label: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .fill(color)
                        .frame(width: 30, height: 30)
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                Text(label)
                    .foregroundColor(.primary)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Computed Properties

    private var initials: String {
        let first = user?.firstName.first.map(String.init) ?? ""
        let last = user?.lastName.first.map(String.init) ?? ""
        return "\(first)\(last)".uppercased()
    }

    private var roleLabel: String {
        switch user?.role {
        case .scout:        return "Scout"
        case .troopLeader:  return "Unit Leader"
        case .parent:       return "Parent"
        case .councilAdmin: return "Council Admin"
        case .nationalAdmin:return "National Admin"
        case .none:         return ""
        }
    }

    private var shouldShowScoutParentExtras: Bool {
        user?.role == .scout || user?.role == .parent
    }
}

// MARK: - SafariWebView (lightweight in-app browser)

import SafariServices

struct SafariWebView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

// MARK: - NotificationsSettingsView placeholder
// Full implementation lives in NotificationManager.swift; this is the settings screen.

struct NotificationsSettingsView: View {
    @StateObject private var manager = NotificationManager.shared

    var body: some View {
        List {
            Section("Push Notifications") {
                HStack {
                    Label("Status", systemImage: "bell.fill")
                    Spacer()
                    Text(statusLabel)
                        .font(.caption)
                        .foregroundColor(statusColor)
                }

                if manager.authorizationStatus == .notDetermined {
                    Button("Enable Notifications") {
                        Task { await manager.requestAuthorization() }
                    }
                    .foregroundColor(CCColor.primary)
                } else if manager.authorizationStatus == .denied {
                    Button("Open Settings") {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }
                    .foregroundColor(Color(hex: "#003F87"))
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .task { await manager.refreshAuthorizationStatus() }
    }

    private var statusLabel: String {
        switch manager.authorizationStatus {
        case .authorized, .provisional, .ephemeral: return "Enabled"
        case .denied:                                return "Disabled"
        case .notDetermined:                         return "Not Set"
        @unknown default:                            return "Unknown"
        }
    }

    private var statusColor: Color {
        switch manager.authorizationStatus {
        case .authorized, .provisional, .ephemeral: return .green
        case .denied:                                return .red
        default:                                     return .secondary
        }
    }
}


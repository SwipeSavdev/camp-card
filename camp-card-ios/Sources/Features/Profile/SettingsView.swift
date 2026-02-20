import SwiftUI

// MARK: - SettingsView
// Accessible from Profile. Required by App Store reviewers.

struct SettingsView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var showDeleteConfirm = false
    @State private var showManageSubscription = false

    var body: some View {
        List {

            // MARK: Account
            Section("Account") {
                NavigationLink {
                    EditProfileView()
                        .environmentObject(auth)
                } label: {
                    Label("Edit Profile", systemImage: "person.circle")
                }

                NavigationLink {
                    ChangePasswordView()
                } label: {
                    Label("Change Password", systemImage: "lock.rotation")
                }
            }

            // MARK: Subscription
            Section("Subscription") {
                Button {
                    if let url = URL(string: "itms-apps://apps.apple.com/account/subscriptions") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    Label("Manage Subscription", systemImage: "creditcard")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Manage subscription in App Store settings")
            }

            // MARK: Notifications
            Section("Notifications") {
                Button {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    Label("Notification Settings", systemImage: "bell.badge")
                        .foregroundColor(.primary)
                }
                .accessibilityLabel("Open notification settings in iOS Settings")
            }

            // MARK: Legal
            Section("Legal") {
                NavigationLink {
                    PrivacyPolicyView()
                } label: {
                    Label("Privacy Policy", systemImage: "hand.raised")
                }

                NavigationLink {
                    TermsOfServiceView()
                } label: {
                    Label("Terms of Service", systemImage: "doc.text")
                }

                NavigationLink {
                    HelpSupportView()
                } label: {
                    Label("Help & Support", systemImage: "questionmark.circle")
                }
            }

            // MARK: App Info
            Section("About") {
                HStack {
                    Label("Version", systemImage: "info.circle")
                    Spacer()
                    Text(appVersion)
                        .foregroundColor(.secondary)
                        .font(.caption)
                }

                HStack {
                    Label("Build", systemImage: "hammer")
                    Spacer()
                    Text(buildNumber)
                        .foregroundColor(.secondary)
                        .font(.caption)
                }
            }

            // MARK: Sign Out / Delete
            Section {
                Button(role: .destructive) {
                    auth.logout()
                } label: {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
                .accessibilityLabel("Sign out of Camp Card")

                Button(role: .destructive) {
                    showDeleteConfirm = true
                } label: {
                    Label("Delete Account", systemImage: "person.crop.circle.badge.minus")
                }
                .accessibilityLabel("Permanently delete your account")
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .confirmationDialog(
            "Delete Account",
            isPresented: $showDeleteConfirm,
            titleVisibility: .visible
        ) {
            Button("Delete Account", role: .destructive) { deleteAccount() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This permanently deletes your account and all associated data. This action cannot be undone.")
        }
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—"
    }

    private var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "—"
    }

    private func deleteAccount() {
        Task {
            _ = try? await APIClient.shared.requestVoid(.deleteAccount)
            auth.logout()
        }
    }
}

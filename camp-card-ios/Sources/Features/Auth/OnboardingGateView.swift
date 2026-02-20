import SwiftUI
import StoreKit

// MARK: - OnboardingGateView
// Entry point for unauthenticated users.

struct OnboardingGateView: View {
    @StateObject private var store = StoreService.shared
    @State private var showLogin = false
    @State private var showSignup = false
    @State private var isRestoring = false
    @State private var restoreAlertMessage: String?
    @State private var showRestoreAlert = false
    @State private var showTerms = false
    @State private var showPrivacy = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {

                Spacer()

                // MARK: - Logo + Branding
                VStack(spacing: 20) {
                    // App icon
                    Group {
                        if let path = Bundle.main.path(forResource: "AppIcon_BSA", ofType: "jpg"),
                           let uiImg = UIImage(contentsOfFile: path) {
                            Image(uiImage: uiImg)
                                .resizable()
                                .scaledToFit()
                                .frame(width: 110, height: 110)
                                .clipShape(RoundedRectangle(cornerRadius: 24))
                        } else {
                            ZStack {
                                RoundedRectangle(cornerRadius: 24)
                                    .fill(Color.white)
                                    .frame(width: 110, height: 110)
                                Image(systemName: "flame.fill")
                                    .font(.system(size: 56))
                                    .foregroundColor(CCColor.secondary)
                            }
                        }
                    }
                    .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 8)
                    .accessibilityLabel("BSA Camp Card")

                    VStack(spacing: 8) {
                        Text("Camp Card")
                            .font(.system(size: 42, weight: .heavy))
                            .foregroundColor(.white)

                        Text("BSA Scout Fundraising")
                            .font(.system(size: 16))
                            .foregroundColor(.white.opacity(0.75))
                    }
                }

                Spacer()

                // MARK: - Buttons
                VStack(spacing: 14) {
                    // Sign Up
                    Button {
                        showSignup = true
                    } label: {
                        Text("Sign Up")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(CCColor.secondary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .accessibilityLabel("Sign Up — create a new free account")

                    // Sign In
                    Button {
                        showLogin = true
                    } label: {
                        Text("Sign In")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color.white.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(Color.white.opacity(0.4), lineWidth: 1.5)
                            )
                    }
                    .accessibilityLabel("Sign In to existing account")

                    // Restore Purchases
                    Button {
                        Task { await performRestore() }
                    } label: {
                        if isRestoring {
                            ProgressView()
                                .progressViewStyle(.circular)
                                .tint(.white.opacity(0.7))
                                .frame(height: 20)
                        } else {
                            Text("Restore Purchases")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    .disabled(isRestoring)
                    .accessibilityLabel("Restore previous App Store purchases")
                }
                .padding(.horizontal, 28)

                // MARK: - Legal footer
                VStack(spacing: 4) {
                    Text("By continuing, you agree to our")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.45))
                    HStack(spacing: 4) {
                        Button("Terms of Service") { showTerms = true }
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.65))
                        Text("and")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.45))
                        Button("Privacy Policy") { showPrivacy = true }
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.65))
                    }
                }
                .padding(.top, 24)
                .padding(.bottom, 40)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                LinearGradient(
                    colors: [CCColor.secondary, Color(hex: "#001A3A")],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationBarHidden(true)
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
            .navigationDestination(isPresented: $showSignup) {
                SignupView()
            }
            .navigationDestination(isPresented: $showTerms) {
                TermsOfServiceView()
            }
            .navigationDestination(isPresented: $showPrivacy) {
                PrivacyPolicyView()
            }
            .alert("Restore Purchases", isPresented: $showRestoreAlert) {
                Button("Sign In") { showLogin = true }
                Button("OK", role: .cancel) {}
            } message: {
                Text(restoreAlertMessage ?? "")
            }
        }
        .background(Color(hex: "#001A3A").ignoresSafeArea())
    }

    // MARK: - Restore Purchases
    private func performRestore() async {
        isRestoring = true
        do {
            try await store.restorePurchases()
            var hasEntitlement = false
            for await verification in Transaction.currentEntitlements {
                if (try? verification.payloadValue) != nil {
                    hasEntitlement = true; break
                }
            }
            if hasEntitlement {
                restoreAlertMessage = "Purchases found! Please sign in with your account to restore access to your cards and subscription."
            } else {
                restoreAlertMessage = "No previous purchases were found for this Apple ID."
            }
        } catch {
            restoreAlertMessage = "Could not connect to the App Store. Please try again later."
        }
        showRestoreAlert = true
        isRestoring = false
    }
}

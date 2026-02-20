import SwiftUI

// MARK: - AccountCreationView
// Step 3 of the new-user onboarding funnel (post-purchase).
// Pre-populates role from the onboarding flow.
// On success: marks accountCreated in Keychain, clears pendingPurchaseProductId,
// and sets AuthViewModel.isAuthenticated = true → RootView routes to home.

struct AccountCreationView: View {
    /// Role pre-selected in RoleSelectionView (nil = resumed from cold launch).
    let preselectedRole: OnboardingRole?
    /// Product ID of the purchase that triggered this screen.
    let pendingProductId: String?

    @EnvironmentObject private var auth: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var showLogin = false

    private let api = APIClient.shared

    private var effectiveRole: UserRole {
        preselectedRole?.userRole ?? .parent
    }

    private var isValid: Bool {
        !firstName.trimmingCharacters(in: .whitespaces).isEmpty &&
        !lastName.trimmingCharacters(in: .whitespaces).isEmpty &&
        email.contains("@") &&
        password.count >= 8 &&
        password == confirmPassword
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {

                // MARK: Success Banner
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                        .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Purchase Confirmed!")
                            .font(.system(size: CCFont.base, weight: .bold))
                            .foregroundColor(.white)
                        Text("Now create your account to access your cards.")
                            .font(.system(size: CCFont.sm))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(CCColor.success)

                VStack(spacing: 20) {

                    // MARK: Title
                    VStack(spacing: 6) {
                        Text("Create Your Account")
                            .font(.system(size: CCFont.xl, weight: .bold))
                            .accessibilityAddTraits(.isHeader)
                        Text("Set up your free account to manage your camp cards.")
                            .font(.system(size: CCFont.sm))
                            .foregroundColor(CCColor.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 24)

                    // MARK: Form
                    VStack(spacing: 14) {
                        HStack(spacing: 12) {
                            CCInputField(icon: "person", placeholder: "First Name", text: $firstName)
                            CCInputField(icon: "person", placeholder: "Last Name", text: $lastName)
                        }

                        CCInputField(icon: "envelope", placeholder: "Email Address",
                                     text: $email, keyboardType: .emailAddress)

                        CCPasswordField(placeholder: "Password (min 8 characters)",
                                        text: $password, showPassword: $showPassword)

                        CCPasswordField(placeholder: "Confirm Password",
                                        text: $confirmPassword, showPassword: $showPassword)

                        if !confirmPassword.isEmpty && password != confirmPassword {
                            ErrorBanner(message: "Passwords do not match")
                        }

                        // Role display (read-only, set by onboarding flow)
                        HStack(spacing: 12) {
                            Image(systemName: "person.badge.key")
                                .foregroundColor(CCColor.textSecondary)
                                .frame(width: 20)
                            Text(effectiveRole.displayName)
                                .foregroundColor(CCColor.textSecondary)
                            Spacer()
                            Image(systemName: "lock.fill")
                                .font(.caption)
                                .foregroundColor(CCColor.disabled)
                        }
                        .padding(.horizontal, 16)
                        .frame(height: 52)
                        .background(CCColor.background)
                        .clipShape(RoundedRectangle(cornerRadius: CCRadius.md))
                        .overlay(RoundedRectangle(cornerRadius: CCRadius.md)
                            .stroke(CCColor.border, lineWidth: 1))
                        .accessibilityLabel("Account role: \(effectiveRole.displayName)")

                        if let error = errorMessage {
                            ErrorBanner(message: error)
                        }

                        // Primary CTA
                        Button(action: performRegistration) {
                            Group {
                                if isLoading {
                                    ProgressView().progressViewStyle(.circular).tint(.white)
                                } else {
                                    Text("Create Account")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(CCColor.primary)
                        .disabled(!isValid || isLoading)
                        .accessibilityLabel(isValid ? "Create account" : "Fill in all fields to continue")
                    }

                    Divider()

                    // Already have account
                    VStack(spacing: 4) {
                        Text("Already have an account?")
                            .font(.system(size: CCFont.sm))
                            .foregroundColor(CCColor.textSecondary)
                        Button("Sign In Instead") { showLogin = true }
                            .font(.system(size: CCFont.sm, weight: .semibold))
                            .foregroundColor(CCColor.primary)
                            .accessibilityLabel("Sign in to existing account instead")
                    }
                    .padding(.bottom, 40)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationTitle("Create Account")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(isLoading)
        .ccScreenBackground()
        .navigationDestination(isPresented: $showLogin) {
            LoginView()
        }
    }

    // MARK: - Registration

    private func performRegistration() {
        guard isValid else { return }
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let body = RegisterRequest(
                    email: email.lowercased().trimmingCharacters(in: .whitespaces),
                    password: password,
                    firstName: firstName.trimmingCharacters(in: .whitespaces),
                    lastName: lastName.trimmingCharacters(in: .whitespaces),
                    role: effectiveRole.rawValue.uppercased()
                )
                let resp: AuthResponse = try await api.request(.register(body: body))

                // Persist tokens
                let keychain = KeychainService.shared
                keychain.storeAuthTokens(access: resp.accessToken, refresh: resp.refreshToken)
                keychain.accountCreated = true
                keychain.pendingPurchaseProductId = nil   // clear — onboarding complete

                // Update StoreService publisher
                await MainActor.run {
                    StoreService.shared.postPurchaseProductId = nil
                }

                // Update auth state → RootView will route to role home
                auth.updateUser(resp.user)

            } catch let ne as NetworkError {
                errorMessage = ne.errorDescription
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

private extension UserRole {
    var displayName: String {
        switch self {
        case .scout: return "Scout"
        case .parent: return "Parent / Supporter"
        case .troopLeader: return "Troop / Unit Leader"
        case .councilAdmin: return "Council Admin"
        case .nationalAdmin: return "National Admin"
        }
    }
}

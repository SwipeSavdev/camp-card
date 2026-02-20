import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var successMessage: String?

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    VStack(spacing: 12) {
                        Image(systemName: "envelope.badge.key.fill")
                            .font(.system(size: 48))
                            .foregroundColor(Color(hex: "#003F87"))
                        Text("Reset Password")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Enter your email address and we'll send you a link to reset your password.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 32)
                    .padding(.horizontal, 32)

                    VStack(spacing: 16) {
                        CCTextField(label: "Email", placeholder: "you@example.com",
                                    text: $email, keyboardType: .emailAddress)

                        if let error = errorMessage {
                            ErrorBanner(message: error)
                        }

                        if let success = successMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                                Text(success).font(.caption).foregroundColor(.green)
                                Spacer()
                            }
                            .padding(12)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(10)
                        }

                        Button(action: sendResetEmail) {
                            Group {
                                if isLoading {
                                    ProgressView().progressViewStyle(.circular).tint(.white)
                                } else {
                                    Text("Send Reset Link").fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(hex: "#003F87"))
                        .disabled(isLoading || email.isEmpty)
                    }
                    .padding(.horizontal, 24)
                }
            }
            .navigationTitle("Forgot Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func sendResetEmail() {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        Task {
            do {
                struct ForgotBody: Codable { let email: String }
                try await api.requestVoid(.forgotPassword(email: email.lowercased().trimmingCharacters(in: .whitespaces)))
                successMessage = "Check your email for a password reset link."
            } catch let ne as NetworkError {
                errorMessage = ne.errorDescription
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - ResetPasswordView (deep link entry)

struct ResetPasswordView: View {
    let token: String
    @Environment(\.dismiss) private var dismiss
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var success = false

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    VStack(spacing: 12) {
                        Image(systemName: "lock.rotation")
                            .font(.system(size: 48))
                            .foregroundColor(Color(hex: "#003F87"))
                        Text("New Password")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .padding(.top, 32)

                    if success {
                        VStack(spacing: 16) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 48))
                                .foregroundColor(.green)
                            Text("Password reset successfully!")
                                .font(.headline)
                            Button("Back to Login") { dismiss() }
                                .buttonStyle(.borderedProminent)
                                .tint(CCColor.primary)
                        }
                        .padding(32)
                    } else {
                        VStack(spacing: 16) {
                            CCSecureField(label: "New Password (min 8 chars)",
                                          placeholder: "••••••••",
                                          text: $password,
                                          showPassword: $showPassword)

                            CCSecureField(label: "Confirm Password",
                                          placeholder: "••••••••",
                                          text: $confirmPassword,
                                          showPassword: $showPassword)

                            if let error = errorMessage { ErrorBanner(message: error) }

                            Button(action: performReset) {
                                Group {
                                    if isLoading {
                                        ProgressView().progressViewStyle(.circular).tint(.white)
                                    } else {
                                        Text("Reset Password").fontWeight(.semibold)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color(hex: "#003F87"))
                            .disabled(isLoading || password.count < 8 || password != confirmPassword)
                        }
                        .padding(.horizontal, 24)
                    }
                }
            }
            .navigationTitle("Reset Password")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func performReset() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                struct ResetBody: Codable { let token: String; let password: String }
                try await api.requestVoid(.resetPassword(token: token, password: password))
                success = true
            } catch let ne as NetworkError {
                errorMessage = ne.errorDescription
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - EmailVerificationView

struct EmailVerificationView: View {
    let token: String
    @Environment(\.dismiss) private var dismiss
    @State private var isVerifying = true
    @State private var success = false
    @State private var errorMessage: String?

    private let api = APIClient.shared

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()
                if isVerifying {
                    ProgressView("Verifying email…")
                } else if success {
                    VStack(spacing: 16) {
                        Image(systemName: "envelope.badge.checkmark.fill")
                            .font(.system(size: 56))
                            .foregroundColor(.green)
                        Text("Email Verified!")
                            .font(.title)
                            .fontWeight(.bold)
                        Text("Your email has been verified. You can now use all features.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        Button("Continue") { dismiss() }
                            .buttonStyle(.borderedProminent)
                            .tint(CCColor.primary)
                    }
                } else {
                    VStack(spacing: 16) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 56))
                            .foregroundColor(.red)
                        Text("Verification Failed")
                            .font(.title)
                            .fontWeight(.bold)
                        if let error = errorMessage {
                            Text(error)
                                .multilineTextAlignment(.center)
                                .foregroundColor(.secondary)
                        }
                        Button("Close") { dismiss() }
                            .buttonStyle(.borderedProminent)
                    }
                }
                Spacer()
            }
            .padding(32)
            .task { await verify() }
        }
    }

    private func verify() async {
        do {
            try await api.requestVoid(.verifyEmail(token: token))
            success = true
        } catch let ne as NetworkError {
            errorMessage = ne.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        isVerifying = false
    }
}

import SwiftUI

struct SignupView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var showConfirmPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let api = APIClient.shared

    private var isValid: Bool {
        !firstName.isEmpty && !lastName.isEmpty &&
        !email.isEmpty && password.count >= 8 &&
        password == confirmPassword
    }

    var body: some View {
        ZStack(alignment: .topLeading) {

            // Full-bleed background — covers status bar, nav bar area, home indicator
            CCColor.background.ignoresSafeArea(.all)

            // Back button
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(CCColor.text)
                    .padding(16)
            }
            .padding(.top, 8)
            .zIndex(1)

            // Centered form
            VStack(spacing: 0) {

                Spacer()

                // Header
                VStack(spacing: 4) {
                    Text("Create Account")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(CCColor.text)
                    Text("Join the BSA Camp Card program")
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.textSecondary)
                }
                .padding(.bottom, 20)

                // Form fields
                VStack(spacing: 8) {

                    HStack(spacing: 8) {
                        CompactInputField(icon: "person", placeholder: "First Name", text: $firstName)
                        CompactInputField(icon: "person", placeholder: "Last Name", text: $lastName)
                    }

                    CompactInputField(icon: "envelope", placeholder: "Email",
                                      text: $email, keyboardType: .emailAddress)

                    CompactInputField(icon: "phone", placeholder: "Phone (optional)",
                                      text: $phone, keyboardType: .phonePad)

                    CompactPasswordField(placeholder: "Password (min 8 chars)",
                                         text: $password, showPassword: $showPassword)

                    CompactPasswordField(placeholder: "Confirm Password",
                                         text: $confirmPassword, showPassword: $showConfirmPassword)

                    if password.count > 0 && password.count < 8 {
                        Text("Password must be at least 8 characters")
                            .font(.system(size: 11))
                            .foregroundColor(CCColor.textSecondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    if !confirmPassword.isEmpty && password != confirmPassword {
                        Text("Passwords do not match")
                            .font(.system(size: 11))
                            .foregroundColor(CCColor.error)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    if let error = errorMessage {
                        ErrorBanner(message: error)
                    }
                }
                .padding(.bottom, 16)

                // Create Account button
                Button(action: performSignup) {
                    ZStack {
                        if isLoading {
                            ProgressView().progressViewStyle(.circular).tint(.white)
                        } else {
                            Text("Create Account")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(isValid && !isLoading ? CCColor.primary : CCColor.primary.opacity(0.6))
                    .cornerRadius(12)
                }
                .disabled(!isValid || isLoading)

                // Footer
                HStack(spacing: 4) {
                    Text("Already have an account?")
                        .font(.system(size: 13))
                        .foregroundColor(CCColor.textSecondary)
                    Button("Sign In") { dismiss() }
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(CCColor.primary)
                }
                .padding(.top, 12)

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .toolbar(.hidden, for: .navigationBar)
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }

    private func performSignup() {
        guard isValid else { return }
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let cleanEmail = email.lowercased().trimmingCharacters(in: .whitespaces)
                let body = RegisterRequest(
                    email: cleanEmail,
                    password: password,
                    firstName: firstName.trimmingCharacters(in: .whitespaces),
                    lastName: lastName.trimmingCharacters(in: .whitespaces),
                    role: "PARENT"
                )
                let _: AuthResponse = try await api.request(.register(body: body))
                try await auth.login(email: cleanEmail, password: password)
            } catch let ne as NetworkError {
                errorMessage = ne.errorDescription
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Compact input (height 44, used only by SignupView)

private struct CompactInputField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(CCColor.textSecondary)
                .frame(width: 18)
            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .textInputAutocapitalization(keyboardType == .emailAddress ? .never : .words)
                .font(.system(size: 15))
                .foregroundColor(CCColor.text)
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(CCColor.surface)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(CCColor.border, lineWidth: 1))
    }
}

private struct CompactPasswordField: View {
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "lock")
                .foregroundColor(CCColor.textSecondary)
                .frame(width: 18)
            if showPassword {
                TextField(placeholder, text: $text)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .font(.system(size: 15))
                    .foregroundColor(CCColor.text)
            } else {
                SecureField(placeholder, text: $text)
                    .font(.system(size: 15))
                    .foregroundColor(CCColor.text)
            }
            Button { showPassword.toggle() } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundColor(CCColor.textSecondary)
            }
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(CCColor.surface)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(CCColor.border, lineWidth: 1))
    }
}

// MARK: - Models

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String
    let lastName: String
    let role: String
}

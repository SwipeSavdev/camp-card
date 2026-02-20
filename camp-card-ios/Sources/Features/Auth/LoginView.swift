import SwiftUI
import LocalAuthentication

struct LoginView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showPassword = false
    @State private var errorMessage: String?
    @State private var showForgotPassword = false
    @State private var showSignup = false

    var body: some View {
        ZStack {
            // Full-bleed background — covers status bar, nav bar area, home indicator
            CCColor.background.ignoresSafeArea(.all)

            VStack(spacing: 0) {

                Spacer()

                // MARK: - Logo
                logoImage(size: 140)
                    .padding(.bottom, 36)
                    .accessibilityLabel("BSA Camp Card")

                // MARK: - Form
                VStack(spacing: 0) {

                    CCInputField(
                        icon: "envelope",
                        placeholder: "Email",
                        text: $email,
                        keyboardType: .emailAddress
                    )
                    .padding(.bottom, 16)

                    CCPasswordField(
                        placeholder: "Password",
                        text: $password,
                        showPassword: $showPassword
                    )
                    .padding(.bottom, 16)

                    if let error = errorMessage {
                        ErrorBanner(message: error)
                            .padding(.bottom, 12)
                    }

                    // Sign In button
                    Button(action: performLogin) {
                        ZStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(.circular)
                                    .tint(.white)
                            } else {
                                Text("Sign In")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            (isLoading || email.isEmpty || password.isEmpty)
                                ? CCColor.primary.opacity(0.6)
                                : CCColor.primary
                        )
                        .cornerRadius(12)
                    }
                    .disabled(isLoading || email.isEmpty || password.isEmpty)

                    // Biometric (Face ID / Touch ID)
                    if auth.canUseBiometric {
                        Button(action: performBiometricLogin) {
                            HStack(spacing: 8) {
                                Image(systemName: biometricIcon)
                                    .font(.system(size: 20))
                                Text(biometricLabel)
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(CCColor.primary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(CCColor.primary, lineWidth: 1.5)
                            )
                        }
                        .padding(.top, 12)
                    }

                    // Forgot Password
                    Button("Forgot Password?") { showForgotPassword = true }
                        .font(.system(size: 14))
                        .foregroundColor(CCColor.primary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 16)
                        .accessibilityLabel("Forgot your password? Tap to reset.")

                    // Footer
                    HStack(spacing: 4) {
                        Text("Don't have an account?")
                            .font(.system(size: 14))
                            .foregroundColor(CCColor.textSecondary)
                        Button("Sign Up") { showSignup = true }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(CCColor.primary)
                    }
                    .padding(.top, 12)
                }
                .padding(.horizontal, 24)

                Spacer()
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordView()
        }
        .navigationDestination(isPresented: $showSignup) {
            SignupView()
        }
    }

    // MARK: - Logo
    @ViewBuilder
    private func logoImage(size: CGFloat) -> some View {
        if let path = Bundle.main.path(forResource: "AppIcon_BSA", ofType: "jpg"),
           let uiImg = UIImage(contentsOfFile: path) {
            Image(uiImage: uiImg)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
                .clipShape(RoundedRectangle(cornerRadius: 22))
                .shadow(color: .black.opacity(0.12), radius: 16, x: 0, y: 4)
        } else {
            ZStack {
                RoundedRectangle(cornerRadius: 22)
                    .fill(CCColor.primary)
                    .frame(width: size, height: size)
                    .shadow(color: CCColor.primary.opacity(0.35), radius: 16, x: 0, y: 4)
                Image(systemName: "flame.fill")
                    .font(.system(size: size * 0.38))
                    .foregroundColor(.white)
            }
        }
    }

    // MARK: - Biometric helpers
    private var biometricIcon: String {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType == .faceID ? "faceid" : "touchid"
    }

    private var biometricLabel: String {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType == .faceID ? "Sign in with Face ID" : "Sign in with Touch ID"
    }

    // MARK: - Actions
    private func performLogin() {
        guard !email.isEmpty, !password.isEmpty else { return }
        isLoading = true
        errorMessage = nil
        Task {
            do {
                try await auth.login(
                    email: email.lowercased().trimmingCharacters(in: .whitespaces),
                    password: password
                )
            } catch {
                errorMessage = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
            }
            isLoading = false
        }
    }

    private func performBiometricLogin() {
        Task {
            do {
                try await auth.loginWithBiometric()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - CCInputField

struct CCInputField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(CCColor.textSecondary)
                .frame(width: 20)
            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .textInputAutocapitalization(keyboardType == .emailAddress ? .never : .sentences)
                .font(.system(size: 16))
                .foregroundColor(CCColor.text)
        }
        .padding(.horizontal, 16)
        .frame(height: 52)
        .background(CCColor.surface)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
    }
}

// MARK: - CCPasswordField

struct CCPasswordField: View {
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock")
                .foregroundColor(CCColor.textSecondary)
                .frame(width: 20)
            if showPassword {
                TextField(placeholder, text: $text)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .font(.system(size: 16))
                    .foregroundColor(CCColor.text)
            } else {
                SecureField(placeholder, text: $text)
                    .font(.system(size: 16))
                    .foregroundColor(CCColor.text)
            }
            Button {
                showPassword.toggle()
            } label: {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundColor(CCColor.textSecondary)
            }
            .accessibilityLabel(showPassword ? "Hide password" : "Show password")
        }
        .padding(.horizontal, 16)
        .frame(height: 52)
        .background(CCColor.surface)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
    }
}

// MARK: - CCTextField / CCSecureField (label-above style, used by other screens)

struct CCTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(CCColor.textSecondary)
            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .autocorrectionDisabled()
                .textInputAutocapitalization(keyboardType == .emailAddress ? .never : .sentences)
                .font(.system(size: 16))
                .padding(12)
                .background(CCColor.surface)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
        }
    }
}

struct CCSecureField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    @Binding var showPassword: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(CCColor.textSecondary)
            HStack {
                if showPassword {
                    TextField(placeholder, text: $text)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .font(.system(size: 16))
                } else {
                    SecureField(placeholder, text: $text)
                        .font(.system(size: 16))
                }
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(CCColor.textSecondary)
                }
            }
            .padding(12)
            .background(CCColor.surface)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(CCColor.border, lineWidth: 1))
        }
    }
}

// MARK: - ErrorBanner

struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(CCColor.error)
            Text(message)
                .font(.system(size: 13))
                .foregroundColor(CCColor.error)
                .multilineTextAlignment(.leading)
            Spacer()
        }
        .padding(12)
        .background(CCColor.error.opacity(0.1))
        .cornerRadius(10)
    }
}

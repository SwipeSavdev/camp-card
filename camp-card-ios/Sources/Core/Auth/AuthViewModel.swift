import Foundation
import SwiftUI
import LocalAuthentication

@MainActor
final class AuthViewModel: ObservableObject {
    static let shared = AuthViewModel()

    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isInitializing = true   // true only during cold-start token check
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared
    private let keychain = KeychainService.shared

    private init() {
        Task { await initialize() }
    }

    // MARK: - Initialize (on app launch)
    func initialize() async {
        defer { isInitializing = false }
        // Screenshot mode: auto-login with demo account so real API data loads
        if ProcessInfo.processInfo.environment["SCREENSHOT_MODE"] == "1" {
            try? await login(email: "demo@campcard.org", password: "Password123")
            return
        }
        guard keychain.accessToken != nil else { return }
        do {
            let u: User = try await api.request(.me)
            user = u
            isAuthenticated = true
        } catch {
            keychain.clearAll()
        }
    }

    // MARK: - Login
    func login(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        error = nil
        do {
            let resp: AuthResponse = try await api.request(.login(email: email, password: password))
            keychain.storeAuthTokens(access: resp.accessToken, refresh: resp.refreshToken)
            keychain.storeBiometricCredentials(email: email, refreshToken: resp.refreshToken)
            user = resp.user
            isAuthenticated = true
        } catch let ne as NetworkError {
            error = ne.errorDescription
            throw ne
        }
    }

    // MARK: - Biometric Login
    var canUseBiometric: Bool {
        let context = LAContext()
        var error: NSError?
        let canEval = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        if canEval { return true }
        // Show button if hardware supports biometrics but isn't enrolled yet
        if let laError = error as? LAError, laError.code == .biometryNotEnrolled { return true }
        return false
    }

    func loginWithBiometric() async throws {
        let context = LAContext()
        let reason = "Log in to Camp Card"
        guard try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) else {
            throw NetworkError.unauthorized
        }
        guard let refreshToken = keychain.biometricRefreshToken else {
            throw NetworkError.custom("Sign in with your password first to enable Face ID")
        }
        isLoading = true
        defer { isLoading = false }
        let resp: AuthResponse = try await api.request(.refresh(token: refreshToken))
        keychain.storeAuthTokens(access: resp.accessToken, refresh: resp.refreshToken)
        user = resp.user
        isAuthenticated = true
    }

    // MARK: - Logout
    func logout() {
        Task {
            try? await api.requestVoid(.logout)
        }
        keychain.clearAll()
        user = nil
        isAuthenticated = false
    }

    // MARK: - Update User
    func updateUser(_ updated: User) {
        user = updated
    }
}

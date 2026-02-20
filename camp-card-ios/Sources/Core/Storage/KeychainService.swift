import Foundation
import Security

final class KeychainService {
    static let shared = KeychainService()
    private init() {}

    private enum Key {
        static let accessToken = "campcard.accessToken"
        static let refreshToken = "campcard.refreshToken"
        static let biometricRefreshToken = "campcard.biometricRefreshToken"
        static let biometricEmail = "campcard.biometricEmail"
        // Onboarding: set "1" after account creation; cleared on logout
        static let accountCreated = "campcard.accountCreated"
        // Onboarding: product ID purchased before account existed; cleared after account creation
        static let pendingPurchaseProductId = "campcard.pendingPurchaseProductId"
    }

    // MARK: - Public Interface
    var accessToken: String? {
        get { load(key: Key.accessToken) }
        set { save(key: Key.accessToken, value: newValue) }
    }

    var refreshToken: String? {
        get { load(key: Key.refreshToken) }
        set { save(key: Key.refreshToken, value: newValue) }
    }

    var biometricRefreshToken: String? {
        get { load(key: Key.biometricRefreshToken) }
        set { save(key: Key.biometricRefreshToken, value: newValue) }
    }

    var biometricEmail: String? {
        get { load(key: Key.biometricEmail) }
        set { save(key: Key.biometricEmail, value: newValue) }
    }

    /// True once the user has completed account creation post-purchase.
    var accountCreated: Bool {
        get { load(key: Key.accountCreated) == "1" }
        set { save(key: Key.accountCreated, value: newValue ? "1" : nil) }
    }

    /// Product ID of an IAP completed before account creation; survives app restarts.
    var pendingPurchaseProductId: String? {
        get { load(key: Key.pendingPurchaseProductId) }
        set { save(key: Key.pendingPurchaseProductId, value: newValue) }
    }

    func clearAll() {
        delete(key: Key.accessToken)
        delete(key: Key.refreshToken)
        delete(key: Key.biometricRefreshToken)
        delete(key: Key.biometricEmail)
        delete(key: Key.accountCreated)
        delete(key: Key.pendingPurchaseProductId)
    }

    func storeAuthTokens(access: String, refresh: String) {
        accessToken = access
        refreshToken = refresh
    }

    func storeBiometricCredentials(email: String, refreshToken: String) {
        biometricEmail = email
        biometricRefreshToken = refreshToken
    }

    // MARK: - Private Keychain Operations
    private func save(key: String, value: String?) {
        guard let value else { delete(key: key); return }
        let data = Data(value.utf8)
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecAttrService: Bundle.main.bundleIdentifier ?? "org.bsa.campcard",
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlock
        ]
        var attributes: [CFString: Any] = [kSecValueData: data]
        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            attributes.merge(query) { current, _ in current }
            SecItemAdd(attributes as CFDictionary, nil)
        }
    }

    private func load(key: String) -> String? {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecAttrService: Bundle.main.bundleIdentifier ?? "org.bsa.campcard",
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func delete(key: String) {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecAttrService: Bundle.main.bundleIdentifier ?? "org.bsa.campcard"
        ]
        SecItemDelete(query as CFDictionary)
    }
}

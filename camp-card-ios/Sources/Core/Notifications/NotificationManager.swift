import Foundation
import UserNotifications
import UIKit
import AppTrackingTransparency
import AdSupport

// MARK: - NotificationManager
// Handles push notification authorization, APNs device token registration,
// and App Tracking Transparency (ATT) — required for ASC App Privacy compliance.

@MainActor
final class NotificationManager: ObservableObject {

    static let shared = NotificationManager()

    @Published var authorizationStatus: UNAuthorizationStatus = .notDetermined
    @Published var attStatus: ATTrackingManager.AuthorizationStatus = .notDetermined
    @Published var deviceToken: String?

    private let api = APIClient.shared

    private init() {
        Task { await refreshAuthorizationStatus() }
    }

    // MARK: - Push Notification Authorization

    /// Requests push notification authorization from the system.
    /// Should be called on first launch after the user has engaged with the app.
    func requestAuthorization() async {
        let center = UNUserNotificationCenter.current()
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
            if granted {
                await MainActor.run {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            await refreshAuthorizationStatus()
        } catch {
            print("[NotificationManager] Authorization request failed: \(error.localizedDescription)")
        }
    }

    /// Refreshes the cached authorization status from the system.
    func refreshAuthorizationStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        authorizationStatus = settings.authorizationStatus
    }

    // MARK: - Device Token Registration

    /// Called from AppDelegate.application(_:didRegisterForRemoteNotificationsWithDeviceToken:).
    /// Converts the raw token data to a hex string and sends it to the backend.
    func didRegisterForRemoteNotifications(deviceTokenData: Data) {
        let tokenString = deviceTokenData
            .map { String(format: "%02.2hhx", $0) }
            .joined()
        deviceToken = tokenString
        Task { await registerToken(tokenString, deviceType: "ios") }
    }

    /// Sends the device token to the backend for push notification targeting.
    func registerToken(_ token: String, deviceType: String) async {
        let request = DeviceTokenRequest(
            token: token,
            deviceType: deviceType,
            deviceModel: deviceModel(),
            osVersion: osVersion(),
            appVersion: APIConstants.appVersion
        )
        do {
            try await api.requestVoid(.registerToken(request))
            print("[NotificationManager] Device token registered: \(token.prefix(8))...")
        } catch {
            print("[NotificationManager] Token registration failed: \(error.localizedDescription)")
        }
    }

    /// Unregisters the current device token from the backend.
    func unregisterToken() async {
        guard let token = deviceToken else { return }
        do {
            try await api.requestVoid(.unregisterToken(token))
            deviceToken = nil
        } catch {
            print("[NotificationManager] Token unregistration failed: \(error.localizedDescription)")
        }
    }

    // MARK: - App Tracking Transparency (ATT)
    // Required by Apple App Store Review for apps that request tracking authorization.
    // Must be called AFTER the app presents its first screen (not on cold launch).

    /// Requests ATT tracking authorization from the user.
    /// This is required for ASC compliance whenever ATT framework is imported.
    /// Returns the resulting authorization status.
    @discardableResult
    func requestATT() async -> ATTrackingManager.AuthorizationStatus {
        // ATT prompt must be requested on the main thread
        let status = await ATTrackingManager.requestTrackingAuthorization()
        attStatus = status
        logATTStatus(status)
        return status
    }

    /// Refreshes the cached ATT status without prompting the user.
    func refreshATTStatus() {
        attStatus = ATTrackingManager.trackingAuthorizationStatus
    }

    /// Returns the IDFA if tracking is authorized, otherwise nil.
    var advertisingIdentifier: String? {
        guard ATTrackingManager.trackingAuthorizationStatus == .authorized else { return nil }
        let idfa = ASIdentifierManager.shared().advertisingIdentifier.uuidString
        return idfa == "00000000-0000-0000-0000-000000000000" ? nil : idfa
    }

    // MARK: - Badge Management

    func setBadgeCount(_ count: Int) async {
        do {
            try await UNUserNotificationCenter.current().setBadgeCount(count)
        } catch {
            print("[NotificationManager] Badge count update failed: \(error.localizedDescription)")
        }
    }

    func clearBadge() async {
        await setBadgeCount(0)
    }

    // MARK: - Private Helpers

    private func deviceModel() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        return withUnsafeBytes(of: &systemInfo.machine) { rawBytes in
            let pointer = rawBytes.baseAddress!.assumingMemoryBound(to: CChar.self)
            return String(cString: pointer)
        }
    }

    private func osVersion() -> String {
        UIDevice.current.systemVersion
    }

    private func logATTStatus(_ status: ATTrackingManager.AuthorizationStatus) {
        let label: String
        switch status {
        case .authorized:         label = "authorized"
        case .denied:             label = "denied"
        case .notDetermined:      label = "notDetermined"
        case .restricted:         label = "restricted"
        @unknown default:         label = "unknown"
        }
        print("[NotificationManager] ATT authorization status: \(label)")
    }
}

// MARK: - ATT Status Helpers

extension ATTrackingManager.AuthorizationStatus {
    var isAuthorized: Bool { self == .authorized }
    var isDecided: Bool { self != .notDetermined }
}

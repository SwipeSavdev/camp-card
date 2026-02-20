import SwiftUI
import UserNotifications
import AppTrackingTransparency

@main
struct CampCardApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authViewModel = AuthViewModel.shared
    @StateObject private var notificationManager = NotificationManager.shared

    var body: some Scene {
        WindowGroup {
            ZStack {
                CCColor.background.ignoresSafeArea(.all)
                RootView()
                    .environmentObject(authViewModel)
                    .environmentObject(notificationManager)
                    .onOpenURL { url in
                        DeepLinkHandler.shared.handle(url: url)
                    }
            }
            .ignoresSafeArea(.all)
            .onAppear {
                let bg = UIColor(red: 0.961, green: 0.961, blue: 0.961, alpha: 1)
                UIApplication.shared.connectedScenes
                    .compactMap { $0 as? UIWindowScene }
                    .flatMap { $0.windows }
                    .forEach {
                        $0.backgroundColor = bg
                        $0.rootViewController?.view.backgroundColor = bg
                    }
            }
        }
    }
}

import Foundation

enum APIConstants {
    static let baseURL = "https://api.campcardapp.org/api/v1"

    // IAP Product IDs
    enum IAP {
        static let subscriptionAnnual = "org.bsa.campcard.subscription.annual"
        static let subscriptionAnnualScout = "org.bsa.campcard.subscription.annual.scout"
        static let cards1 = "org.bsa.campcard.cards.1"
        static let cards3 = "org.bsa.campcard.cards.3"
        static let cards5 = "org.bsa.campcard.cards.5"
        static let cards10 = "org.bsa.campcard.cards.10"

        static let allProductIds: Set<String> = [
            subscriptionAnnual,
            subscriptionAnnualScout,
            cards1, cards3, cards5, cards10
        ]

        static func cardCount(for productId: String) -> Int {
            switch productId {
            case cards1: return 1
            case cards3: return 3
            case cards5: return 5
            case cards10: return 10
            default: return 0
            }
        }
    }

    // Brand Colors
    enum Colors {
        static let scoutRed = "#CE1126"
        static let bsaNavy = "#003F87"
        static let gold = "#FFD700"
    }

    // App Info
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "2.0.0"
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "70"
}

import Foundation

// MARK: - User Role
enum UserRole: String, Codable, CaseIterable {
    case scout = "SCOUT"
    case troopLeader = "TROOP_LEADER"
    case parent = "PARENT"
    case councilAdmin = "COUNCIL_ADMIN"
    case nationalAdmin = "NATIONAL_ADMIN"

    var themeColor: String {
        switch self {
        case .scout: return "#CE1126"
        case .troopLeader: return "#003F87"
        case .parent: return "#FFD700"
        default: return "#003F87"
        }
    }
}

// MARK: - Consent Status
enum ConsentStatus: String, Codable {
    case notRequired = "NOT_REQUIRED"
    case pending = "PENDING"
    case granted = "GRANTED"
    case denied = "DENIED"
    case revoked = "REVOKED"
}

// MARK: - User
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let role: UserRole
    let emailVerified: Bool
    let profileImageUrl: String?
    let cardNumber: String?
    let subscriptionStatus: String?
    let consentStatus: ConsentStatus?
    let locationAllowed: Bool?
    let requiresPasswordChange: Bool?
    let councilId: String?
    let troopId: String?

    var fullName: String { "\(firstName) \(lastName)" }

    var hasActiveSubscription: Bool {
        subscriptionStatus == "active"
    }

    var needsConsentBlock: Bool {
        guard let cs = consentStatus else { return false }
        return cs == .pending || cs == .denied || cs == .revoked
    }
}

// MARK: - Auth Responses
struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let tokenType: String
    let expiresIn: Int64?
    let user: User
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
}

// MARK: - Offer
struct Offer: Codable, Identifiable {
    let id: Int
    let uuid: String?
    let merchantId: Int
    let merchantName: String
    let merchantLogoUrl: String?
    let title: String
    let description: String
    let discountType: String
    let discountValue: Double
    let minPurchaseAmount: Double?
    let category: String?
    let terms: String?
    let imageUrl: String?
    let status: String
    let validFrom: String?
    let validUntil: String?
    let usageLimitPerUser: Int?
    let featured: Bool?
    let scoutExclusive: Bool?
    let requiresQrVerification: Bool?
    let isValid: Bool?
    let userRedemptionCount: Int?
    let userHasReachedLimit: Bool?
    let isRedeemed: Bool?

    var displayDiscount: String {
        switch discountType {
        case "PERCENTAGE": return "\(Int(discountValue))% Off"
        case "FIXED_AMOUNT": return "$\(String(format: "%.2f", discountValue)) Off"
        case "BUY_ONE_GET_ONE": return "BOGO"
        case "FREE_ITEM": return "Free Item"
        default: return "\(Int(discountValue)) Off"
        }
    }
}

// MARK: - Merchant
struct Merchant: Codable, Identifiable {
    let id: Int
    let businessName: String
    let category: String?
    let description: String?
    let logoUrl: String?
    let website: String?
    let status: String
    let locations: [MerchantLocation]?
    let contactEmail: String?
    let contactPhone: String?
}

struct MerchantLocation: Codable, Identifiable {
    let id: Int
    let locationName: String?
    let streetAddress: String
    let city: String
    let state: String
    let zipCode: String
    let phone: String?
    let latitude: Double?
    let longitude: Double?
    let primaryLocation: Bool?
    let hours: String?
}

// MARK: - Camp Card
enum CardStatus: String, Codable {
    case available = "AVAILABLE"
    case active = "ACTIVE"
    case used = "USED"
    case gifted = "GIFTED"
    case claimed = "CLAIMED"
    case expired = "EXPIRED"
    case revoked = "REVOKED"
}

struct CampCard: Codable, Identifiable {
    let id: Int
    let uuid: String
    let cardNumber: String?
    let status: CardStatus
    let activatedAt: String?
    let expiresAt: String?
    let createdAt: String?
    let giftedAt: String?
    let giftedToEmail: String?
    let giftMessage: String?
    let giftClaimedAt: String?
    let offersUsed: Int?
    let totalOffers: Int?
    let totalSavings: Double?
    let scoutAttributionId: String?
    let scoutName: String?
    let replacedByCardId: Int?
}

struct MyCardsResponse: Codable {
    let activeCard: CampCard?
    let unusedCards: [CampCard]?
    let giftedCards: [CampCard]?
    let expiredCards: [CampCard]?
    let totalCards: Int?
}

// MARK: - Notifications
struct AppNotification: Codable, Identifiable {
    let id: Int
    let title: String
    let body: String
    let type: String?
    let isRead: Bool
    let createdAt: String
    let data: [String: String]?
}

// MARK: - Redemption
struct RedemptionRecord: Codable, Identifiable {
    let id: Int
    let offerId: Int
    let offerTitle: String
    let merchantName: String
    let redeemedAt: String
    let discountValue: Double
    let discountType: String
}

// MARK: - Referral
struct ReferralStats: Codable {
    let linkClicks: Int
    let qrScans: Int
    let referralCount: Int
    let totalEarnings: Double
}

struct ReferralCode: Codable {
    let code: String
    let url: String?
}

// MARK: - Subscription Plan
struct SubscriptionPlan: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String
    let price: Double
    let interval: String
    let intervalCount: Int
    let productId: String?
}

struct SubscriptionStatus: Codable {
    let id: Int?
    let status: String
    let currentPeriodEnd: String?
    let cancelAtPeriodEnd: Bool?
    let plan: SubscriptionPlan?
}

// MARK: - Pagination
struct Page<T: Codable>: Codable {
    let content: [T]
    let totalElements: Int
    let totalPages: Int
    let number: Int
    let size: Int
    let first: Bool
    let last: Bool
}

// MARK: - QR Code
struct QRCodeResponse: Codable {
    let uniqueCode: String
    let qrCodeUrl: String?
    let userId: String?
}

// MARK: - Troop
struct Troop: Codable, Identifiable {
    let id: Int
    let name: String
    let troopNumber: String?
    let councilId: Int?
    let totalRaised: Double?
    let totalScouts: Int?
    let totalCards: Int?
}

// MARK: - Scout
struct Scout: Codable, Identifiable {
    let id: Int
    let userId: String
    let firstName: String
    let lastName: String
    let email: String
    let rank: String?
    let totalSales: Double?
    let cardsSold: Int?
    var fullName: String { "\(firstName) \(lastName)" }
}

// MARK: - Invite Scout Request
struct InviteScoutRequest: Codable {
    let email: String
    let firstName: String
    let lastName: String
    let troopId: Int
}

// MARK: - Gift Card
struct GiftCardRequest: Codable {
    let recipientEmail: String
    let giftMessage: String?
}

struct GiftDetailsResponse: Codable {
    let cardId: Int
    let giftedBy: String
    let giftMessage: String?
    let expiresAt: String?
}

// MARK: - Device Token
struct DeviceTokenRequest: Codable {
    let token: String
    let deviceType: String
    let deviceModel: String?
    let osVersion: String?
    let appVersion: String
}

// MARK: - IAP Verify Receipt
struct VerifyReceiptRequest: Codable {
    let receiptData: String
    let productId: String
    let transactionId: String
    let userId: String?
}

struct VerifyReceiptResponse: Codable {
    let valid: Bool
    let productId: String?
    let transactionId: String?
    let isSubscription: Bool?
    let subscriptionId: String?
    let cardsPurchased: Int?
    let expiresDate: String?
    let originalTransactionId: String?
}

// MARK: - Consent
struct ConsentStatusResponse: Codable {
    let status: ConsentStatus
    let parentEmail: String?
    let requestedAt: String?
}

// MARK: - Error
struct APIError: Codable, LocalizedError {
    let message: String?
    let error: String?    // some endpoints use "error" instead of "message"
    let status: Int?
    let errors: [String: String]?

    var errorDescription: String? { message ?? error }
}

// MARK: - Dashboard
struct TroopDashboard: Codable {
    let totalRaised: Double?
    let goal: Double?
    let totalScouts: Int?
    let activeCards: Int?
    let redemptionsThisMonth: Int?
}

// MARK: - Analytics
struct AnalyticsEvent: Codable {
    let sessionId: String
    let eventType: String
    let eventName: String
    let screenName: String?
    let properties: [String: String]?
    let deviceType: String
    let deviceModel: String
    let osVersion: String
    let appVersion: String
    let latitude: Double?
    let longitude: Double?
}

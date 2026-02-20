import Foundation

enum HTTPMethod: String {
    case GET, POST, PUT, PATCH, DELETE
}

struct Endpoint {
    let path: String
    let method: HTTPMethod
    let body: Encodable?
    let queryItems: [URLQueryItem]?
    let requiresAuth: Bool

    init(
        path: String,
        method: HTTPMethod = .GET,
        body: Encodable? = nil,
        queryItems: [URLQueryItem]? = nil,
        requiresAuth: Bool = true
    ) {
        self.path = path
        self.method = method
        self.body = body
        self.queryItems = queryItems
        self.requiresAuth = requiresAuth
    }

    var url: URL? {
        var components = URLComponents(string: APIConstants.baseURL + path)
        components?.queryItems = queryItems
        return components?.url
    }
}

// MARK: - All endpoints
extension Endpoint {
    // Auth
    static func login(email: String, password: String) -> Endpoint {
        Endpoint(path: "/auth/mobile/login", method: .POST,
                 body: ["email": email, "password": password], requiresAuth: false)
    }
    static func register(data: [String: Any]) -> Endpoint {
        Endpoint(path: "/auth/register", method: .POST,
                 body: AnyEncodable(data), requiresAuth: false)
    }
    static func refresh(token: String) -> Endpoint {
        Endpoint(path: "/auth/refresh", method: .POST,
                 body: RefreshTokenRequest(refreshToken: token), requiresAuth: false)
    }
    static let logout = Endpoint(path: "/auth/logout", method: .POST)
    static let me = Endpoint(path: "/auth/me")
    static func forgotPassword(email: String) -> Endpoint {
        Endpoint(path: "/auth/forgot-password", method: .POST,
                 body: ["email": email], requiresAuth: false)
    }
    static func resetPassword(token: String, password: String) -> Endpoint {
        Endpoint(path: "/auth/reset-password", method: .POST,
                 body: ["token": token, "newPassword": password], requiresAuth: false)
    }
    static func updateProfile(body: Encodable) -> Endpoint {
        Endpoint(path: "/auth/profile", method: .PUT, body: body)
    }
    static func changePassword(current: String, new: String) -> Endpoint {
        Endpoint(path: "/auth/change-password", method: .POST,
                 body: ["currentPassword": current, "newPassword": new])
    }

    // Offers
    static func offers(page: Int = 0, size: Int = 20, search: String? = nil) -> Endpoint {
        var qi: [URLQueryItem] = [URLQueryItem(name: "page", value: "\(page)"),
                                   URLQueryItem(name: "size", value: "\(size)")]
        if let s = search { qi.append(URLQueryItem(name: "search", value: s)) }
        return Endpoint(path: "/offers", queryItems: qi, requiresAuth: false)
    }
    static let activeOffers = Endpoint(path: "/offers/active", requiresAuth: false)
    static let featuredOffers = Endpoint(path: "/offers/featured", requiresAuth: false)
    static func offer(id: Int) -> Endpoint { Endpoint(path: "/offers/\(id)", requiresAuth: false) }
    static func merchantOffers(merchantId: Int) -> Endpoint {
        Endpoint(path: "/offers/merchant/\(merchantId)", requiresAuth: false)
    }
    static func generateQR(offerId: Int) -> Endpoint {
        Endpoint(path: "/offers/\(offerId)/qr-code", method: .POST)
    }
    static func redeemOffer(offerId: Int, cardId: Int) -> Endpoint {
        Endpoint(path: "/offers/redeem", method: .POST,
                 body: ["offerId": offerId, "cardId": cardId])
    }
    static func redemptionHistory(userId: String, page: Int = 0) -> Endpoint {
        Endpoint(path: "/offers/redemptions/user/\(userId)",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)")])
    }
    static func favoriteOffer(offerId: Int) -> Endpoint {
        Endpoint(path: "/offers/\(offerId)/favorite", method: .POST)
    }
    static let favorites = Endpoint(path: "/offers/favorites")
    static func unfavoriteOffer(offerId: Int) -> Endpoint {
        Endpoint(path: "/offers/\(offerId)/favorite", method: .DELETE)
    }

    // Merchants
    static func merchants(page: Int = 0, size: Int = 50) -> Endpoint {
        Endpoint(path: "/merchants",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)"),
                               URLQueryItem(name: "size", value: "\(size)")],
                 requiresAuth: false)
    }
    static func merchant(id: Int) -> Endpoint { Endpoint(path: "/merchants/\(id)", requiresAuth: false) }
    static func nearbyMerchants(lat: Double, lon: Double, radius: Int = 25) -> Endpoint {
        Endpoint(path: "/merchants/locations/nearby",
                 queryItems: [URLQueryItem(name: "latitude", value: "\(lat)"),
                               URLQueryItem(name: "longitude", value: "\(lon)"),
                               URLQueryItem(name: "radius", value: "\(radius)")],
                 requiresAuth: false)
    }

    // Cards
    static let myCards = Endpoint(path: "/cards/my-cards")
    static func card(id: Int) -> Endpoint { Endpoint(path: "/cards/\(id)") }
    static func activateCard(id: Int) -> Endpoint { Endpoint(path: "/cards/\(id)/activate", method: .POST) }
    static func giftCard(id: Int, request: GiftCardRequest) -> Endpoint {
        Endpoint(path: "/cards/\(id)/gift", method: .POST, body: request)
    }
    static func cancelGift(id: Int) -> Endpoint { Endpoint(path: "/cards/\(id)/cancel-gift", method: .POST) }
    static func claimGift(token: String) -> Endpoint {
        Endpoint(path: "/cards/claim/\(token)", method: .POST, requiresAuth: false)
    }
    static func giftDetails(token: String) -> Endpoint {
        Endpoint(path: "/cards/claim/\(token)", requiresAuth: false)
    }

    // Subscriptions
    static let subscriptionPlans = Endpoint(path: "/subscription-plans", requiresAuth: false)
    static let mySubscription = Endpoint(path: "/subscriptions/me")
    static func createSubscription(body: Encodable) -> Endpoint {
        Endpoint(path: "/subscriptions", method: .POST, body: body)
    }
    static let cancelSubscription = Endpoint(path: "/subscriptions/me", method: .DELETE)
    static let reactivateSubscription = Endpoint(path: "/subscriptions/me/reactivate", method: .POST)

    // IAP Verification
    static func verifyAppleReceipt(_ request: VerifyReceiptRequest) -> Endpoint {
        Endpoint(path: "/apple/verify-receipt", method: .POST, body: request, requiresAuth: false)
    }
    static func verifyGoogleReceipt(_ request: VerifyReceiptRequest) -> Endpoint {
        Endpoint(path: "/google/verify-receipt", method: .POST, body: request, requiresAuth: false)
    }

    // QR Code
    static let myQRCode = Endpoint(path: "/users/me/qr-code")
    static func validateQR(code: String) -> Endpoint { Endpoint(path: "/qr/validate/\(code)", requiresAuth: false) }

    // Notifications
    static func registerToken(_ request: DeviceTokenRequest) -> Endpoint {
        Endpoint(path: "/notifications/register-token", method: .POST, body: request)
    }
    static func unregisterToken(_ token: String) -> Endpoint {
        Endpoint(path: "/notifications/unregister-token/\(token)", method: .DELETE)
    }
    static func notifications(page: Int = 0) -> Endpoint {
        Endpoint(path: "/notifications/me",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)")])
    }
    static let unreadCount = Endpoint(path: "/notifications/me/unread-count")
    static func markRead(id: Int) -> Endpoint { Endpoint(path: "/notifications/\(id)/read", method: .PUT) }
    static let markAllRead = Endpoint(path: "/notifications/mark-all-read", method: .PUT)

    // Referrals
    static let myReferralCode = Endpoint(path: "/referrals/my-code")
    static let myReferrals = Endpoint(path: "/referrals/my-referrals")
    static let referralStats = Endpoint(path: "/referrals/my-stats")
    static func applyReferral(code: String) -> Endpoint {
        Endpoint(path: "/referrals/apply", method: .POST, body: ["code": code])
    }

    // Scouts / Troop
    static let myTroop = Endpoint(path: "/troops/me")
    static func troopRoster(troopId: Int, page: Int = 0) -> Endpoint {
        Endpoint(path: "/scouts/troop/\(troopId)/roster",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)")])
    }
    static func removeFromTroop(userId: String) -> Endpoint {
        Endpoint(path: "/users/\(userId)/troop", method: .DELETE)
    }
    static func inviteScout(_ request: InviteScoutRequest) -> Endpoint {
        Endpoint(path: "/scouts/invite", method: .POST, body: request)
    }

    // Dashboard
    static let dashboardSummary = Endpoint(path: "/dashboard/summary")
    static let troopSales = Endpoint(path: "/dashboard/troop-sales")
    static let scoutSales = Endpoint(path: "/dashboard/scout-sales")
    static let salesTrend = Endpoint(path: "/dashboard/sales-trend")

    // Consent (COPPA)
    static let myConsentStatus = Endpoint(path: "/consent/my-status")
    static let resendConsent = Endpoint(path: "/consent/resend", method: .POST)
    static func updateParentEmail(email: String) -> Endpoint {
        Endpoint(path: "/consent/update-parent", method: .POST, body: ["parentEmail": email])
    }
    static func consentVerify(token: String) -> Endpoint {
        Endpoint(path: "/consent/verify/\(token)", requiresAuth: false)
    }

    // Health
    static let health = Endpoint(path: "/public/health", requiresAuth: false)

    // MARK: - Aliases for screen code compatibility

    // Register with typed body
    static func register(body: RegisterRequest) -> Endpoint {
        Endpoint(path: "/auth/register", method: .POST, body: body, requiresAuth: false)
    }

    // Verify email
    static func verifyEmail(token: String) -> Endpoint {
        Endpoint(path: "/auth/verify-email", method: .GET,
                 queryItems: [URLQueryItem(name: "token", value: token)], requiresAuth: false)
    }

    // Offer detail alias
    static func offerDetail(id: Int) -> Endpoint { Endpoint(path: "/offers/\(id)", requiresAuth: false) }

    // Merchant detail alias
    static func merchantDetail(id: Int) -> Endpoint { Endpoint(path: "/merchants/\(id)", requiresAuth: false) }

    // GiftCard with body alias
    static func giftCard(id: Int, body: GiftCardRequest) -> Endpoint {
        Endpoint(path: "/cards/\(id)/gift", method: .POST, body: body)
    }

    // QR Code (user affiliate)
    static let qrCode = Endpoint(path: "/users/me/qr-code")

    // Referral code
    static let referralCode = Endpoint(path: "/referrals/my-code")

    // Troop scouts
    static let troopScouts = Endpoint(path: "/scouts/my-troop")

    // Troop dashboard
    static let troopDashboard = Endpoint(path: "/dashboard/troop-summary")

    // Remove scout alias
    static func removeScout(userId: String) -> Endpoint {
        Endpoint(path: "/users/\(userId)/troop", method: .DELETE)
    }

    // Redemption history (paginated)
    static func redemptionHistory(page: Int, size: Int) -> Endpoint {
        Endpoint(path: "/redemptions/history",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)"),
                               URLQueryItem(name: "size", value: "\(size)")])
    }

    // Consent status
    static let consentStatus = Endpoint(path: "/consent/my-status")

    // Subscription plans
    static let subscription = Endpoint(path: "/subscriptions/me")
    static let subscriptionStatus = Endpoint(path: "/subscriptions/me")

    // Change password
    static func changePassword(body: Encodable) -> Endpoint {
        Endpoint(path: "/auth/change-password", method: .POST, body: body)
    }

    // Update profile
    static func profile(body: Encodable? = nil) -> Endpoint {
        body == nil
            ? Endpoint(path: "/users/profile")
            : Endpoint(path: "/users/profile", method: .PUT, body: body)
    }

    // Offers full params
    static func offers(page: Int = 0, size: Int = 20, merchantId: Int? = nil, category: String? = nil) -> Endpoint {
        var qi: [URLQueryItem] = [URLQueryItem(name: "page", value: "\(page)"), URLQueryItem(name: "size", value: "\(size)")]
        if let m = merchantId { qi.append(URLQueryItem(name: "merchantId", value: "\(m)")) }
        if let c = category { qi.append(URLQueryItem(name: "category", value: c)) }
        return Endpoint(path: "/offers", queryItems: qi, requiresAuth: false)
    }

    // Notification endpoints
    static func notifications(page: Int = 0, size: Int = 20) -> Endpoint {
        Endpoint(path: "/notifications/me",
                 queryItems: [URLQueryItem(name: "page", value: "\(page)"), URLQueryItem(name: "size", value: "\(size)")])
    }
    static func markNotificationRead(id: Int) -> Endpoint { Endpoint(path: "/notifications/\(id)/read", method: .PUT) }
    static let markAllNotificationsRead = Endpoint(path: "/notifications/mark-all-read", method: .PUT)

    // Account management
    static let deleteAccount = Endpoint(path: "/users/me", method: .DELETE)
}

// Helper for encoding arbitrary dictionaries
struct AnyEncodable: Encodable {
    private let encodeFunc: (Encoder) throws -> Void
    init(_ value: [String: Any]) {
        encodeFunc = { encoder in
            var container = encoder.container(keyedBy: DynamicCodingKey.self)
            for (key, val) in value {
                let codingKey = DynamicCodingKey(stringValue: key)!
                switch val {
                case let v as String: try container.encode(v, forKey: codingKey)
                case let v as Int: try container.encode(v, forKey: codingKey)
                case let v as Double: try container.encode(v, forKey: codingKey)
                case let v as Bool: try container.encode(v, forKey: codingKey)
                default: break
                }
            }
        }
    }
    func encode(to encoder: Encoder) throws { try encodeFunc(encoder) }
}

struct DynamicCodingKey: CodingKey {
    var stringValue: String
    var intValue: Int?
    init?(stringValue: String) { self.stringValue = stringValue }
    init?(intValue: Int) { self.stringValue = "\(intValue)"; self.intValue = intValue }
}

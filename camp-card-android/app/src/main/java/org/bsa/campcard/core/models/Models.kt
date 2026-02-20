package org.bsa.campcard.core.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// MARK: - Paginated Response (Spring Page<T>)

@Serializable
data class PageResponse<T>(
    val content: List<T> = emptyList(),
    val totalElements: Int = 0,
    val totalPages: Int = 0,
    val last: Boolean = true
)

// MARK: - User Role

enum class UserRole(val value: String) {
    SCOUT("SCOUT"),
    TROOP_LEADER("TROOP_LEADER"),
    PARENT("PARENT"),
    COUNCIL_ADMIN("COUNCIL_ADMIN"),
    NATIONAL_ADMIN("NATIONAL_ADMIN");

    companion object {
        fun from(value: String) = entries.firstOrNull { it.value == value } ?: PARENT
    }
}

// MARK: - User

@Serializable
data class User(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val emailVerified: Boolean,
    val profileImageUrl: String? = null,
    val cardNumber: String? = null,
    val subscriptionStatus: String? = null,
    val consentStatus: String? = null,
    val locationAllowed: Boolean? = null,
    val requiresPasswordChange: Boolean? = null,
    val councilId: String? = null,
    val troopId: String? = null
) {
    val fullName: String get() = "$firstName $lastName"
    val userRole: UserRole get() = UserRole.from(role)
    val hasActiveSubscription: Boolean get() = subscriptionStatus == "active"
    val needsConsentBlock: Boolean get() = consentStatus in listOf("PENDING", "DENIED", "REVOKED")
}

// MARK: - Auth

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String,
    val expiresIn: Long? = null,
    val user: User
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val role: String
)

@Serializable
data class RefreshTokenRequest(
    val refreshToken: String
)

@Serializable
data class ForgotPasswordRequest(val email: String)

@Serializable
data class ResetPasswordRequest(val token: String, val password: String)

@Serializable
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

// MARK: - Offer

@Serializable
data class Offer(
    val id: Int,
    val uuid: String? = null,
    val merchantId: Int,
    val merchantName: String,
    val merchantLogoUrl: String? = null,
    val title: String,
    val description: String,
    val discountType: String,
    val discountValue: Double,
    val minPurchaseAmount: Double? = null,
    val category: String? = null,
    val terms: String? = null,
    val imageUrl: String? = null,
    val status: String,
    val validFrom: String? = null,
    val validUntil: String? = null,
    val usageLimitPerUser: Int? = null,
    val featured: Boolean? = null,
    val scoutExclusive: Boolean? = null,
    val requiresQrVerification: Boolean? = null,
    val isValid: Boolean? = null,
    val userRedemptionCount: Int? = null,
    val userHasReachedLimit: Boolean? = null,
    val isRedeemed: Boolean? = null
) {
    val displayDiscount: String get() = when (discountType) {
        "PERCENTAGE" -> "${discountValue.toInt()}% Off"
        "FIXED_AMOUNT" -> "$${String.format("%.2f", discountValue)} Off"
        "BUY_ONE_GET_ONE" -> "BOGO"
        "FREE_ITEM" -> "Free Item"
        else -> "${discountValue.toInt()} Off"
    }
}

// MARK: - Merchant

@Serializable
data class Merchant(
    val id: Int,
    val businessName: String,
    val category: String? = null,
    val description: String? = null,
    val logoUrl: String? = null,
    val website: String? = null,
    val status: String,
    val locations: List<MerchantLocation>? = null,
    val contactEmail: String? = null,
    val contactPhone: String? = null
)

@Serializable
data class MerchantLocation(
    val id: Int,
    val locationName: String? = null,
    val streetAddress: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val phone: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val primaryLocation: Boolean? = null,
    val hours: String? = null
)

// MARK: - Camp Card

@Serializable
data class CampCard(
    val id: Int,
    val uuid: String,
    val cardNumber: String? = null,
    val status: String,
    val activatedAt: String? = null,
    val expiresAt: String? = null,
    val createdAt: String? = null,
    val giftedAt: String? = null,
    val giftedToEmail: String? = null,
    val giftMessage: String? = null,
    val giftClaimedAt: String? = null,
    val offersUsed: Int? = null,
    val totalOffers: Int? = null,
    val totalSavings: Double? = null,
    val scoutAttributionId: String? = null,
    val scoutName: String? = null,
    val replacedByCardId: Int? = null
)

@Serializable
data class MyCardsResponse(
    val activeCard: CampCard? = null,
    val unusedCards: List<CampCard>? = null,
    val giftedCards: List<CampCard>? = null,
    val expiredCards: List<CampCard>? = null,
    val totalCards: Int? = null
)

// MARK: - Notification

@Serializable
data class AppNotification(
    val id: Int,
    val title: String,
    val body: String,
    val type: String? = null,
    val isRead: Boolean,
    val createdAt: String,
    val data: Map<String, String>? = null
)

// MARK: - Redemption

@Serializable
data class RedemptionRecord(
    val id: Int,
    val offerId: Int,
    val offerTitle: String,
    val merchantName: String,
    val redeemedAt: String,
    val discountValue: Double,
    val discountType: String
)

// MARK: - Referral

@Serializable
data class ReferralStats(
    val linkClicks: Int,
    val qrScans: Int,
    val referralCount: Int,
    val totalEarnings: Double
)

@Serializable
data class ReferralCode(
    val code: String,
    val url: String? = null
)

// MARK: - Subscription

@Serializable
data class SubscriptionPlan(
    val id: Int,
    val name: String,
    val description: String,
    val price: Double,
    val interval: String,
    val intervalCount: Int,
    val productId: String? = null
)

@Serializable
data class SubscriptionStatus(
    val id: Int? = null,
    val status: String,
    val currentPeriodEnd: String? = null,
    val cancelAtPeriodEnd: Boolean? = null,
    val plan: SubscriptionPlan? = null
)

// MARK: - Pagination

@Serializable
data class Page<T>(
    val content: List<T>,
    val totalElements: Int,
    val totalPages: Int,
    val number: Int,
    val size: Int,
    val first: Boolean,
    val last: Boolean
)

// MARK: - QR Code

@Serializable
data class QRCodeResponse(
    val uniqueCode: String,
    val qrCodeUrl: String? = null,
    val userId: String? = null
)

// MARK: - Troop

@Serializable
data class Troop(
    val id: Int,
    val name: String,
    val troopNumber: String? = null,
    val councilId: Int? = null,
    val totalRaised: Double? = null,
    val totalScouts: Int? = null,
    val totalCards: Int? = null
)

@Serializable
data class Scout(
    val id: Int,
    val userId: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val rank: String? = null,
    val totalSales: Double? = null,
    val cardsSold: Int? = null
) {
    val fullName: String get() = "$firstName $lastName"
}

@Serializable
data class InviteScoutRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val troopId: Int
)

// MARK: - Gift Card

@Serializable
data class GiftCardRequest(
    val recipientEmail: String,
    val giftMessage: String? = null
)

@Serializable
data class GiftDetailsResponse(
    val cardId: Int,
    val giftedBy: String,
    val giftMessage: String? = null,
    val expiresAt: String? = null
)

// MARK: - Device Token

@Serializable
data class DeviceTokenRequest(
    val token: String,
    val deviceType: String,
    val deviceModel: String? = null,
    val osVersion: String? = null,
    val appVersion: String
)

// MARK: - IAP

@Serializable
data class VerifyReceiptRequest(
    val receiptData: String,
    val productId: String,
    val transactionId: String,
    val userId: String? = null
)

@Serializable
data class VerifyReceiptResponse(
    val valid: Boolean,
    val productId: String? = null,
    val transactionId: String? = null,
    val isSubscription: Boolean? = null,
    val subscriptionId: String? = null,
    val cardsPurchased: Int? = null,
    val expiresDate: String? = null,
    val originalTransactionId: String? = null
)

// MARK: - Dashboard

@Serializable
data class TroopDashboard(
    val totalRaised: Double? = null,
    val goal: Double? = null,
    val totalScouts: Int? = null,
    val activeCards: Int? = null,
    val redemptionsThisMonth: Int? = null
)

// MARK: - Update Profile

@Serializable
data class UpdateProfileRequest(
    val firstName: String,
    val lastName: String,
    val phone: String? = null
)

// MARK: - Consent

@Serializable
data class ConsentStatusResponse(
    val status: String,
    val parentEmail: String? = null,
    val requestedAt: String? = null
)

// MARK: - API Error

@Serializable
data class ApiError(
    val message: String,
    val status: Int? = null,
    val errors: Map<String, String>? = null
)

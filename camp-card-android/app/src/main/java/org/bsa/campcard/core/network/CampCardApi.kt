package org.bsa.campcard.core.network

import org.bsa.campcard.core.models.*
import retrofit2.http.*

interface CampCardApi {

    // MARK: - Auth
    @POST("auth/mobile/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @POST("auth/refresh")
    suspend fun refresh(@Body request: RefreshTokenRequest): AuthResponse

    @POST("auth/logout")
    suspend fun logout()

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest)

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest)

    @GET("auth/verify-email")
    suspend fun verifyEmail(@Query("token") token: String)

    @GET("auth/me")
    suspend fun me(): User

    // MARK: - Profile
    @GET("auth/me")
    suspend fun getProfile(): User

    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): User

    @POST("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest)

    @DELETE("users/account")
    suspend fun deleteAccount()

    // MARK: - Cards
    @GET("cards/my-cards")
    suspend fun myCards(): MyCardsResponse

    @POST("cards/{id}/activate")
    suspend fun activateCard(@Path("id") id: Int): CampCard

    @POST("cards/{id}/gift")
    suspend fun giftCard(@Path("id") id: Int, @Body request: GiftCardRequest): CampCard

    @GET("cards/claim/{token}")
    suspend fun getGiftDetails(@Path("token") token: String): GiftDetailsResponse

    @POST("cards/claim/{token}")
    suspend fun claimGift(@Path("token") token: String): CampCard

    // MARK: - Offers
    @GET("offers")
    suspend fun getOffers(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 50,
        @Query("merchantId") merchantId: Int? = null,
        @Query("category") category: String? = null
    ): PageResponse<Offer>

    @GET("offers/featured")
    suspend fun getFeaturedOffers(): PageResponse<Offer>

    @GET("offers/{id}")
    suspend fun getOffer(@Path("id") id: Int): Offer

    @POST("offers/redeem")
    suspend fun redeemOffer(@Body body: Map<String, String>): RedemptionRecord

    // MARK: - Merchants
    @GET("merchants")
    suspend fun getMerchants(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 50
    ): PageResponse<Merchant>

    @GET("merchants/{id}")
    suspend fun getMerchant(@Path("id") id: Int): Merchant

    @GET("merchants/locations/nearby")
    suspend fun getNearbyMerchants(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("radius") radius: Double = 25.0
    ): List<MerchantLocation>

    // MARK: - Redemption History
    @GET("offers/redemptions/user/{userId}")
    suspend fun getRedemptionHistory(
        @Path("userId") userId: String,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): PageResponse<RedemptionRecord>

    // MARK: - Referral
    @GET("referrals/my-code")
    suspend fun getReferralCode(): ReferralCode

    @GET("referrals/my-stats")
    suspend fun getReferralStats(): ReferralStats

    // MARK: - QR Code
    @GET("users/me/qr-code")
    suspend fun getQrCode(): QRCodeResponse

    // MARK: - Subscription
    @GET("subscriptions/me")
    suspend fun getSubscriptionStatus(): SubscriptionStatus

    @GET("subscription-plans")
    suspend fun getSubscriptionPlans(): List<SubscriptionPlan>

    @POST("subscriptions")
    suspend fun subscribe(@Body body: Map<String, String>): SubscriptionStatus

    @DELETE("subscriptions/me")
    suspend fun cancelSubscription()

    // MARK: - IAP Verification
    @POST("apple/verify-receipt")
    suspend fun verifyAppleReceipt(@Body request: VerifyReceiptRequest): VerifyReceiptResponse

    @POST("google/verify-receipt")
    suspend fun verifyGoogleReceipt(@Body request: VerifyReceiptRequest): VerifyReceiptResponse

    // MARK: - Notifications
    @GET("notifications/me")
    suspend fun getNotifications(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): PageResponse<AppNotification>

    @PUT("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: Int)

    @PUT("notifications/mark-all-read")
    suspend fun markAllNotificationsRead()

    @POST("notifications/register-token")
    suspend fun registerDeviceToken(@Body request: DeviceTokenRequest)

    // MARK: - Scout / Troop Leader
    @GET("troops/me")
    suspend fun getMyTroop(): Troop

    @GET("scouts/troop/{troopId}/roster")
    suspend fun getTroopScouts(
        @Path("troopId") troopId: Int,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 50
    ): PageResponse<Scout>

    @POST("scouts/invite")
    suspend fun inviteScout(@Body request: InviteScoutRequest)

    @DELETE("users/{userId}/troop")
    suspend fun removeScout(@Path("userId") userId: String)

    @GET("dashboard/troop-summary")
    suspend fun getTroopDashboard(): TroopDashboard

    // MARK: - Consent
    @GET("consent/my-status")
    suspend fun getConsentStatus(): ConsentStatusResponse
}

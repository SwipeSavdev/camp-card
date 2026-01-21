package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents an individual Camp Card in the inventory system.
 * Cards can be purchased, gifted, replenished, and expire on December 31st.
 */
@Entity
@Table(name = "camp_cards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Builder.Default
    private UUID uuid = UUID.randomUUID();

    @Column(name = "card_number", nullable = false, unique = true, length = 20)
    private String cardNumber;

    // Ownership
    @Column(name = "owner_user_id", columnDefinition = "UUID")
    private UUID ownerUserId;

    @Column(name = "original_purchaser_id", columnDefinition = "UUID")
    private UUID originalPurchaserId;

    @Column(name = "purchase_order_id")
    private Long purchaseOrderId;

    @Column(name = "purchase_transaction_id", length = 100)
    private String purchaseTransactionId;

    // Status
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CampCardStatus status = CampCardStatus.UNASSIGNED;

    // Important dates
    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;  // Always December 31st of purchase year

    // Gift information
    @Column(name = "gifted_at")
    private LocalDateTime giftedAt;

    @Column(name = "gifted_to_email", length = 255)
    private String giftedToEmail;

    @Column(name = "gift_message", columnDefinition = "TEXT")
    private String giftMessage;

    @Column(name = "gift_claim_token", unique = true, length = 100)
    private String giftClaimToken;

    @Column(name = "gift_claimed_at")
    private LocalDateTime giftClaimedAt;

    // Scout attribution (preserved even when gifted)
    @Column(name = "scout_attribution_id", columnDefinition = "UUID")
    private UUID scoutAttributionId;

    @Column(name = "referral_depth")
    @Builder.Default
    private Integer referralDepth = 0;

    // Replenishment tracking
    @Column(name = "replaced_by_card_id")
    private Long replacedByCardId;

    // Usage tracking (denormalized for performance)
    @Column(name = "offers_used")
    @Builder.Default
    private Integer offersUsed = 0;

    @Column(name = "total_savings_cents")
    @Builder.Default
    private Integer totalSavingsCents = 0;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Card status enum matching database constraint
     */
    public enum CampCardStatus {
        UNASSIGNED,  // Purchased but not activated; in user's wallet
        ACTIVE,      // Currently in use for offer redemptions
        GIFTED,      // Sent as gift, pending recipient claim
        REPLACED,    // Deactivated when user replenished with new card
        EXPIRED,     // Past December 31st expiry date
        REVOKED      // Administratively disabled
    }

    // Helper methods

    /**
     * Activate this card for the current owner
     */
    public void activate() {
        this.status = CampCardStatus.ACTIVE;
        this.activatedAt = LocalDateTime.now();
    }

    /**
     * Mark this card as gifted to a recipient
     */
    public void markAsGifted(String recipientEmail, String message, String claimToken) {
        this.status = CampCardStatus.GIFTED;
        this.giftedAt = LocalDateTime.now();
        this.giftedToEmail = recipientEmail;
        this.giftMessage = message;
        this.giftClaimToken = claimToken;
    }

    /**
     * Claim this gifted card for a new owner
     */
    public void claimGift(UUID newOwnerId) {
        this.ownerUserId = newOwnerId;
        this.status = CampCardStatus.ACTIVE;
        this.giftClaimedAt = LocalDateTime.now();
        this.activatedAt = LocalDateTime.now();
        this.giftClaimToken = null; // Invalidate the token
    }

    /**
     * Cancel the gift and return card to original owner
     */
    public void cancelGift() {
        this.status = CampCardStatus.UNASSIGNED;
        this.giftedAt = null;
        this.giftedToEmail = null;
        this.giftMessage = null;
        this.giftClaimToken = null;
    }

    /**
     * Mark this card as replaced by a new card
     */
    public void markAsReplaced(Long newCardId) {
        this.status = CampCardStatus.REPLACED;
        this.replacedByCardId = newCardId;
    }

    /**
     * Expire this card
     */
    public void expire() {
        this.status = CampCardStatus.EXPIRED;
    }

    /**
     * Revoke this card administratively
     */
    public void revoke() {
        this.status = CampCardStatus.REVOKED;
    }

    /**
     * Check if this card is currently usable for redemptions
     */
    public boolean isUsable() {
        return this.status == CampCardStatus.ACTIVE &&
               this.expiresAt != null &&
               this.expiresAt.isAfter(LocalDateTime.now());
    }

    /**
     * Check if this card can be gifted
     */
    public boolean canBeGifted() {
        return this.status == CampCardStatus.UNASSIGNED &&
               this.expiresAt != null &&
               this.expiresAt.isAfter(LocalDateTime.now());
    }

    /**
     * Check if this card can be used for replenishment
     */
    public boolean canBeUsedForReplenishment() {
        return this.status == CampCardStatus.UNASSIGNED &&
               this.expiresAt != null &&
               this.expiresAt.isAfter(LocalDateTime.now());
    }

    /**
     * Record an offer redemption against this card
     */
    public void recordRedemption(int savingsCents) {
        this.offersUsed = (this.offersUsed != null ? this.offersUsed : 0) + 1;
        this.totalSavingsCents = (this.totalSavingsCents != null ? this.totalSavingsCents : 0) + savingsCents;
    }
}

package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks parental consent for minor users (COPPA compliance).
 * Each minor user has one ParentalConsent record that tracks
 * the consent workflow and parent permissions.
 */
@Data
@Entity
@Table(name = "parental_consents")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentalConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "minor_user_id", nullable = false, unique = true)
    private UUID minorUserId;

    @Column(name = "parent_user_id")
    private UUID parentUserId;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_phone", length = 20)
    private String parentPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_status", nullable = false, length = 20)
    @Builder.Default
    private ConsentStatus consentStatus = ConsentStatus.PENDING;

    @Column(name = "location_consent")
    @Builder.Default
    private Boolean locationConsent = false;

    @Column(name = "marketing_consent")
    @Builder.Default
    private Boolean marketingConsent = false;

    @Column(name = "data_collection_consent")
    @Builder.Default
    private Boolean dataCollectionConsent = false;

    @Column(name = "verification_token", unique = true)
    private String verificationToken;

    @Column(name = "verification_expires_at")
    private LocalDateTime verificationExpiresAt;

    @Column(name = "consent_granted_at")
    private LocalDateTime consentGrantedAt;

    @Column(name = "consent_ip_address", length = 45)
    private String consentIpAddress;

    @Column(name = "consent_user_agent", columnDefinition = "TEXT")
    private String consentUserAgent;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Consent status values for COPPA compliance tracking
     */
    public enum ConsentStatus {
        /**
         * User is 18+ or role doesn't require consent
         */
        NOT_REQUIRED,

        /**
         * Consent requested, awaiting parent response
         */
        PENDING,

        /**
         * Parent approved, full access granted
         */
        GRANTED,

        /**
         * Parent denied consent, access restricted
         */
        DENIED,

        /**
         * Parent revoked previously granted consent
         */
        REVOKED
    }

    /**
     * Check if the verification token is still valid
     */
    public boolean isVerificationTokenValid() {
        return verificationToken != null
            && verificationExpiresAt != null
            && LocalDateTime.now().isBefore(verificationExpiresAt);
    }

    /**
     * Check if consent is currently granted
     */
    public boolean isConsentGranted() {
        return consentStatus == ConsentStatus.GRANTED && revokedAt == null;
    }

    /**
     * Check if location access is allowed
     */
    public boolean isLocationAllowed() {
        return isConsentGranted() && Boolean.TRUE.equals(locationConsent);
    }
}

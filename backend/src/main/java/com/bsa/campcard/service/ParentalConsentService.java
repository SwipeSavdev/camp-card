package com.bsa.campcard.service;

import com.bsa.campcard.entity.ParentalConsent;
import com.bsa.campcard.entity.ParentalConsent.ConsentStatus;
import com.bsa.campcard.repository.ParentalConsentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing parental consent for minor users (COPPA compliance).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ParentalConsentService {

    private final ParentalConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int TOKEN_LENGTH = 32;
    private static final int TOKEN_EXPIRY_DAYS = 7;

    /**
     * Create a parental consent request for a minor user.
     * Generates verification token and sends email to parent.
     */
    @Transactional
    public ParentalConsent createConsentRequest(
            UUID minorUserId,
            String parentEmail,
            String parentName,
            String parentPhone
    ) {
        log.info("Creating parental consent request for minor user: {}", minorUserId);

        // Check if consent record already exists
        Optional<ParentalConsent> existing = consentRepository.findByMinorUserId(minorUserId);
        if (existing.isPresent()) {
            ParentalConsent consent = existing.get();
            // If pending, update parent info and resend
            if (consent.getConsentStatus() == ConsentStatus.PENDING) {
                consent.setParentEmail(parentEmail);
                consent.setParentName(parentName);
                consent.setParentPhone(parentPhone);
                consent.setVerificationToken(generateToken());
                consent.setVerificationExpiresAt(LocalDateTime.now().plusDays(TOKEN_EXPIRY_DAYS));
                consent = consentRepository.save(consent);
                sendConsentRequestEmail(consent, minorUserId);
                return consent;
            }
            // Return existing record
            return consent;
        }

        // Create new consent request
        ParentalConsent consent = ParentalConsent.builder()
                .minorUserId(minorUserId)
                .parentEmail(parentEmail)
                .parentName(parentName)
                .parentPhone(parentPhone)
                .consentStatus(ConsentStatus.PENDING)
                .verificationToken(generateToken())
                .verificationExpiresAt(LocalDateTime.now().plusDays(TOKEN_EXPIRY_DAYS))
                .build();

        consent = consentRepository.save(consent);
        log.info("Created parental consent record with ID: {}", consent.getId());

        // Send consent request email
        sendConsentRequestEmail(consent, minorUserId);

        return consent;
    }

    /**
     * Resend consent request email to parent.
     */
    @Transactional
    public ParentalConsent resendConsentRequest(UUID minorUserId) {
        ParentalConsent consent = consentRepository.findByMinorUserId(minorUserId)
                .orElseThrow(() -> new IllegalArgumentException("No consent record found for user: " + minorUserId));

        if (consent.getConsentStatus() != ConsentStatus.PENDING) {
            throw new IllegalStateException("Cannot resend consent request - status is: " + consent.getConsentStatus());
        }

        // Generate new token
        consent.setVerificationToken(generateToken());
        consent.setVerificationExpiresAt(LocalDateTime.now().plusDays(TOKEN_EXPIRY_DAYS));
        consent = consentRepository.save(consent);

        sendConsentRequestEmail(consent, minorUserId);

        return consent;
    }

    /**
     * Update parent email and resend consent request.
     */
    @Transactional
    public ParentalConsent updateParentAndResend(UUID minorUserId, String newParentEmail, String newParentName) {
        ParentalConsent consent = consentRepository.findByMinorUserId(minorUserId)
                .orElseThrow(() -> new IllegalArgumentException("No consent record found for user: " + minorUserId));

        if (consent.getConsentStatus() != ConsentStatus.PENDING) {
            throw new IllegalStateException("Cannot update parent - consent already processed");
        }

        consent.setParentEmail(newParentEmail);
        consent.setParentName(newParentName);
        consent.setVerificationToken(generateToken());
        consent.setVerificationExpiresAt(LocalDateTime.now().plusDays(TOKEN_EXPIRY_DAYS));
        consent = consentRepository.save(consent);

        sendConsentRequestEmail(consent, minorUserId);

        return consent;
    }

    /**
     * Get consent verification details by token.
     */
    public Optional<ConsentVerificationDetails> getConsentVerificationDetails(String token) {
        return consentRepository.findByVerificationToken(token)
                .map(consent -> {
                    User minor = userRepository.findById(consent.getMinorUserId())
                            .orElse(null);

                    return new ConsentVerificationDetails(
                            consent.getId(),
                            consent.getMinorUserId(),
                            minor != null ? minor.getFullName() : "Unknown",
                            minor != null ? minor.getDateOfBirth() : null,
                            consent.getParentName(),
                            consent.getConsentStatus(),
                            consent.isVerificationTokenValid()
                    );
                });
    }

    /**
     * Process parent's consent decision.
     */
    @Transactional
    public ParentalConsent processConsentDecision(
            String token,
            boolean granted,
            boolean locationConsent,
            boolean marketingConsent,
            String ipAddress,
            String userAgent
    ) {
        ParentalConsent consent = consentRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (!consent.isVerificationTokenValid()) {
            throw new IllegalStateException("Verification token has expired");
        }

        if (consent.getConsentStatus() != ConsentStatus.PENDING) {
            throw new IllegalStateException("Consent has already been processed");
        }

        consent.setConsentStatus(granted ? ConsentStatus.GRANTED : ConsentStatus.DENIED);
        consent.setLocationConsent(granted && locationConsent);
        consent.setMarketingConsent(granted && marketingConsent);
        consent.setDataCollectionConsent(granted);
        consent.setConsentGrantedAt(granted ? LocalDateTime.now() : null);
        consent.setConsentIpAddress(ipAddress);
        consent.setConsentUserAgent(userAgent);

        // Clear verification token after use
        consent.setVerificationToken(null);
        consent.setVerificationExpiresAt(null);

        consent = consentRepository.save(consent);
        log.info("Consent {} for minor user: {}", granted ? "GRANTED" : "DENIED", consent.getMinorUserId());

        // Update user's consent status (when columns are added to DB)
        // updateUserConsentStatus(consent);

        // Send notification to scout
        sendConsentDecisionEmail(consent);

        return consent;
    }

    /**
     * Revoke previously granted consent.
     */
    @Transactional
    public ParentalConsent revokeConsent(UUID minorUserId, String reason) {
        ParentalConsent consent = consentRepository.findByMinorUserId(minorUserId)
                .orElseThrow(() -> new IllegalArgumentException("No consent record found for user: " + minorUserId));

        if (consent.getConsentStatus() != ConsentStatus.GRANTED) {
            throw new IllegalStateException("Cannot revoke - consent was not granted");
        }

        consent.setConsentStatus(ConsentStatus.REVOKED);
        consent.setRevokedAt(LocalDateTime.now());
        consent.setRevocationReason(reason);
        consent.setLocationConsent(false);

        consent = consentRepository.save(consent);
        log.info("Consent REVOKED for minor user: {}", minorUserId);

        return consent;
    }

    /**
     * Update location consent toggle (parent can enable/disable location access).
     */
    @Transactional
    public ParentalConsent updateLocationConsent(UUID minorUserId, boolean locationEnabled) {
        ParentalConsent consent = consentRepository.findByMinorUserId(minorUserId)
                .orElseThrow(() -> new IllegalArgumentException("No consent record found for user: " + minorUserId));

        if (consent.getConsentStatus() != ConsentStatus.GRANTED) {
            throw new IllegalStateException("Cannot update location - consent not granted");
        }

        consent.setLocationConsent(locationEnabled);
        consent = consentRepository.save(consent);
        log.info("Location consent {} for minor user: {}", locationEnabled ? "ENABLED" : "DISABLED", minorUserId);

        return consent;
    }

    /**
     * Get consent status for a user.
     */
    public Optional<ParentalConsent> getConsentForUser(UUID userId) {
        return consentRepository.findByMinorUserId(userId);
    }

    /**
     * Check if a user has location consent.
     */
    public boolean hasLocationConsent(UUID userId) {
        return consentRepository.hasLocationConsent(userId);
    }

    /**
     * Check if a user has granted consent.
     */
    public boolean hasGrantedConsent(UUID userId) {
        return consentRepository.hasGrantedConsent(userId);
    }

    // ========================================================================
    // Private helper methods
    // ========================================================================

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendConsentRequestEmail(ParentalConsent consent, UUID minorUserId) {
        User minor = userRepository.findById(minorUserId).orElse(null);
        if (minor == null) {
            log.error("Cannot send consent email - minor user not found: {}", minorUserId);
            return;
        }

        emailService.sendParentalConsentRequestEmail(
                consent.getParentEmail(),
                consent.getParentName(),
                minor.getFullName(),
                minor.getDateOfBirth(),
                consent.getVerificationToken()
        );
    }

    private void sendConsentDecisionEmail(ParentalConsent consent) {
        User minor = userRepository.findById(consent.getMinorUserId()).orElse(null);
        if (minor == null) {
            log.error("Cannot send decision email - minor user not found: {}", consent.getMinorUserId());
            return;
        }

        if (consent.getConsentStatus() == ConsentStatus.GRANTED) {
            emailService.sendConsentGrantedEmail(
                    minor.getEmail(),
                    minor.getFirstName(),
                    consent.isLocationAllowed()
            );
        } else {
            emailService.sendConsentDeniedEmail(
                    minor.getEmail(),
                    minor.getFirstName()
            );
        }
    }

    /**
     * DTO for consent verification page data
     */
    public record ConsentVerificationDetails(
            UUID consentId,
            UUID minorUserId,
            String minorName,
            java.time.LocalDate minorDateOfBirth,
            String parentName,
            ConsentStatus status,
            boolean tokenValid
    ) {}
}

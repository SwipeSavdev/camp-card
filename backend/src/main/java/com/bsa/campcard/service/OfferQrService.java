package com.bsa.campcard.service;

import com.bsa.campcard.dto.offer.QrCodeData;
import com.bsa.campcard.dto.offer.QrScanRequest;
import com.bsa.campcard.dto.offer.QrScanResponse;
import com.bsa.campcard.dto.offer.QrValidationResult;
import com.bsa.campcard.entity.Offer;
import com.bsa.campcard.entity.OfferRedemption;
import com.bsa.campcard.entity.OfferScanAttempt;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.OfferRedemptionRepository;
import com.bsa.campcard.repository.OfferRepository;
import com.bsa.campcard.repository.OfferScanAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Service for generating and validating QR codes for one-time offers.
 * Implements anti-abuse detection to prevent screenshot sharing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OfferQrService {

    private final OfferRepository offerRepository;
    private final OfferRedemptionRepository offerRedemptionRepository;
    private final OfferScanAttemptRepository scanAttemptRepository;
    private final UserRepository userRepository;

    @Value("${campcard.qr.secret-key:campcard-qr-secret-key-2026}")
    private String secretKey;

    @Value("${campcard.qr.token-expiry-hours:24}")
    private int tokenExpiryHours;

    // Abuse detection thresholds
    private static final int MAX_SCANS_BEFORE_FLAG = 2;
    private static final int MAX_DIFFERENT_DEVICES = 1;
    private static final double MAX_DISTANCE_KM_PER_MINUTE = 2.0; // ~120 km/h max speed
    private static final int ABUSE_FLAG_THRESHOLD = 3; // Auto-suspend after this many flags

    /**
     * Generate a unique QR code data payload for a user to redeem an offer.
     * The QR code contains an HMAC-signed token that cannot be forged.
     */
    @Transactional
    public QrCodeData generateQrCode(Long offerId, UUID userId) {
        log.info("Generating QR code for offer {} and user {}", offerId, userId);

        // Validate offer exists and is active
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (!offer.isValid()) {
            throw new IllegalStateException("Offer is not currently valid for redemption");
        }

        // Check if user has reached their limit for this offer
        long userRedemptions = offerRedemptionRepository.countUserRedemptions(userId, offerId);
        if (offer.getUsageLimitPerUser() != null && userRedemptions >= offer.getUsageLimitPerUser()) {
            throw new IllegalStateException("You have already redeemed this offer the maximum number of times");
        }

        // Check if user is flagged for abuse
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getAbuseFlagCount() != null && user.getAbuseFlagCount() >= ABUSE_FLAG_THRESHOLD) {
            throw new IllegalStateException("Account suspended due to suspicious activity. Please contact support.");
        }

        // Generate unique token
        long expirationTime = LocalDateTime.now()
                .plusHours(tokenExpiryHours)
                .toEpochSecond(ZoneOffset.UTC);

        String tokenData = String.format("%d:%s:%d", offerId, userId, expirationTime);
        String signature = generateHmacSignature(tokenData);
        String redemptionToken = Base64.getUrlEncoder().encodeToString(
                (tokenData + ":" + signature).getBytes(StandardCharsets.UTF_8)
        );

        // Build QR code data
        QrCodeData qrData = QrCodeData.builder()
                .token(redemptionToken)
                .offerId(offerId)
                .userId(userId.toString())
                .offerTitle(offer.getTitle())
                .discountType(offer.getDiscountType().name())
                .discountValue(offer.getDiscountValue())
                .expiresAt(LocalDateTime.now().plusHours(tokenExpiryHours))
                .build();

        log.info("QR code generated for offer {} user {}, expires at {}",
                offerId, userId, qrData.getExpiresAt());

        return qrData;
    }

    /**
     * Validate and process a QR code scan from a merchant.
     * Tracks the scan attempt and detects potential abuse.
     */
    @Transactional
    public QrScanResponse processScan(QrScanRequest request) {
        log.info("Processing QR scan for token: {}...",
                request.getToken().substring(0, Math.min(20, request.getToken().length())));

        // Parse and validate token
        QrValidationResult validation = validateToken(request.getToken());

        // Create scan attempt record
        OfferScanAttempt scanAttempt = OfferScanAttempt.builder()
                .offerId(validation.getOfferId())
                .userId(validation.getUserId())
                .redemptionToken(request.getToken())
                .scannedAt(LocalDateTime.now())
                .deviceFingerprint(request.getDeviceFingerprint())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        // Check for abuse patterns
        AbuseCheckResult abuseCheck = checkForAbuse(request.getToken(), request, validation);

        if (!validation.isValid()) {
            scanAttempt.markFailed(
                    OfferScanAttempt.ScanResult.valueOf(validation.getFailureReason()),
                    validation.getErrorMessage()
            );
            scanAttemptRepository.save(scanAttempt);

            return QrScanResponse.builder()
                    .success(false)
                    .errorCode(validation.getFailureReason())
                    .errorMessage(validation.getErrorMessage())
                    .build();
        }

        if (abuseCheck.isAbusive()) {
            scanAttempt.flagSuspicious(abuseCheck.reason());
            scanAttemptRepository.save(scanAttempt);

            // Increment user's abuse flag count
            flagUserForAbuse(validation.getUserId(), abuseCheck.reason());

            return QrScanResponse.builder()
                    .success(false)
                    .errorCode("FLAGGED")
                    .errorMessage("This QR code has been flagged for suspicious activity")
                    .flaggedForAbuse(true)
                    .abuseReason(abuseCheck.reason())
                    .build();
        }

        // Process the redemption
        try {
            OfferRedemption redemption = processRedemption(validation, request);
            scanAttempt.markSuccess(redemption.getId());
            scanAttemptRepository.save(scanAttempt);

            // Update redemption with scan tracking
            redemption.setScanCount(redemption.getScanCount() != null ? redemption.getScanCount() + 1 : 1);
            redemption.setLastScannedAt(LocalDateTime.now());
            redemption.setLastScanDeviceFingerprint(request.getDeviceFingerprint());
            offerRedemptionRepository.save(redemption);

            Offer offer = offerRepository.findById(validation.getOfferId())
                    .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

            return QrScanResponse.builder()
                    .success(true)
                    .redemptionId(redemption.getUuid().toString())
                    .verificationCode(redemption.getVerificationCode())
                    .offerTitle(offer.getTitle())
                    .discountType(offer.getDiscountType().name())
                    .discountValue(offer.getDiscountValue())
                    .discountAmount(redemption.getDiscountAmount())
                    .message("Offer successfully redeemed!")
                    .build();

        } catch (IllegalStateException e) {
            scanAttempt.markFailed(OfferScanAttempt.ScanResult.ALREADY_REDEEMED, e.getMessage());
            scanAttemptRepository.save(scanAttempt);

            return QrScanResponse.builder()
                    .success(false)
                    .errorCode("ALREADY_REDEEMED")
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Validate the HMAC-signed token
     */
    private QrValidationResult validateToken(String token) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");

            if (parts.length != 4) {
                return QrValidationResult.invalid("INVALID", "Invalid token format");
            }

            Long offerId = Long.parseLong(parts[0]);
            UUID userId = UUID.fromString(parts[1]);
            long expirationTime = Long.parseLong(parts[2]);
            String providedSignature = parts[3];

            // Verify signature
            String tokenData = String.format("%d:%s:%d", offerId, userId, expirationTime);
            String expectedSignature = generateHmacSignature(tokenData);

            if (!providedSignature.equals(expectedSignature)) {
                log.warn("Invalid signature for token, possible tampering attempt");
                return QrValidationResult.invalid("INVALID", "Token signature verification failed");
            }

            // Check expiration
            if (LocalDateTime.now().toEpochSecond(ZoneOffset.UTC) > expirationTime) {
                return QrValidationResult.invalid("EXPIRED", "This QR code has expired");
            }

            // Validate offer still exists and is active
            Offer offer = offerRepository.findById(offerId).orElse(null);
            if (offer == null) {
                return QrValidationResult.invalid("INVALID", "Offer no longer exists");
            }
            if (!offer.isValid()) {
                return QrValidationResult.invalid("EXPIRED", "This offer is no longer valid");
            }

            return QrValidationResult.valid(offerId, userId);

        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse token: {}", e.getMessage());
            return QrValidationResult.invalid("INVALID", "Invalid token format");
        }
    }

    /**
     * Check for abuse patterns in scan attempts
     */
    private AbuseCheckResult checkForAbuse(String token, QrScanRequest request, QrValidationResult validation) {
        if (!validation.isValid()) {
            return AbuseCheckResult.ok();
        }

        // Check 1: Multiple scans of the same token
        long scanCount = scanAttemptRepository.countByRedemptionToken(token);
        if (scanCount >= MAX_SCANS_BEFORE_FLAG) {
            return AbuseCheckResult.abusive(
                    String.format("QR code scanned %d times (limit: %d). Possible screenshot sharing detected.",
                            scanCount + 1, MAX_SCANS_BEFORE_FLAG)
            );
        }

        // Check 2: Scans from different devices
        if (request.getDeviceFingerprint() != null) {
            boolean differentDevice = scanAttemptRepository.hasScansFromDifferentDevice(
                    token, request.getDeviceFingerprint()
            );
            if (differentDevice) {
                return AbuseCheckResult.abusive(
                        "QR code scanned from multiple devices. Possible screenshot sharing detected."
                );
            }
        }

        // Check 3: Impossible travel (geographic anomaly)
        if (request.getLatitude() != null && request.getLongitude() != null) {
            List<OfferScanAttempt> recentScans = scanAttemptRepository.findScansWithLocationForToken(
                    token, LocalDateTime.now().minusHours(1)
            );

            for (OfferScanAttempt prevScan : recentScans) {
                if (prevScan.getLatitude() != null && prevScan.getLongitude() != null) {
                    double distance = calculateDistanceKm(
                            prevScan.getLatitude().doubleValue(),
                            prevScan.getLongitude().doubleValue(),
                            request.getLatitude().doubleValue(),
                            request.getLongitude().doubleValue()
                    );

                    long minutesBetween = java.time.Duration.between(
                            prevScan.getScannedAt(), LocalDateTime.now()
                    ).toMinutes();

                    if (minutesBetween > 0) {
                        double speedKmPerMinute = distance / minutesBetween;
                        if (speedKmPerMinute > MAX_DISTANCE_KM_PER_MINUTE) {
                            return AbuseCheckResult.abusive(
                                    String.format("Impossible travel detected: %.1f km in %d minutes",
                                            distance, minutesBetween)
                            );
                        }
                    }
                }
            }
        }

        // Check 4: User has history of suspicious activity
        long suspiciousCount = scanAttemptRepository.countByUserIdAndIsSuspiciousTrue(validation.getUserId());
        if (suspiciousCount >= 3) {
            return AbuseCheckResult.abusive(
                    "User has multiple prior suspicious scan attempts"
            );
        }

        return AbuseCheckResult.ok();
    }

    /**
     * Flag a user for abusive behavior
     */
    @Transactional
    public void flagUserForAbuse(UUID userId, String reason) {
        log.warn("Flagging user {} for abuse: {}", userId, reason);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int newFlagCount = (user.getAbuseFlagCount() != null ? user.getAbuseFlagCount() : 0) + 1;
        user.setAbuseFlagCount(newFlagCount);
        user.setAbuseFlaggedAt(LocalDateTime.now());
        user.setAbuseFlagReason(reason);

        userRepository.save(user);

        if (newFlagCount >= ABUSE_FLAG_THRESHOLD) {
            log.error("User {} has reached abuse threshold ({} flags). Account should be reviewed.",
                    userId, newFlagCount);
        }
    }

    /**
     * Process the actual redemption after validation passes
     */
    private OfferRedemption processRedemption(QrValidationResult validation, QrScanRequest request) {
        // Check if already redeemed
        long userRedemptions = offerRedemptionRepository.countUserRedemptions(
                validation.getUserId(), validation.getOfferId()
        );

        Offer offer = offerRepository.findById(validation.getOfferId())
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (offer.getUsageLimitPerUser() != null && userRedemptions >= offer.getUsageLimitPerUser()) {
            throw new IllegalStateException("You have already redeemed this offer");
        }

        // Calculate discount
        BigDecimal purchaseAmount = request.getPurchaseAmount() != null ?
                request.getPurchaseAmount() : BigDecimal.ZERO;
        BigDecimal discountAmount = offer.calculateDiscount(purchaseAmount);

        // Create redemption record
        OfferRedemption redemption = OfferRedemption.builder()
                .offerId(offer.getId())
                .userId(validation.getUserId())
                .merchantId(offer.getMerchantId())
                .merchantLocationId(request.getMerchantLocationId())
                .purchaseAmount(purchaseAmount)
                .discountAmount(discountAmount)
                .finalAmount(purchaseAmount.subtract(discountAmount))
                .verificationCode(generateVerificationCode())
                .status(OfferRedemption.RedemptionStatus.VERIFIED)
                .redeemedAt(LocalDateTime.now())
                .verifiedAt(LocalDateTime.now())
                .redemptionToken(request.getToken())
                .tokenExpiresAt(LocalDateTime.now().plusHours(tokenExpiryHours))
                .scanCount(1)
                .lastScannedAt(LocalDateTime.now())
                .lastScanDeviceFingerprint(request.getDeviceFingerprint())
                .build();

        redemption = offerRedemptionRepository.save(redemption);

        // Update offer redemption count
        offer.setTotalRedemptions(offer.getTotalRedemptions() + 1);
        offerRepository.save(offer);

        log.info("Redemption created: {} for offer {} by user {}",
                redemption.getVerificationCode(), offer.getId(), validation.getUserId());

        return redemption;
    }

    /**
     * Generate HMAC-SHA256 signature
     */
    private String generateHmacSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate HMAC signature", e);
        }
    }

    /**
     * Generate 8-character verification code
     */
    private String generateVerificationCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth's radius in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Inner classes for results
    private record AbuseCheckResult(boolean isAbusive, String reason) {
        static AbuseCheckResult ok() {
            return new AbuseCheckResult(false, null);
        }

        static AbuseCheckResult abusive(String reason) {
            return new AbuseCheckResult(true, reason);
        }
    }
}

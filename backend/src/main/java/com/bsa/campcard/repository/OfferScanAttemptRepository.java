package com.bsa.campcard.repository;

import com.bsa.campcard.entity.OfferScanAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferScanAttemptRepository extends JpaRepository<OfferScanAttempt, Long> {

    Optional<OfferScanAttempt> findByUuid(UUID uuid);

    /**
     * Find all scan attempts for a specific redemption token
     */
    List<OfferScanAttempt> findByRedemptionTokenOrderByScannedAtDesc(String redemptionToken);

    /**
     * Count scans for a specific token
     */
    long countByRedemptionToken(String redemptionToken);

    /**
     * Find scan attempts by user
     */
    Page<OfferScanAttempt> findByUserIdOrderByScannedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find scan attempts for an offer
     */
    Page<OfferScanAttempt> findByOfferIdOrderByScannedAtDesc(Long offerId, Pageable pageable);

    /**
     * Find suspicious scan attempts
     */
    Page<OfferScanAttempt> findByIsSuspiciousTrueOrderByScannedAtDesc(Pageable pageable);

    /**
     * Count scans from different devices for the same token
     */
    @Query("SELECT COUNT(DISTINCT s.deviceFingerprint) FROM OfferScanAttempt s " +
           "WHERE s.redemptionToken = :token AND s.deviceFingerprint IS NOT NULL")
    long countDistinctDevicesForToken(@Param("token") String token);

    /**
     * Count scans from different IPs for the same token
     */
    @Query("SELECT COUNT(DISTINCT s.ipAddress) FROM OfferScanAttempt s " +
           "WHERE s.redemptionToken = :token AND s.ipAddress IS NOT NULL")
    long countDistinctIpsForToken(@Param("token") String token);

    /**
     * Find recent scans for a token within a time window
     */
    @Query("SELECT s FROM OfferScanAttempt s WHERE s.redemptionToken = :token " +
           "AND s.scannedAt >= :since ORDER BY s.scannedAt DESC")
    List<OfferScanAttempt> findRecentScansForToken(
        @Param("token") String token,
        @Param("since") LocalDateTime since
    );

    /**
     * Check if token was scanned from a different device
     */
    @Query("SELECT COUNT(s) > 0 FROM OfferScanAttempt s " +
           "WHERE s.redemptionToken = :token " +
           "AND s.deviceFingerprint IS NOT NULL " +
           "AND s.deviceFingerprint != :currentDeviceFingerprint")
    boolean hasScansFromDifferentDevice(
        @Param("token") String token,
        @Param("currentDeviceFingerprint") String currentDeviceFingerprint
    );

    /**
     * Find all scans by a user for a specific offer
     */
    List<OfferScanAttempt> findByUserIdAndOfferIdOrderByScannedAtDesc(UUID userId, Long offerId);

    /**
     * Count suspicious scans for a user
     */
    long countByUserIdAndIsSuspiciousTrue(UUID userId);

    /**
     * Find scans within geographic proximity to detect impossible travel
     */
    @Query("SELECT s FROM OfferScanAttempt s WHERE s.redemptionToken = :token " +
           "AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL " +
           "AND s.scannedAt >= :since ORDER BY s.scannedAt DESC")
    List<OfferScanAttempt> findScansWithLocationForToken(
        @Param("token") String token,
        @Param("since") LocalDateTime since
    );

    /**
     * Get scan statistics for a user
     */
    @Query("SELECT COUNT(s), SUM(CASE WHEN s.isSuspicious = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN s.wasSuccessful = true THEN 1 ELSE 0 END) " +
           "FROM OfferScanAttempt s WHERE s.userId = :userId")
    Object[] getUserScanStatistics(@Param("userId") UUID userId);

    /**
     * Find all flagged scans within a date range (for admin review)
     */
    @Query("SELECT s FROM OfferScanAttempt s WHERE s.isSuspicious = true " +
           "AND s.scannedAt BETWEEN :startDate AND :endDate ORDER BY s.scannedAt DESC")
    Page<OfferScanAttempt> findSuspiciousScansInRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    // ==================== Merchant Abuse Detection Queries ====================

    /**
     * Count scans by a merchant within a time window (velocity check)
     */
    @Query("SELECT COUNT(s) FROM OfferScanAttempt s " +
           "WHERE s.merchantId = :merchantId AND s.scannedAt >= :since")
    long countMerchantScansInWindow(
        @Param("merchantId") Long merchantId,
        @Param("since") LocalDateTime since
    );

    /**
     * Count how many times a merchant scanned the same user's QR codes
     */
    @Query("SELECT COUNT(s) FROM OfferScanAttempt s " +
           "WHERE s.merchantId = :merchantId AND s.userId = :userId")
    long countMerchantScansForUser(
        @Param("merchantId") Long merchantId,
        @Param("userId") UUID userId
    );

    /**
     * Count distinct users scanned by a merchant in a time window
     */
    @Query("SELECT COUNT(DISTINCT s.userId) FROM OfferScanAttempt s " +
           "WHERE s.merchantId = :merchantId AND s.scannedAt >= :since")
    long countDistinctUsersScannedByMerchant(
        @Param("merchantId") Long merchantId,
        @Param("since") LocalDateTime since
    );

    /**
     * Find suspicious scans by a merchant
     */
    Page<OfferScanAttempt> findByMerchantIdAndIsSuspiciousTrueOrderByScannedAtDesc(
        Long merchantId, Pageable pageable
    );

    /**
     * Count suspicious scans by a merchant
     */
    long countByMerchantIdAndIsSuspiciousTrue(Long merchantId);

    /**
     * Find all scans by a merchant
     */
    Page<OfferScanAttempt> findByMerchantIdOrderByScannedAtDesc(Long merchantId, Pageable pageable);
}

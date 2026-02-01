package com.bsa.campcard.repository;

import com.bsa.campcard.entity.OfferRedemption;
import com.bsa.campcard.entity.OfferRedemption.RedemptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRedemptionRepository extends JpaRepository<OfferRedemption, Long> {

    Optional<OfferRedemption> findByUuid(UUID uuid);

    Optional<OfferRedemption> findByVerificationCode(String verificationCode);

    Page<OfferRedemption> findByUserId(UUID userId, Pageable pageable);

    Page<OfferRedemption> findByOfferId(Long offerId, Pageable pageable);

    Page<OfferRedemption> findByMerchantId(Long merchantId, Pageable pageable);

    // Availability check: only count active (non-replenished) redemptions
    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.offerId = :offerId AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED')")
    int countUserRedemptions(@Param("userId") UUID userId,
                            @Param("offerId") Long offerId);

    // History: show all redemptions including replenished for lifetime view
    @Query("SELECT r FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED', 'REPLENISHED') " +
           "ORDER BY r.createdAt DESC")
    Page<OfferRedemption> findUserRedemptionHistory(@Param("userId") UUID userId,
                                                    Pageable pageable);

    @Query("SELECT r FROM OfferRedemption r WHERE r.merchantId = :merchantId " +
           "AND r.createdAt BETWEEN :startDate AND :endDate " +
           "AND r.status = 'COMPLETED'")
    List<OfferRedemption> findMerchantRedemptionsByDateRange(@Param("merchantId") Long merchantId,
                                                             @Param("startDate") LocalDateTime startDate,
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.offerId = :offerId " +
           "AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED')")
    long countOfferRedemptions(@Param("offerId") Long offerId);

    @Query("SELECT SUM(r.discountAmount) FROM OfferRedemption r " +
           "WHERE r.merchantId = :merchantId AND r.status = 'COMPLETED'")
    Double sumDiscountByMerchant(@Param("merchantId") Long merchantId);

    List<OfferRedemption> findByStatusAndCreatedAtBefore(RedemptionStatus status,
                                                         LocalDateTime dateTime);

    // Availability check: only count active (non-replenished) redemptions per offer
    @Query("SELECT r.offerId, COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.offerId IN :offerIds AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED') " +
           "GROUP BY r.offerId")
    List<Object[]> countUserRedemptionsByOfferIds(@Param("userId") UUID userId,
                                                   @Param("offerIds") List<Long> offerIds);

    // Lifetime analytics: count all redemptions including replenished
    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED', 'REPLENISHED')")
    long countCompletedByUserId(@Param("userId") UUID userId);

    // Lifetime analytics: sum all savings including replenished
    @Query("SELECT COALESCE(SUM(r.discountAmount), 0) FROM OfferRedemption r " +
           "WHERE r.userId = :userId AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED', 'REPLENISHED')")
    java.math.BigDecimal sumSavingsByUserId(@Param("userId") UUID userId);

    // Lifetime analytics: count this month including replenished
    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED', 'REPLENISHED') " +
           "AND r.createdAt >= :since")
    long countCompletedByUserIdSince(@Param("userId") UUID userId,
                                      @Param("since") LocalDateTime since);

    /**
     * Find all redemptions for a user that can be replenished (one-time offers)
     */
    List<OfferRedemption> findByUserId(UUID userId);

    /**
     * Mark all active redemptions as REPLENISHED for a user (used for offer replenishment on renewal).
     * Replenished records still count toward lifetime analytics but no longer block one-time offer availability.
     */
    @Modifying
    @Query("UPDATE OfferRedemption r SET r.status = 'REPLENISHED' WHERE r.userId = :userId " +
           "AND r.status IN ('PENDING', 'VERIFIED', 'COMPLETED')")
    int replenishByUserId(@Param("userId") UUID userId);

    /**
     * Delete all redemptions for an offer (used when deleting an offer)
     */
    void deleteByOfferId(Long offerId);
}

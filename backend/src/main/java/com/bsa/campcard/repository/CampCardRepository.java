package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CampCard;
import com.bsa.campcard.entity.CampCard.CampCardStatus;
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
public interface CampCardRepository extends JpaRepository<CampCard, Long> {

    // Find by identifiers
    Optional<CampCard> findByUuid(UUID uuid);
    Optional<CampCard> findByCardNumber(String cardNumber);
    Optional<CampCard> findByGiftClaimToken(String token);

    // Find by ownership
    List<CampCard> findByOwnerUserId(UUID userId);
    List<CampCard> findByOwnerUserIdAndStatus(UUID userId, CampCardStatus status);
    Page<CampCard> findByOwnerUserId(UUID userId, Pageable pageable);

    List<CampCard> findByOriginalPurchaserId(UUID purchaserId);

    // Find by order
    List<CampCard> findByPurchaseOrderId(Long orderId);

    // Find by status
    Page<CampCard> findByStatus(CampCardStatus status, Pageable pageable);
    List<CampCard> findByStatusIn(List<CampCardStatus> statuses);

    // Active card for user (may have multiple - returns most recently activated)
    @Query("SELECT c FROM CampCard c WHERE c.ownerUserId = :userId AND c.status = 'ACTIVE' ORDER BY c.activatedAt DESC")
    List<CampCard> findActiveCardsByUserId(@Param("userId") UUID userId);

    // Convenience method - get first active card (for backwards compatibility)
    default Optional<CampCard> findActiveCardByUserId(UUID userId) {
        List<CampCard> activeCards = findActiveCardsByUserId(userId);
        return activeCards.isEmpty() ? Optional.empty() : Optional.of(activeCards.get(0));
    }

    // Unused cards (available for gift or replenishment)
    @Query("SELECT c FROM CampCard c WHERE c.ownerUserId = :userId AND c.status = 'UNASSIGNED' " +
           "AND c.expiresAt > :now ORDER BY c.createdAt ASC")
    List<CampCard> findUnusedCardsByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    // Gifted cards (pending claim)
    @Query("SELECT c FROM CampCard c WHERE c.ownerUserId = :userId AND c.status = 'GIFTED' " +
           "ORDER BY c.giftedAt DESC")
    List<CampCard> findGiftedCardsByUserId(@Param("userId") UUID userId);

    // Cards expiring within a date range (for notifications)
    @Query("SELECT c FROM CampCard c WHERE c.status IN ('ACTIVE', 'UNASSIGNED') " +
           "AND c.expiresAt BETWEEN :startDate AND :endDate")
    List<CampCard> findCardsExpiringBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Cards that have expired (for batch expiry job)
    @Query("SELECT c FROM CampCard c WHERE c.status IN ('ACTIVE', 'UNASSIGNED', 'GIFTED') " +
           "AND c.expiresAt < :now")
    List<CampCard> findExpiredCards(@Param("now") LocalDateTime now);

    // Unclaimed gifts older than a certain date
    @Query("SELECT c FROM CampCard c WHERE c.status = 'GIFTED' AND c.giftedAt < :cutoffDate")
    List<CampCard> findUnclaimedGiftsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Scout attribution queries
    List<CampCard> findByScoutAttributionId(UUID scoutId);

    @Query("SELECT COUNT(c) FROM CampCard c WHERE c.scoutAttributionId = :scoutId " +
           "AND c.status IN ('ACTIVE', 'REPLACED', 'EXPIRED')")
    Long countSalesByScout(@Param("scoutId") UUID scoutId);

    // Statistics queries
    @Query("SELECT COUNT(c) FROM CampCard c WHERE c.ownerUserId = :userId")
    Long countCardsByUser(@Param("userId") UUID userId);

    @Query("SELECT COUNT(c) FROM CampCard c WHERE c.ownerUserId = :userId AND c.status = :status")
    Long countCardsByUserAndStatus(@Param("userId") UUID userId, @Param("status") CampCardStatus status);

    @Query("SELECT COALESCE(SUM(c.totalSavingsCents), 0) FROM CampCard c " +
           "WHERE c.ownerUserId = :userId AND c.status IN ('ACTIVE', 'REPLACED', 'EXPIRED')")
    Long getTotalSavingsByUser(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(c.offersUsed), 0) FROM CampCard c " +
           "WHERE c.ownerUserId = :userId AND c.status IN ('ACTIVE', 'REPLACED', 'EXPIRED')")
    Long getTotalOffersUsedByUser(@Param("userId") UUID userId);

    // Check existence
    boolean existsByCardNumber(String cardNumber);
    boolean existsByGiftClaimToken(String token);

    // Admin queries
    @Query("SELECT c FROM CampCard c WHERE c.status = :status ORDER BY c.createdAt DESC")
    Page<CampCard> findAllByStatusOrderByCreatedAtDesc(
        @Param("status") CampCardStatus status,
        Pageable pageable
    );

    @Query("SELECT c FROM CampCard c ORDER BY c.createdAt DESC")
    Page<CampCard> findAllOrderByCreatedAtDesc(Pageable pageable);

    // Cards with pending gifts that need reminders
    @Query("SELECT c FROM CampCard c WHERE c.status = 'GIFTED' " +
           "AND c.giftedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY c.giftedAt ASC")
    List<CampCard> findGiftedCardsBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Users with unused cards (for reminder notifications)
    @Query("SELECT DISTINCT c.ownerUserId FROM CampCard c WHERE c.status = 'UNASSIGNED' " +
           "AND c.expiresAt > :now")
    List<UUID> findUsersWithUnusedCards(@Param("now") LocalDateTime now);
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.OfferRedemption;
import com.bsa.campcard.entity.OfferRedemption.RedemptionStatus;
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
public interface OfferRedemptionRepository extends JpaRepository<OfferRedemption, Long> {
    
    Optional<OfferRedemption> findByUuid(UUID uuid);
    
    Optional<OfferRedemption> findByVerificationCode(String verificationCode);
    
    Page<OfferRedemption> findByUserId(UUID userId, Pageable pageable);
    
    Page<OfferRedemption> findByOfferId(Long offerId, Pageable pageable);
    
    Page<OfferRedemption> findByMerchantId(Long merchantId, Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.offerId = :offerId AND r.status IN ('VERIFIED', 'COMPLETED')")
    int countUserRedemptions(@Param("userId") UUID userId, 
                            @Param("offerId") Long offerId);
    
    @Query("SELECT r FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.status IN ('VERIFIED', 'COMPLETED') " +
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
           "AND r.status IN ('VERIFIED', 'COMPLETED')")
    long countOfferRedemptions(@Param("offerId") Long offerId);
    
    @Query("SELECT SUM(r.discountAmount) FROM OfferRedemption r " +
           "WHERE r.merchantId = :merchantId AND r.status = 'COMPLETED'")
    Double sumDiscountByMerchant(@Param("merchantId") Long merchantId);
    
    List<OfferRedemption> findByStatusAndCreatedAtBefore(RedemptionStatus status,
                                                         LocalDateTime dateTime);

    @Query("SELECT r.offerId, COUNT(r) FROM OfferRedemption r WHERE r.userId = :userId " +
           "AND r.offerId IN :offerIds AND r.status IN ('VERIFIED', 'COMPLETED') " +
           "GROUP BY r.offerId")
    List<Object[]> countUserRedemptionsByOfferIds(@Param("userId") UUID userId,
                                                   @Param("offerIds") List<Long> offerIds);
}

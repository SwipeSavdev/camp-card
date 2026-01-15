package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Offer;
import com.bsa.campcard.entity.Offer.OfferStatus;
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
public interface OfferRepository extends JpaRepository<Offer, Long> {
    
    Optional<Offer> findByUuid(UUID uuid);
    
    Page<Offer> findByMerchantId(Long merchantId, Pageable pageable);
    
    Page<Offer> findByCategory(String category, Pageable pageable);
    
    Page<Offer> findByStatus(OfferStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE o.status = :status " +
           "AND o.validFrom <= :now AND o.validUntil >= :now " +
           "AND (o.usageLimit IS NULL OR o.totalRedemptions < o.usageLimit)")
    Page<Offer> findActiveOffers(@Param("status") OfferStatus status, 
                                  @Param("now") LocalDateTime now,
                                  Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE o.merchantId = :merchantId " +
           "AND o.status = :status " +
           "AND o.validFrom <= :now AND o.validUntil >= :now " +
           "AND (o.usageLimit IS NULL OR o.totalRedemptions < o.usageLimit)")
    Page<Offer> findActiveMerchantOffers(@Param("merchantId") Long merchantId,
                                          @Param("status") OfferStatus status,
                                          @Param("now") LocalDateTime now,
                                          Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE o.featured = true " +
           "AND o.status = :status " +
           "AND o.validFrom <= :now AND o.validUntil >= :now " +
           "ORDER BY o.createdAt DESC")
    List<Offer> findFeaturedOffers(@Param("status") OfferStatus status,
                                    @Param("now") LocalDateTime now,
                                    Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE o.scoutExclusive = true " +
           "AND o.status = :status " +
           "AND o.validFrom <= :now AND o.validUntil >= :now " +
           "AND (o.usageLimit IS NULL OR o.totalRedemptions < o.usageLimit)")
    Page<Offer> findScoutExclusiveOffers(@Param("status") OfferStatus status,
                                          @Param("now") LocalDateTime now,
                                          Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE o.category = :category " +
           "AND o.status = :status " +
           "AND o.validFrom <= :now AND o.validUntil >= :now " +
           "AND (o.usageLimit IS NULL OR o.totalRedemptions < o.usageLimit)")
    Page<Offer> findActiveByCategoryAndStatus(@Param("category") String category,
                                               @Param("status") OfferStatus status,
                                               @Param("now") LocalDateTime now,
                                               Pageable pageable);
    
    @Query("SELECT o FROM Offer o WHERE " +
           "(LOWER(o.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND o.status = :status")
    Page<Offer> searchOffers(@Param("search") String search,
                             @Param("status") OfferStatus status,
                             Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Offer o WHERE o.merchantId = :merchantId AND o.status = :status")
    long countByMerchantIdAndStatus(@Param("merchantId") Long merchantId, 
                                    @Param("status") OfferStatus status);
    
    @Query("SELECT COUNT(o) FROM Offer o WHERE o.status = 'ACTIVE' " +
           "AND o.validUntil < :now")
    long countExpiredOffers(@Param("now") LocalDateTime now);
    
    List<Offer> findByStatusAndValidUntilBefore(OfferStatus status, LocalDateTime dateTime);

    Long countByStatus(OfferStatus status);
}

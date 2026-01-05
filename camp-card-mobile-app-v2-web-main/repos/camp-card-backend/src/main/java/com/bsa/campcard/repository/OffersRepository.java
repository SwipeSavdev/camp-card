package com.bsa.campcard.repository;

import com.bsa.campcard.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OffersRepository extends JpaRepository<Offer, Integer> {

 /**
 * Find all offers for a specific merchant
 */
 List<Offer> findByMerchantId(UUID merchantId);

 /**
 * Find all active offers
 */
 List<Offer> findByIsActive(Boolean isActive);

 /**
 * Find all offers in a specific category
 */
 List<Offer> findByCategoryId(Integer categoryId);

 /**
 * Find all offers for a merchant that are currently active
 */
 List<Offer> findByMerchantIdAndIsActive(UUID merchantId, Boolean isActive);

 /**
 * Find all offers in a category that are currently active
 */
 List<Offer> findByCategoryIdAndIsActive(Integer categoryId, Boolean isActive);

 /**
 * Find all featured offers
 */
 List<Offer> findByIsFeaturedTrueAndIsActive(Boolean isActive);

 /**
 * Find offers that are currently valid (between validFrom and validUntil)
 */
 @Query("SELECT o FROM Offer o WHERE o.isActive = true " +
 "AND CURRENT_TIMESTAMP BETWEEN o.validFrom AND o.validUntil")
 List<Offer> findCurrentlyValidOffers();

 /**
 * Find offers by merchant that are currently valid
 */
 @Query("SELECT o FROM Offer o WHERE o.merchantId = :merchantId " +
 "AND o.isActive = true " +
 "AND CURRENT_TIMESTAMP BETWEEN o.validFrom AND o.validUntil")
 List<Offer> findCurrentValidOffersByMerchant(@Param("merchantId") UUID merchantId);

 /**
 * Find offer by UUID
 */
 Optional<Offer> findByUuid(String uuid);

 /**
 * Count active offers for a merchant
 */
 long countByMerchantIdAndIsActive(UUID merchantId, Boolean isActive);

 /**
 * Count all active offers
 */
 long countByIsActive(Boolean isActive);
}

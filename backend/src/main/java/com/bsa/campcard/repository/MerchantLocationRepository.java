package com.bsa.campcard.repository;

import com.bsa.campcard.entity.MerchantLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantLocationRepository extends JpaRepository<MerchantLocation, Long> {
    
    Optional<MerchantLocation> findByUuid(UUID uuid);
    
    List<MerchantLocation> findByMerchantIdAndDeletedAtIsNull(Long merchantId);
    
    List<MerchantLocation> findByMerchantIdAndActiveAndDeletedAtIsNull(
        Long merchantId, 
        Boolean active
    );
    
    Optional<MerchantLocation> findByMerchantIdAndPrimaryLocationAndDeletedAtIsNull(
        Long merchantId, 
        Boolean primaryLocation
    );
    
    @Query("SELECT ml FROM MerchantLocation ml WHERE " +
           "ml.active = true AND " +
           "ml.deletedAt IS NULL AND " +
           "ml.latitude BETWEEN :minLat AND :maxLat AND " +
           "ml.longitude BETWEEN :minLon AND :maxLon")
    List<MerchantLocation> findWithinBounds(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLon") BigDecimal minLon,
        @Param("maxLon") BigDecimal maxLon
    );
    
    @Query(value = "SELECT * FROM merchant_locations " +
           "WHERE active = true " +
           "AND deleted_at IS NULL " +
           "AND latitude IS NOT NULL " +
           "AND longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) <= :radiusKm " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lon)) + sin(radians(:lat)) * " +
           "sin(radians(latitude))))", 
           nativeQuery = true)
    List<MerchantLocation> findNearby(
        @Param("lat") BigDecimal lat,
        @Param("lon") BigDecimal lon,
        @Param("radiusKm") Double radiusKm
    );
}

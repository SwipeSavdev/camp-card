package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Scout;
import com.bsa.campcard.entity.Scout.ScoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoutRepository extends JpaRepository<Scout, Long> {
    
    Optional<Scout> findByUuid(UUID uuid);
    
    Optional<Scout> findByUserId(UUID userId);
    
    Optional<Scout> findByBsaMemberId(String bsaMemberId);
    
    Page<Scout> findByTroopId(Long troopId, Pageable pageable);
    
    Page<Scout> findByStatus(ScoutStatus status, Pageable pageable);
    
    @Query("SELECT s FROM Scout s WHERE s.troopId = :troopId AND s.status = :status")
    Page<Scout> findByTroopIdAndStatus(@Param("troopId") Long troopId,
                                       @Param("status") ScoutStatus status,
                                       Pageable pageable);
    
    @Query("SELECT s FROM Scout s WHERE s.troopId = :troopId AND s.status = 'ACTIVE'")
    List<Scout> findActiveTroopMembers(@Param("troopId") Long troopId);
    
    @Query("SELECT s FROM Scout s WHERE " +
           "(LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.bsaMemberId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Scout> searchScouts(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Scout s WHERE s.troopId = :troopId AND " +
           "(LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.bsaMemberId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Scout> searchScoutsInTroop(@Param("search") String search, @Param("troopId") Long troopId, Pageable pageable);
    
    @Query("SELECT s FROM Scout s WHERE s.troopId = :troopId " +
           "ORDER BY s.totalSales DESC")
    Page<Scout> findTopSellersByTroop(@Param("troopId") Long troopId, Pageable pageable);
    
    @Query("SELECT s FROM Scout s WHERE s.status = 'ACTIVE' " +
           "ORDER BY s.totalSales DESC")
    Page<Scout> findTopSellersGlobal(Pageable pageable);
    
    @Query("SELECT s FROM Scout s WHERE s.topSeller = true AND s.status = 'ACTIVE'")
    List<Scout> findTopSellers();
    
    @Query("SELECT COUNT(s) FROM Scout s WHERE s.troopId = :troopId AND s.status = :status")
    long countByTroopIdAndStatus(@Param("troopId") Long troopId,
                                 @Param("status") ScoutStatus status);
    
    @Query("SELECT SUM(s.totalSales) FROM Scout s WHERE s.troopId = :troopId")
    java.math.BigDecimal sumSalesByTroop(@Param("troopId") Long troopId);
    
    @Query("SELECT SUM(s.cardsSold) FROM Scout s WHERE s.troopId = :troopId")
    Integer sumCardsSoldByTroop(@Param("troopId") Long troopId);
    
    @Query("SELECT AVG(s.totalSales) FROM Scout s WHERE s.troopId = :troopId AND s.status = 'ACTIVE'")
    java.math.BigDecimal avgSalesByTroop(@Param("troopId") Long troopId);
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.entity.Troop.TroopStatus;
import com.bsa.campcard.entity.Troop.TroopType;
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
public interface TroopRepository extends JpaRepository<Troop, Long> {
    
    Optional<Troop> findByUuid(UUID uuid);
    
    Optional<Troop> findByTroopNumber(String troopNumber);
    
    Page<Troop> findByCouncilId(Long councilId, Pageable pageable);
    
    Page<Troop> findByStatus(TroopStatus status, Pageable pageable);
    
    Page<Troop> findByTroopType(TroopType troopType, Pageable pageable);
    
    @Query("SELECT t FROM Troop t WHERE t.councilId = :councilId AND t.status = :status")
    Page<Troop> findByCouncilIdAndStatus(@Param("councilId") Long councilId,
                                          @Param("status") TroopStatus status,
                                          Pageable pageable);
    
    @Query("SELECT t FROM Troop t WHERE " +
           "(LOWER(t.troopNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.troopName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.charterOrganization) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Troop> searchTroops(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT t FROM Troop t WHERE t.scoutmasterId = :scoutmasterId")
    List<Troop> findByScoutmasterId(@Param("scoutmasterId") UUID scoutmasterId);
    
    @Query("SELECT t FROM Troop t ORDER BY t.totalSales DESC")
    Page<Troop> findTopPerformingTroops(Pageable pageable);
    
    @Query("SELECT t FROM Troop t WHERE t.councilId = :councilId " +
           "ORDER BY t.totalSales DESC")
    Page<Troop> findTopPerformingTroopsByCouncil(@Param("councilId") Long councilId,
                                                  Pageable pageable);
    
    @Query("SELECT COUNT(t) FROM Troop t WHERE t.councilId = :councilId AND t.status = :status")
    long countByCouncilIdAndStatus(@Param("councilId") Long councilId,
                                   @Param("status") TroopStatus status);
    
    @Query("SELECT SUM(t.totalSales) FROM Troop t WHERE t.councilId = :councilId")
    java.math.BigDecimal sumSalesByCouncil(@Param("councilId") Long councilId);
    
    @Query("SELECT SUM(t.cardsSold) FROM Troop t WHERE t.councilId = :councilId")
    Integer sumCardsSoldByCouncil(@Param("councilId") Long councilId);
}

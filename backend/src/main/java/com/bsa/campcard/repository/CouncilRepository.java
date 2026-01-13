package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Council.CouncilStatus;
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
public interface CouncilRepository extends JpaRepository<Council, Long> {
    
    Optional<Council> findByUuid(UUID uuid);
    
    Optional<Council> findByCouncilNumber(String councilNumber);
    
    Page<Council> findByStatus(CouncilStatus status, Pageable pageable);
    
    Page<Council> findByRegion(String region, Pageable pageable);
    
    @Query("SELECT c FROM Council c WHERE c.status = :status AND c.region = :region")
    Page<Council> findByStatusAndRegion(@Param("status") CouncilStatus status,
                                        @Param("region") String region,
                                        Pageable pageable);
    
    @Query("SELECT c FROM Council c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.councilNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.city) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.state) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Council> searchCouncils(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT c FROM Council c ORDER BY c.totalSales DESC")
    Page<Council> findTopPerformingCouncils(Pageable pageable);
    
    @Query("SELECT c FROM Council c WHERE c.region = :region " +
           "ORDER BY c.totalSales DESC")
    Page<Council> findTopPerformingCouncilsByRegion(@Param("region") String region,
                                                     Pageable pageable);
    
    List<Council> findByState(String state);
    
    boolean existsByCouncilNumber(String councilNumber);
}

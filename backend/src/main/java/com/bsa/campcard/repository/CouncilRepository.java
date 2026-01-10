package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Council;
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

    List<Council> findByStatus(Council.CouncilStatus status);

    Page<Council> findByStatus(Council.CouncilStatus status, Pageable pageable);

    List<Council> findByRegion(String region);

    Page<Council> findByRegion(String region, Pageable pageable);

    @Query("SELECT c FROM Council c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.shortName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "c.councilNumber LIKE CONCAT('%', :searchTerm, '%'))")
    Page<Council> searchCouncils(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Council c WHERE c.region = :region AND c.status = :status")
    List<Council> findByRegionAndStatus(
        @Param("region") String region,
        @Param("status") Council.CouncilStatus status
    );

    Long countByStatus(Council.CouncilStatus status);

    Long countByRegion(String region);

    @Query("SELECT c.region, COUNT(c) FROM Council c GROUP BY c.region")
    List<Object[]> countByRegionGrouped();

    @Query("SELECT SUM(c.totalScouts) FROM Council c WHERE c.status = 'ACTIVE'")
    Long getTotalActiveScouts();

    @Query("SELECT SUM(c.totalSales) FROM Council c WHERE c.status = 'ACTIVE'")
    java.math.BigDecimal getTotalActiveSales();
}

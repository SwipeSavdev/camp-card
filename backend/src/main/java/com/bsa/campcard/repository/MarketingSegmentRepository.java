package com.bsa.campcard.repository;

import com.bsa.campcard.entity.MarketingSegment;
import com.bsa.campcard.entity.MarketingSegment.SegmentType;
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
public interface MarketingSegmentRepository extends JpaRepository<MarketingSegment, Long> {

    Optional<MarketingSegment> findByUuid(UUID uuid);

    List<MarketingSegment> findByIsActiveTrue();

    List<MarketingSegment> findByIsSystemTrue();

    Page<MarketingSegment> findByCouncilIdOrIsSystemTrue(Long councilId, Pageable pageable);

    List<MarketingSegment> findByCouncilIdAndIsActiveTrue(Long councilId);

    Page<MarketingSegment> findBySegmentType(SegmentType segmentType, Pageable pageable);

    @Query("SELECT s FROM MarketingSegment s WHERE " +
           "(s.councilId = :councilId OR s.isSystem = true) AND " +
           "s.isActive = true " +
           "ORDER BY s.isSystem DESC, s.userCount DESC")
    List<MarketingSegment> findAvailableSegments(@Param("councilId") Long councilId);

    @Query("SELECT s FROM MarketingSegment s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(s.councilId = :councilId OR s.isSystem = true)")
    Page<MarketingSegment> searchSegments(
        @Param("searchTerm") String searchTerm,
        @Param("councilId") Long councilId,
        Pageable pageable
    );

    Long countByIsActiveTrue();
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.MarketingCampaign;
import com.bsa.campcard.entity.MarketingCampaign.CampaignStatus;
import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
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
public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, Long> {

    Optional<MarketingCampaign> findByUuid(UUID uuid);

    Page<MarketingCampaign> findByCouncilId(Long councilId, Pageable pageable);

    Page<MarketingCampaign> findByCouncilIdAndStatus(Long councilId, CampaignStatus status, Pageable pageable);

    Page<MarketingCampaign> findByCouncilIdAndCampaignType(Long councilId, CampaignType campaignType, Pageable pageable);

    Page<MarketingCampaign> findByStatus(CampaignStatus status, Pageable pageable);

    List<MarketingCampaign> findByCreatedBy(UUID createdBy);

    @Query("SELECT c FROM MarketingCampaign c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:councilId IS NULL OR c.councilId = :councilId)")
    Page<MarketingCampaign> searchCampaigns(
        @Param("searchTerm") String searchTerm,
        @Param("councilId") Long councilId,
        Pageable pageable
    );

    @Query("SELECT c FROM MarketingCampaign c WHERE " +
           "c.status = :status AND " +
           "c.scheduledAt <= :now AND " +
           "c.scheduledAt IS NOT NULL")
    List<MarketingCampaign> findScheduledCampaignsReadyToSend(
        @Param("status") CampaignStatus status,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT c FROM MarketingCampaign c WHERE " +
           "c.councilId = :councilId AND " +
           "c.status IN :statuses")
    Page<MarketingCampaign> findByCouncilIdAndStatusIn(
        @Param("councilId") Long councilId,
        @Param("statuses") List<CampaignStatus> statuses,
        Pageable pageable
    );

    Long countByCouncilIdAndStatus(Long councilId, CampaignStatus status);

    Long countByStatus(CampaignStatus status);

    @Query("SELECT c.campaignType, COUNT(c) FROM MarketingCampaign c " +
           "WHERE c.councilId = :councilId " +
           "GROUP BY c.campaignType")
    List<Object[]> countByCampaignType(@Param("councilId") Long councilId);

    List<MarketingCampaign> findByMerchantId(Long merchantId);

    List<MarketingCampaign> findBySegmentId(Long segmentId);
}

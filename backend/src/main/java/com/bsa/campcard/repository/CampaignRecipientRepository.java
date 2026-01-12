package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CampaignRecipient;
import com.bsa.campcard.entity.CampaignRecipient.Channel;
import com.bsa.campcard.entity.CampaignRecipient.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {

    Optional<CampaignRecipient> findByUuid(UUID uuid);

    // Find by campaign
    List<CampaignRecipient> findByCampaignId(Long campaignId);

    Page<CampaignRecipient> findByCampaignId(Long campaignId, Pageable pageable);

    // Find by user
    List<CampaignRecipient> findByUserId(UUID userId);

    // Find pending recipients for a campaign
    List<CampaignRecipient> findByCampaignIdAndStatus(Long campaignId, DeliveryStatus status);

    // Find by campaign and channel
    List<CampaignRecipient> findByCampaignIdAndChannel(Long campaignId, Channel channel);

    // Check if already sent to user for this campaign and channel
    boolean existsByCampaignIdAndUserIdAndChannel(Long campaignId, UUID userId, Channel channel);

    // Find scheduled recipients ready to send
    @Query("SELECT r FROM CampaignRecipient r WHERE r.status = 'SCHEDULED' AND r.scheduledAt <= :now")
    List<CampaignRecipient> findScheduledRecipientsReadyToSend(@Param("now") LocalDateTime now);

    // Find failed recipients for retry
    @Query("SELECT r FROM CampaignRecipient r WHERE r.status = 'FAILED' AND r.retryCount < :maxRetries " +
           "AND (r.lastRetryAt IS NULL OR r.lastRetryAt < :retryAfter)")
    List<CampaignRecipient> findFailedRecipientsForRetry(
        @Param("maxRetries") int maxRetries,
        @Param("retryAfter") LocalDateTime retryAfter
    );

    // Count by status for campaign
    long countByCampaignIdAndStatus(Long campaignId, DeliveryStatus status);

    // Count by channel for campaign
    long countByCampaignIdAndChannel(Long campaignId, Channel channel);

    // Get campaign metrics
    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.status = 'SENT'")
    long countSentByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.status = 'DELIVERED'")
    long countDeliveredByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.openedAt IS NOT NULL")
    long countOpenedByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.clickedAt IS NOT NULL")
    long countClickedByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.convertedAt IS NOT NULL")
    long countConvertedByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(r) FROM CampaignRecipient r WHERE r.campaignId = :campaignId AND r.status = 'FAILED'")
    long countFailedByCampaign(@Param("campaignId") Long campaignId);

    // Bulk update status
    @Modifying
    @Query("UPDATE CampaignRecipient r SET r.status = :newStatus, r.updatedAt = :now " +
           "WHERE r.campaignId = :campaignId AND r.status = :oldStatus")
    int bulkUpdateStatus(
        @Param("campaignId") Long campaignId,
        @Param("oldStatus") DeliveryStatus oldStatus,
        @Param("newStatus") DeliveryStatus newStatus,
        @Param("now") LocalDateTime now
    );

    // Find geofence-triggered recipients
    List<CampaignRecipient> findByCampaignIdAndTriggeredByGeofenceTrue(Long campaignId);

    // Delete old recipients (for cleanup)
    @Modifying
    @Query("DELETE FROM CampaignRecipient r WHERE r.createdAt < :before AND r.status IN ('SENT', 'DELIVERED', 'FAILED')")
    int deleteOldRecipients(@Param("before") LocalDateTime before);
}

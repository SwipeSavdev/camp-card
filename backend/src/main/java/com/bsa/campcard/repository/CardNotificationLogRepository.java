package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CardNotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardNotificationLogRepository extends JpaRepository<CardNotificationLog, Long> {

    // Check if a specific notification has been sent
    boolean existsByCampCardIdAndNotificationType(Long campCardId, String notificationType);

    // Find notification log entry
    Optional<CardNotificationLog> findByCampCardIdAndNotificationType(Long campCardId, String notificationType);

    // Find all notifications for a card
    List<CardNotificationLog> findByCampCardId(Long campCardId);

    // Find all notifications for a user
    List<CardNotificationLog> findByUserId(UUID userId);

    // Find notifications by type
    List<CardNotificationLog> findByNotificationType(String notificationType);

    // Find notifications sent in date range
    @Query("SELECT n FROM CardNotificationLog n WHERE n.sentAt BETWEEN :startDate AND :endDate " +
           "ORDER BY n.sentAt DESC")
    List<CardNotificationLog> findNotificationsSentBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Count notifications by type
    @Query("SELECT COUNT(n) FROM CardNotificationLog n WHERE n.notificationType = :type")
    Long countByNotificationType(@Param("type") String type);

    // Check if any expiry notification has been sent for a card
    @Query("SELECT COUNT(n) > 0 FROM CardNotificationLog n " +
           "WHERE n.campCardId = :cardId AND n.notificationType LIKE 'EXPIRY_%'")
    boolean hasExpiryNotificationBeenSent(@Param("cardId") Long cardId);

    // Delete old notifications (for cleanup job)
    @Query("DELETE FROM CardNotificationLog n WHERE n.sentAt < :cutoffDate")
    void deleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
}

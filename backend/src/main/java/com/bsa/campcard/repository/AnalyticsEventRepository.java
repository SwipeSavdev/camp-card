package com.bsa.campcard.repository;

import com.bsa.campcard.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    List<AnalyticsEvent> findByUserIdAndEventTypeOrderByCreatedAtDesc(UUID userId, String eventType);

    long countByEventNameAndCreatedAtAfter(String eventName, LocalDateTime after);

    long countByUserIdAndEventName(UUID userId, String eventName);

    List<AnalyticsEvent> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}

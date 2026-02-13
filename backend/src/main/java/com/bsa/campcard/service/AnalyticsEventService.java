package com.bsa.campcard.service;

import com.bsa.campcard.dto.AnalyticsEventRequest;
import com.bsa.campcard.entity.AnalyticsEvent;
import com.bsa.campcard.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsEventService {

    private final AnalyticsEventRepository analyticsEventRepository;

    @Async
    @Transactional
    public void trackEvent(AnalyticsEventRequest request, UUID userId, String ipAddress) {
        try {
            AnalyticsEvent event = AnalyticsEvent.builder()
                    .userId(userId)
                    .sessionId(request.getSessionId())
                    .eventType(request.getEventType())
                    .eventName(request.getEventName())
                    .screenName(request.getScreenName())
                    .properties(request.getProperties())
                    .deviceType(request.getDeviceType())
                    .deviceModel(request.getDeviceModel())
                    .osVersion(request.getOsVersion())
                    .appVersion(request.getAppVersion())
                    .ipAddress(ipAddress)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .build();

            analyticsEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to track analytics event: {} - {}", request.getEventName(), e.getMessage());
        }
    }

    @Async
    @Transactional
    public void trackBatch(List<AnalyticsEventRequest> events, UUID userId, String ipAddress) {
        for (AnalyticsEventRequest request : events) {
            trackEvent(request, userId, ipAddress);
        }
        log.debug("Tracked {} analytics events for user: {}", events.size(), userId);
    }
}

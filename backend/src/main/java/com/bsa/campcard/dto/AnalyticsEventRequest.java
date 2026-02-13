package com.bsa.campcard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEventRequest {
    private String sessionId;
    private String eventType;
    private String eventName;
    private String screenName;
    private Map<String, Object> properties;
    private String deviceType;
    private String deviceModel;
    private String osVersion;
    private String appVersion;
    private BigDecimal latitude;
    private BigDecimal longitude;
}

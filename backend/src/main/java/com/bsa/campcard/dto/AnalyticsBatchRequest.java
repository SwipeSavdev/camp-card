package com.bsa.campcard.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsBatchRequest {
    private List<AnalyticsEventRequest> events;
}

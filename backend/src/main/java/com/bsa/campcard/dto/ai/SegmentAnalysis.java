package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SegmentAnalysis {
    private Long segmentId;
    private String segmentName;
    private String analysis;
    private LocalDateTime generatedAt;
}

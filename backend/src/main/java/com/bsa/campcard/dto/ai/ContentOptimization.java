package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContentOptimization {
    private String originalContent;
    private String optimizedContent;
    private String optimizationType;
    private LocalDateTime generatedAt;
}

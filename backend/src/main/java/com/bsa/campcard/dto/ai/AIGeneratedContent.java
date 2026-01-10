package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AIGeneratedContent {
    private String subjectLine;
    private String bodyContent;
    private String rawContent;
    private String model;
    private String promptUsed;
    private Integer variationNumber;
    private String variationType;
    private LocalDateTime generatedAt;
}

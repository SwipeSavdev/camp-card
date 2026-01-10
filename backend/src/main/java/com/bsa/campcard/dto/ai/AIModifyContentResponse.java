package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AIModifyContentResponse {
    private String originalContent;
    private String modifiedContent;
    private String modificationApplied;
    private LocalDateTime generatedAt;
}

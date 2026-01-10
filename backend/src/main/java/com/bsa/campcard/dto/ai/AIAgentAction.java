package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AIAgentAction {
    private String taskType;
    private String status; // PENDING, IN_PROGRESS, COMPLETED, FAILED
    private Map<String, Object> result;
    private String error;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}

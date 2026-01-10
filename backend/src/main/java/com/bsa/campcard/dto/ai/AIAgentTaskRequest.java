package com.bsa.campcard.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class AIAgentTaskRequest {

    @NotBlank(message = "Task type is required")
    private String taskType; // CREATE_CAMPAIGN, OPTIMIZE_CAMPAIGN, ANALYZE_PERFORMANCE, SUGGEST_IMPROVEMENTS, GENERATE_REPORT, AUTO_SEGMENT

    private Map<String, Object> taskData;
    private Long councilId;
    private String priority; // LOW, NORMAL, HIGH
}

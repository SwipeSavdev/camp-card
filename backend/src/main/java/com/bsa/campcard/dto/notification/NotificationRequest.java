package com.bsa.campcard.dto.notification;

import com.bsa.campcard.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    
    @NotNull(message = "User IDs are required")
    private List<Long> userIds;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Body is required")
    private String body;
    
    private Notification.NotificationType type;
    
    private Map<String, String> data;
    
    private String imageUrl;

    @Builder.Default
    private Boolean saveToDatabase = true;
}

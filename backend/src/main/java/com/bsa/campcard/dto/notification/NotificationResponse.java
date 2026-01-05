package com.bsa.campcard.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    
    private Long id;
    
    private String title;
    
    private String body;
    
    private String type;
    
    private String imageUrl;
    
    private Boolean read;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
}

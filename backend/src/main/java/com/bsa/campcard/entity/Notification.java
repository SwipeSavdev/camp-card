package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private java.util.UUID userId;
    
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;
    
    @Column(length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(columnDefinition = "TEXT")
    private String data; // JSON data for deep linking
    
    @Column(length = 500)
    private String imageUrl;
    
    @Column(nullable = false)
    private Boolean sent = false;
    
    @Column(nullable = false)
    private Boolean read = false;
    
    private LocalDateTime sentAt;
    
    private LocalDateTime readAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum NotificationType {
        NEW_OFFER,
        OFFER_EXPIRING,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        SUBSCRIPTION_EXPIRING,
        SUBSCRIPTION_RENEWED,
        REFERRAL_REWARD,
        TROOP_ANNOUNCEMENT,
        SYSTEM_ALERT
    }
}

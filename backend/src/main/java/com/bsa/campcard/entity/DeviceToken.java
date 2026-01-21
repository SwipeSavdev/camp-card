package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "device_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Note: Currently BIGINT in database, will be converted to UUID by DBA migration
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, unique = true, length = 512)
    private String token;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DeviceType deviceType;
    
    @Column(length = 50)
    private String deviceModel;
    
    @Column(length = 20)
    private String osVersion;
    
    @Column(length = 20)
    private String appVersion;

    // Note: endpointArn column requires DBA to grant table ownership first
    // Uncomment after DBA runs: ALTER TABLE campcard.device_tokens OWNER TO campcard_app;
    // @Column(length = 512)
    // private String endpointArn;
    @Transient
    private String endpointArn;  // Temporary: not persisted until DB column exists

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastUsedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum DeviceType {
        IOS,
        ANDROID,
        WEB
    }
}

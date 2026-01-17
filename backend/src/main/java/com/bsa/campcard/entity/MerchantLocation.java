package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "merchant_locations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private UUID uuid;
    
    @Column(nullable = false)
    private Long merchantId;
    
    // Location Information
    @Column(nullable = false, length = 200)
    private String locationName;
    
    @Column(nullable = false, length = 200)
    private String streetAddress;
    
    @Column(length = 100)
    private String addressLine2;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(nullable = false, length = 50)
    private String state;
    
    @Column(nullable = false, length = 20)
    private String zipCode;

    @Column(length = 50)
    @Builder.Default
    private String country = "USA";

    // Geolocation
    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    // Contact
    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String hours; // JSON or formatted string

    // Features
    @Builder.Default
    private Boolean primaryLocation = false;
    @Builder.Default
    private Boolean active = true;
    
    // Audit
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt;
    
    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

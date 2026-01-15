package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payment_devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    // Device Assignment
    private Long merchantId;

    private Long merchantLocationId;

    // Device Information
    @Column(nullable = false, length = 100)
    private String manufacturer;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, unique = true, length = 100)
    private String serialNumber;

    // Device Details (from device catalog)
    @Column(length = 200)
    private String category;

    @Column(length = 200)
    private String platform;

    @Column(length = 100)
    private String deploymentType;

    @Column(length = 200)
    private String integrationType;

    // Configuration
    @Column(length = 200)
    private String deviceName;

    @Column(length = 500)
    private String locationDescription;

    // SDK/API Integration Details
    @Column(length = 100)
    private String sdkType;

    @Column(length = 50)
    private String sdkVersion;

    @Column(length = 500)
    private String apiEndpoint;

    @Column(length = 100)
    private String terminalId;

    @Column(length = 100)
    private String merchantTerminalId;

    // Status
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DeviceStatus status = DeviceStatus.PENDING;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private ActivationStatus activationStatus = ActivationStatus.NOT_ACTIVATED;

    // Onboarding Checklist
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> onboardingChecklist = new ArrayList<>();

    private Boolean onboardingCompleted = false;

    private LocalDateTime onboardingCompletedAt;

    // Certification
    private Boolean pciCompliant = false;

    private Boolean emvCertified = false;

    private Boolean contactlessEnabled = false;

    // Support Information
    @Column(length = 200)
    private String supportContact;

    @Column(length = 50)
    private String supportPhone;

    @Column(length = 500)
    private String supportUrl;

    @Column(length = 500)
    private String documentationUrl;

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

    public enum DeviceStatus {
        PENDING,        // Device created but not yet configured
        ACTIVE,         // Device is active and operational
        INACTIVE,       // Device temporarily disabled
        MAINTENANCE,    // Device under maintenance
        DECOMMISSIONED  // Device permanently removed from service
    }

    public enum ActivationStatus {
        NOT_ACTIVATED,
        PENDING_ACTIVATION,
        ACTIVATED,
        ACTIVATION_FAILED
    }
}

package com.bsa.campcard.dto.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResponse {

    private Long id;
    private UUID uuid;

    // Device Assignment
    private Long merchantId;
    private String merchantName;
    private Long merchantLocationId;
    private String merchantLocationName;

    // Device Information
    private String manufacturer;
    private String model;
    private String serialNumber;

    // Device Details
    private String category;
    private String platform;
    private String deploymentType;
    private String integrationType;

    // Configuration
    private String deviceName;
    private String locationDescription;

    // SDK/API Integration Details
    private String sdkType;
    private String sdkVersion;
    private String apiEndpoint;
    private String terminalId;
    private String merchantTerminalId;

    // Status
    private String status;
    private String activationStatus;

    // Onboarding
    private List<String> onboardingChecklist;
    private Boolean onboardingCompleted;
    private LocalDateTime onboardingCompletedAt;

    // Certification
    private Boolean pciCompliant;
    private Boolean emvCertified;
    private Boolean contactlessEnabled;

    // Support Information
    private String supportContact;
    private String supportPhone;
    private String supportUrl;
    private String documentationUrl;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

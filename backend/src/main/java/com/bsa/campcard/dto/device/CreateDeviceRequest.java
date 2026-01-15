package com.bsa.campcard.dto.device;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeviceRequest {

    // Device Assignment
    private Long merchantId;
    private Long merchantLocationId;

    // Device Information
    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    // Device Details (from device catalog)
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

    // Certification
    private Boolean pciCompliant;
    private Boolean emvCertified;
    private Boolean contactlessEnabled;

    // Support Information
    private String supportContact;
    private String supportPhone;
    private String supportUrl;
    private String documentationUrl;

    // Onboarding Checklist
    private List<String> onboardingChecklist;
}

package com.bsa.campcard.dto.device;

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
public class DeviceCatalogResponse {

    private List<ManufacturerInfo> manufacturers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManufacturerInfo {
        private String name;
        private String description;
        private String websiteUrl;
        private String supportUrl;
        private String developerPortalUrl;
        private List<DeviceModelInfo> models;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceModelInfo {
        private String model;
        private String category;
        private String platform;
        private String integrationType;
        private String deploymentType;
        private String notes;
        private String sourceUrl;
        private List<String> requirements;
        private SdkInfo sdk;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SdkInfo {
        private String name;
        private String version;
        private String downloadUrl;
        private String documentationUrl;
        private String apiReferenceUrl;
        private List<String> supportedFeatures;
    }
}

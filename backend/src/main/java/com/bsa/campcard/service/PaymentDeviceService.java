package com.bsa.campcard.service;

import com.bsa.campcard.dto.device.*;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.MerchantLocation;
import com.bsa.campcard.entity.PaymentDevice;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.MerchantLocationRepository;
import com.bsa.campcard.repository.MerchantRepository;
import com.bsa.campcard.repository.PaymentDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentDeviceService {

    private final PaymentDeviceRepository deviceRepository;
    private final MerchantRepository merchantRepository;
    private final MerchantLocationRepository locationRepository;

    /**
     * Create a new payment device
     */
    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        log.info("Creating device: {} {} - Serial: {}", request.getManufacturer(), request.getModel(), request.getSerialNumber());

        // Check if serial number already exists
        if (deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException("Device with serial number already exists: " + request.getSerialNumber());
        }

        PaymentDevice device = PaymentDevice.builder()
                .merchantId(request.getMerchantId())
                .merchantLocationId(request.getMerchantLocationId())
                .manufacturer(request.getManufacturer())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .category(request.getCategory())
                .platform(request.getPlatform())
                .deploymentType(request.getDeploymentType())
                .integrationType(request.getIntegrationType())
                .deviceName(request.getDeviceName())
                .locationDescription(request.getLocationDescription())
                .sdkType(request.getSdkType())
                .sdkVersion(request.getSdkVersion())
                .apiEndpoint(request.getApiEndpoint())
                .terminalId(request.getTerminalId())
                .merchantTerminalId(request.getMerchantTerminalId())
                .pciCompliant(request.getPciCompliant() != null ? request.getPciCompliant() : false)
                .emvCertified(request.getEmvCertified() != null ? request.getEmvCertified() : false)
                .contactlessEnabled(request.getContactlessEnabled() != null ? request.getContactlessEnabled() : false)
                .supportContact(request.getSupportContact())
                .supportPhone(request.getSupportPhone())
                .supportUrl(request.getSupportUrl())
                .documentationUrl(request.getDocumentationUrl())
                .onboardingChecklist(request.getOnboardingChecklist() != null ? request.getOnboardingChecklist() : new ArrayList<>())
                .status(PaymentDevice.DeviceStatus.PENDING)
                .activationStatus(PaymentDevice.ActivationStatus.NOT_ACTIVATED)
                .build();

        device = deviceRepository.save(device);
        log.info("Device created with ID: {}", device.getId());

        return toDeviceResponse(device);
    }

    /**
     * Get device by ID
     */
    public DeviceResponse getDevice(Long deviceId) {
        log.info("Fetching device: {}", deviceId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        return toDeviceResponse(device);
    }

    /**
     * Get device by UUID
     */
    public DeviceResponse getDeviceByUuid(UUID uuid) {
        log.info("Fetching device by UUID: {}", uuid);

        PaymentDevice device = deviceRepository.findByUuidAndDeletedAtIsNull(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        return toDeviceResponse(device);
    }

    /**
     * Get all devices with filters
     */
    public Page<DeviceResponse> getDevices(
            PaymentDevice.DeviceStatus status,
            String searchTerm,
            Pageable pageable) {
        log.info("Fetching devices with status: {}, search: {}", status, searchTerm);

        Page<PaymentDevice> devices;

        if (searchTerm != null && !searchTerm.isEmpty()) {
            devices = deviceRepository.searchDevices(searchTerm, pageable);
        } else if (status != null) {
            devices = deviceRepository.findByStatusAndDeletedAtIsNull(status, pageable);
        } else {
            devices = deviceRepository.findByDeletedAtIsNull(pageable);
        }

        return devices.map(this::toDeviceResponse);
    }

    /**
     * Get devices by merchant
     */
    public List<DeviceResponse> getDevicesByMerchant(Long merchantId) {
        log.info("Fetching devices for merchant: {}", merchantId);

        List<PaymentDevice> devices = deviceRepository.findByMerchantIdAndDeletedAtIsNull(merchantId);

        return devices.stream()
                .map(this::toDeviceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get devices by merchant location
     */
    public List<DeviceResponse> getDevicesByLocation(Long locationId) {
        log.info("Fetching devices for location: {}", locationId);

        List<PaymentDevice> devices = deviceRepository.findByMerchantLocationIdAndDeletedAtIsNull(locationId);

        return devices.stream()
                .map(this::toDeviceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update device
     */
    @Transactional
    public DeviceResponse updateDevice(Long deviceId, CreateDeviceRequest request) {
        log.info("Updating device: {}", deviceId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        // Check if serial number is being changed and if new one exists
        if (!device.getSerialNumber().equals(request.getSerialNumber()) &&
            deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException("Device with serial number already exists: " + request.getSerialNumber());
        }

        device.setMerchantId(request.getMerchantId());
        device.setMerchantLocationId(request.getMerchantLocationId());
        device.setManufacturer(request.getManufacturer());
        device.setModel(request.getModel());
        device.setSerialNumber(request.getSerialNumber());
        device.setCategory(request.getCategory());
        device.setPlatform(request.getPlatform());
        device.setDeploymentType(request.getDeploymentType());
        device.setIntegrationType(request.getIntegrationType());
        device.setDeviceName(request.getDeviceName());
        device.setLocationDescription(request.getLocationDescription());
        device.setSdkType(request.getSdkType());
        device.setSdkVersion(request.getSdkVersion());
        device.setApiEndpoint(request.getApiEndpoint());
        device.setTerminalId(request.getTerminalId());
        device.setMerchantTerminalId(request.getMerchantTerminalId());
        device.setPciCompliant(request.getPciCompliant());
        device.setEmvCertified(request.getEmvCertified());
        device.setContactlessEnabled(request.getContactlessEnabled());
        device.setSupportContact(request.getSupportContact());
        device.setSupportPhone(request.getSupportPhone());
        device.setSupportUrl(request.getSupportUrl());
        device.setDocumentationUrl(request.getDocumentationUrl());

        if (request.getOnboardingChecklist() != null) {
            device.setOnboardingChecklist(request.getOnboardingChecklist());
        }

        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Update device status
     */
    @Transactional
    public DeviceResponse updateDeviceStatus(Long deviceId, PaymentDevice.DeviceStatus status) {
        log.info("Updating device status: {} to {}", deviceId, status);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        device.setStatus(status);
        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Update device activation status
     */
    @Transactional
    public DeviceResponse updateActivationStatus(Long deviceId, PaymentDevice.ActivationStatus activationStatus) {
        log.info("Updating device activation status: {} to {}", deviceId, activationStatus);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        device.setActivationStatus(activationStatus);

        // If activated, also set the device to active
        if (activationStatus == PaymentDevice.ActivationStatus.ACTIVATED) {
            device.setStatus(PaymentDevice.DeviceStatus.ACTIVE);
        }

        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Complete device onboarding
     */
    @Transactional
    public DeviceResponse completeOnboarding(Long deviceId) {
        log.info("Completing onboarding for device: {}", deviceId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        device.setOnboardingCompleted(true);
        device.setOnboardingCompletedAt(LocalDateTime.now());
        device.setStatus(PaymentDevice.DeviceStatus.ACTIVE);
        device.setActivationStatus(PaymentDevice.ActivationStatus.ACTIVATED);

        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Assign device to merchant
     */
    @Transactional
    public DeviceResponse assignToMerchant(Long deviceId, Long merchantId, Long locationId) {
        log.info("Assigning device {} to merchant {} at location {}", deviceId, merchantId, locationId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        // Verify merchant exists
        merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        device.setMerchantId(merchantId);
        device.setMerchantLocationId(locationId);

        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Unassign device from merchant
     */
    @Transactional
    public DeviceResponse unassignFromMerchant(Long deviceId) {
        log.info("Unassigning device {} from merchant", deviceId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        device.setMerchantId(null);
        device.setMerchantLocationId(null);

        device = deviceRepository.save(device);

        return toDeviceResponse(device);
    }

    /**
     * Delete device (soft delete)
     */
    @Transactional
    public void deleteDevice(Long deviceId) {
        log.info("Deleting device: {}", deviceId);

        PaymentDevice device = deviceRepository.findByIdAndDeletedAtIsNull(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        device.setDeletedAt(LocalDateTime.now());
        device.setStatus(PaymentDevice.DeviceStatus.DECOMMISSIONED);
        deviceRepository.save(device);
    }

    /**
     * Get device statistics
     */
    public DeviceStatsResponse getDeviceStats() {
        Long pending = deviceRepository.countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus.PENDING);
        Long active = deviceRepository.countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus.ACTIVE);
        Long inactive = deviceRepository.countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus.INACTIVE);
        Long maintenance = deviceRepository.countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus.MAINTENANCE);
        Long decommissioned = deviceRepository.countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus.DECOMMISSIONED);

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("PENDING", pending);
        byStatus.put("ACTIVE", active);
        byStatus.put("INACTIVE", inactive);
        byStatus.put("MAINTENANCE", maintenance);
        byStatus.put("DECOMMISSIONED", decommissioned);

        Map<String, Long> byManufacturer = new HashMap<>();
        List<Object[]> manufacturerCounts = deviceRepository.countByManufacturer();
        for (Object[] row : manufacturerCounts) {
            byManufacturer.put((String) row[0], (Long) row[1]);
        }

        return DeviceStatsResponse.builder()
                .totalDevices(pending + active + inactive + maintenance)
                .pendingDevices(pending)
                .activeDevices(active)
                .inactiveDevices(inactive)
                .maintenanceDevices(maintenance)
                .decommissionedDevices(decommissioned)
                .byStatus(byStatus)
                .byManufacturer(byManufacturer)
                .build();
    }

    /**
     * Get device catalog with all supported manufacturers and models
     */
    public DeviceCatalogResponse getDeviceCatalog() {
        List<DeviceCatalogResponse.ManufacturerInfo> manufacturers = new ArrayList<>();

        // Verifone
        manufacturers.add(DeviceCatalogResponse.ManufacturerInfo.builder()
                .name("Verifone")
                .description("Global leader in payment technology and solutions")
                .websiteUrl("https://www.verifone.com")
                .supportUrl("https://www.verifone.com/en/us/support")
                .developerPortalUrl("https://developer.verifone.com")
                .models(getVerifoneModels())
                .build());

        // Ingenico
        manufacturers.add(DeviceCatalogResponse.ManufacturerInfo.builder()
                .name("Ingenico")
                .description("Seamless payment solutions for all channels")
                .websiteUrl("https://www.ingenico.com")
                .supportUrl("https://www.ingenico.com/en/support")
                .developerPortalUrl("https://developer.ingenico.com")
                .models(getIngenicoModels())
                .build());

        // PAX Technology
        manufacturers.add(DeviceCatalogResponse.ManufacturerInfo.builder()
                .name("PAX")
                .description("Payment technology innovation and excellence")
                .websiteUrl("https://www.pax.us")
                .supportUrl("https://www.pax.us/support")
                .developerPortalUrl("https://developer.pax.us")
                .models(getPaxModels())
                .build());

        // Dejavoo
        manufacturers.add(DeviceCatalogResponse.ManufacturerInfo.builder()
                .name("Dejavoo")
                .description("Smart payment solutions for modern commerce")
                .websiteUrl("https://www.dejavoo.com")
                .supportUrl("https://www.dejavoo.com/support")
                .developerPortalUrl("https://developer.dejavoo.com")
                .models(getDejavooModels())
                .build());

        // Valor
        manufacturers.add(DeviceCatalogResponse.ManufacturerInfo.builder()
                .name("Valor")
                .description("Innovative payment processing solutions")
                .websiteUrl("https://www.valorpaytech.com")
                .supportUrl("https://www.valorpaytech.com/support")
                .developerPortalUrl("https://developer.valorpaytech.com")
                .models(getValorModels())
                .build());

        return DeviceCatalogResponse.builder()
                .manufacturers(manufacturers)
                .build();
    }

    // Helper methods for device catalog models

    private List<DeviceCatalogResponse.DeviceModelInfo> getVerifoneModels() {
        return Arrays.asList(
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("VX 520")
                        .category("Countertop Terminal")
                        .platform("Verix")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Countertop")
                        .notes("Popular countertop terminal with dial-up and IP connectivity")
                        .sourceUrl("https://www.verifone.com/en/products/devices/countertop/vx-520")
                        .requirements(Arrays.asList(
                                "Register for Verifone Developer Portal account",
                                "Download Verix SDK and documentation",
                                "Obtain test device serial numbers",
                                "Configure terminal for test environment",
                                "Complete PCI-DSS compliance certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Verix SDK")
                                .version("2.x")
                                .downloadUrl("https://developer.verifone.com/downloads/verix-sdk")
                                .documentationUrl("https://developer.verifone.com/docs/verix")
                                .apiReferenceUrl("https://developer.verifone.com/api/verix")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Signature Capture", "PIN Entry"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("VX 680")
                        .category("Wireless Terminal")
                        .platform("Verix")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Wireless/Mobile")
                        .notes("Portable wireless terminal with WiFi, Bluetooth, and GPRS")
                        .sourceUrl("https://www.verifone.com/en/products/devices/mobile/vx-680")
                        .requirements(Arrays.asList(
                                "Register for Verifone Developer Portal account",
                                "Download Verix SDK and documentation",
                                "Configure wireless connectivity settings",
                                "Obtain test SIM card for GPRS testing",
                                "Complete EMV L1/L2 certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Verix SDK")
                                .version("2.x")
                                .downloadUrl("https://developer.verifone.com/downloads/verix-sdk")
                                .documentationUrl("https://developer.verifone.com/docs/verix")
                                .apiReferenceUrl("https://developer.verifone.com/api/verix")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "WiFi", "Bluetooth", "GPRS"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("M400")
                        .category("Multi-Lane Device")
                        .platform("Engage")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Multi-Lane")
                        .notes("Android-based multi-lane customer-facing device")
                        .sourceUrl("https://www.verifone.com/en/products/devices/multilane/m400")
                        .requirements(Arrays.asList(
                                "Register for Verifone Engage platform",
                                "Complete merchant boarding process",
                                "Configure Engage Cloud services",
                                "Download device management tools",
                                "Complete PCI P2PE certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Engage SDK")
                                .version("3.x")
                                .downloadUrl("https://developer.verifone.com/downloads/engage-sdk")
                                .documentationUrl("https://developer.verifone.com/docs/engage")
                                .apiReferenceUrl("https://developer.verifone.com/api/engage")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Android Apps", "Cloud Management"))
                                .build())
                        .build()
        );
    }

    private List<DeviceCatalogResponse.DeviceModelInfo> getIngenicoModels() {
        return Arrays.asList(
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("Desk/5000")
                        .category("Countertop Terminal")
                        .platform("Telium TETRA")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Countertop")
                        .notes("Next-gen countertop terminal with high-resolution touchscreen")
                        .sourceUrl("https://www.ingenico.com/en/products/in-store/desk-5000")
                        .requirements(Arrays.asList(
                                "Register for Ingenico Developer Portal",
                                "Download Telium TETRA SDK",
                                "Obtain development device",
                                "Configure test environment",
                                "Complete EMV certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Telium TETRA SDK")
                                .version("4.x")
                                .downloadUrl("https://developer.ingenico.com/downloads/tetra-sdk")
                                .documentationUrl("https://developer.ingenico.com/docs/tetra")
                                .apiReferenceUrl("https://developer.ingenico.com/api/tetra")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Touchscreen", "QR Code"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("Move/5000")
                        .category("Wireless Terminal")
                        .platform("Telium TETRA")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Wireless/Mobile")
                        .notes("Portable wireless terminal with 4G, WiFi, and Bluetooth")
                        .sourceUrl("https://www.ingenico.com/en/products/in-store/move-5000")
                        .requirements(Arrays.asList(
                                "Register for Ingenico Developer Portal",
                                "Download Telium TETRA SDK",
                                "Configure wireless connectivity",
                                "Obtain test SIM for 4G testing",
                                "Complete battery and wireless certifications"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Telium TETRA SDK")
                                .version("4.x")
                                .downloadUrl("https://developer.ingenico.com/downloads/tetra-sdk")
                                .documentationUrl("https://developer.ingenico.com/docs/tetra")
                                .apiReferenceUrl("https://developer.ingenico.com/api/tetra")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "4G LTE", "WiFi", "Bluetooth"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("Lane/5000")
                        .category("Multi-Lane Device")
                        .platform("Telium TETRA")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Multi-Lane")
                        .notes("Customer-facing device for high-volume retail")
                        .sourceUrl("https://www.ingenico.com/en/products/in-store/lane-5000")
                        .requirements(Arrays.asList(
                                "Register for Ingenico Developer Portal",
                                "Download Telium TETRA SDK",
                                "Configure POS integration",
                                "Complete semi-integrated certification",
                                "Configure device management"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Telium TETRA SDK")
                                .version("4.x")
                                .downloadUrl("https://developer.ingenico.com/downloads/tetra-sdk")
                                .documentationUrl("https://developer.ingenico.com/docs/tetra")
                                .apiReferenceUrl("https://developer.ingenico.com/api/tetra")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "POS Integration", "Retail"))
                                .build())
                        .build()
        );
    }

    private List<DeviceCatalogResponse.DeviceModelInfo> getPaxModels() {
        return Arrays.asList(
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("A920")
                        .category("Smart Terminal")
                        .platform("Android")
                        .integrationType("Full-Integrated")
                        .deploymentType("Smart Terminal")
                        .notes("Android-based smart terminal with touchscreen and camera")
                        .sourceUrl("https://www.pax.us/products/smart-terminals/a920")
                        .requirements(Arrays.asList(
                                "Register for PAX Developer Portal",
                                "Download PAX Store SDK",
                                "Set up Android development environment",
                                "Configure PAX Store account",
                                "Complete app certification process"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("PAX Store SDK")
                                .version("Android")
                                .downloadUrl("https://developer.pax.us/downloads/paxstore-sdk")
                                .documentationUrl("https://developer.pax.us/docs/android")
                                .apiReferenceUrl("https://developer.pax.us/api/android")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Camera", "Android Apps", "Touch"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("A80")
                        .category("Countertop Terminal")
                        .platform("ProlinOS")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Countertop")
                        .notes("Compact countertop terminal with color display")
                        .sourceUrl("https://www.pax.us/products/countertop/a80")
                        .requirements(Arrays.asList(
                                "Register for PAX Developer Portal",
                                "Download ProlinOS SDK",
                                "Obtain test terminal",
                                "Configure development environment",
                                "Complete EMV L1/L2 certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("ProlinOS SDK")
                                .version("3.x")
                                .downloadUrl("https://developer.pax.us/downloads/prolinos-sdk")
                                .documentationUrl("https://developer.pax.us/docs/prolinos")
                                .apiReferenceUrl("https://developer.pax.us/api/prolinos")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Color Display", "PIN Entry"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("S300")
                        .category("PIN Pad")
                        .platform("ProlinOS")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Multi-Lane")
                        .notes("Integrated PIN pad for POS systems")
                        .sourceUrl("https://www.pax.us/products/integrated/s300")
                        .requirements(Arrays.asList(
                                "Register for PAX Developer Portal",
                                "Download integration documentation",
                                "Configure POS interface",
                                "Complete semi-integrated certification",
                                "Set up terminal management"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("ProlinOS SDK")
                                .version("3.x")
                                .downloadUrl("https://developer.pax.us/downloads/prolinos-sdk")
                                .documentationUrl("https://developer.pax.us/docs/integrated")
                                .apiReferenceUrl("https://developer.pax.us/api/integrated")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "POS Integration", "PIN Entry"))
                                .build())
                        .build()
        );
    }

    private List<DeviceCatalogResponse.DeviceModelInfo> getDejavooModels() {
        return Arrays.asList(
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("Z11")
                        .category("Countertop Terminal")
                        .platform("Dejavoo OS")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Countertop")
                        .notes("Touch-screen countertop payment terminal")
                        .sourceUrl("https://www.dejavoo.com/products/z11")
                        .requirements(Arrays.asList(
                                "Register for Dejavoo Developer Program",
                                "Download Dejavoo API documentation",
                                "Configure terminal for development",
                                "Set up test merchant account",
                                "Complete certification process"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Dejavoo API")
                                .version("2.x")
                                .downloadUrl("https://developer.dejavoo.com/downloads/api")
                                .documentationUrl("https://developer.dejavoo.com/docs")
                                .apiReferenceUrl("https://developer.dejavoo.com/api")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Touch Screen", "Signature"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("QD4")
                        .category("PIN Pad")
                        .platform("Dejavoo OS")
                        .integrationType("Semi-Integrated")
                        .deploymentType("Multi-Lane")
                        .notes("Compact PIN pad with contactless support")
                        .sourceUrl("https://www.dejavoo.com/products/qd4")
                        .requirements(Arrays.asList(
                                "Register for Dejavoo Developer Program",
                                "Download integration guide",
                                "Configure POS interface settings",
                                "Complete semi-integrated certification",
                                "Set up device management"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Dejavoo API")
                                .version("2.x")
                                .downloadUrl("https://developer.dejavoo.com/downloads/api")
                                .documentationUrl("https://developer.dejavoo.com/docs/integrated")
                                .apiReferenceUrl("https://developer.dejavoo.com/api/integrated")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "PIN Entry", "POS Integration"))
                                .build())
                        .build()
        );
    }

    private List<DeviceCatalogResponse.DeviceModelInfo> getValorModels() {
        return Arrays.asList(
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("VL100")
                        .category("Countertop Terminal")
                        .platform("Valor OS")
                        .integrationType("Full-Integrated")
                        .deploymentType("Countertop")
                        .notes("Android-based countertop terminal")
                        .sourceUrl("https://www.valorpaytech.com/products/vl100")
                        .requirements(Arrays.asList(
                                "Register for Valor Developer Portal",
                                "Download Valor SDK",
                                "Set up Android development environment",
                                "Configure test merchant account",
                                "Complete certification process"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Valor SDK")
                                .version("Android")
                                .downloadUrl("https://developer.valorpaytech.com/downloads/sdk")
                                .documentationUrl("https://developer.valorpaytech.com/docs")
                                .apiReferenceUrl("https://developer.valorpaytech.com/api")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "Android Apps", "Touch Screen"))
                                .build())
                        .build(),
                DeviceCatalogResponse.DeviceModelInfo.builder()
                        .model("VL110")
                        .category("Wireless Terminal")
                        .platform("Valor OS")
                        .integrationType("Full-Integrated")
                        .deploymentType("Wireless/Mobile")
                        .notes("Portable Android terminal with LTE and WiFi")
                        .sourceUrl("https://www.valorpaytech.com/products/vl110")
                        .requirements(Arrays.asList(
                                "Register for Valor Developer Portal",
                                "Download Valor SDK",
                                "Configure wireless settings",
                                "Obtain test SIM card",
                                "Complete mobile certification"
                        ))
                        .sdk(DeviceCatalogResponse.SdkInfo.builder()
                                .name("Valor SDK")
                                .version("Android")
                                .downloadUrl("https://developer.valorpaytech.com/downloads/sdk")
                                .documentationUrl("https://developer.valorpaytech.com/docs/mobile")
                                .apiReferenceUrl("https://developer.valorpaytech.com/api/mobile")
                                .supportedFeatures(Arrays.asList("EMV", "NFC/Contactless", "LTE", "WiFi", "Battery"))
                                .build())
                        .build()
        );
    }

    // Response mapper

    private DeviceResponse toDeviceResponse(PaymentDevice device) {
        String merchantName = null;
        String locationName = null;

        if (device.getMerchantId() != null) {
            merchantRepository.findByIdAndDeletedAtIsNull(device.getMerchantId())
                    .ifPresent(m -> {});
            merchantName = merchantRepository.findByIdAndDeletedAtIsNull(device.getMerchantId())
                    .map(Merchant::getBusinessName)
                    .orElse(null);
        }

        if (device.getMerchantLocationId() != null) {
            locationName = locationRepository.findById(device.getMerchantLocationId())
                    .map(MerchantLocation::getLocationName)
                    .orElse(null);
        }

        return DeviceResponse.builder()
                .id(device.getId())
                .uuid(device.getUuid())
                .merchantId(device.getMerchantId())
                .merchantName(merchantName)
                .merchantLocationId(device.getMerchantLocationId())
                .merchantLocationName(locationName)
                .manufacturer(device.getManufacturer())
                .model(device.getModel())
                .serialNumber(device.getSerialNumber())
                .category(device.getCategory())
                .platform(device.getPlatform())
                .deploymentType(device.getDeploymentType())
                .integrationType(device.getIntegrationType())
                .deviceName(device.getDeviceName())
                .locationDescription(device.getLocationDescription())
                .sdkType(device.getSdkType())
                .sdkVersion(device.getSdkVersion())
                .apiEndpoint(device.getApiEndpoint())
                .terminalId(device.getTerminalId())
                .merchantTerminalId(device.getMerchantTerminalId())
                .status(device.getStatus().name())
                .activationStatus(device.getActivationStatus().name())
                .onboardingChecklist(device.getOnboardingChecklist())
                .onboardingCompleted(device.getOnboardingCompleted())
                .onboardingCompletedAt(device.getOnboardingCompletedAt())
                .pciCompliant(device.getPciCompliant())
                .emvCertified(device.getEmvCertified())
                .contactlessEnabled(device.getContactlessEnabled())
                .supportContact(device.getSupportContact())
                .supportPhone(device.getSupportPhone())
                .supportUrl(device.getSupportUrl())
                .documentationUrl(device.getDocumentationUrl())
                .createdAt(device.getCreatedAt())
                .updatedAt(device.getUpdatedAt())
                .build();
    }
}

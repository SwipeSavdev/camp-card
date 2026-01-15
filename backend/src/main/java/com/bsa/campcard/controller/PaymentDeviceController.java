package com.bsa.campcard.controller;

import com.bsa.campcard.dto.device.*;
import com.bsa.campcard.entity.PaymentDevice;
import com.bsa.campcard.service.PaymentDeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Tag(name = "Payment Devices", description = "Payment device management endpoints")
public class PaymentDeviceController {

    private final PaymentDeviceService deviceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Create device", description = "Register a new payment device")
    public ResponseEntity<DeviceResponse> createDevice(
            @Valid @RequestBody CreateDeviceRequest request) {
        log.info("Creating device: {} {} - Serial: {}",
                request.getManufacturer(), request.getModel(), request.getSerialNumber());

        DeviceResponse device = deviceService.createDevice(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(device);
    }

    @GetMapping
    @Operation(summary = "Get devices", description = "List devices with optional filters")
    public ResponseEntity<Page<DeviceResponse>> getDevices(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        PaymentDevice.DeviceStatus deviceStatus = status != null
                ? PaymentDevice.DeviceStatus.valueOf(status.toUpperCase())
                : null;

        Page<DeviceResponse> devices = deviceService.getDevices(deviceStatus, search, pageable);

        return ResponseEntity.ok(devices);
    }

    @GetMapping("/{deviceId}")
    @Operation(summary = "Get device", description = "Get device details by ID")
    public ResponseEntity<DeviceResponse> getDevice(@PathVariable Long deviceId) {
        log.info("Fetching device: {}", deviceId);

        DeviceResponse device = deviceService.getDevice(deviceId);

        return ResponseEntity.ok(device);
    }

    @GetMapping("/uuid/{uuid}")
    @Operation(summary = "Get device by UUID", description = "Get device details by UUID")
    public ResponseEntity<DeviceResponse> getDeviceByUuid(@PathVariable UUID uuid) {
        log.info("Fetching device by UUID: {}", uuid);

        DeviceResponse device = deviceService.getDeviceByUuid(uuid);

        return ResponseEntity.ok(device);
    }

    @GetMapping("/merchant/{merchantId}")
    @Operation(summary = "Get merchant devices", description = "List all devices for a merchant")
    public ResponseEntity<List<DeviceResponse>> getDevicesByMerchant(@PathVariable Long merchantId) {
        log.info("Fetching devices for merchant: {}", merchantId);

        List<DeviceResponse> devices = deviceService.getDevicesByMerchant(merchantId);

        return ResponseEntity.ok(devices);
    }

    @GetMapping("/location/{locationId}")
    @Operation(summary = "Get location devices", description = "List all devices at a location")
    public ResponseEntity<List<DeviceResponse>> getDevicesByLocation(@PathVariable Long locationId) {
        log.info("Fetching devices for location: {}", locationId);

        List<DeviceResponse> devices = deviceService.getDevicesByLocation(locationId);

        return ResponseEntity.ok(devices);
    }

    @PutMapping("/{deviceId}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Update device", description = "Update device information")
    public ResponseEntity<DeviceResponse> updateDevice(
            @PathVariable Long deviceId,
            @Valid @RequestBody CreateDeviceRequest request) {
        log.info("Updating device: {}", deviceId);

        DeviceResponse device = deviceService.updateDevice(deviceId, request);

        return ResponseEntity.ok(device);
    }

    @PatchMapping("/{deviceId}/status")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Update device status", description = "Update device operational status")
    public ResponseEntity<DeviceResponse> updateDeviceStatus(
            @PathVariable Long deviceId,
            @RequestParam String status) {
        log.info("Updating device status: {} to {}", deviceId, status);

        PaymentDevice.DeviceStatus deviceStatus = PaymentDevice.DeviceStatus.valueOf(status.toUpperCase());

        DeviceResponse device = deviceService.updateDeviceStatus(deviceId, deviceStatus);

        return ResponseEntity.ok(device);
    }

    @PatchMapping("/{deviceId}/activation")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Update activation status", description = "Update device activation status")
    public ResponseEntity<DeviceResponse> updateActivationStatus(
            @PathVariable Long deviceId,
            @RequestParam String status) {
        log.info("Updating device activation status: {} to {}", deviceId, status);

        PaymentDevice.ActivationStatus activationStatus =
                PaymentDevice.ActivationStatus.valueOf(status.toUpperCase());

        DeviceResponse device = deviceService.updateActivationStatus(deviceId, activationStatus);

        return ResponseEntity.ok(device);
    }

    @PostMapping("/{deviceId}/complete-onboarding")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Complete onboarding", description = "Mark device onboarding as complete")
    public ResponseEntity<DeviceResponse> completeOnboarding(@PathVariable Long deviceId) {
        log.info("Completing onboarding for device: {}", deviceId);

        DeviceResponse device = deviceService.completeOnboarding(deviceId);

        return ResponseEntity.ok(device);
    }

    @PostMapping("/{deviceId}/assign")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Assign device", description = "Assign device to merchant and location")
    public ResponseEntity<DeviceResponse> assignToMerchant(
            @PathVariable Long deviceId,
            @RequestParam Long merchantId,
            @RequestParam(required = false) Long locationId) {
        log.info("Assigning device {} to merchant {} at location {}", deviceId, merchantId, locationId);

        DeviceResponse device = deviceService.assignToMerchant(deviceId, merchantId, locationId);

        return ResponseEntity.ok(device);
    }

    @PostMapping("/{deviceId}/unassign")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Unassign device", description = "Remove device assignment from merchant")
    public ResponseEntity<DeviceResponse> unassignFromMerchant(@PathVariable Long deviceId) {
        log.info("Unassigning device {} from merchant", deviceId);

        DeviceResponse device = deviceService.unassignFromMerchant(deviceId);

        return ResponseEntity.ok(device);
    }

    @DeleteMapping("/{deviceId}")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    @Operation(summary = "Delete device", description = "Soft delete device")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long deviceId) {
        log.info("Deleting device: {}", deviceId);

        deviceService.deleteDevice(deviceId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Get device statistics", description = "Get aggregate device stats")
    public ResponseEntity<DeviceStatsResponse> getDeviceStats() {
        log.info("Fetching device statistics");

        DeviceStatsResponse stats = deviceService.getDeviceStats();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/catalog")
    @Operation(summary = "Get device catalog", description = "Get supported device manufacturers and models")
    public ResponseEntity<DeviceCatalogResponse> getDeviceCatalog() {
        log.info("Fetching device catalog");

        DeviceCatalogResponse catalog = deviceService.getDeviceCatalog();

        return ResponseEntity.ok(catalog);
    }
}

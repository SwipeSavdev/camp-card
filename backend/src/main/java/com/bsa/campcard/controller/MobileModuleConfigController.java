package com.bsa.campcard.controller;

import com.bsa.campcard.dto.BulkModuleToggleRequest;
import com.bsa.campcard.dto.MobileModuleConfigRequest;
import com.bsa.campcard.dto.MobileModuleConfigResponse;
import com.bsa.campcard.service.MobileModuleConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config/modules")
@RequiredArgsConstructor
@Tag(name = "Mobile Module Config", description = "Manage mobile app feature modules")
@SecurityRequirement(name = "bearerAuth")
public class MobileModuleConfigController {

    private final MobileModuleConfigService service;

    @GetMapping
    @Operation(summary = "Get all mobile modules")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<List<MobileModuleConfigResponse>> getAllModules() {
        return ResponseEntity.ok(service.getAllModules());
    }

    @GetMapping("/{moduleId}")
    @Operation(summary = "Get a single module by its module ID")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<MobileModuleConfigResponse> getModule(@PathVariable String moduleId) {
        return ResponseEntity.ok(service.getModule(moduleId));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get modules by category")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<List<MobileModuleConfigResponse>> getModulesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.getModulesByCategory(category));
    }

    @PutMapping("/{moduleId}/toggle")
    @Operation(summary = "Toggle a single module enabled/disabled")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<MobileModuleConfigResponse> toggleModule(
            @PathVariable String moduleId,
            @RequestBody Map<String, Boolean> body
    ) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.toggleModule(moduleId, enabled));
    }

    @PutMapping("/bulk")
    @Operation(summary = "Bulk update module enabled/disabled states")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<List<MobileModuleConfigResponse>> bulkToggle(
            @Valid @RequestBody BulkModuleToggleRequest request
    ) {
        return ResponseEntity.ok(service.bulkToggle(request));
    }

    @PostMapping
    @Operation(summary = "Create a new module")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<MobileModuleConfigResponse> createModule(
            @Valid @RequestBody MobileModuleConfigRequest request
    ) {
        MobileModuleConfigResponse response = service.createModule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{moduleId}")
    @Operation(summary = "Update an existing module")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<MobileModuleConfigResponse> updateModule(
            @PathVariable String moduleId,
            @Valid @RequestBody MobileModuleConfigRequest request
    ) {
        return ResponseEntity.ok(service.updateModule(moduleId, request));
    }

    @DeleteMapping("/{moduleId}")
    @Operation(summary = "Delete a module")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<Void> deleteModule(@PathVariable String moduleId) {
        service.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset all modules to default configuration")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<List<MobileModuleConfigResponse>> resetToDefaults() {
        return ResponseEntity.ok(service.resetToDefaults());
    }
}

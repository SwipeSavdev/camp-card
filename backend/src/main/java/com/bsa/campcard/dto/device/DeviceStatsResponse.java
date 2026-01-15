package com.bsa.campcard.dto.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceStatsResponse {

    private Long totalDevices;
    private Long pendingDevices;
    private Long activeDevices;
    private Long inactiveDevices;
    private Long maintenanceDevices;
    private Long decommissionedDevices;

    private Map<String, Long> byManufacturer;
    private Map<String, Long> byStatus;
}

package com.bsa.campcard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkModuleToggleRequest {

    @NotNull(message = "Modules map is required")
    private Map<String, Boolean> modules;
}

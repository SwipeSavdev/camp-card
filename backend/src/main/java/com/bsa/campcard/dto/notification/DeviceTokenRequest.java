package com.bsa.campcard.dto.notification;

import com.bsa.campcard.entity.DeviceToken;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTokenRequest {
    
    @NotBlank(message = "Token is required")
    private String token;
    
    @NotNull(message = "Device type is required")
    private DeviceToken.DeviceType deviceType;
    
    private String deviceModel;
    
    private String osVersion;
    
    private String appVersion;
}

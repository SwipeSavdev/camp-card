package com.bsa.campcard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    // Role for admin updates
    private String role;

    // For admin updates - active status
    private Boolean isActive;

    // Unit type and number for Scouts
    private String unitType;
    private String unitNumber;
}

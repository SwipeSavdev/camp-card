package com.bsa.campcard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilRequest {

    @NotBlank(message = "Council number is required")
    @Size(max = 10, message = "Council number must be 10 characters or less")
    private String councilNumber;

    @NotBlank(message = "Council name is required")
    private String name;

    @Size(max = 50, message = "Short name must be 50 characters or less")
    private String shortName;

    @NotBlank(message = "Region is required")
    @Size(max = 50, message = "Region must be 50 characters or less")
    private String region;

    private String streetAddress;

    @Size(max = 100, message = "City must be 100 characters or less")
    private String city;

    @Size(max = 2, message = "State must be 2 characters")
    private String state;

    @Size(max = 10, message = "Zip code must be 10 characters or less")
    private String zipCode;

    @Size(max = 20, message = "Phone must be 20 characters or less")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 500, message = "Website URL must be 500 characters or less")
    private String websiteUrl;

    @Size(max = 500, message = "Logo URL must be 500 characters or less")
    private String logoUrl;

    // Personnel
    private String scoutExecutiveName;

    @Email(message = "Invalid scout executive email format")
    private String scoutExecutiveEmail;

    private String campCardCoordinatorName;

    @Email(message = "Invalid camp card coordinator email format")
    private String campCardCoordinatorEmail;

    @Size(max = 20, message = "Coordinator phone must be 20 characters or less")
    private String campCardCoordinatorPhone;

    // Campaign settings
    private LocalDate campaignStartDate;
    private LocalDate campaignEndDate;
    private BigDecimal goalAmount;

    // Status
    private String status;

    // Subscription
    private String subscriptionTier;
}

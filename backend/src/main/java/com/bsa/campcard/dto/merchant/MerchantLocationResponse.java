package com.bsa.campcard.dto.merchant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantLocationResponse {
    private Long id;
    private UUID uuid;
    private String locationName;
    private String streetAddress;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String hours;
    private Boolean primaryLocation;
    private Boolean active;
    private Double distanceKm; // Calculated field for nearby searches
}

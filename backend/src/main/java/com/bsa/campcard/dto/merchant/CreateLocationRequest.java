package com.bsa.campcard.dto.merchant;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLocationRequest {
    
    @NotBlank(message = "Location name is required")
    private String locationName;
    
    @NotBlank(message = "Street address is required")
    private String streetAddress;
    
    private String addressLine2;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Zip code is required")
    private String zipCode;
    
    private String country = "USA";
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    private String phone;
    private String hours;
    private Boolean primaryLocation = false;
}

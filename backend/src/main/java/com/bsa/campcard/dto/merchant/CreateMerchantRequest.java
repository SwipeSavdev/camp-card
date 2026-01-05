package com.bsa.campcard.dto.merchant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMerchantRequest {
    
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    private String dbaName;
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private String taxId;
    
    @NotBlank(message = "Contact name is required")
    private String contactName;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;
    
    private String contactPhone;
    
    private String websiteUrl;
    
    private String logoUrl;
    
    private String businessHours;
    
    private Boolean termsAccepted = false;
    
    // Primary location
    private CreateLocationRequest primaryLocation;
}

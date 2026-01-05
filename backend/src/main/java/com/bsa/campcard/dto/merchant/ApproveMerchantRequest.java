package com.bsa.campcard.dto.merchant;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveMerchantRequest {
    
    @NotBlank(message = "Action is required")
    private String action; // APPROVE or REJECT
    
    private String rejectionReason;
}

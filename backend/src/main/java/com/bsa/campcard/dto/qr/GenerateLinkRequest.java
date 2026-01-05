package com.bsa.campcard.dto.qr;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateLinkRequest {
    
    @NotNull(message = "Offer ID is required")
    private Long offerId;
    
    private Long userId; // Optional for tracking who shared
}

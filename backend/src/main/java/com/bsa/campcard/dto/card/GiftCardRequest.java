package com.bsa.campcard.dto.card;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to gift a camp card to someone
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftCardRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Valid recipient email is required")
    private String recipientEmail;

    // Optional personal message
    private String message;
}

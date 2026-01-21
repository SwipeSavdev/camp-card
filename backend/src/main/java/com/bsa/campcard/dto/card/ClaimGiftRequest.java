package com.bsa.campcard.dto.card;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to claim a gifted camp card
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimGiftRequest {

    // For new users claiming a gift
    @Email(message = "Valid email is required")
    private String email;

    private String firstName;
    private String lastName;
    private String password;

    // If the user is already logged in, they don't need to provide these
    // The token in the URL path is sufficient
}

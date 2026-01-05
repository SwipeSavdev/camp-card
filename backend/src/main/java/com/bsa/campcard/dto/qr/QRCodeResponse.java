package com.bsa.campcard.dto.qr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse {

    private UUID userId;
    private String uniqueCode;
    private String qrCodeData;
    private String shareableLink;
    private LocalDateTime validUntil;
    private String firstName;
    private String lastName;
}

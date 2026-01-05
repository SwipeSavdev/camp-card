package com.bsa.campcard.dto.qr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareableLinkResponse {
    
    private String uniqueCode;
    
    private String shareableLink;
    
    private Long offerId;
    
    private String merchantName;
    
    private Integer discountPercentage;
    
    private LocalDateTime expiresAt;
    
    private Integer maxUses;
    
    private Integer currentUses;
}

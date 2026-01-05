package com.bsa.campcard.dto.merchant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantResponse {
    private Long id;
    private UUID uuid;
    private String businessName;
    private String dbaName;
    private String description;
    private String category;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String websiteUrl;
    private String logoUrl;
    private String status;
    private Integer totalOffers;
    private Integer activeOffers;
    private Integer totalRedemptions;
    private List<MerchantLocationResponse> locations;
}

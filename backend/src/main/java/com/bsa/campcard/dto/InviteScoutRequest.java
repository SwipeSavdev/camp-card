package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteScoutRequest {
    private String email;
    private String scoutName;
}

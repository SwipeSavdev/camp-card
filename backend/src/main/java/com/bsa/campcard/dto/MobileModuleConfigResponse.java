package com.bsa.campcard.dto;

import com.bsa.campcard.entity.MobileModuleConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MobileModuleConfigResponse {

    private Long id;
    private String moduleId;
    private String name;
    private String description;
    private String category;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MobileModuleConfigResponse fromEntity(MobileModuleConfig entity) {
        return MobileModuleConfigResponse.builder()
                .id(entity.getId())
                .moduleId(entity.getModuleId())
                .name(entity.getName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .enabled(entity.getEnabled())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

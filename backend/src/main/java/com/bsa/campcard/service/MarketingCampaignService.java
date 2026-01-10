package com.bsa.campcard.service;

import com.bsa.campcard.dto.CampaignDTO;
import com.bsa.campcard.dto.SavedCampaignDTO;
import com.bsa.campcard.entity.MarketingCampaign;
import com.bsa.campcard.entity.MarketingCampaign.CampaignStatus;
import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
import com.bsa.campcard.entity.MarketingSegment;
import com.bsa.campcard.entity.SavedCampaign;
import com.bsa.campcard.entity.SavedCampaign.SaveType;
import com.bsa.campcard.repository.MarketingCampaignRepository;
import com.bsa.campcard.repository.MarketingSegmentRepository;
import com.bsa.campcard.repository.SavedCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketingCampaignService {

    private final MarketingCampaignRepository campaignRepository;
    private final SavedCampaignRepository savedCampaignRepository;
    private final MarketingSegmentRepository segmentRepository;

    @Transactional
    public CampaignDTO createCampaign(CampaignDTO dto, UUID userId, Long councilId) {
        MarketingCampaign campaign = new MarketingCampaign();
        mapDtoToEntity(dto, campaign);
        campaign.setCreatedBy(userId);
        campaign.setCouncilId(councilId);
        campaign.setStatus(CampaignStatus.DRAFT);

        MarketingCampaign saved = campaignRepository.save(campaign);
        log.info("Created campaign {} by user {}", saved.getId(), userId);

        return mapEntityToDto(saved);
    }

    @Transactional
    public CampaignDTO updateCampaign(Long id, CampaignDTO dto, UUID userId) {
        MarketingCampaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));

        mapDtoToEntity(dto, campaign);
        campaign.setUpdatedBy(userId);

        MarketingCampaign saved = campaignRepository.save(campaign);
        log.info("Updated campaign {} by user {}", saved.getId(), userId);

        return mapEntityToDto(saved);
    }

    public CampaignDTO getCampaign(Long id) {
        MarketingCampaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));
        return mapEntityToDto(campaign);
    }

    public CampaignDTO getCampaignByUuid(UUID uuid) {
        MarketingCampaign campaign = campaignRepository.findByUuid(uuid)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + uuid));
        return mapEntityToDto(campaign);
    }

    public Page<CampaignDTO> getCampaigns(Long councilId, CampaignStatus status,
                                           CampaignType type, String search, Pageable pageable) {
        Page<MarketingCampaign> campaigns;

        if (search != null && !search.isBlank()) {
            campaigns = campaignRepository.searchCampaigns(search, councilId, pageable);
        } else if (status != null) {
            campaigns = campaignRepository.findByCouncilIdAndStatus(councilId, status, pageable);
        } else if (type != null) {
            campaigns = campaignRepository.findByCouncilIdAndCampaignType(councilId, type, pageable);
        } else {
            campaigns = campaignRepository.findByCouncilId(councilId, pageable);
        }

        return campaigns.map(this::mapEntityToDto);
    }

    @Transactional
    public CampaignDTO updateCampaignStatus(Long id, CampaignStatus newStatus, UUID userId) {
        MarketingCampaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));

        CampaignStatus oldStatus = campaign.getStatus();
        campaign.setStatus(newStatus);
        campaign.setUpdatedBy(userId);

        if (newStatus == CampaignStatus.ACTIVE || newStatus == CampaignStatus.SENDING) {
            campaign.setStartedAt(LocalDateTime.now());
        } else if (newStatus == CampaignStatus.COMPLETED || newStatus == CampaignStatus.CANCELLED) {
            campaign.setCompletedAt(LocalDateTime.now());
        }

        MarketingCampaign saved = campaignRepository.save(campaign);
        log.info("Campaign {} status changed from {} to {} by user {}",
            id, oldStatus, newStatus, userId);

        return mapEntityToDto(saved);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
        log.info("Deleted campaign {}", id);
    }

    // Saved Campaigns (User Drafts & Templates)

    @Transactional
    public SavedCampaignDTO saveCampaign(SavedCampaignDTO dto, UUID userId, Long councilId) {
        SavedCampaign savedCampaign = new SavedCampaign();
        savedCampaign.setUserId(userId);
        savedCampaign.setCouncilId(councilId);
        savedCampaign.setName(dto.getName());
        savedCampaign.setDescription(dto.getDescription());
        savedCampaign.setCampaignConfig(dto.getCampaignConfig());
        savedCampaign.setSaveType(dto.getSaveType() != null ? dto.getSaveType() : SaveType.DRAFT);
        savedCampaign.setSourceCampaignId(dto.getSourceCampaignId());
        savedCampaign.setIsFavorite(dto.getIsFavorite() != null ? dto.getIsFavorite() : false);

        SavedCampaign saved = savedCampaignRepository.save(savedCampaign);
        log.info("Saved campaign {} by user {}", saved.getId(), userId);

        return mapSavedCampaignToDto(saved);
    }

    @Transactional
    public SavedCampaignDTO updateSavedCampaign(Long id, SavedCampaignDTO dto, UUID userId) {
        SavedCampaign savedCampaign = savedCampaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Saved campaign not found: " + id));

        if (!savedCampaign.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this saved campaign");
        }

        savedCampaign.setName(dto.getName());
        savedCampaign.setDescription(dto.getDescription());
        savedCampaign.setCampaignConfig(dto.getCampaignConfig());
        if (dto.getSaveType() != null) {
            savedCampaign.setSaveType(dto.getSaveType());
        }
        if (dto.getIsFavorite() != null) {
            savedCampaign.setIsFavorite(dto.getIsFavorite());
        }

        SavedCampaign saved = savedCampaignRepository.save(savedCampaign);
        log.info("Updated saved campaign {} by user {}", saved.getId(), userId);

        return mapSavedCampaignToDto(saved);
    }

    public Page<SavedCampaignDTO> getSavedCampaigns(UUID userId, SaveType saveType,
                                                      String search, Pageable pageable) {
        Page<SavedCampaign> campaigns;

        if (search != null && !search.isBlank()) {
            campaigns = savedCampaignRepository.searchByUserId(search, userId, pageable);
        } else if (saveType != null) {
            campaigns = savedCampaignRepository.findByUserIdAndSaveType(userId, saveType, pageable);
        } else {
            campaigns = savedCampaignRepository.findByUserId(userId, pageable);
        }

        return campaigns.map(this::mapSavedCampaignToDto);
    }

    public SavedCampaignDTO getSavedCampaign(Long id, UUID userId) {
        SavedCampaign saved = savedCampaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Saved campaign not found: " + id));

        if (!saved.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to view this saved campaign");
        }

        return mapSavedCampaignToDto(saved);
    }

    public List<SavedCampaignDTO> getFavorites(UUID userId) {
        return savedCampaignRepository.findByUserIdAndIsFavoriteTrue(userId)
            .stream()
            .map(this::mapSavedCampaignToDto)
            .toList();
    }

    @Transactional
    public void deleteSavedCampaign(Long id, UUID userId) {
        SavedCampaign saved = savedCampaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Saved campaign not found: " + id));

        if (!saved.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this saved campaign");
        }

        savedCampaignRepository.delete(saved);
        log.info("Deleted saved campaign {} by user {}", id, userId);
    }

    @Transactional
    public CampaignDTO createCampaignFromSaved(Long savedCampaignId, UUID userId, Long councilId) {
        SavedCampaign saved = savedCampaignRepository.findById(savedCampaignId)
            .orElseThrow(() -> new RuntimeException("Saved campaign not found: " + savedCampaignId));

        CampaignDTO dto = new CampaignDTO();
        Map<String, Object> config = saved.getCampaignConfig();

        dto.setName((String) config.get("name"));
        dto.setDescription((String) config.get("description"));
        dto.setCampaignType(CampaignType.valueOf((String) config.get("campaignType")));
        dto.setSubjectLine((String) config.get("subjectLine"));
        dto.setContentText((String) config.get("contentText"));
        dto.setContentHtml((String) config.get("contentHtml"));

        if (config.get("channels") instanceof List<?> channelList) {
            dto.setChannels(channelList.stream().map(Object::toString).toArray(String[]::new));
        }

        dto.setEnableGeofencing((Boolean) config.getOrDefault("enableGeofencing", false));
        dto.setEnableGamification((Boolean) config.getOrDefault("enableGamification", false));
        dto.setEnableAiOptimization((Boolean) config.getOrDefault("enableAiOptimization", true));

        return createCampaign(dto, userId, councilId);
    }

    // Segments

    public List<MarketingSegment> getAvailableSegments(Long councilId) {
        return segmentRepository.findAvailableSegments(councilId);
    }

    // Helper methods

    private void mapDtoToEntity(CampaignDTO dto, MarketingCampaign campaign) {
        campaign.setName(dto.getName());
        campaign.setDescription(dto.getDescription());
        campaign.setCampaignType(dto.getCampaignType());
        campaign.setSubjectLine(dto.getSubjectLine());
        campaign.setContentHtml(dto.getContentHtml());
        campaign.setContentText(dto.getContentText());
        campaign.setContentJson(dto.getContentJson());
        campaign.setAiGenerated(dto.getAiGenerated());
        campaign.setAiPrompt(dto.getAiPrompt());
        campaign.setAiModel(dto.getAiModel());
        campaign.setSegmentId(dto.getSegmentId());
        campaign.setTargetAudience(dto.getTargetAudience());
        campaign.setEstimatedReach(dto.getEstimatedReach());
        campaign.setChannels(dto.getChannels());
        campaign.setScheduledAt(dto.getScheduledAt());
        campaign.setEnableGeofencing(dto.getEnableGeofencing());
        campaign.setEnableGamification(dto.getEnableGamification());
        campaign.setEnableAiOptimization(dto.getEnableAiOptimization());
        campaign.setMerchantId(dto.getMerchantId());
        campaign.setOfferId(dto.getOfferId());
        campaign.setTags(dto.getTags());
        campaign.setMetadata(dto.getMetadata());
    }

    private CampaignDTO mapEntityToDto(MarketingCampaign campaign) {
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        dto.setUuid(campaign.getUuid());
        dto.setName(campaign.getName());
        dto.setDescription(campaign.getDescription());
        dto.setCampaignType(campaign.getCampaignType());
        dto.setStatus(campaign.getStatus());
        dto.setSubjectLine(campaign.getSubjectLine());
        dto.setContentHtml(campaign.getContentHtml());
        dto.setContentText(campaign.getContentText());
        dto.setContentJson(campaign.getContentJson());
        dto.setAiGenerated(campaign.getAiGenerated());
        dto.setAiPrompt(campaign.getAiPrompt());
        dto.setAiModel(campaign.getAiModel());
        dto.setSegmentId(campaign.getSegmentId());
        dto.setTargetAudience(campaign.getTargetAudience());
        dto.setEstimatedReach(campaign.getEstimatedReach());
        dto.setChannels(campaign.getChannels());
        dto.setScheduledAt(campaign.getScheduledAt());
        dto.setStartedAt(campaign.getStartedAt());
        dto.setCompletedAt(campaign.getCompletedAt());
        dto.setEnableGeofencing(campaign.getEnableGeofencing());
        dto.setEnableGamification(campaign.getEnableGamification());
        dto.setEnableAiOptimization(campaign.getEnableAiOptimization());
        dto.setMerchantId(campaign.getMerchantId());
        dto.setOfferId(campaign.getOfferId());
        dto.setTags(campaign.getTags());
        dto.setMetadata(campaign.getMetadata());
        dto.setCreatedBy(campaign.getCreatedBy());
        dto.setCreatedAt(campaign.getCreatedAt());
        dto.setUpdatedAt(campaign.getUpdatedAt());

        // Load segment name if available
        if (campaign.getSegmentId() != null) {
            segmentRepository.findById(campaign.getSegmentId())
                .ifPresent(segment -> dto.setSegmentName(segment.getName()));
        }

        return dto;
    }

    private SavedCampaignDTO mapSavedCampaignToDto(SavedCampaign saved) {
        SavedCampaignDTO dto = new SavedCampaignDTO();
        dto.setId(saved.getId());
        dto.setUuid(saved.getUuid());
        dto.setName(saved.getName());
        dto.setDescription(saved.getDescription());
        dto.setCampaignConfig(saved.getCampaignConfig());
        dto.setSaveType(saved.getSaveType());
        dto.setSourceCampaignId(saved.getSourceCampaignId());
        dto.setIsFavorite(saved.getIsFavorite());
        dto.setCreatedAt(saved.getCreatedAt());
        dto.setUpdatedAt(saved.getUpdatedAt());
        return dto;
    }
}

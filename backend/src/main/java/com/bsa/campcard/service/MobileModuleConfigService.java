package com.bsa.campcard.service;

import com.bsa.campcard.dto.BulkModuleToggleRequest;
import com.bsa.campcard.dto.MobileModuleConfigRequest;
import com.bsa.campcard.dto.MobileModuleConfigResponse;
import com.bsa.campcard.entity.MobileModuleConfig;
import com.bsa.campcard.repository.MobileModuleConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MobileModuleConfigService {

    private final MobileModuleConfigRepository repository;

    public List<MobileModuleConfigResponse> getAllModules() {
        return repository.findAllByOrderByCategoryAscNameAsc()
                .stream()
                .map(MobileModuleConfigResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public MobileModuleConfigResponse getModule(String moduleId) {
        MobileModuleConfig config = repository.findByModuleId(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        return MobileModuleConfigResponse.fromEntity(config);
    }

    public List<MobileModuleConfigResponse> getModulesByCategory(String category) {
        return repository.findByCategory(category)
                .stream()
                .map(MobileModuleConfigResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MobileModuleConfigResponse toggleModule(String moduleId, boolean enabled) {
        MobileModuleConfig config = repository.findByModuleId(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        config.setEnabled(enabled);
        MobileModuleConfig saved = repository.save(config);
        return MobileModuleConfigResponse.fromEntity(saved);
    }

    @Transactional
    public List<MobileModuleConfigResponse> bulkToggle(BulkModuleToggleRequest request) {
        Map<String, Boolean> modules = request.getModules();

        List<MobileModuleConfig> allConfigs = repository.findAll();
        for (MobileModuleConfig config : allConfigs) {
            if (modules.containsKey(config.getModuleId())) {
                config.setEnabled(modules.get(config.getModuleId()));
            }
        }
        List<MobileModuleConfig> saved = repository.saveAll(allConfigs);

        return saved.stream()
                .map(MobileModuleConfigResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MobileModuleConfigResponse createModule(MobileModuleConfigRequest request) {
        if (repository.findByModuleId(request.getModuleId()).isPresent()) {
            throw new IllegalArgumentException("Module already exists: " + request.getModuleId());
        }

        MobileModuleConfig config = new MobileModuleConfig();
        config.setModuleId(request.getModuleId());
        config.setName(request.getName());
        config.setDescription(request.getDescription());
        config.setCategory(request.getCategory());
        config.setEnabled(request.getEnabled());

        MobileModuleConfig saved = repository.save(config);
        return MobileModuleConfigResponse.fromEntity(saved);
    }

    @Transactional
    public MobileModuleConfigResponse updateModule(String moduleId, MobileModuleConfigRequest request) {
        MobileModuleConfig config = repository.findByModuleId(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));

        if (request.getName() != null) config.setName(request.getName());
        if (request.getDescription() != null) config.setDescription(request.getDescription());
        if (request.getCategory() != null) config.setCategory(request.getCategory());
        if (request.getEnabled() != null) config.setEnabled(request.getEnabled());

        MobileModuleConfig saved = repository.save(config);
        return MobileModuleConfigResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteModule(String moduleId) {
        MobileModuleConfig config = repository.findByModuleId(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        repository.delete(config);
    }

    @Transactional
    public List<MobileModuleConfigResponse> resetToDefaults() {
        // Delete all existing configs - the migration seeds will re-apply on next startup,
        // but for runtime reset we re-insert defaults programmatically.
        repository.deleteAll();

        List<MobileModuleConfig> defaults = List.of(
                createDefault("user_auth", "User Authentication", "Email/password login and account management", "auth", true),
                createDefault("biometric_login", "Biometric Login", "Fingerprint and face recognition authentication", "auth", true),
                createDefault("push_notifications", "Push Notifications", "Real-time push notifications for offers and updates", "engagement", true),
                createDefault("loyalty_points", "Loyalty Points", "Earn and redeem loyalty points on purchases", "engagement", true),
                createDefault("dark_mode", "Dark Mode", "Dark theme option for the mobile app", "ux", false),
                createDefault("offer_redemption", "Offer Redemption", "Scan and redeem merchant offers", "features", true),
                createDefault("scout_management", "Scout Management", "Scout recruiting and management features", "features", true),
                createDefault("social_sharing", "Social Sharing", "Share offers on social media platforms", "engagement", false),
                createDefault("offline_mode", "Offline Mode", "Access cached data without internet connection", "ux", false),
                createDefault("advanced_analytics", "Advanced Analytics", "User behavior tracking and analytics dashboard", "features", true)
        );

        List<MobileModuleConfig> saved = repository.saveAll(defaults);
        return saved.stream()
                .map(MobileModuleConfigResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private MobileModuleConfig createDefault(String moduleId, String name, String description, String category, boolean enabled) {
        MobileModuleConfig config = new MobileModuleConfig();
        config.setModuleId(moduleId);
        config.setName(name);
        config.setDescription(description);
        config.setCategory(category);
        config.setEnabled(enabled);
        return config;
    }
}

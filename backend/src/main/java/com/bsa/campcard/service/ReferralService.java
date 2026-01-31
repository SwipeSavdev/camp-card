package com.bsa.campcard.service;

import com.bsa.campcard.dto.referral.*;
import com.bsa.campcard.entity.Referral;
import com.bsa.campcard.entity.ReferralClick;
import org.bsa.campcard.domain.user.User;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.ReferralClickRepository;
import com.bsa.campcard.repository.ReferralRepository;
import org.bsa.campcard.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {
    
    private final ReferralRepository referralRepository;
    private final ReferralClickRepository referralClickRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String QR_CODE_PREFIX = "qr:user:";
    
    @Value("${app.referral.reward.amount:10.00}")
    private BigDecimal referralRewardAmount;
    
    @Value("${campcard.base-url:https://api.campcardapp.org}")
    private String baseUrl;

    @Value("${campcard.static-site-url:https://www.campcardapp.org}")
    private String staticSiteUrl;

    private static final String REFERRAL_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();
    
    /**
     * Get or generate user's referral code
     */
    public ReferralCodeResponse getUserReferralCode(UUID userId) {
        log.info("Getting referral code for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String referralCode = user.getReferralCode();
        
        // Generate new code if user doesn't have one
        if (referralCode == null || referralCode.isEmpty()) {
            referralCode = generateUniqueReferralCode();
            user.setReferralCode(referralCode);
            userRepository.save(user);
        }
        
        // Calculate statistics
        List<Referral> allReferrals = referralRepository.findByReferrerId(userId);
        Long successfulReferrals = referralRepository.countSuccessfulReferrals(userId);
        Double totalRewards = referralRepository.getTotalRewardsEarned(userId);
        
        BigDecimal pendingRewards = allReferrals.stream()
                .filter(r -> (r.getStatus() == Referral.ReferralStatus.COMPLETED ||
                              r.getStatus() == Referral.ReferralStatus.SUBSCRIBED) &&
                             Boolean.FALSE.equals(r.getRewardClaimed()))
                .map(Referral::getRewardAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Build subscribe URL based on user role
        String userName = URLEncoder.encode(
                user.getFirstName() + " " + user.getLastName(),
                StandardCharsets.UTF_8);

        String subscribeUrl;
        if (user.getRole() == User.UserRole.SCOUT) {
            // Scout referral - use QR code from Redis (matches what scout sees in app)
            // Points to /subscribe/ which is the dedicated scout referral landing page ($10)
            String qrCode = getQrCodeForUser(userId);
            String scoutCode = (qrCode != null) ? qrCode : referralCode;
            subscribeUrl = staticSiteUrl + "/subscribe/?scout=" + scoutCode + "&name=" + userName;
        } else {
            // Customer/Parent referral - $15/year via /buy-campcard/
            subscribeUrl = staticSiteUrl + "/buy-campcard/?ref=" + referralCode + "&refname=" + userName;
        }

        // Get click count — include clicks on the user's QR code (stored in Redis)
        // because the subscribe page tracks clicks using the QR code, not the referralCode
        long clickCount = referralClickRepository.countByReferralCode(referralCode);
        String qrCode = getQrCodeForUser(userId);
        if (qrCode != null && !qrCode.equals(referralCode)) {
            clickCount += referralClickRepository.countByReferralCode(qrCode);
        }

        return ReferralCodeResponse.builder()
                .referralCode(referralCode)
                .shareableLink(subscribeUrl)
                .totalReferrals(allReferrals.size())
                .successfulReferrals(successfulReferrals.intValue())
                .totalRewardsEarned(totalRewards != null ? BigDecimal.valueOf(totalRewards) : BigDecimal.ZERO)
                .pendingRewards(pendingRewards)
                .totalClicks(clickCount)
                .build();
    }
    
    /**
     * Apply referral code during user registration
     */
    @Transactional
    public void applyReferralCode(UUID newUserId, String referralCode) {
        log.info("Applying referral code {} for new user: {}", referralCode, newUserId);
        
        // Find the referrer by code
        User referrer = userRepository.findByReferralCode(referralCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid referral code"));
        
        // Prevent self-referral
        if (referrer.getId().equals(newUserId)) {
            throw new IllegalArgumentException("Cannot refer yourself");
        }
        
        // Check if user already has a referral
        List<Referral> existingReferrals = referralRepository.findByReferredUserId(newUserId);
        if (!existingReferrals.isEmpty()) {
            throw new IllegalStateException("User has already been referred");
        }
        
        // Create referral record
        Referral referral = Referral.builder()
                .referrerId(referrer.getId())
                .referredUserId(newUserId)
                .referralCode(referralCode)
                .status(Referral.ReferralStatus.PENDING)
                .rewardAmount(referralRewardAmount)
                .rewardClaimed(false)
                .build();
        
        referralRepository.save(referral);
        log.info("Referral created successfully: {}", referral.getId());
    }
    
    /**
     * Complete referral when referred user subscribes
     */
    @Transactional
    public void completeReferral(UUID userId) {
        log.info("Completing referral for user: {}", userId);
        
        List<Referral> referrals = referralRepository.findByReferredUserId(userId);
        
        for (Referral referral : referrals) {
            if (referral.getStatus() == Referral.ReferralStatus.PENDING) {
                referral.setStatus(Referral.ReferralStatus.SUBSCRIBED);
                referral.setCompletedAt(LocalDateTime.now());
                referralRepository.save(referral);

                log.info("Referral completed: {}", referral.getId());
            }
        }
    }
    
    /**
     * Claim referral reward
     */
    @Transactional
    public void claimReward(UUID userId, Long referralId) {
        log.info("Claiming reward for referral: {}", referralId);
        
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new ResourceNotFoundException("Referral not found"));
        
        if (!referral.getReferrerId().equals(userId)) {
            throw new IllegalArgumentException("This referral does not belong to you");
        }
        
        if (referral.getStatus() != Referral.ReferralStatus.COMPLETED &&
            referral.getStatus() != Referral.ReferralStatus.SUBSCRIBED) {
            throw new IllegalStateException("Referral is not completed yet");
        }
        
        if (referral.getRewardClaimed()) {
            throw new IllegalStateException("Reward has already been claimed");
        }
        
        // Mark as claimed
        referral.setRewardClaimed(true);
        referral.setRewardClaimedAt(LocalDateTime.now());
        referral.setStatus(Referral.ReferralStatus.REWARDED);
        referralRepository.save(referral);

        log.info("Reward claimed successfully for referral: {}", referralId);
    }
    
    /**
     * Get user's referral history
     */
    public List<ReferralResponse> getUserReferrals(UUID userId) {
        log.info("Getting referrals for user: {}", userId);
        
        List<Referral> referrals = referralRepository.findByReferrerId(userId);
        
        return referrals.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Track a click on a referral or scout link.
     * This is a public endpoint — no authentication required.
     */
    @Transactional
    public void trackClick(String code, String source, String ipAddress, String userAgent, String referer) {
        if (code == null || code.isBlank()) {
            log.warn("trackClick called with empty code");
            return;
        }

        log.info("Tracking click for code: {} source: {} ip: {}", code, source, ipAddress);

        ReferralClick click = ReferralClick.builder()
                .referralCode(code)
                .source(source)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .referer(referer)
                .build();

        referralClickRepository.save(click);
    }

    /**
     * Get click count for a specific referral code.
     */
    public long getClickCount(String referralCode) {
        return referralClickRepository.countByReferralCode(referralCode);
    }

    /**
     * Generate a unique referral code
     */
    private String generateUniqueReferralCode() {
        String code;
        int attempts = 0;
        int maxAttempts = 10;
        
        do {
            code = generateRandomCode();
            attempts++;
            
            if (attempts >= maxAttempts) {
                throw new IllegalStateException("Failed to generate unique referral code");
            }
        } while (userRepository.findByReferralCode(code).isPresent());
        
        return code;
    }
    
    /**
     * Generate a random alphanumeric code
     */
    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(REFERRAL_CODE_CHARS.charAt(random.nextInt(REFERRAL_CODE_CHARS.length())));
        }
        return sb.toString();
    }
    
    /**
     * Look up a user's QR code from Redis.
     * Scout QR codes are stored as "qr:user:{userId}" → code (e.g. "SC-945F31BB").
     */
    private String getQrCodeForUser(UUID userId) {
        try {
            Object value = redisTemplate.opsForValue().get(QR_CODE_PREFIX + userId.toString());
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            log.warn("Failed to look up QR code for user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Get scout stats for the dashboard: link clicks, QR scans, referral counts, earnings.
     */
    public Map<String, Object> getScoutStats(UUID userId) {
        log.info("Getting scout stats for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String referralCode = user.getReferralCode();
        String qrCode = getQrCodeForUser(userId);

        // Build list of all codes belonging to this user
        List<String> codes = new ArrayList<>();
        if (referralCode != null && !referralCode.isBlank()) codes.add(referralCode);
        if (qrCode != null && !qrCode.isBlank() && !codes.contains(qrCode)) codes.add(qrCode);

        // Count clicks by source
        long linkClicks = 0;
        long qrScans = 0;
        long totalClicks = 0;

        if (!codes.isEmpty()) {
            totalClicks = referralClickRepository.countByReferralCodeIn(codes);
            qrScans = referralClickRepository.countByReferralCodeInAndSource(codes, "qr");
            linkClicks = totalClicks - qrScans;
        }

        // Get referral counts
        List<Referral> allReferrals = referralRepository.findByReferrerId(userId);
        long directReferrals = allReferrals.stream()
                .filter(r -> r.getStatus() != Referral.ReferralStatus.PENDING)
                .count();
        long totalSubscribers = allReferrals.stream()
                .filter(r -> r.getStatus() == Referral.ReferralStatus.SUBSCRIBED ||
                             r.getStatus() == Referral.ReferralStatus.COMPLETED ||
                             r.getStatus() == Referral.ReferralStatus.REWARDED)
                .count();

        // Calculate earnings
        Double totalRewards = referralRepository.getTotalRewardsEarned(userId);
        double totalEarnings = totalRewards != null ? totalRewards : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubscribers", totalSubscribers);
        stats.put("directReferrals", directReferrals);
        stats.put("indirectReferrals", 0); // Chain referrals not yet implemented
        stats.put("linkClicks", linkClicks);
        stats.put("qrScans", qrScans);
        stats.put("totalEarnings", totalEarnings);
        stats.put("redemptionsUsed", 0); // TODO: integrate with offer redemptions
        stats.put("savingsEarned", 0.0); // TODO: integrate with savings tracking
        return stats;
    }

    private ReferralResponse toResponse(Referral referral) {
        User referredUser = userRepository.findById(referral.getReferredUserId()).orElse(null);
        
        return ReferralResponse.builder()
                .id(referral.getId())
                .referredUserId(referral.getReferredUserId())
                .referredUserName(referredUser != null 
                        ? referredUser.getFirstName() + " " + referredUser.getLastName() 
                        : "Unknown")
                .referredUserEmail(referredUser != null ? referredUser.getEmail() : "")
                .status(referral.getStatus().name())
                .rewardAmount(referral.getRewardAmount())
                .rewardClaimed(referral.getRewardClaimed())
                .createdAt(referral.getCreatedAt())
                .completedAt(referral.getCompletedAt())
                .build();
    }
}

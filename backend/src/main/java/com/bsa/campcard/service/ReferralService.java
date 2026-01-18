package com.bsa.campcard.service;

import com.bsa.campcard.dto.referral.*;
import com.bsa.campcard.entity.Referral;
import org.bsa.campcard.domain.user.User;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.ReferralRepository;
import org.bsa.campcard.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {
    
    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    
    @Value("${app.referral.reward.amount:10.00}")
    private BigDecimal referralRewardAmount;
    
    @Value("${app.base.url:https://campcardapp.com}")
    private String baseUrl;
    
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
                .filter(r -> r.getStatus() == Referral.ReferralStatus.COMPLETED && Boolean.FALSE.equals(r.getRewardClaimed()))
                .map(Referral::getRewardAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Build subscribe URL with customer referral tracking
        // Customer referrals show $15 tier and include the referring customer's code
        String customerName = URLEncoder.encode(
                user.getFirstName() + " " + user.getLastName(),
                StandardCharsets.UTF_8);
        String subscribeUrl = baseUrl + "/campcard/subscribe/?ref=" + referralCode + "&refname=" + customerName;

        return ReferralCodeResponse.builder()
                .referralCode(referralCode)
                .shareableLink(subscribeUrl)
                .totalReferrals(allReferrals.size())
                .successfulReferrals(successfulReferrals.intValue())
                .totalRewardsEarned(totalRewards != null ? BigDecimal.valueOf(totalRewards) : BigDecimal.ZERO)
                .pendingRewards(pendingRewards)
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
                referral.setStatus(Referral.ReferralStatus.COMPLETED);
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
        
        if (referral.getStatus() != Referral.ReferralStatus.COMPLETED) {
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

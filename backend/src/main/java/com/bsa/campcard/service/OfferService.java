package com.bsa.campcard.service;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.entity.*;
import com.bsa.campcard.entity.Offer.DiscountType;
import com.bsa.campcard.entity.Offer.OfferStatus;
import com.bsa.campcard.entity.OfferRedemption.RedemptionStatus;
import com.bsa.campcard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferRedemptionRepository redemptionRepository;
    private final MerchantRepository merchantRepository;
    private final OfferScanAttemptRepository scanAttemptRepository;

    /**
     * Helper method to enrich an offer with merchant data
     */
    private OfferResponse enrichWithMerchant(Offer offer, Map<Long, Merchant> merchantCache) {
        Merchant merchant = merchantCache.get(offer.getMerchantId());
        if (merchant != null) {
            return OfferResponse.fromEntity(offer, merchant.getBusinessName(), merchant.getLogoUrl());
        }
        return OfferResponse.fromEntity(offer);
    }

    /**
     * Helper method to enrich an offer with merchant and user redemption data
     */
    private OfferResponse enrichWithMerchantAndUserData(Offer offer, Map<Long, Merchant> merchantCache, Map<Long, Integer> userRedemptionCache) {
        Merchant merchant = merchantCache.get(offer.getMerchantId());
        int userRedemptionCount = userRedemptionCache.getOrDefault(offer.getId(), 0);
        String businessName = merchant != null ? merchant.getBusinessName() : null;
        String logoUrl = merchant != null ? merchant.getLogoUrl() : null;
        return OfferResponse.fromEntityWithUserData(offer, businessName, logoUrl, userRedemptionCount);
    }

    /**
     * Helper method to build user redemption cache from a list of offers
     */
    private Map<Long, Integer> buildUserRedemptionCache(List<Offer> offers, UUID userId) {
        if (userId == null || offers.isEmpty()) {
            return Map.of();
        }
        List<Long> offerIds = offers.stream().map(Offer::getId).collect(Collectors.toList());
        List<Object[]> results = redemptionRepository.countUserRedemptionsByOfferIds(userId, offerIds);
        return results.stream().collect(Collectors.toMap(
            r -> (Long) r[0],
            r -> ((Number) r[1]).intValue()
        ));
    }

    /**
     * Helper method to build merchant cache from a list of offers
     */
    private Map<Long, Merchant> buildMerchantCache(List<Offer> offers) {
        Set<Long> merchantIds = offers.stream()
            .map(Offer::getMerchantId)
            .collect(Collectors.toSet());
        return merchantRepository.findAllById(merchantIds).stream()
            .collect(Collectors.toMap(Merchant::getId, m -> m));
    }
    
    @Transactional
    public OfferResponse createOffer(CreateOfferRequest request) {
        // Validate merchant exists and is approved
        Merchant merchant = merchantRepository.findById(request.getMerchantId())
            .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));
        
        if (merchant.getStatus() != Merchant.MerchantStatus.APPROVED) {
            throw new IllegalStateException("Only approved merchants can create offers");
        }
        
        // Validate dates
        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new IllegalArgumentException("Valid until date must be after valid from date");
        }
        
        Offer offer = new Offer();
        offer.setMerchantId(request.getMerchantId());
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        offer.setDiscountValue(request.getDiscountValue());
        offer.setMinPurchaseAmount(request.getMinPurchaseAmount());
        offer.setMaxDiscountAmount(request.getMaxDiscountAmount());
        offer.setCategory(request.getCategory());
        offer.setTerms(request.getTerms());
        offer.setImageUrl(request.getImageUrl());
        offer.setValidFrom(request.getValidFrom());
        offer.setValidUntil(request.getValidUntil());
        offer.setUsageLimit(request.getUsageLimit());
        offer.setUsageLimitPerUser(request.getUsageLimitPerUser());
        offer.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        offer.setScoutExclusive(request.getScoutExclusive() != null ? request.getScoutExclusive() : false);
        offer.setRequiresQrVerification(request.getRequiresQrVerification() != null ? request.getRequiresQrVerification() : true);
        offer.setLocationSpecific(request.getLocationSpecific() != null ? request.getLocationSpecific() : false);
        offer.setMerchantLocationId(request.getMerchantLocationId());
        // TODO: Uncomment after DBA adds barcode column
        // offer.setBarcode(request.getBarcode());
        offer.setStatus(OfferStatus.ACTIVE);
        
        Offer savedOffer = offerRepository.save(offer);

        // Update merchant offer counts
        updateMerchantOfferCounts(merchant.getId());

        return OfferResponse.fromEntity(savedOffer, merchant.getBusinessName(), merchant.getLogoUrl());
    }
    
    @Transactional
    public OfferResponse updateOffer(Long offerId, CreateOfferRequest request) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        
        if (request.getTitle() != null) offer.setTitle(request.getTitle());
        if (request.getDescription() != null) offer.setDescription(request.getDescription());
        if (request.getDiscountType() != null) offer.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        if (request.getDiscountValue() != null) offer.setDiscountValue(request.getDiscountValue());
        if (request.getMinPurchaseAmount() != null) offer.setMinPurchaseAmount(request.getMinPurchaseAmount());
        if (request.getMaxDiscountAmount() != null) offer.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getCategory() != null) offer.setCategory(request.getCategory());
        if (request.getTerms() != null) offer.setTerms(request.getTerms());
        if (request.getImageUrl() != null) offer.setImageUrl(request.getImageUrl());
        if (request.getValidFrom() != null) offer.setValidFrom(request.getValidFrom());
        if (request.getValidUntil() != null) offer.setValidUntil(request.getValidUntil());
        if (request.getUsageLimit() != null) offer.setUsageLimit(request.getUsageLimit());
        if (request.getUsageLimitPerUser() != null) offer.setUsageLimitPerUser(request.getUsageLimitPerUser());
        if (request.getFeatured() != null) offer.setFeatured(request.getFeatured());
        if (request.getScoutExclusive() != null) offer.setScoutExclusive(request.getScoutExclusive());
        // TODO: Uncomment after DBA adds barcode column
        // if (request.getBarcode() != null) offer.setBarcode(request.getBarcode());

        Offer updatedOffer = offerRepository.save(offer);
        Merchant merchant = merchantRepository.findById(updatedOffer.getMerchantId()).orElse(null);
        if (merchant != null) {
            return OfferResponse.fromEntity(updatedOffer, merchant.getBusinessName(), merchant.getLogoUrl());
        }
        return OfferResponse.fromEntity(updatedOffer);
    }
    
    public OfferResponse getOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        Merchant merchant = merchantRepository.findById(offer.getMerchantId()).orElse(null);
        if (merchant != null) {
            return OfferResponse.fromEntity(offer, merchant.getBusinessName(), merchant.getLogoUrl());
        }
        return OfferResponse.fromEntity(offer);
    }

    public Page<OfferResponse> getActiveOffers(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        Page<Offer> offerPage = offerRepository.findActiveOffers(OfferStatus.ACTIVE, now, pageable);
        Map<Long, Merchant> merchantCache = buildMerchantCache(offerPage.getContent());
        return offerPage.map(offer -> enrichWithMerchant(offer, merchantCache));
    }

    /**
     * Get active offers with user-specific redemption data
     * This allows filtering out offers the user has already fully redeemed
     */
    public Page<OfferResponse> getActiveOffersForUser(UUID userId, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        Page<Offer> offerPage = offerRepository.findActiveOffers(OfferStatus.ACTIVE, now, pageable);
        Map<Long, Merchant> merchantCache = buildMerchantCache(offerPage.getContent());
        Map<Long, Integer> userRedemptionCache = buildUserRedemptionCache(offerPage.getContent(), userId);
        return offerPage.map(offer -> enrichWithMerchantAndUserData(offer, merchantCache, userRedemptionCache));
    }

    public Page<OfferResponse> getMerchantOffers(Long merchantId, Pageable pageable) {
        Merchant merchant = merchantRepository.findById(merchantId).orElse(null);
        return offerRepository.findByMerchantId(merchantId, pageable)
            .map(offer -> {
                if (merchant != null) {
                    return OfferResponse.fromEntity(offer, merchant.getBusinessName(), merchant.getLogoUrl());
                }
                return OfferResponse.fromEntity(offer);
            });
    }

    public Page<OfferResponse> getOffersByCategory(String category, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        Page<Offer> offerPage = offerRepository.findActiveByCategoryAndStatus(category, OfferStatus.ACTIVE, now, pageable);
        Map<Long, Merchant> merchantCache = buildMerchantCache(offerPage.getContent());
        return offerPage.map(offer -> enrichWithMerchant(offer, merchantCache));
    }

    public Page<OfferResponse> getFeaturedOffers(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        List<Offer> offersList = offerRepository.findFeaturedOffers(OfferStatus.ACTIVE, now, pageable);
        Map<Long, Merchant> merchantCache = buildMerchantCache(offersList);
        List<OfferResponse> responses = offersList.stream()
                .map(offer -> enrichWithMerchant(offer, merchantCache))
                .toList();
        return new org.springframework.data.domain.PageImpl<>(responses, pageable, responses.size());
    }

    public Page<OfferResponse> searchOffers(String search, Pageable pageable) {
        Page<Offer> offerPage = offerRepository.searchOffers(search, OfferStatus.ACTIVE, pageable);
        Map<Long, Merchant> merchantCache = buildMerchantCache(offerPage.getContent());
        return offerPage.map(offer -> enrichWithMerchant(offer, merchantCache));
    }
    
    @Transactional
    public OfferRedemptionResponse redeemOffer(RedeemOfferRequest request) {
        // Validate offer exists and is active
        Offer offer = offerRepository.findById(request.getOfferId())
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        
        if (!offer.isValid()) {
            throw new IllegalStateException("Offer is not valid or has expired");
        }
        
        // Check user redemption count
        int userRedemptionCount = redemptionRepository.countUserRedemptions(
            request.getUserId(), 
            request.getOfferId()
        );
        
        if (!offer.canRedeem(userRedemptionCount)) {
            throw new IllegalStateException("User has reached redemption limit for this offer");
        }
        
        // Calculate discount
        BigDecimal discountAmount = offer.calculateDiscount(request.getPurchaseAmount());
        BigDecimal finalAmount = request.getPurchaseAmount() != null 
            ? request.getPurchaseAmount().subtract(discountAmount)
            : BigDecimal.ZERO;
        
        // Create redemption record
        OfferRedemption redemption = new OfferRedemption();
        redemption.setOfferId(offer.getId());
        redemption.setUserId(request.getUserId());
        redemption.setMerchantId(offer.getMerchantId());
        redemption.setMerchantLocationId(request.getMerchantLocationId());
        redemption.setPurchaseAmount(request.getPurchaseAmount());
        redemption.setDiscountAmount(discountAmount);
        redemption.setFinalAmount(finalAmount);
        redemption.setNotes(request.getNotes());
        redemption.setStatus(RedemptionStatus.PENDING);
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        redemption.setVerificationCode(verificationCode);
        
        OfferRedemption savedRedemption = redemptionRepository.save(redemption);
        
        // Increment offer redemption count
        offer.setTotalRedemptions(offer.getTotalRedemptions() + 1);
        offerRepository.save(offer);
        
        // Update merchant redemption stats
        updateMerchantRedemptionStats(offer.getMerchantId());
        
        return OfferRedemptionResponse.fromEntity(savedRedemption);
    }
    
    @Transactional
    public OfferRedemptionResponse verifyRedemption(String verificationCode, UUID verifierId) {
        OfferRedemption redemption = redemptionRepository.findByVerificationCode(verificationCode)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification code"));
        
        if (redemption.getStatus() != RedemptionStatus.PENDING) {
            throw new IllegalStateException("Redemption has already been processed");
        }
        
        redemption.verify(verifierId);
        redemption.complete();
        
        OfferRedemption verified = redemptionRepository.save(redemption);
        return OfferRedemptionResponse.fromEntity(verified);
    }
    
    public Page<OfferRedemptionResponse> getUserRedemptions(UUID userId, Pageable pageable) {
        return redemptionRepository.findUserRedemptionHistory(userId, pageable)
            .map(OfferRedemptionResponse::fromEntity);
    }
    
    public Page<OfferRedemptionResponse> getMerchantRedemptions(Long merchantId, Pageable pageable) {
        return redemptionRepository.findByMerchantId(merchantId, pageable)
            .map(OfferRedemptionResponse::fromEntity);
    }
    
    @Transactional
    public void pauseOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        offer.setStatus(OfferStatus.PAUSED);
        offerRepository.save(offer);
        updateMerchantOfferCounts(offer.getMerchantId());
    }
    
    @Transactional
    public void resumeOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        offer.setStatus(OfferStatus.ACTIVE);
        offerRepository.save(offer);
        updateMerchantOfferCounts(offer.getMerchantId());
    }
    
    @Transactional
    public void deleteOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found"));
        Long merchantId = offer.getMerchantId();

        // Delete related records first to avoid FK constraint violations
        scanAttemptRepository.deleteByOfferId(offerId);
        redemptionRepository.deleteByOfferId(offerId);

        offerRepository.delete(offer);
        updateMerchantOfferCounts(merchantId);
    }
    
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void expireOldOffers() {
        LocalDateTime now = LocalDateTime.now();
        List<Offer> expiredOffers = offerRepository.findByStatusAndValidUntilBefore(
            OfferStatus.ACTIVE, 
            now
        );
        
        expiredOffers.forEach(offer -> {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            updateMerchantOfferCounts(offer.getMerchantId());
        });
    }
    
    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    @Transactional
    public void expireOldRedemptions() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<OfferRedemption> oldRedemptions = redemptionRepository
            .findByStatusAndCreatedAtBefore(RedemptionStatus.PENDING, cutoff);
        
        oldRedemptions.forEach(redemption -> {
            redemption.setStatus(RedemptionStatus.EXPIRED);
            redemptionRepository.save(redemption);
        });
    }
    
    private void updateMerchantOfferCounts(Long merchantId) {
        Merchant merchant = merchantRepository.findById(merchantId).orElse(null);
        if (merchant == null) return;
        
        long activeCount = offerRepository.countByMerchantIdAndStatus(merchantId, OfferStatus.ACTIVE);
        long totalCount = offerRepository.findByMerchantId(merchantId, Pageable.unpaged()).getTotalElements();
        
        merchant.setActiveOffers((int) activeCount);
        merchant.setTotalOffers((int) totalCount);
        merchantRepository.save(merchant);
    }
    
    private void updateMerchantRedemptionStats(Long merchantId) {
        Merchant merchant = merchantRepository.findById(merchantId).orElse(null);
        if (merchant == null) return;
        
        // Count could be calculated from all merchant offers' redemptions
        // For simplicity, increment the counter
        merchant.setTotalRedemptions(merchant.getTotalRedemptions() + 1);
        merchantRepository.save(merchant);
    }
    
    private String generateVerificationCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}

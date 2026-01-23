package com.bsa.campcard.service;

import com.bsa.campcard.dto.card.*;
import com.bsa.campcard.entity.CampCard;
import com.bsa.campcard.entity.CampCard.CampCardStatus;
import com.bsa.campcard.entity.CardOrder;
import com.bsa.campcard.entity.CardOrder.PaymentStatus;
import com.bsa.campcard.entity.Offer;
import com.bsa.campcard.entity.SubscriptionPlan;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampCardService {

    private final CampCardRepository campCardRepository;
    private final CardOrderRepository cardOrderRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserRepository userRepository;
    private final CouncilRepository councilRepository;
    private final OfferRepository offerRepository;
    private final OfferRedemptionRepository offerRedemptionRepository;
    private final EmailService emailService;
    private final PaymentService paymentService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String CLAIM_TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // ==================== PURCHASE OPERATIONS ====================

    // In-app direct purchase price: $15/card
    private static final int IN_APP_PRICE_CENTS = 1500;

    /**
     * Purchase multiple camp cards
     */
    @Transactional
    public PurchaseCardsResponse purchaseCards(UUID userId, PurchaseCardsRequest request) {
        log.info("Processing card purchase for user: {}, quantity: {}", userId, request.getQuantity());

        int unitPriceCents;
        int totalPriceCents;

        // If paymentToken is provided, payment was already processed at in-app price
        // Otherwise, look up plan for price
        if (request.getPaymentToken() != null && !request.getPaymentToken().isBlank() && request.getPlanId() == null) {
            // Direct in-app purchase with pre-processed payment
            unitPriceCents = IN_APP_PRICE_CENTS;
            totalPriceCents = unitPriceCents * request.getQuantity();
            log.info("Processing direct in-app purchase at ${}/card", unitPriceCents / 100.0);
        } else if (request.getPlanId() != null) {
            // Plan-based purchase
            SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndDeletedAtIsNull(request.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
            unitPriceCents = plan.getPriceCents();
            totalPriceCents = unitPriceCents * request.getQuantity();
        } else {
            throw new IllegalArgumentException("Either planId or paymentToken is required");
        }

        // Get user's council for payment gateway routing
        User user = userRepository.findById(userId).orElse(null);
        Long councilId = null;
        if (user != null && user.getCouncilId() != null) {
            councilId = councilRepository.findByUuid(user.getCouncilId())
                    .map(com.bsa.campcard.entity.Council::getId)
                    .orElse(null);
        }

        // Look up scout by referral code if provided
        UUID scoutId = null;
        if (request.getScoutCode() != null && !request.getScoutCode().isBlank()) {
            User scout = userRepository.findByReferralCode(request.getScoutCode()).orElse(null);
            if (scout != null && scout.getRole() == User.UserRole.SCOUT) {
                scoutId = scout.getId();
            }
        }

        // Create the order
        CardOrder order = CardOrder.builder()
                .userId(userId)
                .quantity(request.getQuantity())
                .unitPriceCents(unitPriceCents)
                .totalPriceCents(totalPriceCents)
                .scoutCode(request.getScoutCode())
                .scoutId(scoutId)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        order = cardOrderRepository.save(order);
        log.info("Card order created: {}", order.getId());

        // Process payment (if payment token/transaction ID provided)
        // The paymentToken is actually the transactionId from Accept Hosted flow
        if (request.getPaymentToken() != null && !request.getPaymentToken().isBlank()) {
            try {
                // Verify the payment via Authorize.net using council-specific gateway
                com.bsa.campcard.dto.payment.PaymentResponse paymentResponse =
                        paymentService.verifySubscriptionPayment(councilId, request.getPaymentToken());

                if ("SUCCESS".equals(paymentResponse.getStatus())) {
                    order.markAsPaid(paymentResponse.getTransactionId());
                    order = cardOrderRepository.save(order);
                    log.info("Payment verified for order {} via council {} gateway", order.getId(), councilId);
                } else {
                    log.error("Payment verification failed for order {}: {}", order.getId(), paymentResponse.getErrorMessage());
                    throw new IllegalStateException("Payment verification failed: " + paymentResponse.getErrorMessage());
                }
            } catch (com.bsa.campcard.exception.PaymentException e) {
                log.error("Payment processing failed for order {}: {}", order.getId(), e.getMessage());
                throw new IllegalStateException("Payment processing failed: " + e.getMessage());
            }
        } else {
            // No payment token - mark as paid for testing (remove in production)
            log.warn("No payment token provided for order {}. Marking as paid for testing.", order.getId());
            order.markAsPaid("TEST-" + System.currentTimeMillis());
            order = cardOrderRepository.save(order);
        }

        // Generate camp cards
        List<CampCard> cards = new ArrayList<>();
        LocalDateTime expiresAt = getDecember31stExpiry();

        for (int i = 0; i < request.getQuantity(); i++) {
            String cardNumber = generateUniqueCardNumber();

            CampCard card = CampCard.builder()
                    .cardNumber(cardNumber)
                    .ownerUserId(userId)
                    .originalPurchaserId(userId)
                    .purchaseOrderId(order.getId())
                    .purchaseTransactionId(order.getTransactionId())
                    .status(i == 0 ? CampCardStatus.ACTIVE : CampCardStatus.UNASSIGNED) // First card is active
                    .activatedAt(i == 0 ? LocalDateTime.now() : null)
                    .expiresAt(expiresAt)
                    .scoutAttributionId(scoutId)
                    .referralDepth(0)
                    .build();

            card = campCardRepository.save(card);
            cards.add(card);
            log.info("Camp card created: {} with status {}", card.getCardNumber(), card.getStatus());
        }

        // Build response
        List<CampCardResponse> cardResponses = cards.stream()
                .map(this::toCardResponse)
                .collect(Collectors.toList());

        return PurchaseCardsResponse.builder()
                .orderId(order.getUuid())
                .transactionId(order.getTransactionId())
                .cards(cardResponses)
                .quantity(order.getQuantity())
                .unitPriceCents(order.getUnitPriceCents())
                .totalPriceCents(order.getTotalPriceCents())
                .paymentStatus(order.getPaymentStatus().name())
                .build();
    }

    // ==================== CARD RETRIEVAL ====================

    /**
     * Get user's complete card inventory
     */
    public MyCardsResponse getMyCards(UUID userId) {
        log.info("Fetching cards for user: {}", userId);

        LocalDateTime now = LocalDateTime.now();

        // Get active card
        CampCard activeCard = campCardRepository.findActiveCardByUserId(userId).orElse(null);

        // Get unused cards
        List<CampCard> unusedCards = campCardRepository.findUnusedCardsByUserId(userId, now);

        // Get gifted cards (pending claim)
        List<CampCard> giftedCards = campCardRepository.findGiftedCardsByUserId(userId);

        // Get historical cards (replaced, expired)
        List<CampCard> allCards = campCardRepository.findByOwnerUserId(userId);
        List<CampCard> historicalCards = allCards.stream()
                .filter(c -> c.getStatus() == CampCardStatus.REPLACED ||
                             c.getStatus() == CampCardStatus.EXPIRED ||
                             c.getStatus() == CampCardStatus.REVOKED)
                .collect(Collectors.toList());

        // Calculate totals
        Long totalSavingsCents = campCardRepository.getTotalSavingsByUser(userId);
        Long totalOffersUsed = campCardRepository.getTotalOffersUsedByUser(userId);

        return MyCardsResponse.builder()
                .activeCard(activeCard != null ? toCardResponse(activeCard) : null)
                .unusedCards(unusedCards.stream().map(this::toCardResponse).collect(Collectors.toList()))
                .giftedCards(giftedCards.stream().map(this::toCardResponse).collect(Collectors.toList()))
                .historicalCards(historicalCards.stream().map(this::toCardResponse).collect(Collectors.toList()))
                .totalCards(allCards.size())
                .activeCards(activeCard != null ? 1 : 0)
                .unusedCardsCount(unusedCards.size())
                .giftedCardsCount(giftedCards.size())
                .totalSavings(totalSavingsCents != null ? totalSavingsCents / 100.0 : 0.0)
                .totalOffersUsed(totalOffersUsed != null ? totalOffersUsed.intValue() : 0)
                .build();
    }

    /**
     * Get a single card by ID
     */
    public CampCardResponse getCard(UUID userId, Long cardId) {
        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership
        if (!card.getOwnerUserId().equals(userId) && !card.getOriginalPurchaserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        return toCardResponse(card);
    }

    /**
     * Get a single card by UUID
     */
    public CampCardResponse getCardByUuid(UUID userId, UUID cardUuid) {
        CampCard card = campCardRepository.findByUuid(cardUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership
        if (!card.getOwnerUserId().equals(userId) && !card.getOriginalPurchaserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        return toCardResponse(card);
    }

    /**
     * Get card expiry status for mobile alerts
     */
    public CardExpiryStatusResponse getExpiryStatus(UUID userId) {
        log.info("Getting expiry status for user: {}", userId);

        LocalDateTime now = LocalDateTime.now();

        // Get all non-expired, non-revoked cards for the user
        List<CampCard> cards = campCardRepository.findByOwnerUserId(userId).stream()
                .filter(c -> c.getStatus() == CampCardStatus.ACTIVE || c.getStatus() == CampCardStatus.UNASSIGNED)
                .filter(c -> c.getExpiresAt() != null && c.getExpiresAt().isAfter(now))
                .collect(Collectors.toList());

        if (cards.isEmpty()) {
            return CardExpiryStatusResponse.builder()
                    .daysUntilExpiry(365)
                    .expiringCardCount(0)
                    .totalActiveCards(0)
                    .earliestExpiry(null)
                    .build();
        }

        // Find earliest expiry date
        LocalDateTime earliestExpiry = cards.stream()
                .map(CampCard::getExpiresAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);

        // Calculate days until earliest expiry
        int daysUntilExpiry = earliestExpiry != null
                ? (int) java.time.temporal.ChronoUnit.DAYS.between(now.toLocalDate(), earliestExpiry.toLocalDate())
                : 365;

        // Count cards expiring within 30 days
        LocalDateTime threshold = now.plusDays(30);
        int expiringCount = (int) cards.stream()
                .filter(c -> c.getExpiresAt() != null && c.getExpiresAt().isBefore(threshold))
                .count();

        return CardExpiryStatusResponse.builder()
                .daysUntilExpiry(Math.max(0, daysUntilExpiry))
                .expiringCardCount(expiringCount)
                .totalActiveCards(cards.size())
                .earliestExpiry(earliestExpiry != null ? earliestExpiry.toLocalDate() : null)
                .build();
    }

    // ==================== CARD ACTIVATION (REPLENISHMENT) ====================

    /**
     * Activate a card (for replenishing offers)
     */
    @Transactional
    public CampCardResponse activateCard(UUID userId, Long cardId) {
        log.info("Activating card {} for user {}", cardId, userId);

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership
        if (!card.getOwnerUserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        // Verify card can be activated
        if (!card.canBeUsedForReplenishment()) {
            throw new IllegalStateException("Card cannot be activated. Status: " + card.getStatus());
        }

        // Deactivate current active card if exists
        campCardRepository.findActiveCardByUserId(userId).ifPresent(currentActive -> {
            currentActive.markAsReplaced(cardId);
            campCardRepository.save(currentActive);
            log.info("Previous active card {} marked as replaced", currentActive.getId());
        });

        // Activate the new card
        card.activate();
        card = campCardRepository.save(card);

        // Clear offer redemptions for this user (replenish offers)
        offerRedemptionRepository.deleteByUserId(userId);
        log.info("Offers replenished for user {}", userId);

        return toCardResponse(card);
    }

    // ==================== GIFT OPERATIONS ====================

    /**
     * Gift a card to someone via email
     */
    @Transactional
    public CampCardResponse giftCard(UUID userId, Long cardId, GiftCardRequest request) {
        log.info("Gifting card {} from user {} to {}", cardId, userId, request.getRecipientEmail());

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership
        if (!card.getOwnerUserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        // Verify card can be gifted
        if (!card.canBeGifted()) {
            throw new IllegalStateException("Card cannot be gifted. Status: " + card.getStatus());
        }

        // Generate claim token
        String claimToken = generateClaimToken();

        // Mark card as gifted
        card.markAsGifted(request.getRecipientEmail(), request.getMessage(), claimToken);
        card = campCardRepository.save(card);

        // TODO: Send gift email to recipient
        sendGiftEmail(card, userId);

        log.info("Card {} gifted to {} with token {}", cardId, request.getRecipientEmail(), claimToken);

        return toCardResponse(card);
    }

    /**
     * Cancel a pending gift
     */
    @Transactional
    public CampCardResponse cancelGift(UUID userId, Long cardId) {
        log.info("Canceling gift for card {} by user {}", cardId, userId);

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership (original purchaser)
        if (!card.getOriginalPurchaserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        // Verify card is in gifted status
        if (card.getStatus() != CampCardStatus.GIFTED) {
            throw new IllegalStateException("Card is not in gifted status");
        }

        // Cancel the gift
        card.cancelGift();
        card.setOwnerUserId(userId); // Return to original owner
        card = campCardRepository.save(card);

        log.info("Gift canceled for card {}", cardId);

        return toCardResponse(card);
    }

    /**
     * Resend gift email
     */
    @Transactional
    public CampCardResponse resendGiftEmail(UUID userId, Long cardId) {
        log.info("Resending gift email for card {} by user {}", cardId, userId);

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership (original purchaser)
        if (!card.getOriginalPurchaserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        // Verify card is in gifted status
        if (card.getStatus() != CampCardStatus.GIFTED) {
            throw new IllegalStateException("Card is not in gifted status");
        }

        // Resend gift email
        sendGiftEmail(card, userId);

        log.info("Gift email resent for card {}", cardId);

        return toCardResponse(card);
    }

    /**
     * Get gift details by claim token (public endpoint)
     */
    public GiftDetailsResponse getGiftDetails(String claimToken) {
        log.info("Getting gift details for token: {}", claimToken);

        CampCard card = campCardRepository.findByGiftClaimToken(claimToken)
                .orElseThrow(() -> new ResourceNotFoundException("Gift not found or already claimed"));

        // Get sender info
        String senderName = "A Camp Card user";
        String senderEmail = "";
        if (card.getOriginalPurchaserId() != null) {
            Optional<User> senderOpt = userRepository.findById(card.getOriginalPurchaserId());
            if (senderOpt.isPresent()) {
                User sender = senderOpt.get();
                senderName = sender.getFullName();
                senderEmail = sender.getEmail();
            }
        }

        boolean isExpired = card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDateTime.now());
        boolean isClaimed = card.getGiftClaimedAt() != null;

        return GiftDetailsResponse.builder()
                .cardNumber(card.getCardNumber())
                .senderName(senderName)
                .senderEmail(senderEmail)
                .message(card.getGiftMessage())
                .giftedAt(card.getGiftedAt())
                .expiresAt(card.getExpiresAt())
                .claimed(isClaimed)
                .claimedAt(card.getGiftClaimedAt())
                .expired(isExpired)
                .build();
    }

    /**
     * Claim a gifted card
     */
    @Transactional
    public CampCardResponse claimGift(String claimToken, UUID newOwnerId) {
        log.info("Claiming gift with token {} for user {}", claimToken, newOwnerId);

        CampCard card = campCardRepository.findByGiftClaimToken(claimToken)
                .orElseThrow(() -> new ResourceNotFoundException("Gift not found or already claimed"));

        // Verify card is still in gifted status
        if (card.getStatus() != CampCardStatus.GIFTED) {
            throw new IllegalStateException("Gift has already been claimed");
        }

        // Check if expired
        if (card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Gift has expired");
        }

        // Claim the gift
        card.claimGift(newOwnerId);
        card = campCardRepository.save(card);

        // TODO: Send confirmation email to original purchaser
        sendGiftClaimedEmail(card);

        log.info("Gift claimed: card {} now owned by {}", card.getId(), newOwnerId);

        return toCardResponse(card);
    }

    // ==================== ADMIN OPERATIONS ====================

    /**
     * Get all cards (admin)
     */
    public Page<CampCardResponse> getAllCards(Pageable pageable) {
        return campCardRepository.findAllOrderByCreatedAtDesc(pageable)
                .map(this::toCardResponse);
    }

    /**
     * Get cards by status (admin)
     */
    public Page<CampCardResponse> getCardsByStatus(CampCardStatus status, Pageable pageable) {
        return campCardRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable)
                .map(this::toCardResponse);
    }

    /**
     * Revoke a card (admin)
     */
    @Transactional
    public CampCardResponse revokeCard(Long cardId) {
        log.info("Revoking card {}", cardId);

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        card.revoke();
        card = campCardRepository.save(card);

        log.info("Card {} revoked", cardId);

        return toCardResponse(card);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate a unique card number in format CC-XXXX-XXXX-XXXX
     */
    private String generateUniqueCardNumber() {
        String cardNumber;
        int attempts = 0;
        do {
            cardNumber = "CC-" +
                    randomHexString(4).toUpperCase() + "-" +
                    randomHexString(4).toUpperCase() + "-" +
                    randomHexString(4).toUpperCase();
            attempts++;
            if (attempts > 100) {
                throw new IllegalStateException("Unable to generate unique card number");
            }
        } while (campCardRepository.existsByCardNumber(cardNumber));

        return cardNumber;
    }

    /**
     * Generate a secure claim token
     */
    private String generateClaimToken() {
        StringBuilder token = new StringBuilder(64);
        for (int i = 0; i < 64; i++) {
            token.append(CLAIM_TOKEN_CHARS.charAt(SECURE_RANDOM.nextInt(CLAIM_TOKEN_CHARS.length())));
        }
        return token.toString();
    }

    /**
     * Generate random hex string
     */
    private String randomHexString(int length) {
        byte[] bytes = new byte[length];
        SECURE_RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.substring(0, length);
    }

    /**
     * Get December 31st expiry date for current year
     */
    private LocalDateTime getDecember31stExpiry() {
        int year = LocalDateTime.now().getYear();
        return LocalDateTime.of(year, Month.DECEMBER, 31, 23, 59, 59);
    }

    /**
     * Get total available offers count
     */
    private int getTotalAvailableOffers() {
        // Count active offers
        Long count = offerRepository.countByStatus(Offer.OfferStatus.ACTIVE);
        return count != null ? count.intValue() : 0;
    }

    /**
     * Send gift notification email
     */
    private void sendGiftEmail(CampCard card, UUID senderId) {
        User sender = userRepository.findById(senderId).orElse(null);
        if (sender == null) {
            log.warn("Cannot send gift email - sender not found: {}", senderId);
            return;
        }

        String senderName = sender.getFullName();
        String recipientEmail = card.getGiftedToEmail();
        // Recipient name not stored on card - will be personalized when they claim
        String recipientName = null;
        String giftMessage = card.getGiftMessage();
        String claimToken = card.getGiftClaimToken();
        String cardNumber = card.getCardNumber();
        java.time.LocalDate expirationDate = card.getExpiresAt().toLocalDate();

        // Send gift notification to recipient
        emailService.sendGiftCardNotification(
            recipientEmail,
            senderName,
            recipientName,
            giftMessage,
            claimToken,
            cardNumber,
            expirationDate
        );

        // Send confirmation to sender
        emailService.sendGiftSentConfirmation(
            sender.getEmail(),
            senderName,
            recipientEmail,
            recipientName,
            cardNumber,
            expirationDate
        );

        log.info("Gift emails sent for card {} to recipient {} from sender {}",
            card.getId(), recipientEmail, sender.getEmail());
    }

    /**
     * Send gift claimed confirmation to original purchaser
     */
    private void sendGiftClaimedEmail(CampCard card) {
        if (card.getOriginalPurchaserId() == null) {
            log.warn("Cannot send gift claimed email - no original purchaser for card: {}", card.getId());
            return;
        }

        User sender = userRepository.findById(card.getOriginalPurchaserId()).orElse(null);
        if (sender == null) {
            log.warn("Cannot send gift claimed email - sender not found: {}", card.getOriginalPurchaserId());
            return;
        }

        User recipient = null;
        if (card.getOwnerUserId() != null) {
            recipient = userRepository.findById(card.getOwnerUserId()).orElse(null);
        }

        String recipientName = recipient != null ? recipient.getFullName() : card.getGiftedToEmail();
        String recipientEmail = recipient != null ? recipient.getEmail() : card.getGiftedToEmail();

        emailService.sendGiftClaimedNotification(
            sender.getEmail(),
            sender.getFullName(),
            recipientName,
            recipientEmail,
            card.getCardNumber()
        );

        log.info("Gift claimed email sent to original purchaser {} for card {}",
            sender.getEmail(), card.getId());
    }

    /**
     * Convert CampCard entity to response DTO
     */
    private CampCardResponse toCardResponse(CampCard card) {
        int totalOffers = getTotalAvailableOffers();

        String scoutName = null;
        if (card.getScoutAttributionId() != null) {
            scoutName = userRepository.findById(card.getScoutAttributionId())
                    .map(User::getFullName)
                    .orElse(null);
        }

        return CampCardResponse.builder()
                .id(card.getId())
                .uuid(card.getUuid())
                .cardNumber(card.getCardNumber())
                .status(card.getStatus().name())
                .activatedAt(card.getActivatedAt())
                .expiresAt(card.getExpiresAt())
                .createdAt(card.getCreatedAt())
                .giftedAt(card.getGiftedAt())
                .giftedToEmail(card.getGiftedToEmail())
                .giftMessage(card.getGiftMessage())
                .giftClaimedAt(card.getGiftClaimedAt())
                .offersUsed(card.getOffersUsed() != null ? card.getOffersUsed() : 0)
                .totalOffers(totalOffers)
                .totalSavings(card.getTotalSavingsCents() != null ? card.getTotalSavingsCents() / 100.0 : 0.0)
                .scoutAttributionId(card.getScoutAttributionId())
                .scoutName(scoutName)
                .replacedByCardId(card.getReplacedByCardId())
                .build();
    }
}

package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.ChargeRequest;
import com.bsa.campcard.dto.payment.PaymentResponse;
import com.bsa.campcard.dto.payment.SubscriptionCheckoutRequest;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseRequest;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseResponse;
import com.bsa.campcard.entity.Referral;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.repository.ReferralRepository;
import com.bsa.campcard.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import com.bsa.campcard.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionPurchaseService {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ReferralRepository referralRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.referral.reward.amount:10.00}")
    private BigDecimal referralRewardAmount;

    private static final String QR_CODE_PREFIX = "qr:user:";

    /**
     * Complete a subscription purchase after successful payment.
     * 1. Verify the transaction with Authorize.Net
     * 2. Create user account
     * 3. Generate unique card number
     * 4. Create annual subscription
     * 5. Return auth tokens for immediate login
     */
    @Transactional
    public SubscriptionPurchaseResponse completePurchase(SubscriptionPurchaseRequest request) {
        log.info("Processing subscription purchase for: {}", request.getEmail());

        try {
            // Step 1: Verify the payment transaction
            PaymentResponse paymentResponse = paymentService.verifySubscriptionPayment(request.getTransactionId());

            if (!"SUCCESS".equals(paymentResponse.getStatus())) {
                log.error("Payment verification failed for transaction: {}", request.getTransactionId());
                return SubscriptionPurchaseResponse.builder()
                        .success(false)
                        .errorMessage("Payment verification failed. Please contact support.")
                        .errorCode("PAYMENT_VERIFICATION_FAILED")
                        .build();
            }

            // Step 2: Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Email already registered: {}", request.getEmail());
                return SubscriptionPurchaseResponse.builder()
                        .success(false)
                        .errorMessage("An account with this email already exists. Please login instead.")
                        .errorCode("EMAIL_EXISTS")
                        .build();
            }

            // Step 3: Create user account
            String cardNumber = generateUniqueCardNumber();

            User user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phoneNumber(request.getPhone())
                    .role(User.UserRole.PARENT)
                    .emailVerified(true) // Auto-verify since they paid
                    .cardNumber(cardNumber)
                    .isActive(true)
                    .build();

            user = userRepository.save(user);
            log.info("User created with ID: {} and card number: {}", user.getId(), cardNumber);

            // Step 4: Resolve Scout attribution through referral chain
            UUID rootScoutId = null;
            int referralDepth = 0;
            String effectiveReferralCode = null;

            // Direct Scout referral ($10/year tier)
            if (request.getScoutCode() != null && !request.getScoutCode().isEmpty()) {
                effectiveReferralCode = request.getScoutCode();
                // Look up the Scout by their QR code
                rootScoutId = findScoutByCode(request.getScoutCode());
                referralDepth = 1; // Direct from Scout
                log.info("Direct Scout referral: code={}, scoutId={}", request.getScoutCode(), rootScoutId);
            }
            // Customer referral ($15/year tier) - trace back to original Scout
            else if (request.getCustomerRefCode() != null && !request.getCustomerRefCode().isEmpty()) {
                effectiveReferralCode = request.getCustomerRefCode();
                // Find the customer who referred and trace their rootScoutId
                var referrerChain = findReferralChain(request.getCustomerRefCode());
                if (referrerChain != null) {
                    rootScoutId = referrerChain.rootScoutId();
                    referralDepth = referrerChain.depth() + 1;
                    log.info("Customer referral chain: code={}, rootScoutId={}, depth={}",
                            request.getCustomerRefCode(), rootScoutId, referralDepth);
                }
            }
            // Legacy referralCode field for backwards compatibility
            else if (request.getReferralCode() != null && !request.getReferralCode().isEmpty()) {
                effectiveReferralCode = request.getReferralCode();
                rootScoutId = findScoutByCode(request.getReferralCode());
                referralDepth = 1;
                log.info("Legacy referral code: {}", request.getReferralCode());
            }

            // Step 5: Create annual subscription with Scout attribution
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusYears(1);

            Subscription subscription = Subscription.builder()
                    .userId(user.getId())
                    .councilId(1L) // Default council
                    .planId(1L) // Default annual plan
                    .referralCode(effectiveReferralCode)
                    .rootScoutId(rootScoutId) // Original Scout in the chain
                    .referralDepth(referralDepth)
                    .currentPeriodStart(now)
                    .currentPeriodEnd(expiresAt)
                    .status(Subscription.SubscriptionStatus.ACTIVE)
                    .cancelAtPeriodEnd(false)
                    .stripeSubscriptionId(request.getTransactionId()) // Store Authorize.Net transaction ID
                    .cardNumber(cardNumber)
                    .build();

            subscription = subscriptionRepository.save(subscription);
            log.info("Subscription created with ID: {} expires: {} rootScoutId: {} depth: {}",
                    subscription.getId(), expiresAt, rootScoutId, referralDepth);

            // Step 6: Generate auth tokens for immediate login
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            // Create Referral record so the scout's referral stats are updated
            if (rootScoutId != null) {
                createReferralRecord(rootScoutId, user.getId(), effectiveReferralCode);
                log.info("Scout {} credited for subscription (depth: {})", rootScoutId, referralDepth);
            }

            log.info("Subscription purchase completed successfully for: {}", request.getEmail());

            return SubscriptionPurchaseResponse.builder()
                    .success(true)
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .cardNumber(cardNumber)
                    .subscriptionStatus("ACTIVE")
                    .subscriptionExpiresAt(expiresAt)
                    .transactionId(request.getTransactionId())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();

        } catch (Exception e) {
            log.error("Error completing subscription purchase", e);
            return SubscriptionPurchaseResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorCode("INTERNAL_ERROR")
                    .build();
        }
    }

    /**
     * Generate a unique Camp Card number.
     * Format: CC-XXXX-XXXX-XXXX (16 digits total)
     */
    private String generateUniqueCardNumber() {
        String cardNumber;
        int attempts = 0;
        int maxAttempts = 10;
        java.util.Random random = new java.util.Random();

        do {
            // Generate random 12 digits
            long randomNum = Math.abs(random.nextLong()) % 1000000000000L;
            String digits = String.format("%012d", randomNum);

            // Format as CC-XXXX-XXXX-XXXX
            cardNumber = String.format("CC-%s-%s-%s",
                    digits.substring(0, 4),
                    digits.substring(4, 8),
                    digits.substring(8, 12));

            attempts++;
        } while (subscriptionRepository.existsByCardNumber(cardNumber) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Fallback to UUID-based generation
            String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
            cardNumber = String.format("CC-%s-%s-%s",
                    uuid.substring(0, 4),
                    uuid.substring(4, 8),
                    uuid.substring(8, 12));
        }

        return cardNumber;
    }

    /**
     * Find a Scout's user ID by their QR code.
     * The QR code is stored in Redis with key pattern "qr:user:{userId}" -> uniqueCode
     * We need to reverse lookup: find the userId that has this uniqueCode.
     *
     * @param code The unique QR code from the ?scout= parameter
     * @return The Scout's user ID, or null if not found or user is inactive
     */
    private UUID findScoutByCode(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }

        // First, try to find in Redis (reverse lookup through all QR codes)
        String pattern = QR_CODE_PREFIX + "*";
        var keys = redisTemplate.keys(pattern);

        if (keys != null) {
            for (String key : keys) {
                String storedCode = (String) redisTemplate.opsForValue().get(key);
                if (code.equals(storedCode)) {
                    String userIdStr = key.replace(QR_CODE_PREFIX, "");
                    try {
                        UUID userId = UUID.fromString(userIdStr);
                        // Verify this user is actually a Scout and is active
                        Optional<User> userOpt = userRepository.findById(userId);
                        if (userOpt.isPresent()) {
                            User user = userOpt.get();
                            if (user.getRole() == User.UserRole.SCOUT &&
                                Boolean.TRUE.equals(user.getIsActive()) &&
                                user.getDeletedAt() == null) {
                                return userId;
                            }
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid UUID in Redis key: {}", key);
                    }
                }
            }
        }

        // Fallback: check if the code matches a user's referralCode field
        Optional<User> userByRefCode = userRepository.findByReferralCode(code);
        if (userByRefCode.isPresent()) {
            User user = userByRefCode.get();
            if (user.getRole() == User.UserRole.SCOUT &&
                Boolean.TRUE.equals(user.getIsActive()) &&
                user.getDeletedAt() == null) {
                return user.getId();
            }
        }

        // Fallback: handle mobile app fallback codes in format "SC-{first8CharsOfUUID}"
        // The mobile app generates these locally when the QR code API fails
        if (code.startsWith("SC-") && code.length() == 11) {
            String uuidPrefix = code.substring(3).toLowerCase();
            // Search for a Scout user whose UUID starts with this prefix
            List<User> scouts = userRepository.findByRole(User.UserRole.SCOUT,
                    org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();
            for (User scout : scouts) {
                if (scout.getId().toString().replace("-", "").startsWith(uuidPrefix) &&
                    Boolean.TRUE.equals(scout.getIsActive()) &&
                    scout.getDeletedAt() == null) {
                    log.info("Matched SC- fallback code {} to scout {}", code, scout.getId());
                    // Store in Redis so future lookups are faster
                    try {
                        redisTemplate.opsForValue().set(
                                QR_CODE_PREFIX + scout.getId().toString(), code,
                                30, java.util.concurrent.TimeUnit.DAYS);
                    } catch (Exception e) {
                        log.warn("Failed to cache SC- code in Redis: {}", e.getMessage());
                    }
                    return scout.getId();
                }
            }
        }

        log.warn("Could not find active Scout for code: {}", code);
        return null;
    }

    /**
     * Find the referral chain for a customer referral code.
     * When a customer refers someone, we need to trace back to the original Scout
     * who started the chain.
     *
     * The chain works as follows:
     * - Scout refers Customer A (depth=1, rootScoutId=Scout)
     * - Customer A refers Customer B (depth=2, rootScoutId=Scout)
     * - Customer B refers Customer C (depth=3, rootScoutId=Scout)
     * All customers in the chain maintain the same rootScoutId.
     *
     * @param code The unique QR code from the ?ref= parameter
     * @return ReferralChainInfo with the rootScoutId and current depth, or null if not found
     */
    private ReferralChainInfo findReferralChain(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }

        // First, find the user who has this QR code
        UUID referrerUserId = null;

        // Check Redis for the QR code
        String pattern = QR_CODE_PREFIX + "*";
        var keys = redisTemplate.keys(pattern);

        if (keys != null) {
            for (String key : keys) {
                String storedCode = (String) redisTemplate.opsForValue().get(key);
                if (code.equals(storedCode)) {
                    String userIdStr = key.replace(QR_CODE_PREFIX, "");
                    try {
                        referrerUserId = UUID.fromString(userIdStr);
                        break;
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid UUID in Redis key: {}", key);
                    }
                }
            }
        }

        // Fallback: check referralCode field
        if (referrerUserId == null) {
            Optional<User> userByRefCode = userRepository.findByReferralCode(code);
            if (userByRefCode.isPresent()) {
                referrerUserId = userByRefCode.get().getId();
            }
        }

        if (referrerUserId == null) {
            log.warn("Could not find referrer user for code: {}", code);
            return null;
        }

        // Verify the referrer is active
        Optional<User> referrerOpt = userRepository.findById(referrerUserId);
        if (referrerOpt.isEmpty() ||
            !Boolean.TRUE.equals(referrerOpt.get().getIsActive()) ||
            referrerOpt.get().getDeletedAt() != null) {
            log.warn("Referrer user is not active: {}", referrerUserId);
            return null;
        }

        // Find the referrer's subscription to get their rootScoutId and depth
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserIdAndStatus(
                referrerUserId, Subscription.SubscriptionStatus.ACTIVE);

        if (subscriptionOpt.isEmpty()) {
            // Try to find any subscription for this user (even expired)
            subscriptionOpt = subscriptionRepository.findByUserIdAndDeletedAtIsNull(referrerUserId);
        }

        if (subscriptionOpt.isPresent()) {
            Subscription subscription = subscriptionOpt.get();
            UUID rootScoutId = subscription.getRootScoutId();
            Integer depth = subscription.getReferralDepth();

            if (rootScoutId != null) {
                // Verify the root Scout is still active
                Optional<User> rootScoutOpt = userRepository.findById(rootScoutId);
                if (rootScoutOpt.isPresent() &&
                    Boolean.TRUE.equals(rootScoutOpt.get().getIsActive()) &&
                    rootScoutOpt.get().getDeletedAt() == null) {
                    return new ReferralChainInfo(rootScoutId, depth != null ? depth : 1);
                } else {
                    log.info("Root Scout {} is no longer active, chain tracking ends", rootScoutId);
                    return null;
                }
            }
        }

        log.warn("Could not find subscription chain for referrer: {}", referrerUserId);
        return null;
    }

    /**
     * Record to hold referral chain information.
     * Contains the original Scout ID and the current depth in the referral chain.
     */
    private record ReferralChainInfo(UUID rootScoutId, int depth) {}

    /**
     * Create a Referral entity record so the scout's referral stats
     * (displayed via GET /referrals/my-code) are accurately counted.
     */
    private void createReferralRecord(UUID scoutId, UUID referredUserId, String referralCode) {
        try {
            // Generate a unique per-referral code because the DB has a UNIQUE constraint
            // on referrals.referral_code (and the same scout code is used for many referrals).
            String uniqueRefCode = referralCode + "-" + UUID.randomUUID().toString().substring(0, 8);

            Referral referral = Referral.builder()
                    .referrerId(scoutId)
                    .referredUserId(referredUserId)
                    .referralCode(uniqueRefCode)
                    .status(Referral.ReferralStatus.SUBSCRIBED) // DB CHECK allows SUBSCRIBED, not COMPLETED
                    .rewardAmount(referralRewardAmount)
                    .rewardClaimed(false)
                    .completedAt(LocalDateTime.now())
                    .build();

            referralRepository.save(referral);
            log.info("Referral record created: scout={} referredUser={} code={}", scoutId, referredUserId, uniqueRefCode);
        } catch (Exception e) {
            // Log but don't fail the purchase — the subscription is already created
            log.error("Failed to create referral record for scout={} referredUser={}: {}", scoutId, referredUserId, e.getMessage());
        }
    }

    /**
     * Process a complete subscription checkout in one step:
     * 1. Check if email already exists
     * 2. Process payment with Authorize.Net
     * 3. Create user account
     * 4. Create subscription with Scout attribution
     * 5. Return auth tokens for immediate login
     *
     * This is used by the custom payment form on the website.
     */
    @Transactional
    public SubscriptionPurchaseResponse checkout(SubscriptionCheckoutRequest request) {
        log.info("Processing subscription checkout for: {}", request.getEmail());

        try {
            // Step 1: Check if email already exists BEFORE charging
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("Email already registered: {}", request.getEmail());
                return SubscriptionPurchaseResponse.builder()
                        .success(false)
                        .errorMessage("An account with this email already exists. Please login instead.")
                        .errorCode("EMAIL_EXISTS")
                        .build();
            }

            // Step 2: Determine subscription amount based on referral type
            java.math.BigDecimal amount = request.getScoutCode() != null && !request.getScoutCode().isEmpty()
                    ? new java.math.BigDecimal("10.00")  // Scout referral = $10
                    : new java.math.BigDecimal("15.00"); // Regular or customer referral = $15

            // Step 3: Process payment
            ChargeRequest chargeRequest = new ChargeRequest();
            chargeRequest.setAmount(amount);
            chargeRequest.setCardNumber(request.getCardNumber());
            // Normalize expiration date format (remove slash if present)
            String expDate = request.getExpirationDate().replace("/", "");
            chargeRequest.setExpirationDate(expDate);
            chargeRequest.setCvv(request.getCvv());
            chargeRequest.setCustomerEmail(request.getEmail());
            chargeRequest.setCustomerName(request.getFirstName() + " " + request.getLastName());
            chargeRequest.setDescription(PaymentService.WEB_SUBSCRIPTION_DESCRIPTION);
            if (request.getBillingZip() != null) {
                chargeRequest.setBillingZip(request.getBillingZip());
            }

            PaymentResponse paymentResponse = paymentService.charge(chargeRequest);

            if (!"SUCCESS".equals(paymentResponse.getStatus())) {
                log.error("Payment failed for checkout: {}", paymentResponse.getErrorMessage());
                return SubscriptionPurchaseResponse.builder()
                        .success(false)
                        .errorMessage(paymentResponse.getErrorMessage() != null
                                ? paymentResponse.getErrorMessage()
                                : "Payment failed. Please check your card details and try again.")
                        .errorCode(paymentResponse.getErrorCode() != null
                                ? paymentResponse.getErrorCode()
                                : "PAYMENT_FAILED")
                        .build();
            }

            log.info("Payment successful, transaction ID: {}", paymentResponse.getTransactionId());

            // Step 4: Create user account
            String cardNumber = generateUniqueCardNumber();

            User user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phoneNumber(request.getPhone())
                    .role(User.UserRole.PARENT)
                    .emailVerified(true) // Auto-verify since they paid
                    .cardNumber(cardNumber)
                    .isActive(true)
                    .build();

            user = userRepository.save(user);
            log.info("User created with ID: {} and card number: {}", user.getId(), cardNumber);

            // Step 5: Resolve Scout attribution through referral chain
            UUID rootScoutId = null;
            int referralDepth = 0;
            String effectiveReferralCode = null;

            // Direct Scout referral ($10/year tier)
            if (request.getScoutCode() != null && !request.getScoutCode().isEmpty()) {
                effectiveReferralCode = request.getScoutCode();
                rootScoutId = findScoutByCode(request.getScoutCode());
                referralDepth = 1;
                log.info("Direct Scout referral: code={}, scoutId={}", request.getScoutCode(), rootScoutId);
            }
            // Customer referral ($15/year tier) - trace back to original Scout
            else if (request.getCustomerRefCode() != null && !request.getCustomerRefCode().isEmpty()) {
                effectiveReferralCode = request.getCustomerRefCode();
                var referrerChain = findReferralChain(request.getCustomerRefCode());
                if (referrerChain != null) {
                    rootScoutId = referrerChain.rootScoutId();
                    referralDepth = referrerChain.depth() + 1;
                    log.info("Customer referral chain: code={}, rootScoutId={}, depth={}",
                            request.getCustomerRefCode(), rootScoutId, referralDepth);
                }
            }

            // Step 6: Create annual subscription with Scout attribution
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusYears(1);

            Subscription subscription = Subscription.builder()
                    .userId(user.getId())
                    .councilId(1L)
                    .planId(1L)
                    .referralCode(effectiveReferralCode)
                    .rootScoutId(rootScoutId)
                    .referralDepth(referralDepth)
                    .currentPeriodStart(now)
                    .currentPeriodEnd(expiresAt)
                    .status(Subscription.SubscriptionStatus.ACTIVE)
                    .cancelAtPeriodEnd(false)
                    .stripeSubscriptionId(paymentResponse.getTransactionId())
                    .cardNumber(cardNumber)
                    .build();

            subscription = subscriptionRepository.save(subscription);
            log.info("Subscription created with ID: {} expires: {} rootScoutId: {} depth: {}",
                    subscription.getId(), expiresAt, rootScoutId, referralDepth);

            // Step 7: Generate auth tokens for immediate login
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            // Create Referral record so the scout's referral stats are updated
            if (rootScoutId != null) {
                createReferralRecord(rootScoutId, user.getId(), effectiveReferralCode);
                log.info("Scout {} credited for subscription (depth: {})", rootScoutId, referralDepth);
            }

            log.info("Subscription checkout completed successfully for: {}", request.getEmail());

            return SubscriptionPurchaseResponse.builder()
                    .success(true)
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .cardNumber(cardNumber)
                    .subscriptionStatus("ACTIVE")
                    .subscriptionExpiresAt(expiresAt)
                    .transactionId(paymentResponse.getTransactionId())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();

        } catch (Exception e) {
            log.error("Error during subscription checkout", e);
            return SubscriptionPurchaseResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorCode("INTERNAL_ERROR")
                    .build();
        }
    }
}

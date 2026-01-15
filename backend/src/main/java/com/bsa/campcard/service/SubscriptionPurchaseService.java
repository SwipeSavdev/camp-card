package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.PaymentResponse;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseRequest;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseResponse;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.bsa.campcard.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionPurchaseService {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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

            // Step 4: Create annual subscription
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusYears(1);

            Subscription subscription = Subscription.builder()
                    .userId(user.getId())
                    .councilId(1L) // Default council
                    .planId(1L) // Default annual plan
                    .referralCode(request.getReferralCode())
                    .currentPeriodStart(now)
                    .currentPeriodEnd(expiresAt)
                    .status(Subscription.SubscriptionStatus.ACTIVE)
                    .cancelAtPeriodEnd(false)
                    .stripeSubscriptionId(request.getTransactionId()) // Store Authorize.Net transaction ID
                    .cardNumber(cardNumber)
                    .build();

            subscription = subscriptionRepository.save(subscription);
            log.info("Subscription created with ID: {} expires: {}", subscription.getId(), expiresAt);

            // Step 5: Generate auth tokens for immediate login
            String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name(), null);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

            // Step 6: Handle referral attribution if provided
            if (request.getReferralCode() != null && !request.getReferralCode().isEmpty()) {
                log.info("Referral code used: {} - crediting Scout", request.getReferralCode());
                // TODO: Credit the referring Scout's sales
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

        do {
            // Generate random 12 digits
            long random = (long) (Math.random() * 999999999999L);
            String digits = String.format("%012d", random);

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
}

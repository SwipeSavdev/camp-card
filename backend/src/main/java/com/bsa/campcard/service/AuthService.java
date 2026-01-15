package com.bsa.campcard.service;

import com.bsa.campcard.dto.auth.*;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.exception.AuthenticationException;
import com.bsa.campcard.repository.SubscriptionRepository;
import com.bsa.campcard.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final SmsService smsService;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthenticationException("Email already registered");
        }

        // Determine the role - default to PARENT (customer) for mobile signups
        User.UserRole userRole = User.UserRole.PARENT;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                userRole = User.UserRole.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role provided, use default
                log.warn("Invalid role '{}' provided, defaulting to PARENT", request.getRole());
            }
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhone())
                .role(userRole)
                .isActive(true)
                .emailVerified(false)
                .emailVerificationToken(UUID.randomUUID().toString())
                .emailVerificationExpiresAt(LocalDateTime.now().plusDays(7))
                .referralCode(generateReferralCode())
                .build();

        User savedUser = userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getEmailVerificationToken());

        // Send welcome SMS if phone number provided
        if (savedUser.getPhoneNumber() != null && !savedUser.getPhoneNumber().isBlank()) {
            smsService.sendWelcomeSms(savedUser.getPhoneNumber(), savedUser.getFirstName());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        log.info("User registered successfully: {}", savedUser.getEmail());

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                toUserInfo(savedUser)
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!user.getIsActive()) {
            throw new AuthenticationException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                toUserInfo(user)
        );
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthenticationException("Invalid refresh token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (!user.getIsActive()) {
            throw new AuthenticationException("Account is inactive");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                toUserInfo(user)
        );
    }

    public void logout(String token) {
        jwtTokenProvider.invalidateToken(token);
        log.info("User logged out");
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            log.info("Password reset email sent to: {}", email);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new AuthenticationException("Invalid reset token"));

        if (user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        // Send password changed confirmation
        emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getFirstName());

        log.info("Password reset for: {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AuthenticationException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        // Send welcome email now that email is verified
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        log.info("Email verified for: {}", user.getEmail());
    }

    public UserProfileResponse getCurrentUser(String token) {
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Get subscription status and card number
        String subscriptionStatus = "none";
        String cardNumber = user.getCardNumber();

        var subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(user.getId());
        if (subscription.isPresent()) {
            subscriptionStatus = subscription.get().getStatus().name().toLowerCase();
            if (subscription.get().getCardNumber() != null) {
                cardNumber = subscription.get().getCardNumber();
            }
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhoneNumber())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerified())
                .cardNumber(cardNumber)
                .subscriptionStatus(subscriptionStatus)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AuthResponse.UserInfo toUserInfo(User user) {
        // Get subscription status and card number
        String subscriptionStatus = "none";
        String cardNumber = user.getCardNumber();

        var subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(user.getId());
        if (subscription.isPresent()) {
            subscriptionStatus = subscription.get().getStatus().name().toLowerCase();
            // Use subscription card number if available
            if (subscription.get().getCardNumber() != null) {
                cardNumber = subscription.get().getCardNumber();
            }
        }

        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerified())
                .cardNumber(cardNumber)
                .subscriptionStatus(subscriptionStatus)
                .build();
    }

    private String generateReferralCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

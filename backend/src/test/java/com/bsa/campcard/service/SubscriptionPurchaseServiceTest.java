package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.PaymentResponse;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseRequest;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseResponse;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.repository.SubscriptionRepository;
import com.bsa.campcard.security.JwtTokenProvider;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubscriptionPurchaseService Tests")
class SubscriptionPurchaseServiceTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private SubscriptionPurchaseService subscriptionPurchaseService;

    private SubscriptionPurchaseRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new SubscriptionPurchaseRequest();
        validRequest.setTransactionId("TX123456");
        validRequest.setEmail("test@example.com");
        validRequest.setPassword("SecurePassword123!");
        validRequest.setFirstName("John");
        validRequest.setLastName("Doe");
        validRequest.setPhone("555-0100");
    }

    @Nested
    @DisplayName("completePurchase Tests")
    class CompletePurchaseTests {

        @Test
        @DisplayName("Should complete purchase successfully with valid payment")
        void shouldCompletePurchaseSuccessfully() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .transactionId("TX123456")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.PARENT)
                    .build();

            when(paymentService.verifySubscriptionPayment("TX123456")).thenReturn(successPayment);
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertTrue(response.isSuccess());
            assertEquals("test@example.com", response.getEmail());
            assertEquals("John", response.getFirstName());
            assertEquals("Doe", response.getLastName());
            assertNotNull(response.getCardNumber());
            assertTrue(response.getCardNumber().startsWith("CC-"));
            assertEquals("ACTIVE", response.getSubscriptionStatus());
            assertNotNull(response.getSubscriptionExpiresAt());
            assertEquals("access_token", response.getAccessToken());
            assertEquals("refresh_token", response.getRefreshToken());

            verify(paymentService).verifySubscriptionPayment("TX123456");
            verify(userRepository).save(any(User.class));
            verify(subscriptionRepository).save(any(Subscription.class));
        }

        @Test
        @DisplayName("Should fail when payment verification fails")
        void shouldFailWhenPaymentVerificationFails() {
            // Given
            PaymentResponse failedPayment = PaymentResponse.builder()
                    .status("FAILED")
                    .transactionId("TX123456")
                    .build();

            when(paymentService.verifySubscriptionPayment("TX123456")).thenReturn(failedPayment);

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertFalse(response.isSuccess());
            assertEquals("PAYMENT_VERIFICATION_FAILED", response.getErrorCode());
            assertNotNull(response.getErrorMessage());

            verify(userRepository, never()).save(any(User.class));
            verify(subscriptionRepository, never()).save(any(Subscription.class));
        }

        @Test
        @DisplayName("Should fail when email already exists")
        void shouldFailWhenEmailAlreadyExists() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .transactionId("TX123456")
                    .build();

            when(paymentService.verifySubscriptionPayment("TX123456")).thenReturn(successPayment);
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertFalse(response.isSuccess());
            assertEquals("EMAIL_EXISTS", response.getErrorCode());
            assertNotNull(response.getErrorMessage());

            verify(userRepository, never()).save(any(User.class));
            verify(subscriptionRepository, never()).save(any(Subscription.class));
        }

        @Test
        @DisplayName("Should create user with PARENT role")
        void shouldCreateUserWithParentRole() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .transactionId("TX123456")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .role(User.UserRole.PARENT)
                    .build();

            when(paymentService.verifySubscriptionPayment("TX123456")).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(User.UserRole.PARENT, userCaptor.getValue().getRole());
        }

        @Test
        @DisplayName("Should set email as verified for paid subscription")
        void shouldSetEmailAsVerified() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .emailVerified(true)
                    .build();

            when(paymentService.verifySubscriptionPayment(anyString())).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertTrue(userCaptor.getValue().getEmailVerified());
        }

        @Test
        @DisplayName("Should create subscription with ACTIVE status")
        void shouldCreateActiveSubscription() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .build();

            when(paymentService.verifySubscriptionPayment(anyString())).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            ArgumentCaptor<Subscription> subCaptor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository).save(subCaptor.capture());
            assertEquals(Subscription.SubscriptionStatus.ACTIVE, subCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("Should handle referral code")
        void shouldHandleReferralCode() {
            // Given
            validRequest.setReferralCode("REF123");

            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .build();

            when(paymentService.verifySubscriptionPayment(anyString())).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            ArgumentCaptor<Subscription> subCaptor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository).save(subCaptor.capture());
            assertEquals("REF123", subCaptor.getValue().getReferralCode());
        }

        @Test
        @DisplayName("Should handle exception and return error response")
        void shouldHandleExceptionGracefully() {
            // Given
            when(paymentService.verifySubscriptionPayment(anyString())).thenThrow(new RuntimeException("Network error"));

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertFalse(response.isSuccess());
            assertEquals("INTERNAL_ERROR", response.getErrorCode());
            assertNotNull(response.getErrorMessage());
        }
    }

    @Nested
    @DisplayName("Card Number Generation Tests")
    class CardNumberGenerationTests {

        @Test
        @DisplayName("Should generate unique card number in correct format")
        void shouldGenerateCardNumberInCorrectFormat() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .build();

            when(paymentService.verifySubscriptionPayment(anyString())).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(subscriptionRepository.existsByCardNumber(anyString())).thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertNotNull(response.getCardNumber());
            assertTrue(response.getCardNumber().matches("CC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"));
        }

        @Test
        @DisplayName("Should retry card number generation if collision detected")
        void shouldRetryOnCardNumberCollision() {
            // Given
            PaymentResponse successPayment = PaymentResponse.builder()
                    .status("SUCCESS")
                    .build();

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("test@example.com")
                    .build();

            when(paymentService.verifySubscriptionPayment(anyString())).thenReturn(successPayment);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            // First call returns true (collision), subsequent calls return false
            when(subscriptionRepository.existsByCardNumber(anyString()))
                    .thenReturn(true)
                    .thenReturn(true)
                    .thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");

            // When
            SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(validRequest);

            // Then
            assertTrue(response.isSuccess());
            assertNotNull(response.getCardNumber());
            verify(subscriptionRepository, atLeast(3)).existsByCardNumber(anyString());
        }
    }
}

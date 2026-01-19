package com.bsa.campcard.service;

import com.bsa.campcard.dto.auth.*;
import com.bsa.campcard.exception.AuthenticationException;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private AuthService authService;

    private UUID testUserId;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
                .id(testUserId)
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .firstName("John")
                .lastName("Doe")
                .role(User.UserRole.PARENT)
                .isActive(true)
                .emailVerified(true)
                .build();
    }

    @Nested
    @DisplayName("register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully")
        void shouldRegisterNewUserSuccessfully() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("newuser@example.com");
            request.setPassword("SecurePassword123!");
            request.setFirstName("Jane");
            request.setLastName("Doe");
            request.setPhone("555-0100");

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("newuser@example.com")
                    .firstName("Jane")
                    .lastName("Doe")
                    .role(User.UserRole.PARENT)
                    .isActive(true)
                    .emailVerified(false)
                    .emailVerificationToken("token123")
                    .phoneNumber("555-0100")
                    .build();

            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            AuthResponse response = authService.register(request);

            // Then
            assertNotNull(response);
            assertEquals("access_token", response.getAccessToken());
            assertEquals("refresh_token", response.getRefreshToken());
            assertNotNull(response.getUser());
            assertEquals("newuser@example.com", response.getUser().getEmail());

            verify(emailService).sendVerificationEmail(eq("newuser@example.com"), anyString());
            verify(smsService).sendWelcomeSms(eq("555-0100"), eq("Jane"));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("existing@example.com");
            request.setPassword("password123");

            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            // When/Then
            assertThrows(AuthenticationException.class, () -> authService.register(request));

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should default to PARENT role when no role specified")
        void shouldDefaultToParentRole() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("newuser@example.com");
            request.setPassword("password123");
            request.setFirstName("Jane");
            request.setLastName("Doe");

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("newuser@example.com")
                    .role(User.UserRole.PARENT)
                    .isActive(true)
                    .emailVerified(false)
                    .build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            authService.register(request);

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals(User.UserRole.PARENT, captor.getValue().getRole());
        }

        @Test
        @DisplayName("Should use specified role when valid")
        void shouldUseSpecifiedRole() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("scout@example.com");
            request.setPassword("password123");
            request.setFirstName("Scout");
            request.setLastName("User");
            request.setRole("SCOUT");

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("scout@example.com")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .emailVerified(false)
                    .build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            authService.register(request);

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals(User.UserRole.SCOUT, captor.getValue().getRole());
        }

        @Test
        @DisplayName("Should convert email to lowercase")
        void shouldConvertEmailToLowercase() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("USER@EXAMPLE.COM");
            request.setPassword("password123");
            request.setFirstName("User");
            request.setLastName("Test");

            User savedUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("user@example.com")
                    .role(User.UserRole.PARENT)
                    .isActive(true)
                    .emailVerified(false)
                    .build();

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            authService.register(request);

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals("user@example.com", captor.getValue().getEmail());
        }
    }

    @Nested
    @DisplayName("login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login admin user successfully")
        void shouldLoginAdminUserSuccessfully() {
            // Given
            User adminUser = User.builder()
                    .id(testUserId)
                    .email("admin@example.com")
                    .passwordHash("hashedPassword")
                    .role(User.UserRole.NATIONAL_ADMIN)
                    .isActive(true)
                    .build();

            LoginRequest request = new LoginRequest();
            request.setEmail("admin@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
            when(userRepository.save(any(User.class))).thenReturn(adminUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            AuthResponse response = authService.login(request);

            // Then
            assertNotNull(response);
            assertEquals("access_token", response.getAccessToken());
            assertEquals("NATIONAL_ADMIN", response.getUser().getRole());
        }

        @Test
        @DisplayName("Should block SCOUT from admin portal login")
        void shouldBlockScoutFromAdminPortal() {
            // Given
            User scoutUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .passwordHash("hashedPassword")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            LoginRequest request = new LoginRequest();
            request.setEmail("scout@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("scout@example.com")).thenReturn(Optional.of(scoutUser));

            // When/Then
            AuthenticationException exception = assertThrows(AuthenticationException.class,
                    () -> authService.login(request));
            assertTrue(exception.getMessage().contains("admin portal"));
        }

        @Test
        @DisplayName("Should block PARENT from admin portal login")
        void shouldBlockParentFromAdminPortal() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setEmail("test@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            // When/Then
            AuthenticationException exception = assertThrows(AuthenticationException.class,
                    () -> authService.login(request));
            assertTrue(exception.getMessage().contains("admin portal"));
        }

        @Test
        @DisplayName("Should throw exception for invalid credentials")
        void shouldThrowExceptionForInvalidCredentials() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setEmail("nonexistent@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            // When/Then
            assertThrows(AuthenticationException.class, () -> authService.login(request));
        }

        @Test
        @DisplayName("Should throw exception for wrong password")
        void shouldThrowExceptionForWrongPassword() {
            // Given
            User adminUser = User.builder()
                    .id(testUserId)
                    .email("admin@example.com")
                    .passwordHash("hashedPassword")
                    .role(User.UserRole.NATIONAL_ADMIN)
                    .isActive(true)
                    .build();

            LoginRequest request = new LoginRequest();
            request.setEmail("admin@example.com");
            request.setPassword("wrongPassword");

            when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

            // When/Then
            assertThrows(AuthenticationException.class, () -> authService.login(request));
        }

        @Test
        @DisplayName("Should throw exception for inactive account")
        void shouldThrowExceptionForInactiveAccount() {
            // Given
            User inactiveUser = User.builder()
                    .id(testUserId)
                    .email("inactive@example.com")
                    .passwordHash("hashedPassword")
                    .role(User.UserRole.NATIONAL_ADMIN)
                    .isActive(false)
                    .build();

            LoginRequest request = new LoginRequest();
            request.setEmail("inactive@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("inactive@example.com")).thenReturn(Optional.of(inactiveUser));

            // When/Then
            AuthenticationException exception = assertThrows(AuthenticationException.class,
                    () -> authService.login(request));
            assertTrue(exception.getMessage().contains("inactive"));
        }
    }

    @Nested
    @DisplayName("mobileLogin Tests")
    class MobileLoginTests {

        @Test
        @DisplayName("Should allow SCOUT to login via mobile")
        void shouldAllowScoutMobileLogin() {
            // Given
            User scoutUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .passwordHash("hashedPassword")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            LoginRequest request = new LoginRequest();
            request.setEmail("scout@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("scout@example.com")).thenReturn(Optional.of(scoutUser));
            when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
            when(userRepository.save(any(User.class))).thenReturn(scoutUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            AuthResponse response = authService.mobileLogin(request);

            // Then
            assertNotNull(response);
            assertEquals("SCOUT", response.getUser().getRole());
        }

        @Test
        @DisplayName("Should allow PARENT to login via mobile")
        void shouldAllowParentMobileLogin() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setEmail("test@example.com");
            request.setPassword("password123");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            AuthResponse response = authService.mobileLogin(request);

            // Then
            assertNotNull(response);
            assertEquals("PARENT", response.getUser().getRole());
        }
    }

    @Nested
    @DisplayName("refreshToken Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() {
            // Given
            when(jwtTokenProvider.validateToken("valid_refresh_token")).thenReturn(true);
            when(jwtTokenProvider.getUserIdFromToken("valid_refresh_token")).thenReturn(testUserId);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("new_access_token");
            when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("new_refresh_token");
            when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(86400000L);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            AuthResponse response = authService.refreshToken("valid_refresh_token");

            // Then
            assertNotNull(response);
            assertEquals("new_access_token", response.getAccessToken());
            assertEquals("new_refresh_token", response.getRefreshToken());
        }

        @Test
        @DisplayName("Should throw exception for invalid refresh token")
        void shouldThrowExceptionForInvalidRefreshToken() {
            // Given
            when(jwtTokenProvider.validateToken("invalid_token")).thenReturn(false);

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.refreshToken("invalid_token"));
        }
    }

    @Nested
    @DisplayName("forgotPassword Tests")
    class ForgotPasswordTests {

        @Test
        @DisplayName("Should send password reset email when user exists")
        void shouldSendPasswordResetEmail() {
            // Given
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // When
            authService.forgotPassword("test@example.com");

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertNotNull(captor.getValue().getPasswordResetToken());
            assertNotNull(captor.getValue().getPasswordResetExpiresAt());
            verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
        }

        @Test
        @DisplayName("Should do nothing when user doesn't exist (no error)")
        void shouldNotRevealUserExistence() {
            // Given
            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            // When
            authService.forgotPassword("nonexistent@example.com");

            // Then - No exception thrown, no email sent
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        }
    }

    @Nested
    @DisplayName("resetPassword Tests")
    class ResetPasswordTests {

        @Test
        @DisplayName("Should reset password successfully")
        void shouldResetPasswordSuccessfully() {
            // Given
            testUser.setPasswordResetToken("valid_token");
            testUser.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));

            when(userRepository.findByPasswordResetToken("valid_token")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // When
            authService.resetPassword("valid_token", "newPassword123");

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals("newHashedPassword", captor.getValue().getPasswordHash());
            assertNull(captor.getValue().getPasswordResetToken());
            assertNull(captor.getValue().getPasswordResetExpiresAt());
            verify(emailService).sendPasswordChangedConfirmation(eq("test@example.com"), eq("John"));
        }

        @Test
        @DisplayName("Should throw exception for invalid reset token")
        void shouldThrowExceptionForInvalidResetToken() {
            // Given
            when(userRepository.findByPasswordResetToken("invalid_token")).thenReturn(Optional.empty());

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.resetPassword("invalid_token", "newPassword123"));
        }

        @Test
        @DisplayName("Should throw exception for expired reset token")
        void shouldThrowExceptionForExpiredResetToken() {
            // Given
            testUser.setPasswordResetToken("expired_token");
            testUser.setPasswordResetExpiresAt(LocalDateTime.now().minusHours(1));

            when(userRepository.findByPasswordResetToken("expired_token")).thenReturn(Optional.of(testUser));

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.resetPassword("expired_token", "newPassword123"));
        }
    }

    @Nested
    @DisplayName("verifyEmail Tests")
    class VerifyEmailTests {

        @Test
        @DisplayName("Should verify email successfully")
        void shouldVerifyEmailSuccessfully() {
            // Given
            testUser.setEmailVerified(false);
            testUser.setEmailVerificationToken("verification_token");
            testUser.setEmailVerificationExpiresAt(LocalDateTime.now().plusDays(1));

            when(userRepository.findByEmailVerificationToken("verification_token")).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // When
            authService.verifyEmail("verification_token");

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertTrue(captor.getValue().getEmailVerified());
            assertNull(captor.getValue().getEmailVerificationToken());
            verify(emailService).sendWelcomeEmail(eq("test@example.com"), eq("John"));
        }

        @Test
        @DisplayName("Should throw exception for invalid verification token")
        void shouldThrowExceptionForInvalidVerificationToken() {
            // Given
            when(userRepository.findByEmailVerificationToken("invalid_token")).thenReturn(Optional.empty());

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.verifyEmail("invalid_token"));
        }

        @Test
        @DisplayName("Should throw exception for expired verification token")
        void shouldThrowExceptionForExpiredVerificationToken() {
            // Given
            testUser.setEmailVerificationToken("expired_token");
            testUser.setEmailVerificationExpiresAt(LocalDateTime.now().minusDays(1));

            when(userRepository.findByEmailVerificationToken("expired_token")).thenReturn(Optional.of(testUser));

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.verifyEmail("expired_token"));
        }
    }

    @Nested
    @DisplayName("changePassword Tests")
    class ChangePasswordTests {

        @Test
        @DisplayName("Should change password successfully")
        void shouldChangePasswordSuccessfully() {
            // Given
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("currentPassword", "hashedPassword")).thenReturn(true);
            when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // When
            authService.changePassword(testUserId, "currentPassword", "newPassword123");

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals("newHashedPassword", captor.getValue().getPasswordHash());
            verify(emailService).sendSecuritySettingsChangedNotification(
                    eq("test@example.com"), eq("John"), eq("Password"));
        }

        @Test
        @DisplayName("Should throw exception for wrong current password")
        void shouldThrowExceptionForWrongCurrentPassword() {
            // Given
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.changePassword(testUserId, "wrongPassword", "newPassword123"));
        }
    }

    @Nested
    @DisplayName("updateProfile Tests")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should update profile successfully")
        void shouldUpdateProfileSuccessfully() {
            // Given
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setEmail("test@example.com");
            request.setFirstName("Updated");
            request.setLastName("Name");
            request.setPhone("555-0200");

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.getUserIdFromToken(anyString())).thenReturn(testUserId);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            authService.updateProfile(testUserId, request);

            // Then
            verify(userRepository).save(any(User.class));
            verify(emailService).sendProfileUpdateNotification(eq("test@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("Should throw exception when new email already exists")
        void shouldThrowExceptionWhenNewEmailExists() {
            // Given
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setEmail("existing@example.com");
            request.setFirstName("John");
            request.setLastName("Doe");

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            // When/Then
            assertThrows(AuthenticationException.class,
                    () -> authService.updateProfile(testUserId, request));
        }

        @Test
        @DisplayName("Should require email re-verification when email changes")
        void shouldRequireReVerificationOnEmailChange() {
            // Given
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setEmail("newemail@example.com");
            request.setFirstName("John");
            request.setLastName("Doe");

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("token");
            when(jwtTokenProvider.getUserIdFromToken(anyString())).thenReturn(testUserId);
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(any())).thenReturn(Optional.empty());

            // When
            authService.updateProfile(testUserId, request);

            // Then
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertFalse(captor.getValue().getEmailVerified());
            assertNotNull(captor.getValue().getEmailVerificationToken());
            verify(emailService).sendVerificationEmail(eq("newemail@example.com"), anyString());
        }
    }
}

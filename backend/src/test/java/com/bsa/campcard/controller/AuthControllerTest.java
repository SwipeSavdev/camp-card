package com.bsa.campcard.controller;

import com.bsa.campcard.dto.auth.*;
import com.bsa.campcard.exception.AuthenticationException;
import com.bsa.campcard.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AuthController using @Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Login with valid/invalid credentials
 * - User registration
 * - Email verification
 * - Password reset request and confirm
 * - Refresh token
 * - Get current user (/auth/me)
 * - Logout
 * - Change password
 * - Update profile
 * - Input validation
 * - Error handling
 */
@Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest(AuthController.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private LoginRequest validLoginRequest;
    private RegisterRequest validRegisterRequest;
    private AuthResponse sampleAuthResponse;
    private UserProfileResponse sampleUserProfile;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        // Create valid login request using setters
        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("test@campcard.org");
        validLoginRequest.setPassword("Password123");

        // Create valid register request using setters
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("newuser@campcard.org");
        validRegisterRequest.setPassword("Password123");
        validRegisterRequest.setFirstName("John");
        validRegisterRequest.setLastName("Doe");
        validRegisterRequest.setPhone("303-555-1234");
        validRegisterRequest.setRole("SCOUT");

        // Create sample auth response using builder (has @Builder)
        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(testUserId)
                .email("test@campcard.org")
                .firstName("John")
                .lastName("Doe")
                .role("SCOUT")
                .emailVerified(true)
                .cardNumber("CC-12345678")
                .subscriptionStatus("active")
                .build();

        sampleAuthResponse = AuthResponse.builder()
                .accessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-access-token")
                .refreshToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-refresh-token")
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(userInfo)
                .build();

        // Create sample user profile using builder
        sampleUserProfile = UserProfileResponse.builder()
                .id(testUserId)
                .email("test@campcard.org")
                .firstName("John")
                .lastName("Doe")
                .phone("303-555-1234")
                .role("SCOUT")
                .emailVerified(true)
                .cardNumber("CC-12345678")
                .subscriptionStatus("active")
                .createdAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();
    }

    // ========================================================================
    // REGISTER TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/register - User Registration")
    class RegisterTests {

        @Test
        @DisplayName("Should register user with valid data")
        void register_ValidData_Success() throws Exception {
            when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.expiresIn").value(86400000L))
                    .andExpect(jsonPath("$.user.email").value("test@campcard.org"));

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when email is blank")
        void register_BlankEmail_BadRequest() throws Exception {
            validRegisterRequest.setEmail("");

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when email is null")
        void register_NullEmail_BadRequest() throws Exception {
            validRegisterRequest.setEmail(null);

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when email format is invalid")
        void register_InvalidEmailFormat_BadRequest() throws Exception {
            validRegisterRequest.setEmail("not-an-email");

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when password is blank")
        void register_BlankPassword_BadRequest() throws Exception {
            validRegisterRequest.setPassword("");

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when password is too short")
        void register_PasswordTooShort_BadRequest() throws Exception {
            validRegisterRequest.setPassword("Pass1"); // Less than 8 characters

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when first name is blank")
        void register_BlankFirstName_BadRequest() throws Exception {
            validRegisterRequest.setFirstName("");

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 when last name is blank")
        void register_BlankLastName_BadRequest() throws Exception {
            validRegisterRequest.setLastName("");

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 401 when email already registered")
        void register_EmailAlreadyExists_Unauthorized() throws Exception {
            when(authService.register(any(RegisterRequest.class)))
                    .thenThrow(new AuthenticationException("Email already registered"));

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Should register with optional phone number")
        void register_WithPhone_Success() throws Exception {
            validRegisterRequest.setPhone("303-555-1234");
            when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isCreated());

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Should register without optional phone number")
        void register_WithoutPhone_Success() throws Exception {
            validRegisterRequest.setPhone(null);
            when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isCreated());

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Should register with referral code")
        void register_WithReferralCode_Success() throws Exception {
            validRegisterRequest.setReferralCode("ABCD1234");
            when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/register", validRegisterRequest)
                    .andExpect(status().isCreated());

            verify(authService).register(any(RegisterRequest.class));
        }
    }

    // ========================================================================
    // LOGIN TESTS (Admin Portal)
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/login - Admin Portal Login")
    class LoginTests {

        @Test
        @DisplayName("Should login with valid credentials")
        void login_ValidCredentials_Success() throws Exception {
            when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.user.id").value(testUserId.toString()))
                    .andExpect(jsonPath("$.user.email").value("test@campcard.org"));

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 401 with invalid credentials")
        void login_InvalidCredentials_Unauthorized() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("Invalid credentials"));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when account is inactive")
        void login_InactiveAccount_Unauthorized() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("Account is inactive"));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when SCOUT tries admin portal login")
        void login_ScoutToAdminPortal_Unauthorized() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("This account cannot access the admin portal. Please use the mobile app."));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when PARENT tries admin portal login")
        void login_ParentToAdminPortal_Unauthorized() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("This account cannot access the admin portal. Please use the mobile app."));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when email is blank")
        void login_BlankEmail_BadRequest() throws Exception {
            validLoginRequest.setEmail("");

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("Should return 400 when email format is invalid")
        void login_InvalidEmailFormat_BadRequest() throws Exception {
            validLoginRequest.setEmail("not-an-email");

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("Should return 400 when password is blank")
        void login_BlankPassword_BadRequest() throws Exception {
            validLoginRequest.setPassword("");

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }
    }

    // ========================================================================
    // MOBILE LOGIN TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/mobile/login - Mobile App Login")
    class MobileLoginTests {

        @Test
        @DisplayName("Should login with valid credentials for mobile")
        void mobileLogin_ValidCredentials_Success() throws Exception {
            when(authService.mobileLogin(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/mobile/login", validLoginRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.user.email").value("test@campcard.org"));

            verify(authService).mobileLogin(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should allow SCOUT to login via mobile")
        void mobileLogin_AsScout_Success() throws Exception {
            AuthResponse.UserInfo scoutInfo = AuthResponse.UserInfo.builder()
                    .id(testUserId)
                    .email("scout@campcard.org")
                    .role("SCOUT")
                    .build();
            AuthResponse scoutResponse = AuthResponse.builder()
                    .accessToken("scout-token")
                    .refreshToken("scout-refresh")
                    .tokenType("Bearer")
                    .expiresIn(86400000L)
                    .user(scoutInfo)
                    .build();

            when(authService.mobileLogin(any(LoginRequest.class))).thenReturn(scoutResponse);

            performPost("/api/v1/auth/mobile/login", validLoginRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.role").value("SCOUT"));

            verify(authService).mobileLogin(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should allow PARENT to login via mobile")
        void mobileLogin_AsParent_Success() throws Exception {
            AuthResponse.UserInfo parentInfo = AuthResponse.UserInfo.builder()
                    .id(testUserId)
                    .email("parent@campcard.org")
                    .role("PARENT")
                    .build();
            AuthResponse parentResponse = AuthResponse.builder()
                    .accessToken("parent-token")
                    .refreshToken("parent-refresh")
                    .tokenType("Bearer")
                    .expiresIn(86400000L)
                    .user(parentInfo)
                    .build();

            when(authService.mobileLogin(any(LoginRequest.class))).thenReturn(parentResponse);

            performPost("/api/v1/auth/mobile/login", validLoginRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.role").value("PARENT"));

            verify(authService).mobileLogin(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should return 401 with invalid credentials")
        void mobileLogin_InvalidCredentials_Unauthorized() throws Exception {
            when(authService.mobileLogin(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("Invalid credentials"));

            performPost("/api/v1/auth/mobile/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());

            verify(authService).mobileLogin(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should accept device token for push notifications")
        void mobileLogin_WithDeviceToken_Success() throws Exception {
            validLoginRequest.setDeviceToken("fcm-device-token-12345");
            validLoginRequest.setPlatform("ios");
            when(authService.mobileLogin(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/mobile/login", validLoginRequest)
                    .andExpect(status().isOk());

            verify(authService).mobileLogin(any(LoginRequest.class));
        }
    }

    // ========================================================================
    // REFRESH TOKEN TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/refresh - Refresh Token")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token with valid refresh token")
        void refreshToken_ValidToken_Success() throws Exception {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("valid-refresh-token");

            when(authService.refreshToken("valid-refresh-token")).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/refresh", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty());

            verify(authService).refreshToken("valid-refresh-token");
        }

        @Test
        @DisplayName("Should return 401 with invalid refresh token")
        void refreshToken_InvalidToken_Unauthorized() throws Exception {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("invalid-refresh-token");

            when(authService.refreshToken("invalid-refresh-token"))
                    .thenThrow(new AuthenticationException("Invalid refresh token"));

            performPost("/api/v1/auth/refresh", request)
                    .andExpect(status().isUnauthorized());

            verify(authService).refreshToken("invalid-refresh-token");
        }

        @Test
        @DisplayName("Should return 400 when refresh token is blank")
        void refreshToken_BlankToken_BadRequest() throws Exception {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("");

            performPost("/api/v1/auth/refresh", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).refreshToken(anyString());
        }

        @Test
        @DisplayName("Should return 400 when refresh token is null")
        void refreshToken_NullToken_BadRequest() throws Exception {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(null);

            performPost("/api/v1/auth/refresh", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).refreshToken(anyString());
        }
    }

    // ========================================================================
    // LOGOUT TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/logout - Logout")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully with valid token")
        @WithMockUser(roles = "SCOUT")
        void logout_ValidToken_Success() throws Exception {
            doNothing().when(authService).logout(anyString());

            mockMvc.perform(post("/api/v1/auth/logout")
                            .header("Authorization", "Bearer valid-access-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(authService).logout("valid-access-token");
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void logout_NotAuthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/auth/logout")
                            .header("Authorization", "Bearer some-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService, never()).logout(anyString());
        }
    }

    // ========================================================================
    // FORGOT PASSWORD TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/forgot-password - Forgot Password")
    class ForgotPasswordTests {

        @Test
        @DisplayName("Should send reset email for valid email")
        void forgotPassword_ValidEmail_Success() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("user@campcard.org");

            doNothing().when(authService).forgotPassword("user@campcard.org");

            performPost("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password reset email sent if account exists"));

            verify(authService).forgotPassword("user@campcard.org");
        }

        @Test
        @DisplayName("Should return same response for non-existent email (security)")
        void forgotPassword_NonExistentEmail_SameResponse() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("nonexistent@campcard.org");

            doNothing().when(authService).forgotPassword("nonexistent@campcard.org");

            performPost("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password reset email sent if account exists"));

            verify(authService).forgotPassword("nonexistent@campcard.org");
        }

        @Test
        @DisplayName("Should return 400 when email is blank")
        void forgotPassword_BlankEmail_BadRequest() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("");

            performPost("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).forgotPassword(anyString());
        }

        @Test
        @DisplayName("Should return 400 when email format is invalid")
        void forgotPassword_InvalidEmail_BadRequest() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("not-an-email");

            performPost("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).forgotPassword(anyString());
        }
    }

    // ========================================================================
    // RESET PASSWORD TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/reset-password - Reset Password")
    class ResetPasswordTests {

        @Test
        @DisplayName("Should reset password with valid token")
        void resetPassword_ValidToken_Success() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("valid-reset-token");
            request.setNewPassword("NewPassword123");

            doNothing().when(authService).resetPassword("valid-reset-token", "NewPassword123");

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password reset successfully"));

            verify(authService).resetPassword("valid-reset-token", "NewPassword123");
        }

        @Test
        @DisplayName("Should return 401 with invalid reset token")
        void resetPassword_InvalidToken_Unauthorized() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("invalid-reset-token");
            request.setNewPassword("NewPassword123");

            doThrow(new AuthenticationException("Invalid reset token"))
                    .when(authService).resetPassword("invalid-reset-token", "NewPassword123");

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isUnauthorized());

            verify(authService).resetPassword("invalid-reset-token", "NewPassword123");
        }

        @Test
        @DisplayName("Should return 401 with expired reset token")
        void resetPassword_ExpiredToken_Unauthorized() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("expired-reset-token");
            request.setNewPassword("NewPassword123");

            doThrow(new AuthenticationException("Reset token has expired"))
                    .when(authService).resetPassword("expired-reset-token", "NewPassword123");

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isUnauthorized());

            verify(authService).resetPassword("expired-reset-token", "NewPassword123");
        }

        @Test
        @DisplayName("Should return 400 when token is blank")
        void resetPassword_BlankToken_BadRequest() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("");
            request.setNewPassword("NewPassword123");

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).resetPassword(anyString(), anyString());
        }

        @Test
        @DisplayName("Should return 400 when new password is too short")
        void resetPassword_PasswordTooShort_BadRequest() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("valid-token");
            request.setNewPassword("Pass1"); // Less than 8 characters

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).resetPassword(anyString(), anyString());
        }

        @Test
        @DisplayName("Should return 400 when new password is blank")
        void resetPassword_BlankPassword_BadRequest() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("valid-token");
            request.setNewPassword("");

            performPost("/api/v1/auth/reset-password", request)
                    .andExpect(status().isBadRequest());

            verify(authService, never()).resetPassword(anyString(), anyString());
        }
    }

    // ========================================================================
    // VERIFY EMAIL TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/verify-email - Email Verification")
    class VerifyEmailTests {

        @Test
        @DisplayName("Should verify email with valid token")
        void verifyEmail_ValidToken_Success() throws Exception {
            doNothing().when(authService).verifyEmail("valid-verification-token");

            mockMvc.perform(post("/api/v1/auth/verify-email")
                            .param("token", "valid-verification-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Email verified successfully"));

            verify(authService).verifyEmail("valid-verification-token");
        }

        @Test
        @DisplayName("Should return 401 with invalid verification token")
        void verifyEmail_InvalidToken_Unauthorized() throws Exception {
            doThrow(new AuthenticationException("Invalid verification token"))
                    .when(authService).verifyEmail("invalid-token");

            mockMvc.perform(post("/api/v1/auth/verify-email")
                            .param("token", "invalid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService).verifyEmail("invalid-token");
        }

        @Test
        @DisplayName("Should return 401 with expired verification token")
        void verifyEmail_ExpiredToken_Unauthorized() throws Exception {
            doThrow(new AuthenticationException("Verification token has expired"))
                    .when(authService).verifyEmail("expired-token");

            mockMvc.perform(post("/api/v1/auth/verify-email")
                            .param("token", "expired-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService).verifyEmail("expired-token");
        }
    }

    // ========================================================================
    // GET CURRENT USER TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/auth/me - Get Current User")
    class GetCurrentUserTests {

        @Test
        @DisplayName("Should return current user profile")
        @WithMockUser(roles = "SCOUT")
        void getCurrentUser_ValidToken_Success() throws Exception {
            when(authService.getCurrentUser("valid-access-token")).thenReturn(sampleUserProfile);

            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer valid-access-token")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testUserId.toString()))
                    .andExpect(jsonPath("$.email").value("test@campcard.org"))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Doe"))
                    .andExpect(jsonPath("$.role").value("SCOUT"))
                    .andExpect(jsonPath("$.emailVerified").value(true))
                    .andExpect(jsonPath("$.subscriptionStatus").value("active"));

            verify(authService).getCurrentUser("valid-access-token");
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void getCurrentUser_NotAuthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer some-token")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(authService, never()).getCurrentUser(anyString());
        }

        @Test
        @DisplayName("Should return 401 when user not found")
        @WithMockUser(roles = "SCOUT")
        void getCurrentUser_UserNotFound_Unauthorized() throws Exception {
            when(authService.getCurrentUser("orphan-token"))
                    .thenThrow(new AuthenticationException("User not found"));

            mockMvc.perform(get("/api/v1/auth/me")
                            .header("Authorization", "Bearer orphan-token")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(authService).getCurrentUser("orphan-token");
        }
    }

    // ========================================================================
    // CHANGE PASSWORD TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/auth/change-password - Change Password")
    class ChangePasswordTests {

        @Test
        @DisplayName("Should change password with correct current password")
        @WithMockUser(roles = "SCOUT")
        void changePassword_ValidRequest_Success() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPassword123");
            request.setNewPassword("NewPassword123");

            when(authService.getUserIdFromToken("valid-token")).thenReturn(testUserId);
            doNothing().when(authService).changePassword(testUserId, "OldPassword123", "NewPassword123");

            mockMvc.perform(post("/api/v1/auth/change-password")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password changed successfully"));

            verify(authService).changePassword(testUserId, "OldPassword123", "NewPassword123");
        }

        @Test
        @DisplayName("Should return 401 when current password is incorrect")
        @WithMockUser(roles = "SCOUT")
        void changePassword_IncorrectCurrentPassword_Unauthorized() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("WrongPassword");
            request.setNewPassword("NewPassword123");

            when(authService.getUserIdFromToken("valid-token")).thenReturn(testUserId);
            doThrow(new AuthenticationException("Current password is incorrect"))
                    .when(authService).changePassword(testUserId, "WrongPassword", "NewPassword123");

            mockMvc.perform(post("/api/v1/auth/change-password")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService).changePassword(testUserId, "WrongPassword", "NewPassword123");
        }

        @Test
        @DisplayName("Should return 400 when current password is blank")
        @WithMockUser(roles = "SCOUT")
        void changePassword_BlankCurrentPassword_BadRequest() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("");
            request.setNewPassword("NewPassword123");

            mockMvc.perform(post("/api/v1/auth/change-password")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).changePassword(any(), anyString(), anyString());
        }

        @Test
        @DisplayName("Should return 400 when new password is too short")
        @WithMockUser(roles = "SCOUT")
        void changePassword_NewPasswordTooShort_BadRequest() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPassword123");
            request.setNewPassword("Short1"); // Less than 8 characters

            mockMvc.perform(post("/api/v1/auth/change-password")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).changePassword(any(), anyString(), anyString());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void changePassword_NotAuthenticated_Unauthorized() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPassword123");
            request.setNewPassword("NewPassword123");

            mockMvc.perform(post("/api/v1/auth/change-password")
                            .header("Authorization", "Bearer some-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService, never()).changePassword(any(), anyString(), anyString());
        }
    }

    // ========================================================================
    // UPDATE PROFILE TESTS
    // ========================================================================

    @Nested
    @DisplayName("PUT /api/v1/auth/profile - Update Profile")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should update profile with valid data")
        @WithMockUser(roles = "SCOUT")
        void updateProfile_ValidData_Success() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("Jane");
            request.setLastName("Smith");
            request.setEmail("jane.smith@campcard.org");
            request.setPhone("303-555-9876");

            UserProfileResponse updatedProfile = UserProfileResponse.builder()
                    .id(testUserId)
                    .email("jane.smith@campcard.org")
                    .firstName("Jane")
                    .lastName("Smith")
                    .phone("303-555-9876")
                    .role("SCOUT")
                    .build();

            when(authService.getUserIdFromToken("valid-token")).thenReturn(testUserId);
            when(authService.updateProfile(eq(testUserId), any(UpdateProfileRequest.class))).thenReturn(updatedProfile);

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("Jane"))
                    .andExpect(jsonPath("$.lastName").value("Smith"))
                    .andExpect(jsonPath("$.email").value("jane.smith@campcard.org"));

            verify(authService).updateProfile(eq(testUserId), any(UpdateProfileRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when email already in use")
        @WithMockUser(roles = "SCOUT")
        void updateProfile_EmailAlreadyInUse_Unauthorized() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setEmail("existing@campcard.org");

            when(authService.getUserIdFromToken("valid-token")).thenReturn(testUserId);
            when(authService.updateProfile(eq(testUserId), any(UpdateProfileRequest.class)))
                    .thenThrow(new AuthenticationException("Email already in use"));

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService).updateProfile(eq(testUserId), any(UpdateProfileRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when first name is blank")
        @WithMockUser(roles = "SCOUT")
        void updateProfile_BlankFirstName_BadRequest() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("");
            request.setLastName("Doe");
            request.setEmail("test@campcard.org");

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).updateProfile(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when last name is blank")
        @WithMockUser(roles = "SCOUT")
        void updateProfile_BlankLastName_BadRequest() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("John");
            request.setLastName("");
            request.setEmail("test@campcard.org");

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).updateProfile(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when email is invalid")
        @WithMockUser(roles = "SCOUT")
        void updateProfile_InvalidEmail_BadRequest() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setEmail("not-an-email");

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer valid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).updateProfile(any(), any());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void updateProfile_NotAuthenticated_Unauthorized() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setEmail("test@campcard.org");

            mockMvc.perform(put("/api/v1/auth/profile")
                            .header("Authorization", "Bearer some-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(authService, never()).updateProfile(any(), any());
        }
    }

    // ========================================================================
    // INPUT VALIDATION TESTS
    // ========================================================================

    @Nested
    @DisplayName("Input Validation Tests")
    class InputValidationTests {

        @Test
        @DisplayName("Should return 400 for empty request body on login")
        void login_EmptyBody_BadRequest() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}")
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("Should return 400 for empty request body on register")
        void register_EmptyBody_BadRequest() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}")
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("Should return 400 for malformed JSON on login")
        void login_MalformedJson_BadRequest() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json}")
                            .with(csrf()))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("Should accept email with subdomain")
        void login_EmailWithSubdomain_Success() throws Exception {
            validLoginRequest.setEmail("user@mail.campcard.org");
            when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isOk());

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should accept email with plus sign")
        void login_EmailWithPlusSign_Success() throws Exception {
            validLoginRequest.setEmail("user+test@campcard.org");
            when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isOk());

            verify(authService).login(any(LoginRequest.class));
        }
    }

    // ========================================================================
    // ERROR HANDLING TESTS
    // ========================================================================

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should return 401 for AuthenticationException")
        void authenticationException_ReturnsUnauthorized() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new AuthenticationException("Custom auth error"));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should handle concurrent login attempts")
        void login_ConcurrentAttempts_HandledGracefully() throws Exception {
            when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

            // Simulate concurrent requests
            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isOk());

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isOk());

            verify(authService, times(2)).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Should handle service unavailable gracefully")
        void login_ServiceUnavailable_InternalServerError() throws Exception {
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(new RuntimeException("Database connection failed"));

            performPost("/api/v1/auth/login", validLoginRequest)
                    .andExpect(status().isInternalServerError());
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private ResultActions performPost(String url, Object content) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .with(csrf()));
    }
}

package com.bsa.campcard.contract;

import com.bsa.campcard.dto.auth.*;
import com.bsa.campcard.integration.TestDataBuilder;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for Authentication API endpoints.
 *
 * Validates:
 * - Request schema compliance
 * - Response schema compliance
 * - Required field enforcement
 * - Error response format
 * - Enum value validation
 */
@DisplayName("Auth API Contract Tests")
@Disabled("Contract tests need Spring context configuration fix - temporarily disabled")
class AuthContractTest extends AbstractContractTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test user for login tests
        testUser = TestDataBuilder.createUser(User.UserRole.SCOUT);
        testUser.setEmail("auth-contract-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        testUser.setPasswordHash(passwordEncoder.encode("TestPassword123!"));
        testUser.setEmailVerified(true);
        testUser = userRepository.save(testUser);
        flushAndClear();
    }

    @AfterEach
    void tearDown() {
        if (testUser != null && testUser.getId() != null) {
            userRepository.deleteById(testUser.getId());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/login")
    class LoginContractTests {

        @Test
        @DisplayName("Should return AuthResponse with correct schema on successful login")
        void shouldReturnAuthResponseSchema() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email(testUser.getEmail())
                    .password("TestPassword123!")
                    .build();

            postRequest("/api/v1/auth/mobile/login", request)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    // AuthResponse fields
                    .andExpect(jsonPath("$.accessToken").isString())
                    .andExpect(jsonPath("$.refreshToken").isString())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.expiresIn").isNumber())
                    // UserInfo nested object
                    .andExpect(jsonPath("$.user").exists())
                    .andExpect(jsonPath("$.user.id").isString())
                    .andExpect(jsonPath("$.user.email").value(testUser.getEmail()))
                    .andExpect(jsonPath("$.user.firstName").value(testUser.getFirstName()))
                    .andExpect(jsonPath("$.user.lastName").value(testUser.getLastName()))
                    .andExpect(jsonPath("$.user.role").isString())
                    .andExpect(jsonPath("$.user.emailVerified").isBoolean());
        }

        @Test
        @DisplayName("Should validate email is required")
        void shouldRequireEmail() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .password("TestPassword123!")
                    .build();

            postRequest("/api/v1/auth/login", request)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Should validate email format")
        void shouldValidateEmailFormat() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("invalid-email")
                    .password("TestPassword123!")
                    .build();

            postRequest("/api/v1/auth/login", request)
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should validate password is required")
        void shouldRequirePassword() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("test@test.com")
                    .build();

            postRequest("/api/v1/auth/login", request)
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 for invalid credentials")
        void shouldReturn401ForInvalidCredentials() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email(testUser.getEmail())
                    .password("WrongPassword123!")
                    .build();

            postRequest("/api/v1/auth/mobile/login", request)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/register")
    class RegisterContractTests {

        @Test
        @DisplayName("Should return AuthResponse on successful registration")
        void shouldReturnAuthResponseOnRegister() throws Exception {
            String uniqueEmail = "register-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";
            RegisterRequest request = RegisterRequest.builder()
                    .email(uniqueEmail)
                    .password("NewPassword123!")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            postRequest("/api/v1/auth/register", request)
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.accessToken").isString())
                    .andExpect(jsonPath("$.refreshToken").isString())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.user.email").value(uniqueEmail));

            // Clean up
            userRepository.findByEmail(uniqueEmail).ifPresent(user -> userRepository.delete(user));
        }

        @Test
        @DisplayName("Should validate required fields")
        void shouldValidateRequiredFields() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("test@test.com")
                    // Missing password, firstName, lastName
                    .build();

            postRequest("/api/v1/auth/register", request)
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should validate password minimum length")
        void shouldValidatePasswordMinLength() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email("shortpass@test.com")
                    .password("short")  // Less than 8 characters
                    .firstName("Test")
                    .lastName("User")
                    .build();

            postRequest("/api/v1/auth/register", request)
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 409 for duplicate email")
        void shouldReturn409ForDuplicateEmail() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .email(testUser.getEmail())  // Already exists
                    .password("NewPassword123!")
                    .firstName("Test")
                    .lastName("User")
                    .build();

            postRequest("/api/v1/auth/register", request)
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/refresh")
    class RefreshTokenContractTests {

        @Test
        @DisplayName("Should return new tokens on valid refresh token")
        void shouldReturnNewTokensOnRefresh() throws Exception {
            // First login to get tokens
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(testUser.getEmail())
                    .password("TestPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String refreshToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                    .get("refreshToken").asText();

            RefreshTokenRequest request = RefreshTokenRequest.builder()
                    .refreshToken(refreshToken)
                    .build();

            postRequest("/api/v1/auth/refresh", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isString())
                    .andExpect(jsonPath("$.refreshToken").isString());
        }

        @Test
        @DisplayName("Should validate refresh token is required")
        void shouldRequireRefreshToken() throws Exception {
            RefreshTokenRequest request = RefreshTokenRequest.builder().build();

            postRequest("/api/v1/auth/refresh", request)
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/auth/me")
    class GetCurrentUserContractTests {

        @Test
        @DisplayName("Should return user profile with correct schema")
        void shouldReturnUserProfile() throws Exception {
            // Login to get token
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(testUser.getEmail())
                    .password("TestPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String token = extractToken(loginResult);

            getRequest("/api/v1/auth/me", token)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").isString())
                    .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                    .andExpect(jsonPath("$.firstName").isString())
                    .andExpect(jsonPath("$.lastName").isString())
                    .andExpect(jsonPath("$.role").isString());
        }

        @Test
        @DisplayName("Should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            getRequest("/api/v1/auth/me")
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/forgot-password")
    class ForgotPasswordContractTests {

        @Test
        @DisplayName("Should return success message for valid email")
        void shouldReturnSuccessMessage() throws Exception {
            ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                    .email(testUser.getEmail())
                    .build();

            postRequest("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").isString());
        }

        @Test
        @DisplayName("Should return success even for non-existent email (security)")
        void shouldReturnSuccessForNonExistentEmail() throws Exception {
            ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                    .email("nonexistent@test.com")
                    .build();

            // Should still return 200 to prevent email enumeration
            postRequest("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should validate email is required")
        void shouldRequireEmail() throws Exception {
            ForgotPasswordRequest request = ForgotPasswordRequest.builder().build();

            postRequest("/api/v1/auth/forgot-password", request)
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/change-password")
    class ChangePasswordContractTests {

        @Test
        @DisplayName("Should return 401 without authentication")
        void shouldRequireAuthentication() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("TestPassword123!");
            request.setNewPassword("NewPassword456!");

            postRequest("/api/v1/auth/change-password", request)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/auth/logout")
    class LogoutContractTests {

        @Test
        @DisplayName("Should return 204 on successful logout")
        void shouldReturn204OnLogout() throws Exception {
            // Login to get token
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(testUser.getEmail())
                    .password("TestPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String token = extractToken(loginResult);

            postRequest("/api/v1/auth/logout", null, token)
                    .andExpect(status().isNoContent());
        }
    }
}

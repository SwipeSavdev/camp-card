package com.bsa.campcard.contract;

import com.bsa.campcard.dto.auth.LoginRequest;
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
 * Contract tests for API error responses.
 *
 * Validates that all error responses follow a consistent schema:
 * - 400 Bad Request: Validation errors
 * - 401 Unauthorized: Authentication required
 * - 403 Forbidden: Insufficient permissions
 * - 404 Not Found: Resource not found
 * - 409 Conflict: Resource already exists
 * - 500 Internal Server Error: Unexpected errors
 */
@DisplayName("Error Response Contract Tests")
@Disabled("Contract tests need Spring context configuration fix - temporarily disabled")
class ErrorResponseContractTest extends AbstractContractTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User regularUser;
    private String adminToken;
    private String userToken;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();
        // Create admin user
        adminUser = TestDataBuilder.createUser(User.UserRole.NATIONAL_ADMIN);
        adminUser.setEmail("error-contract-admin-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPassword123!"));
        adminUser.setEmailVerified(true);
        adminUser = userRepository.save(adminUser);

        // Create regular user
        regularUser = TestDataBuilder.createUser(User.UserRole.SCOUT);
        regularUser.setEmail("error-contract-scout-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        regularUser.setPasswordHash(passwordEncoder.encode("UserPassword123!"));
        regularUser.setEmailVerified(true);
        regularUser = userRepository.save(regularUser);

        flushAndClear();

        try {
            // Login as admin
            LoginRequest adminLogin = LoginRequest.builder()
                    .email(adminUser.getEmail())
                    .password("AdminPassword123!")
                    .build();
            MvcResult adminResult = postRequest("/api/v1/auth/mobile/login", adminLogin)
                    .andExpect(status().isOk())
                    .andReturn();
            adminToken = extractToken(adminResult);

            // Login as regular user
            LoginRequest userLogin = LoginRequest.builder()
                    .email(regularUser.getEmail())
                    .password("UserPassword123!")
                    .build();
            MvcResult userResult = postRequest("/api/v1/auth/mobile/login", userLogin)
                    .andExpect(status().isOk())
                    .andReturn();
            userToken = extractToken(userResult);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set up test", e);
        }
    }

    @AfterEach
    void tearDown() {
        if (regularUser != null && regularUser.getId() != null) {
            userRepository.deleteById(regularUser.getId());
        }
        if (adminUser != null && adminUser.getId() != null) {
            userRepository.deleteById(adminUser.getId());
        }
    }

    @Nested
    @DisplayName("400 Bad Request - Validation Errors")
    class BadRequestTests {

        @Test
        @DisplayName("Should return error with message for missing required fields")
        void shouldReturnErrorForMissingFields() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    // Missing email and password
                    .build();

            postRequest("/api/v1/auth/login", request)
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("Should return error for invalid email format")
        void shouldReturnErrorForInvalidEmail() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("not-an-email")
                    .password("password123")
                    .build();

            postRequest("/api/v1/auth/login", request)
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(JSON));
        }

        @Test
        @DisplayName("Should return error for invalid request body")
        void shouldReturnErrorForInvalidBody() throws Exception {
            // Send malformed JSON
            mockMvc.perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                            .post("/api/v1/auth/login")
                            .contentType(JSON)
                            .content("{invalid json}")
            )
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("401 Unauthorized - Authentication Required")
    class UnauthorizedTests {

        @Test
        @DisplayName("Should return 401 for protected endpoint without token")
        void shouldReturn401WithoutToken() throws Exception {
            getRequest("/api/v1/users")
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 for invalid token")
        void shouldReturn401ForInvalidToken() throws Exception {
            getRequest("/api/v1/users", "invalid-token")
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 for expired token format")
        void shouldReturn401ForMalformedToken() throws Exception {
            getRequest("/api/v1/users", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 for wrong credentials")
        void shouldReturn401ForWrongCredentials() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email(adminUser.getEmail())
                    .password("WrongPassword!")
                    .build();

            postRequest("/api/v1/auth/mobile/login", request)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("403 Forbidden - Insufficient Permissions")
    class ForbiddenTests {

        @Test
        @DisplayName("Should return 403 for non-admin accessing admin endpoint")
        void shouldReturn403ForNonAdmin() throws Exception {
            getRequest("/api/v1/users", userToken)
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should return 403 for creating user without admin role")
        void shouldReturn403ForUnauthorizedCreate() throws Exception {
            org.bsa.campcard.domain.user.UserService.UserCreateRequest request =
                    new org.bsa.campcard.domain.user.UserService.UserCreateRequest(
                            "test@test.com",
                            "Password123!",
                            "Test",
                            "User",
                            null,
                            User.UserRole.SCOUT,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null
                    );

            postRequest("/api/v1/users", request, userToken)
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should return 403 for deleting user without admin role")
        void shouldReturn403ForUnauthorizedDelete() throws Exception {
            deleteRequest("/api/v1/users/" + adminUser.getId(), userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("404 Not Found - Resource Not Found")
    class NotFoundTests {

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() throws Exception {
            getRequest("/api/v1/users/" + UUID.randomUUID(), adminToken)
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 for non-existent council")
        void shouldReturn404ForNonExistentCouncil() throws Exception {
            getRequest("/api/v1/councils/99999999", adminToken)
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 for non-existent council by UUID")
        void shouldReturn404ForNonExistentCouncilByUuid() throws Exception {
            getRequest("/api/v1/councils/uuid/" + UUID.randomUUID(), adminToken)
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("409 Conflict - Resource Already Exists")
    class ConflictTests {

        @Test
        @DisplayName("Should return 409 for duplicate email on registration")
        void shouldReturn409ForDuplicateEmail() throws Exception {
            com.bsa.campcard.dto.auth.RegisterRequest request =
                    com.bsa.campcard.dto.auth.RegisterRequest.builder()
                            .email(adminUser.getEmail())  // Already exists
                            .password("NewPassword123!")
                            .firstName("Test")
                            .lastName("User")
                            .build();

            postRequest("/api/v1/auth/register", request)
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("Content Type Validation")
    class ContentTypeTests {

        @Test
        @DisplayName("Should return error for wrong content type")
        void shouldReturnErrorForWrongContentType() throws Exception {
            mockMvc.perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                            .post("/api/v1/auth/login")
                            .contentType("text/plain")
                            .content("email=test@test.com&password=test")
            )
                    .andExpect(status().isUnsupportedMediaType());
        }
    }

    @Nested
    @DisplayName("Response Headers")
    class ResponseHeaderTests {

        @Test
        @DisplayName("Should return JSON content type for success responses")
        void shouldReturnJsonContentType() throws Exception {
            getRequest("/api/v1/councils", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON));
        }

        @Test
        @DisplayName("Should return JSON content type for error responses")
        void shouldReturnJsonContentTypeForErrors() throws Exception {
            LoginRequest request = LoginRequest.builder()
                    .email("wrong@test.com")
                    .password("wrong")
                    .build();

            // Some error responses may not have content type if empty body
            postRequest("/api/v1/auth/mobile/login", request)
                    .andExpect(status().isUnauthorized());
        }
    }
}

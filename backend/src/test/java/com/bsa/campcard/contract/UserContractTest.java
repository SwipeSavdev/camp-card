package com.bsa.campcard.contract;

import com.bsa.campcard.dto.auth.LoginRequest;
import com.bsa.campcard.integration.TestDataBuilder;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.bsa.campcard.domain.user.UserService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for User API endpoints.
 *
 * Validates:
 * - UserResponse schema compliance
 * - Pagination response format
 * - RBAC enforcement
 * - Required field validation
 */
@DisplayName("User API Contract Tests")
class UserContractTest extends AbstractContractTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User regularUser;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Create admin user
        adminUser = TestDataBuilder.createUser(User.UserRole.NATIONAL_ADMIN);
        adminUser.setEmail("user-contract-admin-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPassword123!"));
        adminUser.setEmailVerified(true);
        adminUser = userRepository.save(adminUser);

        // Create regular user
        regularUser = TestDataBuilder.createUser(User.UserRole.SCOUT);
        regularUser.setEmail("user-contract-scout-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        regularUser.setPasswordHash(passwordEncoder.encode("UserPassword123!"));
        regularUser.setEmailVerified(true);
        regularUser = userRepository.save(regularUser);

        flushAndClear();

        // Login as admin
        LoginRequest loginRequest = LoginRequest.builder()
                .email(adminUser.getEmail())
                .password("AdminPassword123!")
                .build();

        MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                .andExpect(status().isOk())
                .andReturn();

        adminToken = extractToken(loginResult);
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
    @DisplayName("GET /api/v1/users")
    class GetAllUsersContractTests {

        @Test
        @DisplayName("Should return paginated users with correct schema")
        void shouldReturnPaginatedUsers() throws Exception {
            getRequest("/api/v1/users", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    // Page structure
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.pageable").exists())
                    .andExpect(jsonPath("$.totalElements").isNumber())
                    .andExpect(jsonPath("$.totalPages").isNumber())
                    .andExpect(jsonPath("$.size").isNumber())
                    .andExpect(jsonPath("$.number").isNumber())
                    // User schema in content
                    .andExpect(jsonPath("$.content[0].id").exists())
                    .andExpect(jsonPath("$.content[0].email").exists())
                    .andExpect(jsonPath("$.content[0].firstName").exists())
                    .andExpect(jsonPath("$.content[0].lastName").exists())
                    .andExpect(jsonPath("$.content[0].role").exists());
        }

        @Test
        @DisplayName("Should respect size parameter")
        void shouldRespectSizeParameter() throws Exception {
            getRequest("/api/v1/users?size=5", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.size").value(5));
        }

        @Test
        @DisplayName("Should return 401 without authentication")
        void shouldReturn401WithoutAuth() throws Exception {
            getRequest("/api/v1/users")
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 403 for non-admin users")
        void shouldReturn403ForNonAdmin() throws Exception {
            // Login as regular user
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(regularUser.getEmail())
                    .password("UserPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String userToken = extractToken(loginResult);

            getRequest("/api/v1/users", userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/users/{id}")
    class GetUserByIdContractTests {

        @Test
        @DisplayName("Should return user with correct schema")
        void shouldReturnUserSchema() throws Exception {
            getRequest("/api/v1/users/" + regularUser.getId(), adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").value(regularUser.getId().toString()))
                    .andExpect(jsonPath("$.email").value(regularUser.getEmail()))
                    .andExpect(jsonPath("$.firstName").isString())
                    .andExpect(jsonPath("$.lastName").isString())
                    .andExpect(jsonPath("$.role").isString())
                    .andExpect(jsonPath("$.isActive").isBoolean())
                    .andExpect(jsonPath("$.emailVerified").isBoolean());
        }

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistent() throws Exception {
            getRequest("/api/v1/users/" + UUID.randomUUID(), adminToken)
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/users")
    class CreateUserContractTests {

        @Test
        @DisplayName("Should create user with valid request")
        void shouldCreateUser() throws Exception {
            String uniqueEmail = "new-user-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";

            UserService.UserCreateRequest request = new UserService.UserCreateRequest(
                    uniqueEmail,
                    "NewPassword123!",
                    "New",
                    "User",
                    "555-1234",
                    User.UserRole.SCOUT,
                    null,  // councilId
                    null,  // troopId
                    null,  // unitType
                    null   // unitNumber
            );

            postRequest("/api/v1/users", request, adminToken)
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").isString())
                    .andExpect(jsonPath("$.email").value(uniqueEmail))
                    .andExpect(jsonPath("$.firstName").value("New"))
                    .andExpect(jsonPath("$.lastName").value("User"))
                    .andExpect(jsonPath("$.role").value("SCOUT"));

            // Clean up
            userRepository.findByEmail(uniqueEmail).ifPresent(user -> userRepository.delete(user));
        }

        @Test
        @DisplayName("Should return 403 for non-admin creating user")
        void shouldReturn403ForNonAdmin() throws Exception {
            // Login as regular user
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(regularUser.getEmail())
                    .password("UserPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String userToken = extractToken(loginResult);

            UserService.UserCreateRequest request = new UserService.UserCreateRequest(
                    "test@test.com",
                    "Password123!",
                    "Test",
                    "User",
                    null,
                    User.UserRole.SCOUT,
                    null,  // councilId
                    null,  // troopId
                    null,  // unitType
                    null   // unitNumber
            );

            postRequest("/api/v1/users", request, userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/users/{id}")
    class UpdateUserContractTests {

        @Test
        @DisplayName("Should update user with valid request")
        void shouldUpdateUser() throws Exception {
            UserService.UserUpdateRequest request = new UserService.UserUpdateRequest(
                    "Updated",  // firstName
                    "Name",     // lastName
                    "555-9999", // phoneNumber
                    null,       // role
                    null,       // isActive
                    null,       // unitType
                    null        // unitNumber
            );

            putRequest("/api/v1/users/" + regularUser.getId(), request, adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.firstName").value("Updated"))
                    .andExpect(jsonPath("$.lastName").value("Name"));
        }

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistent() throws Exception {
            UserService.UserUpdateRequest request = new UserService.UserUpdateRequest(
                    "Updated",  // firstName
                    "Name",     // lastName
                    null,       // phoneNumber
                    null,       // role
                    null,       // isActive
                    null,       // unitType
                    null        // unitNumber
            );

            putRequest("/api/v1/users/" + UUID.randomUUID(), request, adminToken)
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/users/{id}")
    class DeleteUserContractTests {

        @Test
        @DisplayName("Should delete user and return 204")
        void shouldDeleteUser() throws Exception {
            // Create a user to delete
            User toDelete = TestDataBuilder.createUser(User.UserRole.SCOUT);
            toDelete.setEmail("to-delete-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
            toDelete.setPasswordHash(passwordEncoder.encode("Password123!"));
            toDelete = userRepository.save(toDelete);
            flushAndClear();

            deleteRequest("/api/v1/users/" + toDelete.getId(), adminToken)
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistent() throws Exception {
            deleteRequest("/api/v1/users/" + UUID.randomUUID(), adminToken)
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 403 for non-admin")
        void shouldReturn403ForNonAdmin() throws Exception {
            // Login as regular user
            LoginRequest loginRequest = LoginRequest.builder()
                    .email(regularUser.getEmail())
                    .password("UserPassword123!")
                    .build();

            MvcResult loginResult = postRequest("/api/v1/auth/mobile/login", loginRequest)
                    .andExpect(status().isOk())
                    .andReturn();

            String userToken = extractToken(loginResult);

            deleteRequest("/api/v1/users/" + adminUser.getId(), userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/users/search")
    class SearchUsersContractTests {

        @Test
        @DisplayName("Should return search results with pagination")
        void shouldReturnSearchResults() throws Exception {
            getRequest("/api/v1/users/search?q=contract", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.totalElements").isNumber());
        }

        @Test
        @DisplayName("Should require search parameter")
        void shouldRequireSearchParam() throws Exception {
            getRequest("/api/v1/users/search", adminToken)
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("UserRole Enum Validation")
    class UserRoleEnumTests {

        @Test
        @DisplayName("Should accept valid role values")
        void shouldAcceptValidRoles() throws Exception {
            // Test that all 5 valid roles are accepted
            String[] validRoles = {"NATIONAL_ADMIN", "COUNCIL_ADMIN", "UNIT_LEADER", "PARENT", "SCOUT"};

            for (String role : validRoles) {
                String uniqueEmail = "role-test-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";

                UserService.UserCreateRequest request = new UserService.UserCreateRequest(
                        uniqueEmail,
                        "Password123!",
                        "Test",
                        "User",
                        null,
                        User.UserRole.valueOf(role),
                        null,  // councilId
                        null,  // troopId
                        null,  // unitType
                        null   // unitNumber
                );

                postRequest("/api/v1/users", request, adminToken)
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.role").value(role));

                // Clean up
                userRepository.findByEmail(uniqueEmail).ifPresent(user -> userRepository.delete(user));
            }
        }
    }
}

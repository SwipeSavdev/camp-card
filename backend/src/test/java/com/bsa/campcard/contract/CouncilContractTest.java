package com.bsa.campcard.contract;

import com.bsa.campcard.dto.CouncilRequest;
import com.bsa.campcard.dto.auth.LoginRequest;
import com.bsa.campcard.entity.Council;
import com.bsa.campcard.integration.TestDataBuilder;
import com.bsa.campcard.repository.CouncilRepository;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for Council API endpoints.
 *
 * Validates:
 * - CouncilResponse schema compliance
 * - CouncilRequest validation
 * - RBAC enforcement
 * - Pagination format
 */
@DisplayName("Council API Contract Tests")
@Disabled("Contract tests need Spring context configuration fix - temporarily disabled")
class CouncilContractTest extends AbstractContractTest {

    @Autowired
    private CouncilRepository councilRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User regularUser;
    private String adminToken;
    private Council testCouncil;

    @BeforeEach
    void setUp() throws Exception {
        // Create admin user
        adminUser = TestDataBuilder.createUser(User.UserRole.NATIONAL_ADMIN);
        adminUser.setEmail("council-contract-admin-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPassword123!"));
        adminUser.setEmailVerified(true);
        adminUser = userRepository.save(adminUser);

        // Create regular user
        regularUser = TestDataBuilder.createUser(User.UserRole.SCOUT);
        regularUser.setEmail("council-contract-scout-" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        regularUser.setPasswordHash(passwordEncoder.encode("UserPassword123!"));
        regularUser.setEmailVerified(true);
        regularUser = userRepository.save(regularUser);

        // Create test council
        testCouncil = TestDataBuilder.createCouncil();
        testCouncil = councilRepository.save(testCouncil);

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
        if (testCouncil != null && testCouncil.getId() != null) {
            councilRepository.deleteById(testCouncil.getId());
        }
        if (regularUser != null && regularUser.getId() != null) {
            userRepository.deleteById(regularUser.getId());
        }
        if (adminUser != null && adminUser.getId() != null) {
            userRepository.deleteById(adminUser.getId());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/councils")
    class GetAllCouncilsContractTests {

        @Test
        @DisplayName("Should return paginated councils with correct schema")
        void shouldReturnPaginatedCouncils() throws Exception {
            getRequest("/api/v1/councils", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    // Page structure
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.totalElements").isNumber())
                    .andExpect(jsonPath("$.totalPages").isNumber())
                    .andExpect(jsonPath("$.size").isNumber())
                    .andExpect(jsonPath("$.number").isNumber());
        }

        @Test
        @DisplayName("Should return council with correct schema in list")
        void shouldReturnCouncilSchema() throws Exception {
            getRequest("/api/v1/councils?size=100", adminToken)
                    .andExpect(status().isOk())
                    // Council schema
                    .andExpect(jsonPath("$.content[?(@.id == " + testCouncil.getId() + ")].councilNumber").exists())
                    .andExpect(jsonPath("$.content[?(@.id == " + testCouncil.getId() + ")].name").exists())
                    .andExpect(jsonPath("$.content[?(@.id == " + testCouncil.getId() + ")].region").exists());
        }

        @Test
        @DisplayName("Should support search parameter")
        void shouldSupportSearch() throws Exception {
            getRequest("/api/v1/councils?search=Test", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("Should support status filter")
        void shouldSupportStatusFilter() throws Exception {
            getRequest("/api/v1/councils?status=ACTIVE", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("Should support region filter")
        void shouldSupportRegionFilter() throws Exception {
            getRequest("/api/v1/councils?region=NORTHEAST", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/councils/{id}")
    class GetCouncilByIdContractTests {

        @Test
        @DisplayName("Should return council with correct schema")
        void shouldReturnCouncilSchema() throws Exception {
            getRequest("/api/v1/councils/" + testCouncil.getId(), adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").value(testCouncil.getId()))
                    .andExpect(jsonPath("$.uuid").isString())
                    .andExpect(jsonPath("$.councilNumber").value(testCouncil.getCouncilNumber()))
                    .andExpect(jsonPath("$.name").value(testCouncil.getName()))
                    .andExpect(jsonPath("$.region").value(testCouncil.getRegion()))
                    .andExpect(jsonPath("$.status").isString());
        }

        @Test
        @DisplayName("Should return council by UUID")
        void shouldReturnCouncilByUuid() throws Exception {
            getRequest("/api/v1/councils/uuid/" + testCouncil.getUuid(), adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testCouncil.getId()));
        }

        @Test
        @DisplayName("Should return council by council number")
        void shouldReturnCouncilByNumber() throws Exception {
            getRequest("/api/v1/councils/number/" + testCouncil.getCouncilNumber(), adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testCouncil.getId()));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/councils")
    class CreateCouncilContractTests {

        @Test
        @DisplayName("Should create council with valid request")
        void shouldCreateCouncil() throws Exception {
            String uniqueNumber = "C-" + UUID.randomUUID().toString().substring(0, 6);
            CouncilRequest request = CouncilRequest.builder()
                    .councilNumber(uniqueNumber)
                    .name("New Test Council")
                    .region("SOUTHERN")
                    .city("Atlanta")
                    .state("GA")
                    .status("ACTIVE")
                    .build();

            MvcResult result = postRequest("/api/v1/councils", request, adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.uuid").isString())
                    .andExpect(jsonPath("$.councilNumber").value(uniqueNumber))
                    .andExpect(jsonPath("$.name").value("New Test Council"))
                    .andExpect(jsonPath("$.region").value("SOUTHERN"))
                    .andReturn();

            // Clean up
            Long createdId = objectMapper.readTree(result.getResponse().getContentAsString())
                    .get("id").asLong();
            councilRepository.deleteById(createdId);
        }

        @Test
        @DisplayName("Should validate required fields")
        void shouldValidateRequiredFields() throws Exception {
            CouncilRequest request = CouncilRequest.builder()
                    // Missing councilNumber, name, region
                    .city("Test City")
                    .build();

            postRequest("/api/v1/councils", request, adminToken)
                    .andExpect(status().isBadRequest());
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

            CouncilRequest request = CouncilRequest.builder()
                    .councilNumber("C-TEST")
                    .name("Test Council")
                    .region("NORTHEAST")
                    .build();

            postRequest("/api/v1/councils", request, userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/councils/{id}")
    class UpdateCouncilContractTests {

        @Test
        @DisplayName("Should update council with valid request")
        void shouldUpdateCouncil() throws Exception {
            CouncilRequest request = CouncilRequest.builder()
                    .councilNumber(testCouncil.getCouncilNumber())
                    .name("Updated Council Name")
                    .region(testCouncil.getRegion())
                    .city("Updated City")
                    .state("CA")
                    .build();

            putRequest("/api/v1/councils/" + testCouncil.getId(), request, adminToken)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Council Name"))
                    .andExpect(jsonPath("$.city").value("Updated City"));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/councils/{id}")
    class DeleteCouncilContractTests {

        @Test
        @DisplayName("Should delete council and return 200")
        void shouldDeleteCouncil() throws Exception {
            // Create a council to delete
            Council toDelete = TestDataBuilder.createCouncil();
            toDelete = councilRepository.save(toDelete);
            flushAndClear();

            deleteRequest("/api/v1/councils/" + toDelete.getId(), adminToken)
                    .andExpect(status().isOk());
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

            deleteRequest("/api/v1/councils/" + testCouncil.getId(), userToken)
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/councils/stats")
    class CouncilStatsContractTests {

        @Test
        @DisplayName("Should return stats with correct schema")
        void shouldReturnStatsSchema() throws Exception {
            getRequest("/api/v1/councils/stats", adminToken)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.totalCouncils").isNumber())
                    .andExpect(jsonPath("$.activeCouncils").isNumber());
        }
    }

    @Nested
    @DisplayName("CouncilStatus Enum Validation")
    class CouncilStatusEnumTests {

        @Test
        @DisplayName("Should accept valid status values")
        void shouldAcceptValidStatusValues() throws Exception {
            String[] validStatuses = {"ACTIVE", "INACTIVE", "SUSPENDED", "TRIAL"};

            for (String status : validStatuses) {
                String uniqueNumber = "C-" + UUID.randomUUID().toString().substring(0, 6);
                CouncilRequest request = CouncilRequest.builder()
                        .councilNumber(uniqueNumber)
                        .name("Status Test Council")
                        .region("NORTHEAST")
                        .status(status)
                        .build();

                MvcResult result = postRequest("/api/v1/councils", request, adminToken)
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.status").value(status))
                        .andReturn();

                // Clean up
                Long createdId = objectMapper.readTree(result.getResponse().getContentAsString())
                        .get("id").asLong();
                councilRepository.deleteById(createdId);
            }
        }
    }
}

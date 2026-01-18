package com.bsa.campcard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsa.campcard.api.UserController;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserService;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.Import;

/**
 * Unit tests for UserController using @WebMvcTest.
 *
 * Tests the REST API layer including:
 * - User CRUD operations
 * - User search and filtering
 * - Troop/Council assignments
 * - Pagination
 *
 * Security is disabled for unit testing - authorization is tested at integration level.
 */
@WebMvcTest(value = UserController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UUID testUserId;
    private UUID testCouncilId;
    private UUID testTroopId;
    private User testUser;
    private UserService.UserCreateRequest validCreateRequest;
    private UserService.UserUpdateRequest validUpdateRequest;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testCouncilId = UUID.randomUUID();
        testTroopId = UUID.randomUUID();

        testUser = User.builder()
                .id(testUserId)
                .email("scout@example.com")
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("303-555-1234")
                .role(User.UserRole.SCOUT)
                .councilId(testCouncilId)
                .troopId(testTroopId)
                .isActive(true)
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        validCreateRequest = new UserService.UserCreateRequest(
                "newuser@example.com",
                "Password123",
                "Jane",
                "Smith",
                "303-555-5678",
                User.UserRole.SCOUT,
                testCouncilId,
                testTroopId,
                null,
                null
        );

        validUpdateRequest = new UserService.UserUpdateRequest(
                "Jane",
                "Updated",
                "303-555-9999",
                User.UserRole.SCOUT,
                true,
                null,
                null
        );
    }

    // ========================================================================
    // GET ALL USERS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users - Get All Users")
    class GetAllUsersTests {

        @Test
        @DisplayName("Should return paginated users")
        void getAllUsers_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 20), 1);
            when(userService.getAllUsers(any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].email").value("scout@example.com"))
                    .andExpect(jsonPath("$.content[0].firstName").value("John"))
                    .andExpect(jsonPath("$.content[0].lastName").value("Doe"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(userService).getAllUsers(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no users exist")
        void getAllUsers_Empty_ReturnsEmptyPage() throws Exception {
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(userService.getAllUsers(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("Should support pagination parameters")
        void getAllUsers_WithPagination_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(1, 10), 1);
            when(userService.getAllUsers(any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users")
                            .param("page", "1")
                            .param("size", "10")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.pageable.pageNumber").value(1))
                    .andExpect(jsonPath("$.pageable.pageSize").value(10));

            verify(userService).getAllUsers(any(Pageable.class));
        }
    }

    // ========================================================================
    // SEARCH USERS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/search - Search Users")
    class SearchUsersTests {

        @Test
        @DisplayName("Should search users by query")
        void searchUsers_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 20), 1);
            when(userService.searchUsers(eq("John"), any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users/search")
                            .param("q", "John")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].firstName").value("John"));

            verify(userService).searchUsers(eq("John"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty result when no matches")
        void searchUsers_NoMatches_ReturnsEmpty() throws Exception {
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(userService.searchUsers(eq("nonexistent"), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/users/search")
                            .param("q", "nonexistent")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(userService).searchUsers(eq("nonexistent"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search by email")
        void searchUsers_ByEmail_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 20), 1);
            when(userService.searchUsers(eq("scout@example.com"), any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users/search")
                            .param("q", "scout@example.com")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].email").value("scout@example.com"));

            verify(userService).searchUsers(eq("scout@example.com"), any(Pageable.class));
        }
    }

    // ========================================================================
    // GET USER BY ID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/{id} - Get User by ID")
    class GetUserByIdTests {

        @Test
        @DisplayName("Should return user when found")
        void getUserById_Found_Success() throws Exception {
            when(userService.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testUserId.toString()))
                    .andExpect(jsonPath("$.email").value("scout@example.com"))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.role").value("SCOUT"));

            verify(userService).findById(testUserId);
        }

        @Test
        @DisplayName("Should return 404 when user not found")
        void getUserById_NotFound_Returns404() throws Exception {
            UUID unknownId = UUID.randomUUID();
            when(userService.findById(unknownId)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/users/" + unknownId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());

            verify(userService).findById(unknownId);
        }

        @Test
        @DisplayName("Should return user with all fields")
        void getUserById_AllFields_Success() throws Exception {
            when(userService.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.email").exists())
                    .andExpect(jsonPath("$.firstName").exists())
                    .andExpect(jsonPath("$.lastName").exists())
                    .andExpect(jsonPath("$.role").exists());

            verify(userService).findById(testUserId);
        }
    }

    // ========================================================================
    // CREATE USER TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/users - Create User")
    class CreateUserTests {

        @Test
        @DisplayName("Should create user successfully")
        void createUser_Success() throws Exception {
            User createdUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("newuser@example.com")
                    .firstName("Jane")
                    .lastName("Smith")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            when(userService.createUser(any(UserService.UserCreateRequest.class))).thenReturn(createdUser);

            mockMvc.perform(post("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("newuser@example.com"))
                    .andExpect(jsonPath("$.firstName").value("Jane"));

            verify(userService).createUser(any(UserService.UserCreateRequest.class));
        }

        @Test
        @DisplayName("Should create user with council and troop")
        void createUser_WithCouncilAndTroop_Success() throws Exception {
            User createdUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("newuser@example.com")
                    .firstName("Jane")
                    .lastName("Smith")
                    .role(User.UserRole.SCOUT)
                    .councilId(testCouncilId)
                    .troopId(testTroopId)
                    .isActive(true)
                    .build();

            when(userService.createUser(any(UserService.UserCreateRequest.class))).thenReturn(createdUser);

            mockMvc.perform(post("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.councilId").value(testCouncilId.toString()))
                    .andExpect(jsonPath("$.troopId").value(testTroopId.toString()));

            verify(userService).createUser(any(UserService.UserCreateRequest.class));
        }

        @Test
        @DisplayName("Should create user with different roles")
        void createUser_DifferentRoles_Success() throws Exception {
            User parentUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("parent@example.com")
                    .firstName("Parent")
                    .lastName("User")
                    .role(User.UserRole.PARENT)
                    .isActive(true)
                    .build();

            when(userService.createUser(any(UserService.UserCreateRequest.class))).thenReturn(parentUser);

            UserService.UserCreateRequest parentRequest = new UserService.UserCreateRequest(
                    "parent@example.com",
                    "Password123",
                    "Parent",
                    "User",
                    "303-555-0000",
                    User.UserRole.PARENT,
                    testCouncilId,
                    null,
                    null,
                    null
            );

            mockMvc.perform(post("/api/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(parentRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.role").value("PARENT"));

            verify(userService).createUser(any(UserService.UserCreateRequest.class));
        }
    }

    // ========================================================================
    // UPDATE USER TESTS
    // ========================================================================

    @Nested
    @DisplayName("PUT /api/v1/users/{id} - Update User")
    class UpdateUserTests {

        @Test
        @DisplayName("Should update user successfully")
        void updateUser_Success() throws Exception {
            User updatedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("Jane")
                    .lastName("Updated")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            when(userService.updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class)))
                    .thenReturn(updatedUser);

            mockMvc.perform(put("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validUpdateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("Jane"))
                    .andExpect(jsonPath("$.lastName").value("Updated"));

            verify(userService).updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class));
        }

        @Test
        @DisplayName("Should update user role")
        void updateUser_ChangeRole_Success() throws Exception {
            User updatedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.PARENT)
                    .isActive(true)
                    .build();

            when(userService.updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class)))
                    .thenReturn(updatedUser);

            UserService.UserUpdateRequest roleChangeRequest = new UserService.UserUpdateRequest(
                    "John",
                    "Doe",
                    "303-555-1234",
                    User.UserRole.PARENT,
                    true,
                    null,
                    null
            );

            mockMvc.perform(put("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(roleChangeRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value("PARENT"));

            verify(userService).updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class));
        }

        @Test
        @DisplayName("Should deactivate user")
        void updateUser_Deactivate_Success() throws Exception {
            User deactivatedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.SCOUT)
                    .isActive(false)
                    .build();

            when(userService.updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class)))
                    .thenReturn(deactivatedUser);

            UserService.UserUpdateRequest deactivateRequest = new UserService.UserUpdateRequest(
                    "John",
                    "Doe",
                    "303-555-1234",
                    User.UserRole.SCOUT,
                    false,
                    null,
                    null
            );

            mockMvc.perform(put("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(deactivateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isActive").value(false));

            verify(userService).updateUser(eq(testUserId), any(UserService.UserUpdateRequest.class));
        }
    }

    // ========================================================================
    // DELETE USER TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/users/{id} - Delete User")
    class DeleteUserTests {

        @Test
        @DisplayName("Should delete user successfully")
        void deleteUser_Success() throws Exception {
            doNothing().when(userService).deleteUser(testUserId);

            mockMvc.perform(delete("/api/v1/users/" + testUserId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNoContent());

            verify(userService).deleteUser(testUserId);
        }

        @Test
        @DisplayName("Should handle delete of non-existent user")
        void deleteUser_NotFound_Success() throws Exception {
            UUID unknownId = UUID.randomUUID();
            doNothing().when(userService).deleteUser(unknownId);

            mockMvc.perform(delete("/api/v1/users/" + unknownId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNoContent());

            verify(userService).deleteUser(unknownId);
        }
    }

    // ========================================================================
    // GET USERS BY COUNCIL TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/council/{councilId} - Get Users by Council")
    class GetUsersByCouncilTests {

        @Test
        @DisplayName("Should return users by council")
        void getUsersByCouncil_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 20), 1);
            when(userService.getUsersByCouncil(eq(testCouncilId), any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users/council/" + testCouncilId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].councilId").value(testCouncilId.toString()));

            verify(userService).getUsersByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty result when no users in council")
        void getUsersByCouncil_Empty_Success() throws Exception {
            UUID emptyCouncilId = UUID.randomUUID();
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(userService.getUsersByCouncil(eq(emptyCouncilId), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/users/council/" + emptyCouncilId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(userService).getUsersByCouncil(eq(emptyCouncilId), any(Pageable.class));
        }
    }

    // ========================================================================
    // GET USERS BY TROOP TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/troop/{troopId} - Get Users by Troop")
    class GetUsersByTroopTests {

        @Test
        @DisplayName("Should return users by troop")
        void getUsersByTroop_Success() throws Exception {
            Page<User> userPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 20), 1);
            when(userService.getUsersByTroop(eq(testTroopId), any(Pageable.class))).thenReturn(userPage);

            mockMvc.perform(get("/api/v1/users/troop/" + testTroopId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(userService).getUsersByTroop(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty result when no users in troop")
        void getUsersByTroop_Empty_Success() throws Exception {
            UUID emptyTroopId = UUID.randomUUID();
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(userService.getUsersByTroop(eq(emptyTroopId), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/users/troop/" + emptyTroopId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(userService).getUsersByTroop(eq(emptyTroopId), any(Pageable.class));
        }
    }

    // ========================================================================
    // GET SCOUTS BY TROOP TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/troop/{troopId}/scouts - Get Scouts by Troop")
    class GetScoutsByTroopTests {

        @Test
        @DisplayName("Should return scouts by troop")
        void getScoutsByTroop_Success() throws Exception {
            Page<User> scoutPage = new PageImpl<>(List.of(testUser), PageRequest.of(0, 50), 1);
            when(userService.getScoutsByTroop(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/users/troop/" + testTroopId + "/scouts")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(userService).getScoutsByTroop(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return only scouts (not other roles)")
        void getScoutsByTroop_OnlyScouts_Success() throws Exception {
            User scoutUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("scout@example.com")
                    .firstName("Scout")
                    .lastName("User")
                    .role(User.UserRole.SCOUT)
                    .troopId(testTroopId)
                    .build();

            Page<User> scoutPage = new PageImpl<>(List.of(scoutUser), PageRequest.of(0, 50), 1);
            when(userService.getScoutsByTroop(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/users/troop/" + testTroopId + "/scouts")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].role").value("SCOUT"));

            verify(userService).getScoutsByTroop(eq(testTroopId), any(Pageable.class));
        }
    }

    // ========================================================================
    // ASSIGN SCOUT TO TROOP TESTS
    // ========================================================================

    @Nested
    @DisplayName("PATCH /api/v1/users/{userId}/assign-troop/{troopId} - Assign Scout to Troop")
    class AssignScoutToTroopTests {

        @Test
        @DisplayName("Should assign scout to troop")
        void assignScoutToTroop_Success() throws Exception {
            User assignedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .troopId(testTroopId)
                    .role(User.UserRole.SCOUT)
                    .build();

            when(userService.assignToTroop(testUserId, testTroopId)).thenReturn(assignedUser);

            mockMvc.perform(patch("/api/v1/users/" + testUserId + "/assign-troop/" + testTroopId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopId").value(testTroopId.toString()));

            verify(userService).assignToTroop(testUserId, testTroopId);
        }

        @Test
        @DisplayName("Should reassign scout to different troop")
        void assignScoutToTroop_Reassign_Success() throws Exception {
            UUID newTroopId = UUID.randomUUID();
            User reassignedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .troopId(newTroopId)
                    .role(User.UserRole.SCOUT)
                    .build();

            when(userService.assignToTroop(testUserId, newTroopId)).thenReturn(reassignedUser);

            mockMvc.perform(patch("/api/v1/users/" + testUserId + "/assign-troop/" + newTroopId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopId").value(newTroopId.toString()));

            verify(userService).assignToTroop(testUserId, newTroopId);
        }
    }

    // ========================================================================
    // REMOVE SCOUT FROM TROOP TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/users/{userId}/troop - Remove Scout from Troop")
    class RemoveScoutFromTroopTests {

        @Test
        @DisplayName("Should remove scout from troop")
        void removeScoutFromTroop_Success() throws Exception {
            User removedUser = User.builder()
                    .id(testUserId)
                    .email("scout@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .troopId(null)
                    .role(User.UserRole.SCOUT)
                    .build();

            when(userService.removeFromTroop(testUserId)).thenReturn(removedUser);

            mockMvc.perform(delete("/api/v1/users/" + testUserId + "/troop")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopId").doesNotExist());

            verify(userService).removeFromTroop(testUserId);
        }
    }

    // ========================================================================
    // GET UNASSIGNED SCOUTS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/users/scouts/unassigned - Get Unassigned Scouts")
    class GetUnassignedScoutsTests {

        @Test
        @DisplayName("Should return unassigned scouts")
        void getUnassignedScouts_Success() throws Exception {
            User unassignedScout = User.builder()
                    .id(testUserId)
                    .email("unassigned@example.com")
                    .firstName("Unassigned")
                    .lastName("Scout")
                    .troopId(null)
                    .role(User.UserRole.SCOUT)
                    .build();

            Page<User> scoutPage = new PageImpl<>(List.of(unassignedScout), PageRequest.of(0, 50), 1);
            when(userService.getUnassignedScouts(any(), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/users/scouts/unassigned")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].troopId").doesNotExist());

            verify(userService).getUnassignedScouts(any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter by councilId when provided")
        void getUnassignedScouts_WithCouncilId_Success() throws Exception {
            Page<User> scoutPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 50), 0);
            when(userService.getUnassignedScouts(eq(testCouncilId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/users/scouts/unassigned")
                            .param("councilId", testCouncilId.toString())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(userService).getUnassignedScouts(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty when all scouts assigned")
        void getUnassignedScouts_AllAssigned_ReturnsEmpty() throws Exception {
            Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 50), 0);
            when(userService.getUnassignedScouts(any(), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/users/scouts/unassigned")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(userService).getUnassignedScouts(any(), any(Pageable.class));
        }
    }
}

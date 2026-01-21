package org.bsa.campcard.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for user management
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get all users", description = "Retrieve paginated list of users. National Admins see all users, Council Admins see users in their council, Unit Leaders see users in their troop.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
        Authentication authentication,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        // RBAC: Filter based on user role
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            // UNIT_LEADER: Can only see users in their troop
            if (user.getRole() == User.UserRole.UNIT_LEADER && user.getTroopId() != null) {
                Page<User> users = userService.getUsersByTroop(user.getTroopId(), pageable);
                Page<UserResponse> response = users.map(this::toResponse);
                return ResponseEntity.ok(response);
            }
            // COUNCIL_ADMIN: Can only see users in their council
            if (user.getRole() == User.UserRole.COUNCIL_ADMIN && user.getCouncilId() != null) {
                Page<User> users = userService.getUsersByCouncil(user.getCouncilId(), pageable);
                Page<UserResponse> response = users.map(this::toResponse);
                return ResponseEntity.ok(response);
            }
        }

        Page<User> users = userService.getAllUsers(pageable);
        Page<UserResponse> response = users.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Search users", description = "Search users by name or email. Council Admins only see users in their council, Unit Leaders only see users in their troop.")
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Page<UserResponse>> searchUsers(
        Authentication authentication,
        @Parameter(description = "Search term") @RequestParam String q,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        // RBAC: Filter based on user role
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            // UNIT_LEADER: Can only search users in their troop
            if (user.getRole() == User.UserRole.UNIT_LEADER && user.getTroopId() != null) {
                Page<User> users = userService.searchUsersInTroop(q, user.getTroopId(), pageable);
                Page<UserResponse> response = users.map(this::toResponse);
                return ResponseEntity.ok(response);
            }
            // COUNCIL_ADMIN: Can only search users in their council
            if (user.getRole() == User.UserRole.COUNCIL_ADMIN && user.getCouncilId() != null) {
                Page<User> users = userService.searchUsersInCouncil(q, user.getCouncilId(), pageable);
                Page<UserResponse> response = users.map(this::toResponse);
                return ResponseEntity.ok(response);
            }
        }

        Page<User> users = userService.searchUsers(q, pageable);
        Page<UserResponse> response = users.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get user by ID", description = "Retrieve user details by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
        @Parameter(description = "User ID") @PathVariable UUID id
    ) {
        return userService.findById(id)
            .map(user -> ResponseEntity.ok(toResponse(user)))
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create user", description = "Create a new user. Council Admins can only create users in their own council. Unit Leaders can only create Scout accounts in their troop.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content)
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<UserResponse> createUser(
        Authentication authentication,
        @Valid @RequestBody UserService.UserCreateRequest request
    ) {
        if (authentication != null && authentication.getPrincipal() instanceof User currentUser) {
            // RBAC: Only GLOBAL_SYSTEM_ADMIN can assign system-level roles
            if (User.isSystemRole(request.role()) && currentUser.getRole() != User.UserRole.GLOBAL_SYSTEM_ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "Only Global System Admin can assign system-level roles (Admin, Support Representative, System Analyst, System QA, Security Analyst)");
            }

            // RBAC: Unit Leaders can only create Scout accounts in their troop
            if (currentUser.getRole() == User.UserRole.UNIT_LEADER) {
                if (request.role() != User.UserRole.SCOUT) {
                    throw new org.springframework.security.access.AccessDeniedException(
                        "Unit Leaders can only create Scout accounts");
                }
                // Force the scout to be in the Unit Leader's council and troop
                request = new UserService.UserCreateRequest(
                    request.email(),
                    request.password(),
                    request.firstName(),
                    request.lastName(),
                    request.phoneNumber(),
                    User.UserRole.SCOUT,
                    currentUser.getCouncilId(),
                    currentUser.getTroopId(),
                    request.unitType(),
                    request.unitNumber(),
                    // COPPA compliance fields
                    request.dateOfBirth(),
                    request.parentName(),
                    request.parentEmail(),
                    request.parentPhone()
                );
            }
            // RBAC: Council Admins can only create users in their own council
            else if (currentUser.getRole() == User.UserRole.COUNCIL_ADMIN && currentUser.getCouncilId() != null) {
                // Force the new user to be in the Council Admin's council
                request = new UserService.UserCreateRequest(
                    request.email(),
                    request.password(),
                    request.firstName(),
                    request.lastName(),
                    request.phoneNumber(),
                    request.role(),
                    currentUser.getCouncilId(), // Force to Council Admin's council
                    request.troopId(),
                    request.unitType(),
                    request.unitNumber(),
                    // COPPA compliance fields
                    request.dateOfBirth(),
                    request.parentName(),
                    request.parentEmail(),
                    request.parentPhone()
                );
            }
        }

        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @Operation(summary = "Update user", description = "Update user details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(
        Authentication authentication,
        @Parameter(description = "User ID") @PathVariable UUID id,
        @Valid @RequestBody UserService.UserUpdateRequest request
    ) {
        // RBAC: Only GLOBAL_SYSTEM_ADMIN can assign system-level roles
        if (request.role() != null
            && authentication != null
            && authentication.getPrincipal() instanceof User currentUser
            && User.isSystemRole(request.role())
            && currentUser.getRole() != User.UserRole.GLOBAL_SYSTEM_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException(
                "Only Global System Admin can assign system-level roles (Admin, Support Representative, System Analyst, System QA, Security Analyst)");
        }

        User user = userService.updateUser(id, request);
        return ResponseEntity.ok(toResponse(user));
    }

    @Operation(summary = "Delete user", description = "Soft delete a user (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN')")
    public ResponseEntity<Void> deleteUser(
        @Parameter(description = "User ID") @PathVariable UUID id
    ) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get users by council", description = "Get all users in a council")
    @GetMapping("/council/{councilId}")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersByCouncil(
        @Parameter(description = "Council ID") @PathVariable UUID councilId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userService.getUsersByCouncil(councilId, pageable);
        Page<UserResponse> response = users.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get users by troop", description = "Get all users in a troop")
    @GetMapping("/troop/{troopId}")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Page<UserResponse>> getUsersByTroop(
        @Parameter(description = "Troop ID") @PathVariable UUID troopId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userService.getUsersByTroop(troopId, pageable);
        Page<UserResponse> response = users.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get scouts by troop", description = "Get all scouts in a troop")
    @GetMapping("/troop/{troopId}/scouts")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Page<UserResponse>> getScoutsByTroop(
        @Parameter(description = "Troop ID") @PathVariable UUID troopId,
        @PageableDefault(size = 50) Pageable pageable
    ) {
        Page<User> scouts = userService.getScoutsByTroop(troopId, pageable);
        Page<UserResponse> response = scouts.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Assign scout to troop", description = "Assign a scout user to a troop")
    @PatchMapping("/{userId}/assign-troop/{troopId}")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<UserResponse> assignScoutToTroop(
        @Parameter(description = "User ID (Scout)") @PathVariable UUID userId,
        @Parameter(description = "Troop ID") @PathVariable UUID troopId
    ) {
        User user = userService.assignToTroop(userId, troopId);
        return ResponseEntity.ok(toResponse(user));
    }

    @Operation(summary = "Remove scout from troop", description = "Remove a scout from their troop")
    @DeleteMapping("/{userId}/troop")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<UserResponse> removeScoutFromTroop(
        @Parameter(description = "User ID (Scout)") @PathVariable UUID userId
    ) {
        User user = userService.removeFromTroop(userId);
        return ResponseEntity.ok(toResponse(user));
    }

    @Operation(summary = "Get unassigned scouts", description = "Get scouts not assigned to any troop")
    @GetMapping("/scouts/unassigned")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Page<UserResponse>> getUnassignedScouts(
        @Parameter(description = "Council ID (optional)") @RequestParam(required = false) UUID councilId,
        @PageableDefault(size = 50) Pageable pageable
    ) {
        Page<User> scouts = userService.getUnassignedScouts(councilId, pageable);
        Page<UserResponse> response = scouts.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    // Response DTO
    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhoneNumber(),
            user.getRole(),
            user.getCouncilId(),
            user.getTroopId(),
            null, // unitType - TODO: Re-enable once unit_type column exists
            user.getIsActive(),
            user.getEmailVerified(),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            // COPPA compliance fields
            user.getDateOfBirth(),
            user.getConsentStatus() != null ? user.getConsentStatus().name() : null,
            user.getIsMinor()
        );
    }

    public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        User.UserRole role,
        UUID councilId,
        UUID troopId,
        String unitType, // Changed to String temporarily until column exists
        Boolean isActive,
        Boolean emailVerified,
        java.time.LocalDateTime lastLoginAt,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt,
        // COPPA compliance fields
        java.time.LocalDate dateOfBirth,
        String consentStatus,
        Boolean isMinor
    ) {}
}

package org.bsa.campcard.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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

    @Operation(summary = "Get all users", description = "Retrieve paginated list of all users (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userService.getAllUsers(pageable);
        Page<UserResponse> response = users.map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Search users", description = "Search users by name or email")
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Page<UserResponse>> searchUsers(
        @Parameter(description = "Search term") @RequestParam String q,
        @PageableDefault(size = 20) Pageable pageable
    ) {
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

    @Operation(summary = "Create user", description = "Create a new user (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content)
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody UserService.UserCreateRequest request
    ) {
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @Operation(summary = "Update user", description = "Update user details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(
        @Parameter(description = "User ID") @PathVariable UUID id,
        @Valid @RequestBody UserService.UserUpdateRequest request
    ) {
        User user = userService.updateUser(id, request);
        return ResponseEntity.ok(toResponse(user));
    }

    @Operation(summary = "Delete user", description = "Soft delete a user (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('NATIONAL_ADMIN')")
    public ResponseEntity<Void> deleteUser(
        @Parameter(description = "User ID") @PathVariable UUID id
    ) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get users by council", description = "Get all users in a council")
    @GetMapping("/council/{councilId}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
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
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'TROOP_LEADER')")
    public ResponseEntity<Page<UserResponse>> getUsersByTroop(
        @Parameter(description = "Troop ID") @PathVariable UUID troopId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userService.getUsersByTroop(troopId, pageable);
        Page<UserResponse> response = users.map(this::toResponse);
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
            user.getIsActive(),
            user.getEmailVerified(),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt()
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
        Boolean isActive,
        Boolean emailVerified,
        java.time.LocalDateTime lastLoginAt,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt
    ) {}
}

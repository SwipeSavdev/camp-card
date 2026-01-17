package org.bsa.campcard.domain.user;

import com.bsa.campcard.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing users
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Find user by ID
     */
    @Cacheable(value = "users", key = "#id")
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id)
            .filter(user -> !user.isDeleted());
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email)
            .filter(user -> !user.isDeleted());
    }

    /**
     * Find active user by email (for login)
     */
    public Optional<User> findActiveUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
            .filter(user -> !user.isDeleted());
    }

    /**
     * Get all users with pagination
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Search users by name or email
     */
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        return userRepository.searchUsers(searchTerm, pageable);
    }

    /**
     * Get users by council
     */
    public Page<User> getUsersByCouncil(UUID councilId, Pageable pageable) {
        return userRepository.findByCouncilId(councilId, pageable);
    }

    /**
     * Get users by troop
     */
    public Page<User> getUsersByTroop(UUID troopId, Pageable pageable) {
        return userRepository.findByTroopId(troopId, pageable);
    }

    /**
     * Create new user (admin-initiated)
     * Generates verification token and sends verification email
     */
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public User createUser(UserCreateRequest request) {
        log.info("Creating new user with email: {}", request.email());

        // Check if email already exists (case-insensitive)
        String normalizedEmail = request.email().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("A user with this email already exists");
        }

        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
            .email(request.email().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .phoneNumber(request.phoneNumber())
            .role(request.role())
            .councilId(request.councilId())
            .troopId(request.troopId())
            .unitType(request.unitType())
            .isActive(true)
            .emailVerified(false)
            .emailVerificationToken(verificationToken)
            .emailVerificationExpiresAt(LocalDateTime.now().plusDays(7))
            .referralCode(generateReferralCode())
            .build();

        User savedUser = userRepository.save(user);
        log.info("Created user with ID: {}", savedUser.getId());

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken);
        log.info("Verification email sent to: {}", savedUser.getEmail());

        return savedUser;
    }

    /**
     * Generate a unique referral code for the user
     */
    private String generateReferralCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (userRepository.existsByReferralCode(code));
        return code;
    }

    /**
     * Update user
     */
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public User updateUser(UUID id, UserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (user.isDeleted()) {
            throw new IllegalStateException("Cannot update deleted user: " + id);
        }

        // Update fields
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }
        if (request.unitType() != null) {
            user.setUnitType(request.unitType());
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user with ID: {}", id);

        return updatedUser;
    }

    /**
     * Soft delete user
     */
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(UUID id) {
        log.info("Soft deleting user with ID: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);

        userRepository.save(user);
        log.info("Soft deleted user with ID: {}", id);
    }

    /**
     * Verify email
     */
    @Transactional
    @CacheEvict(value = "users", key = "#result.id")
    public User verifyEmail(String token) {
        log.info("Verifying email with token");

        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Verification token expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);

        return userRepository.save(user);
    }

    /**
     * Update last login timestamp
     */
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public void updateLastLogin(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    /**
     * Get scouts by troop
     */
    public Page<User> getScoutsByTroop(UUID troopId, Pageable pageable) {
        return userRepository.findByTroopIdAndRole(troopId, User.UserRole.SCOUT, pageable);
    }

    /**
     * Get unassigned scouts (scouts with no troop)
     */
    public Page<User> getUnassignedScouts(UUID councilId, Pageable pageable) {
        if (councilId != null) {
            return userRepository.findUnassignedScoutsByCouncil(councilId, pageable);
        }
        return userRepository.findUnassignedScouts(pageable);
    }

    /**
     * Assign user to troop
     */
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public User assignToTroop(UUID userId, UUID troopId) {
        log.info("Assigning user {} to troop {}", userId, troopId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.isDeleted()) {
            throw new IllegalStateException("Cannot assign deleted user: " + userId);
        }

        user.setTroopId(troopId);
        User savedUser = userRepository.save(user);

        log.info("User {} assigned to troop {}", userId, troopId);
        return savedUser;
    }

    /**
     * Remove user from troop
     */
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public User removeFromTroop(UUID userId) {
        log.info("Removing user {} from troop", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.isDeleted()) {
            throw new IllegalStateException("Cannot modify deleted user: " + userId);
        }

        user.setTroopId(null);
        User savedUser = userRepository.save(user);

        log.info("User {} removed from troop", userId);
        return savedUser;
    }

    // DTOs
    public record UserCreateRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        String phoneNumber,
        User.UserRole role,
        UUID councilId,
        UUID troopId,
        User.UnitType unitType
    ) {}

    public record UserUpdateRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        User.UserRole role,
        Boolean isActive,
        User.UnitType unitType
    ) {}
}

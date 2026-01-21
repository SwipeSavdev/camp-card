package org.bsa.campcard.domain.user;

import com.bsa.campcard.service.ParentalConsentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
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

    private static final String USER_NOT_FOUND = "User not found: ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ParentalConsentService parentalConsentService;

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
     * Search users by name or email within a specific council
     */
    public Page<User> searchUsersInCouncil(String searchTerm, UUID councilId, Pageable pageable) {
        return userRepository.searchUsersInCouncil(searchTerm, councilId, pageable);
    }

    /**
     * Search users by name or email within a specific troop
     */
    public Page<User> searchUsersInTroop(String searchTerm, UUID troopId, Pageable pageable) {
        return userRepository.searchUsersInTroop(searchTerm, troopId, pageable);
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
     * For Scout accounts, also handles COPPA compliance by creating parental consent request
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
        log.info("Generated verification token for {}: {}", request.email(), verificationToken);

        // Determine if user is a minor (for COPPA compliance)
        boolean isMinor = false;
        boolean isUnder13 = false;
        User.ConsentStatus consentStatus = User.ConsentStatus.NOT_REQUIRED;

        if (request.dateOfBirth() != null) {
            int age = Period.between(request.dateOfBirth(), LocalDate.now()).getYears();
            isMinor = age < 18;
            isUnder13 = age < 13;

            // Scouts who are minors require parental consent
            if (request.role() == User.UserRole.SCOUT && isMinor) {
                consentStatus = User.ConsentStatus.PENDING;
                log.info("User is a minor (age {}), parental consent will be required", age);
            }
        }

        User user = User.builder()
            .email(request.email().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .phoneNumber(request.phoneNumber())
            .role(request.role())
            .councilId(request.councilId())
            .troopId(request.troopId())
            // Disabled until DB columns exist
            // .unitType(request.unitType())
            // .unitNumber(request.unitNumber())
            .isActive(true)
            .emailVerified(false)
            .emailVerificationToken(verificationToken)
            .emailVerificationExpiresAt(LocalDateTime.now().plusDays(7))
            // COPPA fields - @Transient until DB columns exist
            .dateOfBirth(request.dateOfBirth())
            .isMinor(isMinor)
            .isUnder13(isUnder13)
            .consentStatus(consentStatus)
            .parentEmail(request.parentEmail())
            .parentName(request.parentName())
            .requiresPasswordChange(true) // Admin-created accounts require password change
            .referralCode(generateReferralCode())
            .build();

        User savedUser = userRepository.save(user);
        log.info("Created user with ID: {}", savedUser.getId());

        // Create parental consent request for minor scouts
        if (request.role() == User.UserRole.SCOUT && isMinor
                && request.parentEmail() != null && request.parentName() != null) {
            try {
                parentalConsentService.createConsentRequest(
                    savedUser.getId(),
                    request.parentEmail(),
                    request.parentName(),
                    request.parentPhone()
                );
                log.info("Parental consent request created for minor scout: {}", savedUser.getId());
            } catch (Exception e) {
                log.error("Failed to create parental consent request for scout {}: {}",
                    savedUser.getId(), e.getMessage());
                // Don't fail user creation if consent request fails
            }
        }

        // Send verification email notification via async service
        log.info("Verification email notification queued for: {}", savedUser.getEmail());

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
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND + id));

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

        User updatedUser = userRepository.save(user);
        log.info("Updated user with ID: {}", id);

        return updatedUser;
    }

    /**
     * Hard delete user (permanently removes from database)
     */
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(UUID id) {
        log.info("Deleting user with ID: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND + id));

        userRepository.delete(user);
        log.info("Deleted user with ID: {}", id);
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
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND + userId));

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
            .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND + userId));

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
        User.UnitType unitType,
        String unitNumber,
        // COPPA compliance fields
        java.time.LocalDate dateOfBirth,
        String parentName,
        String parentEmail,
        String parentPhone
    ) {}

    public record UserUpdateRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        User.UserRole role,
        Boolean isActive,
        User.UnitType unitType,
        String unitNumber
    ) {}
}

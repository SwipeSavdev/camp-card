package org.bsa.campcard.domain.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity
 * Leverages PostgreSQL Row-Level Security for multi-tenancy
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email (unique)
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by email and active status
     */
    Optional<User> findByEmailAndIsActiveTrue(String email);

    /**
     * Find user by email verification token
     */
    Optional<User> findByEmailVerificationToken(String token);

    /**
     * Find user by password reset token
     */
    Optional<User> findByPasswordResetToken(String token);

    // NOTE: Disabled until DBA adds password_setup_token column
    // /**
    //  * Find user by password setup token (for admin-created users setting their password)
    //  */
    // Optional<User> findByPasswordSetupToken(String token);

    /**
     * Find all users by council ID (for council admins)
     */
    Page<User> findByCouncilId(UUID councilId, Pageable pageable);

    /**
     * Find all users by troop ID (for troop leaders)
     */
    Page<User> findByTroopId(UUID troopId, Pageable pageable);

    /**
     * Find all users by role
     */
    Page<User> findByRole(User.UserRole role, Pageable pageable);

    /**
     * Find active users by council and role
     */
    @Query("SELECT u FROM User u WHERE u.councilId = :councilId AND u.role = :role AND u.isActive = true AND u.deletedAt IS NULL")
    Page<User> findActiveUsersByCouncilAndRole(
        @Param("councilId") UUID councilId,
        @Param("role") User.UserRole role,
        Pageable pageable
    );

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if email exists (case-insensitive), excluding soft-deleted users
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.deletedAt IS NULL")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    /**
     * Count active users by council
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.councilId = :councilId AND u.isActive = true AND u.deletedAt IS NULL")
    long countActiveUsersByCouncil(@Param("councilId") UUID councilId);

    /**
     * Search users by name or email (for admin search)
     */
    @Query("SELECT u FROM User u WHERE " +
        "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
        "u.deletedAt IS NULL")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Search users by name or email within a specific council (for council admin search)
     */
    @Query("SELECT u FROM User u WHERE " +
        "u.councilId = :councilId AND " +
        "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
        "u.deletedAt IS NULL")
    Page<User> searchUsersInCouncil(
        @Param("searchTerm") String searchTerm,
        @Param("councilId") UUID councilId,
        Pageable pageable
    );

    /**
     * Find user by referral code
     */
    Optional<User> findByReferralCode(String referralCode);

    /**
     * Check if referral code exists
     */
    boolean existsByReferralCode(String referralCode);

    /**
     * Find users by troop and role
     */
    @Query("SELECT u FROM User u WHERE u.troopId = :troopId AND u.role = :role AND u.deletedAt IS NULL")
    Page<User> findByTroopIdAndRole(
        @Param("troopId") UUID troopId,
        @Param("role") User.UserRole role,
        Pageable pageable
    );

    /**
     * Find unassigned scouts (scouts with no troop)
     */
    @Query("SELECT u FROM User u WHERE u.troopId IS NULL AND u.role = 'SCOUT' AND u.isActive = true AND u.deletedAt IS NULL")
    Page<User> findUnassignedScouts(Pageable pageable);

    /**
     * Find unassigned scouts by council
     */
    @Query("SELECT u FROM User u WHERE u.councilId = :councilId AND u.troopId IS NULL AND u.role = 'SCOUT' AND u.isActive = true AND u.deletedAt IS NULL")
    Page<User> findUnassignedScoutsByCouncil(@Param("councilId") UUID councilId, Pageable pageable);
}

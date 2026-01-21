package org.bsa.campcard.domain.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.UUID;

/**
 * User entity representing platform users
 * Supports multi-tenancy with council_id foreign key
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_council_id", columnList = "council_id"),
    @Index(name = "idx_users_troop_id", columnList = "troop_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @Column(name = "council_id")
    private UUID councilId;

    @Column(name = "troop_id")
    private UUID troopId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "email_verification_token", length = 255)
    private String emailVerificationToken;

    @Column(name = "email_verification_expires_at")
    private LocalDateTime emailVerificationExpiresAt;

    @Column(name = "password_reset_token", length = 255)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "referral_code", unique = true, length = 20)
    private String referralCode;

    @Column(name = "card_number", unique = true, length = 20)
    private String cardNumber;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Abuse tracking fields - temporarily disabled until DBA adds columns to RDS
    @Transient
    @Builder.Default
    private Integer abuseFlagCount = 0;

    @Transient
    private LocalDateTime abuseFlaggedAt;

    @Transient
    private String abuseFlagReason;

    // ========================================================================
    // COPPA Compliance fields - temporarily @Transient until DBA adds columns
    // See migration V027__coppa_parental_consent.sql for column definitions
    // ========================================================================

    /**
     * User's date of birth for age verification
     */
    @Transient
    private LocalDate dateOfBirth;

    /**
     * True if user is under 18 years old (state privacy law restrictions)
     */
    @Transient
    @Builder.Default
    private Boolean isMinor = false;

    /**
     * True if user is under 13 (COPPA full compliance required)
     */
    @Transient
    @Builder.Default
    private Boolean isUnder13 = false;

    /**
     * Parental consent status: NOT_REQUIRED, PENDING, GRANTED, DENIED, REVOKED
     */
    @Transient
    @Builder.Default
    private ConsentStatus consentStatus = ConsentStatus.NOT_REQUIRED;

    /**
     * Parent has granted location tracking permission
     */
    @Transient
    @Builder.Default
    private Boolean locationConsent = false;

    /**
     * True if user must change password on next login (e.g., admin-created accounts)
     */
    @Transient
    @Builder.Default
    private Boolean requiresPasswordChange = false;

    /**
     * Parent/guardian email for consent verification
     */
    @Transient
    private String parentEmail;

    /**
     * Parent/guardian full name
     */
    @Transient
    private String parentName;

    /**
     * Consent status values for COPPA compliance tracking
     */
    public enum ConsentStatus {
        NOT_REQUIRED,
        PENDING,
        GRANTED,
        DENIED,
        REVOKED
    }

    public enum UserRole {
        // System-level roles (only assignable by GLOBAL_SYSTEM_ADMIN)
        GLOBAL_SYSTEM_ADMIN,
        ADMIN,                  // Full Access Admin
        SUPPORT_REPRESENTATIVE, // Support Rep
        SYSTEM_ANALYST,         // System Analyst
        SYSTEM_QA,              // QA Role
        SECURITY_ANALYST,       // Security Role
        // Organization-level roles
        NATIONAL_ADMIN,
        COUNCIL_ADMIN,
        UNIT_LEADER,
        PARENT,
        SCOUT
    }

    /**
     * Check if a role is a system-level role (only assignable by GLOBAL_SYSTEM_ADMIN)
     */
    public static boolean isSystemRole(UserRole role) {
        return role == UserRole.GLOBAL_SYSTEM_ADMIN
            || role == UserRole.ADMIN
            || role == UserRole.SUPPORT_REPRESENTATIVE
            || role == UserRole.SYSTEM_ANALYST
            || role == UserRole.SYSTEM_QA
            || role == UserRole.SECURITY_ANALYST;
    }

    /**
     * Unit type for scouts (Pack, BSA Troop for Boys, BSA Troop for Girls, Ship, Crew, Family Scouting)
     */
    public enum UnitType {
        PACK,
        BSA_TROOP_BOYS,
        BSA_TROOP_GIRLS,
        SHIP,
        CREW,
        FAMILY_SCOUTING
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    // ========================================================================
    // COPPA Compliance helper methods
    // ========================================================================

    /**
     * Calculate age from date of birth
     */
    public int getAge() {
        if (dateOfBirth == null) {
            return 0;
        }
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    /**
     * Update minor status flags based on date of birth
     */
    public void updateMinorStatus() {
        if (dateOfBirth == null) {
            this.isMinor = false;
            this.isUnder13 = false;
            return;
        }
        int age = getAge();
        this.isMinor = age < 18;
        this.isUnder13 = age < 13;
    }

    /**
     * Check if user requires parental consent based on role and age
     */
    public boolean requiresParentalConsent() {
        // Only SCOUT and PARENT roles for minors require consent
        if (role != UserRole.SCOUT && role != UserRole.PARENT) {
            return false;
        }
        return Boolean.TRUE.equals(isMinor);
    }

    /**
     * Check if location access is allowed for this user
     */
    public boolean isLocationAccessAllowed() {
        // Adults and unit leaders always have location access
        if (!Boolean.TRUE.equals(isMinor) || role == UserRole.UNIT_LEADER) {
            return true;
        }
        // Minors need parental consent for location
        return consentStatus == ConsentStatus.GRANTED && Boolean.TRUE.equals(locationConsent);
    }

    /**
     * Check if user has full app access (consent granted or not required)
     */
    public boolean hasFullAppAccess() {
        return consentStatus == ConsentStatus.NOT_REQUIRED || consentStatus == ConsentStatus.GRANTED;
    }
}

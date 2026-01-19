package org.bsa.campcard.domain.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
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

    // Abuse tracking fields
    // NOTE: These fields are temporarily disabled until DBA adds columns to RDS
    // Run the following SQL as postgres user:
    //   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flag_count INTEGER DEFAULT 0;
    //   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flagged_at TIMESTAMP;
    //   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flag_reason TEXT;
    // Then remove @Transient annotations below
    @Transient
    @Builder.Default
    private Integer abuseFlagCount = 0;

    @Transient
    private LocalDateTime abuseFlaggedAt;

    @Transient
    private String abuseFlagReason;

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
}

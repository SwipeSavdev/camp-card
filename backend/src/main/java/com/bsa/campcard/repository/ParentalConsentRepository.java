package com.bsa.campcard.repository;

import com.bsa.campcard.entity.ParentalConsent;
import com.bsa.campcard.entity.ParentalConsent.ConsentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParentalConsentRepository extends JpaRepository<ParentalConsent, UUID> {

    /**
     * Find consent record by minor user ID
     */
    Optional<ParentalConsent> findByMinorUserId(UUID minorUserId);

    /**
     * Find consent record by verification token
     */
    Optional<ParentalConsent> findByVerificationToken(String verificationToken);

    /**
     * Find all consent records for a parent email
     */
    List<ParentalConsent> findByParentEmail(String parentEmail);

    /**
     * Find consent records by status
     */
    Page<ParentalConsent> findByConsentStatus(ConsentStatus status, Pageable pageable);

    /**
     * Find pending consents that have expired
     */
    @Query("SELECT pc FROM ParentalConsent pc WHERE pc.consentStatus = 'PENDING' " +
           "AND pc.verificationExpiresAt < :now")
    List<ParentalConsent> findExpiredPendingConsents(@Param("now") LocalDateTime now);

    /**
     * Find consent records by parent user ID (when parent has an account)
     */
    List<ParentalConsent> findByParentUserId(UUID parentUserId);

    /**
     * Check if a minor has granted consent
     */
    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END " +
           "FROM ParentalConsent pc WHERE pc.minorUserId = :minorUserId " +
           "AND pc.consentStatus = 'GRANTED' AND pc.revokedAt IS NULL")
    boolean hasGrantedConsent(@Param("minorUserId") UUID minorUserId);

    /**
     * Check if location consent is granted for a minor
     */
    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END " +
           "FROM ParentalConsent pc WHERE pc.minorUserId = :minorUserId " +
           "AND pc.consentStatus = 'GRANTED' AND pc.locationConsent = true " +
           "AND pc.revokedAt IS NULL")
    boolean hasLocationConsent(@Param("minorUserId") UUID minorUserId);

    /**
     * Count pending consents for a specific troop (via user's troop_id)
     */
    @Query("SELECT COUNT(pc) FROM ParentalConsent pc " +
           "JOIN org.bsa.campcard.domain.user.User u ON u.id = pc.minorUserId " +
           "WHERE u.troopId = :troopId AND pc.consentStatus = 'PENDING'")
    long countPendingConsentsByTroop(@Param("troopId") UUID troopId);

    /**
     * Find all consents for minors in a specific troop
     */
    @Query("SELECT pc FROM ParentalConsent pc " +
           "JOIN org.bsa.campcard.domain.user.User u ON u.id = pc.minorUserId " +
           "WHERE u.troopId = :troopId")
    Page<ParentalConsent> findByTroopId(@Param("troopId") UUID troopId, Pageable pageable);
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    
    Optional<Referral> findByReferralCode(String referralCode);
    
    List<Referral> findByReferrerId(UUID referrerId);
    
    List<Referral> findByReferredUserId(UUID referredUserId);
    
    List<Referral> findByReferrerIdAndStatus(UUID referrerId, Referral.ReferralStatus status);
    
    Long countByReferrerIdAndStatus(UUID referrerId, Referral.ReferralStatus status);
    
    @Query("SELECT SUM(r.rewardAmount) FROM Referral r WHERE r.referrerId = ?1 AND r.status IN ('SUBSCRIBED', 'COMPLETED', 'REWARDED')")
    Double getTotalRewardsEarned(UUID referrerId);
    
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrerId = ?1 AND (r.status = 'COMPLETED' OR r.status = 'SUBSCRIBED')")
    Long countSuccessfulReferrals(UUID referrerId);

    @Query("SELECT r.referrerId, COUNT(r) FROM Referral r WHERE r.referrerId IN :referrerIds GROUP BY r.referrerId")
    List<Object[]> countReferralsByReferrerIds(@Param("referrerIds") List<UUID> referrerIds);

    @Query("SELECT r.referrerId, COUNT(r) FROM Referral r WHERE r.referrerId IN :referrerIds " +
           "AND r.status IN ('COMPLETED', 'SUBSCRIBED', 'REWARDED') GROUP BY r.referrerId")
    List<Object[]> countConversionsByReferrerIds(@Param("referrerIds") List<UUID> referrerIds);
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
    
    @Query("SELECT SUM(r.rewardAmount) FROM Referral r WHERE r.referrerId = ?1 AND r.rewardClaimed = true")
    Double getTotalRewardsEarned(UUID referrerId);
    
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrerId = ?1 AND r.status = 'COMPLETED'")
    Long countSuccessfulReferrals(UUID referrerId);
}

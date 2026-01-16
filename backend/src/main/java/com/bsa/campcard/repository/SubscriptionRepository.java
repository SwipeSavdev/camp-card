package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Page<Subscription> findByStatus(Subscription.SubscriptionStatus status, Pageable pageable);
    
    Optional<Subscription> findByUuid(UUID uuid);
    
    Optional<Subscription> findByUserIdAndStatusAndDeletedAtIsNull(
        UUID userId, 
        Subscription.SubscriptionStatus status
    );
    
    Optional<Subscription> findByUserIdAndDeletedAtIsNull(UUID userId);
    
    List<Subscription> findByStatusAndCurrentPeriodEndBefore(
        Subscription.SubscriptionStatus status, 
        LocalDateTime endDate
    );
    
    List<Subscription> findByRootScoutId(UUID scoutId);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.rootScoutId = ?1 AND s.status = 'ACTIVE'")
    Long countActiveByScout(UUID scoutId);
    
    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' " +
           "AND s.cancelAtPeriodEnd = false " +
           "AND s.currentPeriodEnd BETWEEN ?1 AND ?2")
    List<Subscription> findRenewalsInPeriod(LocalDateTime startDate, LocalDateTime endDate);

    boolean existsByCardNumber(String cardNumber);
}

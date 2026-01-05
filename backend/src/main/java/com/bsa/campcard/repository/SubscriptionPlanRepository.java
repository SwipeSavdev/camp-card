package com.bsa.campcard.repository;

import com.bsa.campcard.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    
    Optional<SubscriptionPlan> findByUuid(UUID uuid);
    
    List<SubscriptionPlan> findByCouncilIdAndStatusAndDeletedAtIsNull(
        Long councilId, 
        SubscriptionPlan.PlanStatus status
    );
    
    List<SubscriptionPlan> findByStatusAndDeletedAtIsNull(SubscriptionPlan.PlanStatus status);
    
    Optional<SubscriptionPlan> findByIdAndDeletedAtIsNull(Long id);
}

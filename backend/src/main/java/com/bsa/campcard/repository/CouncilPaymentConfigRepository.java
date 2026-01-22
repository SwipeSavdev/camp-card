package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CouncilPaymentConfig;
import com.bsa.campcard.entity.GatewayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for council payment gateway configurations.
 */
@Repository
public interface CouncilPaymentConfigRepository extends JpaRepository<CouncilPaymentConfig, Long> {

    /**
     * Find active payment config for a council by gateway type.
     */
    Optional<CouncilPaymentConfig> findByCouncilIdAndGatewayTypeAndIsActiveTrue(Long councilId, GatewayType gatewayType);

    /**
     * Find any active payment config for a council (regardless of gateway type).
     */
    Optional<CouncilPaymentConfig> findByCouncilIdAndIsActiveTrue(Long councilId);

    /**
     * Find payment config by council ID (active or inactive).
     */
    Optional<CouncilPaymentConfig> findByCouncilId(Long councilId);

    /**
     * Find payment config by UUID.
     */
    Optional<CouncilPaymentConfig> findByUuid(UUID uuid);

    /**
     * Check if a council has any payment config.
     */
    boolean existsByCouncilId(Long councilId);

    /**
     * Check if a council has an active and verified payment config.
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM CouncilPaymentConfig c " +
           "WHERE c.council.id = :councilId AND c.isActive = true AND c.isVerified = true")
    boolean hasActiveVerifiedConfig(@Param("councilId") Long councilId);
}

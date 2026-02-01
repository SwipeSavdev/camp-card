package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CustomerPaymentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerPaymentProfileRepository extends JpaRepository<CustomerPaymentProfile, Long> {

    List<CustomerPaymentProfile> findByUserId(UUID userId);

    Optional<CustomerPaymentProfile> findByUserIdAndIsDefaultTrue(UUID userId);

    Optional<CustomerPaymentProfile> findByAuthorizeCustomerProfileId(String customerProfileId);

    void deleteByUserId(UUID userId);
}

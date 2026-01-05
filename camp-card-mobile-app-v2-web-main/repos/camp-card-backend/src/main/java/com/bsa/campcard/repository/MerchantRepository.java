package com.bsa.campcard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bsa.campcard.model.Merchant;
import java.util.UUID;
import java.util.List;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, UUID> {
 List<Merchant> findByIsActive(Boolean isActive);
 List<Merchant> findByBusinessNameContainingIgnoreCase(String businessName);
}

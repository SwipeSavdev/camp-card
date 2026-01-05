package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Merchant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    
    Optional<Merchant> findByUuid(UUID uuid);
    
    Optional<Merchant> findByIdAndDeletedAtIsNull(Long id);
    
    List<Merchant> findByStatusAndDeletedAtIsNull(Merchant.MerchantStatus status);
    
    Page<Merchant> findByStatusAndDeletedAtIsNull(
        Merchant.MerchantStatus status, 
        Pageable pageable
    );
    
    Page<Merchant> findByCouncilIdAndDeletedAtIsNull(Long councilId, Pageable pageable);
    
    List<Merchant> findByCouncilIdAndStatusAndDeletedAtIsNull(
        Long councilId, 
        Merchant.MerchantStatus status
    );
    
    @Query("SELECT m FROM Merchant m WHERE " +
           "(LOWER(m.businessName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.dbaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "m.deletedAt IS NULL")
    Page<Merchant> searchMerchants(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT m FROM Merchant m WHERE " +
           "m.category = :category AND " +
           "m.status = 'APPROVED' AND " +
           "m.deletedAt IS NULL")
    List<Merchant> findByCategory(@Param("category") String category);
    
    Long countByStatusAndDeletedAtIsNull(Merchant.MerchantStatus status);
}

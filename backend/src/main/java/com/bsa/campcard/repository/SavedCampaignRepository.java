package com.bsa.campcard.repository;

import com.bsa.campcard.entity.SavedCampaign;
import com.bsa.campcard.entity.SavedCampaign.SaveType;
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
public interface SavedCampaignRepository extends JpaRepository<SavedCampaign, Long> {

    Optional<SavedCampaign> findByUuid(UUID uuid);

    List<SavedCampaign> findByUserId(UUID userId);

    Page<SavedCampaign> findByUserId(UUID userId, Pageable pageable);

    Page<SavedCampaign> findByUserIdAndSaveType(UUID userId, SaveType saveType, Pageable pageable);

    List<SavedCampaign> findByUserIdAndIsFavoriteTrue(UUID userId);

    Page<SavedCampaign> findByCouncilId(Long councilId, Pageable pageable);

    Page<SavedCampaign> findByCouncilIdAndSaveType(Long councilId, SaveType saveType, Pageable pageable);

    @Query("SELECT s FROM SavedCampaign s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "s.userId = :userId")
    Page<SavedCampaign> searchByUserId(
        @Param("searchTerm") String searchTerm,
        @Param("userId") UUID userId,
        Pageable pageable
    );

    Long countByUserId(UUID userId);

    Long countByUserIdAndSaveType(UUID userId, SaveType saveType);

    void deleteByUserIdAndId(UUID userId, Long id);
}

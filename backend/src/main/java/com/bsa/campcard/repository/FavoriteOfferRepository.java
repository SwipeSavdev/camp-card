package com.bsa.campcard.repository;

import com.bsa.campcard.entity.FavoriteOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteOfferRepository extends JpaRepository<FavoriteOffer, Long> {

    List<FavoriteOffer> findByUserId(UUID userId);

    Optional<FavoriteOffer> findByUserIdAndOfferId(UUID userId, Long offerId);

    @Modifying
    @Transactional
    void deleteByUserIdAndOfferId(UUID userId, Long offerId);

    boolean existsByUserIdAndOfferId(UUID userId, Long offerId);

    @Query("SELECT f.offerId FROM FavoriteOffer f WHERE f.userId = :userId")
    List<Long> findOfferIdsByUserId(@Param("userId") UUID userId);
}

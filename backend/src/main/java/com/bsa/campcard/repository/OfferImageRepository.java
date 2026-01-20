package com.bsa.campcard.repository;

import com.bsa.campcard.entity.OfferImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfferImageRepository extends JpaRepository<OfferImage, Long> {

    Optional<OfferImage> findByOfferId(Long offerId);

    void deleteByOfferId(Long offerId);
}

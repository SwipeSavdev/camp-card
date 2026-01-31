package com.bsa.campcard.repository;

import com.bsa.campcard.entity.ReferralClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralClickRepository extends JpaRepository<ReferralClick, Long> {

    long countByReferralCode(String referralCode);

    long countByReferralCodeAndSource(String referralCode, String source);

    long countByReferralCodeIn(List<String> referralCodes);

    long countByReferralCodeInAndSource(List<String> referralCodes, String source);

    List<ReferralClick> findByReferralCodeOrderByCreatedAtDesc(String referralCode);
}

package com.bsa.campcard.repository;

import com.bsa.campcard.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findByUserIdAndActiveTrue(java.util.UUID userId);

    Optional<DeviceToken> findByToken(String token);

    List<DeviceToken> findByUserIdInAndActiveTrue(List<java.util.UUID> userIds);

    void deleteByToken(String token);
}

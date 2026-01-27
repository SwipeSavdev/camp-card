package com.bsa.campcard.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-backed token blacklist service for distributed token invalidation.
 * Tokens are stored with TTL matching their expiration time.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * Adds a token to the blacklist with automatic expiration.
     *
     * @param token The JWT token to blacklist
     * @param expirationSeconds Time until the token would naturally expire (seconds)
     */
    public void blacklistToken(String token, long expirationSeconds) {
        String key = BLACKLIST_PREFIX + token;
        // Store with TTL - no need to keep blacklisted tokens after they expire anyway
        redisTemplate.opsForValue().set(key, "1", Duration.ofSeconds(expirationSeconds));
        log.debug("Token blacklisted, TTL: {} seconds", expirationSeconds);
    }

    /**
     * Checks if a token is blacklisted.
     * Gracefully handles Redis connection failures to allow authentication when Redis is unavailable.
     *
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false if not blacklisted or if Redis is unavailable
     */
    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            Boolean exists = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            // Log warning but don't fail authentication - token revocation won't work during Redis outage
            log.warn("Redis unavailable for blacklist check, assuming token is valid: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Removes a token from the blacklist (useful for testing).
     *
     * @param token The JWT token to remove
     */
    public void removeFromBlacklist(String token) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.delete(key);
    }
}

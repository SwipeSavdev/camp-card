package com.bsa.campcard.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

/**
 * Redis Cache Configuration for Offers System
 * Enables high-performance caching of frequently accessed data
 */
@Configuration
@EnableCaching
public class CacheConfig {

 @Bean
 public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
 return RedisCacheManager.create(factory);
 }
}

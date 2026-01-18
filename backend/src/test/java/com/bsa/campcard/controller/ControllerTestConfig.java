package com.bsa.campcard.controller;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

/**
 * Shared test configuration for controller tests.
 * Provides a minimal Spring Boot context that excludes database, Kafka, Redis,
 * and security auto-configuration, allowing controller tests to run in isolation.
 */
@SpringBootConfiguration
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    KafkaAutoConfiguration.class,
    RedisAutoConfiguration.class,
    SecurityAutoConfiguration.class
})
public class ControllerTestConfig {
}

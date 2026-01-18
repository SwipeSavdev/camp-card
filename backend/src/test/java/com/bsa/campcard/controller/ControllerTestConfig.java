package com.bsa.campcard.controller;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;

/**
 * Shared test configuration for controller tests.
 * Disables database, Kafka, and Redis auto-configuration to allow
 * controller tests to run in isolation with mocked services.
 *
 * Use with @Import(ControllerTestConfig.class) in your @WebMvcTest
 */
@TestConfiguration
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    KafkaAutoConfiguration.class,
    RedisAutoConfiguration.class
})
public class ControllerTestConfig {
}

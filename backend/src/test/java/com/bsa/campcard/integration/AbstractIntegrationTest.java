package com.bsa.campcard.integration;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

/**
 * Abstract base class for integration tests using Testcontainers.
 *
 * Provides:
 * - PostgreSQL container with Flyway migrations
 * - Spring Boot context with test profile
 * - Transaction management for test isolation
 * - Entity manager for direct database operations
 *
 * Usage:
 * <pre>
 * class MyRepositoryIT extends AbstractIntegrationTest {
 *     @Autowired
 *     private MyRepository repository;
 *
 *     @Test
 *     void testQuery() {
 *         // Test code
 *     }
 * }
 * </pre>
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Transactional
public abstract class AbstractIntegrationTest {

    /**
     * Shared PostgreSQL container for all integration tests.
     * Uses reusable container mode for faster test execution.
     */
    @SuppressWarnings("resource") // Container lifecycle managed by @Container annotation
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("campcard_test")
            .withUsername("test_user")
            .withPassword("test_password")
            .withInitScript("init-test-schema.sql")
            .withReuse(true);

    @Autowired
    protected EntityManager entityManager;

    /**
     * Configure Spring properties dynamically from the Testcontainer.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        // Flyway configuration
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.flyway.baseline-on-migrate", () -> false);
        registry.add("spring.flyway.schemas", () -> "campcard");
        registry.add("spring.flyway.default-schema", () -> "campcard");

        // JPA configuration
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.default_schema", () -> "campcard");

        // Disable non-essential services for integration tests
        registry.add("spring.redis.enabled", () -> false);
        registry.add("spring.kafka.enabled", () -> false);
        registry.add("spring.mail.enabled", () -> false);
    }

    @BeforeAll
    static void beforeAll() {
        postgres.start();
    }

    @BeforeEach
    protected void setUp() {
        // Clear any cached entities before each test
        entityManager.clear();
    }

    /**
     * Flush and clear the entity manager to ensure database state is synchronized.
     */
    protected void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    /**
     * Persist an entity and synchronize with the database.
     */
    protected <T> T persistAndFlush(T entity) {
        entityManager.persist(entity);
        flushAndClear();
        return entity;
    }
}

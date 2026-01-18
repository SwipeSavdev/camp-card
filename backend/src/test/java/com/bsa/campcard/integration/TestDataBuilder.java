package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.User.UserRole;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Test data builder utility for creating test entities.
 *
 * Provides factory methods for creating valid test entities with
 * sensible defaults. For complex entities, refer to their respective
 * entity classes for the exact field names and required values.
 */
public class TestDataBuilder {

    private static final AtomicLong idCounter = new AtomicLong(1);

    /**
     * Create a new User with SCOUT role.
     */
    public static User createUser() {
        return createUser(UserRole.SCOUT);
    }

    /**
     * Create a new User with specified role.
     */
    public static User createUser(UserRole role) {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return User.builder()
                .email("user-" + uniqueId + "@test.com")
                .passwordHash("$2a$12$TestHashedPasswordForTesting123")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("555-" + String.format("%04d", idCounter.getAndIncrement()))
                .role(role)
                .emailVerified(true)
                .isActive(true)
                .build();
    }

    /**
     * Create a new User with admin role.
     */
    public static User createAdminUser() {
        return createUser(UserRole.NATIONAL_ADMIN);
    }

    /**
     * Create a new User with council admin role.
     */
    public static User createCouncilAdminUser(UUID councilId) {
        User user = createUser(UserRole.COUNCIL_ADMIN);
        user.setCouncilId(councilId);
        return user;
    }

    /**
     * Create a new Council.
     */
    public static Council createCouncil() {
        String uniqueId = UUID.randomUUID().toString().substring(0, 6);
        return Council.builder()
                .councilNumber("C-" + uniqueId)
                .name("Test Council " + uniqueId)
                .region("NORTHEAST")
                .city("Test City")
                .state("NY")
                .status(Council.CouncilStatus.ACTIVE)
                .build();
    }

    /**
     * Generate unique ID for test purposes.
     */
    public static long nextId() {
        return idCounter.getAndIncrement();
    }

    /**
     * Generate unique string suffix for test purposes.
     */
    public static String uniqueSuffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}

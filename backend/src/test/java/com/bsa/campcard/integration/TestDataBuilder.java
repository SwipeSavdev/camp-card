package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.Merchant.MerchantStatus;
import com.bsa.campcard.entity.Offer;
import com.bsa.campcard.entity.Offer.DiscountType;
import com.bsa.campcard.entity.Offer.OfferStatus;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.entity.Troop.TroopStatus;
import com.bsa.campcard.entity.Troop.TroopType;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.User.UserRole;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    /**
     * Create a new Merchant with default values.
     */
    public static Merchant createMerchant(Long councilId) {
        String uniqueId = uniqueSuffix();
        return Merchant.builder()
                .councilId(councilId)
                .businessName("Test Business " + uniqueId)
                .dbaName("Test DBA " + uniqueId)
                .description("A test merchant for integration testing")
                .category("RESTAURANTS")
                .contactName("John Doe")
                .contactEmail("contact-" + uniqueId + "@test.com")
                .contactPhone("555-0100")
                .websiteUrl("https://example.com")
                .status(MerchantStatus.PENDING)
                .build();
    }

    /**
     * Create a new Offer with default values.
     */
    public static Offer createOffer(Long merchantId) {
        Offer offer = new Offer();
        offer.setMerchantId(merchantId);
        offer.setTitle("Test Offer " + uniqueSuffix());
        offer.setDescription("A test offer for integration testing");
        offer.setDiscountType(DiscountType.PERCENTAGE);
        offer.setDiscountValue(new BigDecimal("10.00"));
        offer.setCategory("RESTAURANTS");
        offer.setStatus(OfferStatus.ACTIVE);
        offer.setValidFrom(LocalDateTime.now().minusDays(1));
        offer.setValidUntil(LocalDateTime.now().plusDays(30));
        offer.setTotalRedemptions(0);
        offer.setFeatured(false);
        offer.setScoutExclusive(false);
        return offer;
    }

    /**
     * Create a new Troop with default values.
     */
    public static Troop createTroop(Long councilId) {
        Troop troop = new Troop();
        String uniqueId = uniqueSuffix();
        troop.setTroopNumber("T-" + uniqueId);
        troop.setCouncilId(councilId);
        troop.setTroopName("Test Troop " + uniqueId);
        troop.setTroopType(TroopType.SCOUTS_BSA);
        troop.setCharterOrganization("Test Church " + uniqueId);
        troop.setMeetingLocation("Community Center");
        troop.setMeetingDay("Tuesday");
        troop.setMeetingTime("7:00 PM");
        troop.setScoutmasterName("John Smith");
        troop.setScoutmasterEmail("scoutmaster-" + uniqueId + "@test.com");
        troop.setScoutmasterPhone("555-0100");
        troop.setStatus(TroopStatus.ACTIVE);
        troop.setTotalScouts(20);
        troop.setActiveScouts(18);
        troop.setTotalSales(BigDecimal.ZERO);
        troop.setCardsSold(0);
        return troop;
    }
}

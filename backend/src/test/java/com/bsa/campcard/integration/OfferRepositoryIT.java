package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.Merchant.MerchantStatus;
import com.bsa.campcard.entity.Offer;
import com.bsa.campcard.entity.Offer.DiscountType;
import com.bsa.campcard.entity.Offer.OfferStatus;
import com.bsa.campcard.repository.CouncilRepository;
import com.bsa.campcard.repository.MerchantRepository;
import com.bsa.campcard.repository.OfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for OfferRepository.
 *
 * Tests database operations with real PostgreSQL via Testcontainers.
 */
@DisplayName("Offer Repository Integration Tests")
class OfferRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private CouncilRepository councilRepository;

    private Council testCouncil;
    private Merchant testMerchant;

    @BeforeEach
    void setUpTestData() {
        // Create council and merchant for offer foreign key relationships
        testCouncil = TestDataBuilder.createCouncil();
        testCouncil = councilRepository.save(testCouncil);

        String uniqueId = TestDataBuilder.uniqueSuffix();
        testMerchant = Merchant.builder()
                .councilId(testCouncil.getId())
                .businessName("Test Merchant " + uniqueId)
                .contactName("Test Contact")
                .contactEmail("merchant-" + uniqueId + "@test.com")
                .status(MerchantStatus.APPROVED)
                .build();
        testMerchant = merchantRepository.save(testMerchant);
        flushAndClear();
    }

    /**
     * Helper method to create a valid offer with required fields.
     */
    private Offer createOffer() {
        Offer offer = new Offer();
        offer.setMerchantId(testMerchant.getId());
        offer.setTitle("Test Offer " + TestDataBuilder.uniqueSuffix());
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

    @Nested
    @DisplayName("CRUD Operations")
    class CrudTests {

        @Test
        @DisplayName("Should save and retrieve an offer by ID")
        void shouldSaveAndRetrieveOfferById() {
            // Given
            Offer offer = createOffer();

            // When
            Offer saved = offerRepository.save(offer);
            flushAndClear();
            Optional<Offer> found = offerRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getTitle()).isEqualTo(offer.getTitle());
            assertThat(found.get().getMerchantId()).isEqualTo(testMerchant.getId());
        }

        @Test
        @DisplayName("Should generate UUID on entity creation")
        void shouldHaveUuidOnCreation() {
            // Given
            Offer offer = createOffer();

            // When
            Offer saved = offerRepository.save(offer);
            flushAndClear();

            // Then
            assertThat(saved.getUuid()).isNotNull();
        }

        @Test
        @DisplayName("Should find offer by UUID")
        void shouldFindOfferByUuid() {
            // Given
            Offer offer = createOffer();
            Offer saved = offerRepository.save(offer);
            flushAndClear();

            // When
            Optional<Offer> found = offerRepository.findByUuid(saved.getUuid());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should update offer fields")
        void shouldUpdateOfferFields() {
            // Given
            Offer offer = createOffer();
            Offer saved = offerRepository.save(offer);
            flushAndClear();

            // When
            saved.setTitle("Updated Offer Title");
            saved.setDiscountValue(new BigDecimal("20.00"));
            offerRepository.save(saved);
            flushAndClear();

            Optional<Offer> updated = offerRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getTitle()).isEqualTo("Updated Offer Title");
            assertThat(updated.get().getDiscountValue()).isEqualByComparingTo(new BigDecimal("20.00"));
        }

        @Test
        @DisplayName("Should delete offer by ID")
        void shouldDeleteOfferById() {
            // Given
            Offer offer = createOffer();
            Offer saved = offerRepository.save(offer);
            Long savedId = saved.getId();
            flushAndClear();

            // When
            offerRepository.deleteById(savedId);
            flushAndClear();

            // Then
            assertThat(offerRepository.findById(savedId)).isEmpty();
        }

        @Test
        @DisplayName("Should set createdAt timestamp on persist")
        void shouldSetCreatedAtOnPersist() {
            // Given
            Offer offer = createOffer();
            LocalDateTime beforeSave = LocalDateTime.now().minusSeconds(1);

            // When
            Offer saved = offerRepository.save(offer);
            flushAndClear();

            // Then
            assertThat(saved.getCreatedAt()).isAfter(beforeSave);
        }
    }

    @Nested
    @DisplayName("Find Active Offers")
    class FindActiveOffersTests {

        @Test
        @DisplayName("Should find active offers within valid date range")
        void shouldFindActiveOffersWithinValidDateRange() {
            // Given
            Offer activeOffer = createOffer();
            activeOffer.setStatus(OfferStatus.ACTIVE);
            activeOffer.setValidFrom(LocalDateTime.now().minusDays(1));
            activeOffer.setValidUntil(LocalDateTime.now().plusDays(30));

            offerRepository.save(activeOffer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent()).allMatch(o -> o.getStatus() == OfferStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should exclude expired offers")
        void shouldExcludeExpiredOffers() {
            // Given
            Offer expiredOffer = createOffer();
            expiredOffer.setStatus(OfferStatus.ACTIVE);
            expiredOffer.setValidFrom(LocalDateTime.now().minusDays(30));
            expiredOffer.setValidUntil(LocalDateTime.now().minusDays(1)); // Expired

            offerRepository.save(expiredOffer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .noneMatch(o -> o.getValidUntil().isBefore(LocalDateTime.now()));
        }

        @Test
        @DisplayName("Should exclude offers not yet started")
        void shouldExcludeOffersNotYetStarted() {
            // Given
            Offer futureOffer = createOffer();
            futureOffer.setStatus(OfferStatus.ACTIVE);
            futureOffer.setValidFrom(LocalDateTime.now().plusDays(7)); // Future start
            futureOffer.setValidUntil(LocalDateTime.now().plusDays(30));

            offerRepository.save(futureOffer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .noneMatch(o -> o.getValidFrom().isAfter(LocalDateTime.now()));
        }

        @Test
        @DisplayName("Should exclude offers that reached usage limit")
        void shouldExcludeOffersReachedUsageLimit() {
            // Given
            Offer limitedOffer = createOffer();
            limitedOffer.setUsageLimit(100);
            limitedOffer.setTotalRedemptions(100); // Reached limit

            offerRepository.save(limitedOffer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .noneMatch(o -> o.getUsageLimit() != null && o.getTotalRedemptions() >= o.getUsageLimit());
        }
    }

    @Nested
    @DisplayName("Find By Merchant ID")
    class FindByMerchantIdTests {

        @Test
        @DisplayName("Should find offers by merchant ID")
        void shouldFindOffersByMerchantId() {
            // Given
            Offer offer1 = createOffer();
            Offer offer2 = createOffer();
            offerRepository.saveAll(List.of(offer1, offer2));
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findByMerchantId(testMerchant.getId(), PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(o -> o.getMerchantId().equals(testMerchant.getId()));
        }

        @Test
        @DisplayName("Should return empty page for non-existent merchant")
        void shouldReturnEmptyPageForNonExistentMerchant() {
            // When
            Page<Offer> results = offerRepository.findByMerchantId(999999L, PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should find active merchant offers")
        void shouldFindActiveMerchantOffers() {
            // Given
            Offer activeOffer = createOffer();
            activeOffer.setStatus(OfferStatus.ACTIVE);

            Offer draftOffer = createOffer();
            draftOffer.setStatus(OfferStatus.DRAFT);

            offerRepository.saveAll(List.of(activeOffer, draftOffer));
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveMerchantOffers(
                    testMerchant.getId(),
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(o -> o.getStatus() == OfferStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Find Featured Offers")
    class FindFeaturedOffersTests {

        @Test
        @DisplayName("Should find featured offers")
        void shouldFindFeaturedOffers() {
            // Given
            Offer featuredOffer = createOffer();
            featuredOffer.setFeatured(true);

            Offer regularOffer = createOffer();
            regularOffer.setFeatured(false);

            offerRepository.saveAll(List.of(featuredOffer, regularOffer));
            flushAndClear();

            // When
            List<Offer> results = offerRepository.findFeaturedOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results)
                    .isNotEmpty()
                    .allMatch(o -> o.getFeatured());
        }

        @Test
        @DisplayName("Should order featured offers by created date descending")
        void shouldOrderFeaturedOffersByCreatedDateDesc() {
            // Given
            Offer olderOffer = createOffer();
            olderOffer.setFeatured(true);
            offerRepository.save(olderOffer);
            flushAndClear();

            // Add a slight delay to ensure different timestamps
            Offer newerOffer = createOffer();
            newerOffer.setFeatured(true);
            offerRepository.save(newerOffer);
            flushAndClear();

            // When
            List<Offer> results = offerRepository.findFeaturedOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results).hasSizeGreaterThanOrEqualTo(2);
            // Results should be ordered by createdAt DESC
            for (int i = 0; i < results.size() - 1; i++) {
                assertThat(results.get(i).getCreatedAt())
                        .isAfterOrEqualTo(results.get(i + 1).getCreatedAt());
            }
        }
    }

    @Nested
    @DisplayName("Search Offers")
    class SearchOffersTests {

        @Test
        @DisplayName("Should search offers by title")
        void shouldSearchOffersByTitle() {
            // Given
            Offer offer = createOffer();
            offer.setTitle("Unique Pizza Special");
            offerRepository.save(offer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.searchOffers(
                    "Pizza",
                    OfferStatus.ACTIVE,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(o -> o.getTitle().contains("Pizza"));
        }

        @Test
        @DisplayName("Should search offers by description")
        void shouldSearchOffersByDescription() {
            // Given
            Offer offer = createOffer();
            offer.setDescription("Get 20% off all burgers");
            offerRepository.save(offer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.searchOffers(
                    "burgers",
                    OfferStatus.ACTIVE,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(o -> o.getDescription().toLowerCase().contains("burgers"));
        }

        @Test
        @DisplayName("Should perform case-insensitive search")
        void shouldPerformCaseInsensitiveSearch() {
            // Given
            Offer offer = createOffer();
            offer.setTitle("CamelCase Offer Title");
            offerRepository.save(offer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.searchOffers(
                    "camelcase",
                    OfferStatus.ACTIVE,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(o -> o.getTitle().equals("CamelCase Offer Title"));
        }
    }

    @Nested
    @DisplayName("Find By Category")
    class FindByCategoryTests {

        @Test
        @DisplayName("Should find offers by category with pagination")
        void shouldFindOffersByCategoryWithPagination() {
            // Given
            Offer offer1 = createOffer();
            offer1.setCategory("ENTERTAINMENT");

            Offer offer2 = createOffer();
            offer2.setCategory("ENTERTAINMENT");

            offerRepository.saveAll(List.of(offer1, offer2));
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findByCategory("ENTERTAINMENT", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(o -> o.getCategory().equals("ENTERTAINMENT"));
        }

        @Test
        @DisplayName("Should find active offers by category and status")
        void shouldFindActiveOffersByCategoryAndStatus() {
            // Given
            Offer activeOffer = createOffer();
            activeOffer.setCategory("RETAIL");
            activeOffer.setStatus(OfferStatus.ACTIVE);

            Offer pausedOffer = createOffer();
            pausedOffer.setCategory("RETAIL");
            pausedOffer.setStatus(OfferStatus.PAUSED);

            offerRepository.saveAll(List.of(activeOffer, pausedOffer));
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveByCategoryAndStatus(
                    "RETAIL",
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(o -> o.getStatus() == OfferStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Scout Exclusive Offers")
    class ScoutExclusiveOffersTests {

        @Test
        @DisplayName("Should find scout exclusive offers")
        void shouldFindScoutExclusiveOffers() {
            // Given
            Offer scoutExclusive = createOffer();
            scoutExclusive.setScoutExclusive(true);

            Offer regularOffer = createOffer();
            regularOffer.setScoutExclusive(false);

            offerRepository.saveAll(List.of(scoutExclusive, regularOffer));
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findScoutExclusiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(o -> o.getScoutExclusive());
        }
    }

    @Nested
    @DisplayName("Count Operations")
    class CountOperationsTests {

        @Test
        @DisplayName("Should count offers by merchant and status")
        void shouldCountOffersByMerchantAndStatus() {
            // Given
            Offer activeOffer1 = createOffer();
            activeOffer1.setStatus(OfferStatus.ACTIVE);

            Offer activeOffer2 = createOffer();
            activeOffer2.setStatus(OfferStatus.ACTIVE);

            Offer draftOffer = createOffer();
            draftOffer.setStatus(OfferStatus.DRAFT);

            offerRepository.saveAll(List.of(activeOffer1, activeOffer2, draftOffer));
            flushAndClear();

            // When
            long activeCount = offerRepository.countByMerchantIdAndStatus(testMerchant.getId(), OfferStatus.ACTIVE);
            long draftCount = offerRepository.countByMerchantIdAndStatus(testMerchant.getId(), OfferStatus.DRAFT);

            // Then
            assertThat(activeCount).isGreaterThanOrEqualTo(2);
            assertThat(draftCount).isGreaterThanOrEqualTo(1);
        }

        @Test
        @DisplayName("Should count offers by status")
        void shouldCountOffersByStatus() {
            // Given
            Offer offer = createOffer();
            offer.setStatus(OfferStatus.ACTIVE);
            offerRepository.save(offer);
            flushAndClear();

            // When
            Long count = offerRepository.countByStatus(OfferStatus.ACTIVE);

            // Then
            assertThat(count).isGreaterThanOrEqualTo(1L);
        }

        @Test
        @DisplayName("Should count expired offers")
        void shouldCountExpiredOffers() {
            // Given
            Offer expiredOffer = createOffer();
            expiredOffer.setStatus(OfferStatus.ACTIVE);
            expiredOffer.setValidUntil(LocalDateTime.now().minusDays(1));

            offerRepository.save(expiredOffer);
            flushAndClear();

            // When
            long expiredCount = offerRepository.countExpiredOffers(LocalDateTime.now());

            // Then
            assertThat(expiredCount).isGreaterThanOrEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Find Expired Offers")
    class FindExpiredOffersTests {

        @Test
        @DisplayName("Should find offers by status and valid until before date")
        void shouldFindOffersByStatusAndValidUntilBefore() {
            // Given
            Offer expiredOffer = createOffer();
            expiredOffer.setStatus(OfferStatus.ACTIVE);
            expiredOffer.setValidUntil(LocalDateTime.now().minusDays(5));

            offerRepository.save(expiredOffer);
            flushAndClear();

            // When
            List<Offer> results = offerRepository.findByStatusAndValidUntilBefore(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now()
            );

            // Then
            assertThat(results)
                    .isNotEmpty()
                    .allMatch(o -> o.getValidUntil().isBefore(LocalDateTime.now()));
        }
    }

    @Nested
    @DisplayName("Pagination and Sorting")
    class PaginationAndSortingTests {

        @Test
        @DisplayName("Should paginate results correctly")
        void shouldPaginateResultsCorrectly() {
            // Given - Create 10 offers
            for (int i = 0; i < 10; i++) {
                Offer offer = createOffer();
                offerRepository.save(offer);
            }
            flushAndClear();

            // When
            Page<Offer> firstPage = offerRepository.findByMerchantId(testMerchant.getId(), PageRequest.of(0, 3));
            Page<Offer> secondPage = offerRepository.findByMerchantId(testMerchant.getId(), PageRequest.of(1, 3));

            // Then
            assertThat(firstPage.getContent()).hasSize(3);
            assertThat(secondPage.getContent()).hasSize(3);
            assertThat(firstPage.getNumber()).isEqualTo(0);
            assertThat(secondPage.getNumber()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should sort results by title")
        void shouldSortResultsByTitle() {
            // Given
            Offer offerA = createOffer();
            offerA.setTitle("Alpha Offer");

            Offer offerZ = createOffer();
            offerZ.setTitle("Zeta Offer");

            offerRepository.saveAll(List.of(offerZ, offerA));
            flushAndClear();

            // When
            Page<Offer> sortedAsc = offerRepository.findByMerchantId(
                    testMerchant.getId(),
                    PageRequest.of(0, 10, Sort.by("title").ascending())
            );

            // Then
            List<String> titles = sortedAsc.getContent().stream()
                    .map(Offer::getTitle)
                    .toList();
            assertThat(titles).isSorted();
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty optional for non-existent UUID")
        void shouldReturnEmptyForNonExistentUuid() {
            // When
            Optional<Offer> found = offerRepository.findByUuid(UUID.randomUUID());

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should return empty optional for non-existent ID")
        void shouldReturnEmptyForNonExistentId() {
            // When
            Optional<Offer> found = offerRepository.findById(999999L);

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should handle null usage limit")
        void shouldHandleNullUsageLimit() {
            // Given
            Offer offer = createOffer();
            offer.setUsageLimit(null);
            offerRepository.save(offer);
            flushAndClear();

            // When
            Page<Offer> results = offerRepository.findActiveOffers(
                    OfferStatus.ACTIVE,
                    LocalDateTime.now(),
                    PageRequest.of(0, 10)
            );

            // Then - Offers with null usage limit should be included
            assertThat(results.getContent())
                    .anyMatch(o -> o.getUsageLimit() == null);
        }
    }

    @Nested
    @DisplayName("Constraint Validation")
    class ConstraintTests {

        @Test
        @DisplayName("Should require title")
        void shouldRequireTitle() {
            // Given
            Offer offer = createOffer();
            offer.setTitle(null);

            // When/Then
            assertThatThrownBy(() -> {
                offerRepository.save(offer);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require merchant ID")
        void shouldRequireMerchantId() {
            // Given
            Offer offer = createOffer();
            offer.setMerchantId(null);

            // When/Then
            assertThatThrownBy(() -> {
                offerRepository.save(offer);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require discount type")
        void shouldRequireDiscountType() {
            // Given
            Offer offer = createOffer();
            offer.setDiscountType(null);

            // When/Then
            assertThatThrownBy(() -> {
                offerRepository.save(offer);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require valid from date")
        void shouldRequireValidFromDate() {
            // Given
            Offer offer = createOffer();
            offer.setValidFrom(null);

            // When/Then
            assertThatThrownBy(() -> {
                offerRepository.save(offer);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require valid until date")
        void shouldRequireValidUntilDate() {
            // Given
            Offer offer = createOffer();
            offer.setValidUntil(null);

            // When/Then
            assertThatThrownBy(() -> {
                offerRepository.save(offer);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}

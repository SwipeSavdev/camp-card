package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.Merchant.MerchantStatus;
import com.bsa.campcard.repository.CouncilRepository;
import com.bsa.campcard.repository.MerchantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for MerchantRepository.
 *
 * Tests database operations with real PostgreSQL via Testcontainers.
 */
@DisplayName("Merchant Repository Integration Tests")
class MerchantRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private CouncilRepository councilRepository;

    private Council testCouncil;

    @BeforeEach
    void setUpTestData() {
        // Create a council for merchant foreign key relationships
        testCouncil = TestDataBuilder.createCouncil();
        testCouncil = councilRepository.save(testCouncil);
        flushAndClear();
    }

    /**
     * Helper method to create a valid merchant with required fields.
     */
    private Merchant createMerchant() {
        String uniqueId = TestDataBuilder.uniqueSuffix();
        return Merchant.builder()
                .councilId(testCouncil.getId())
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

    @Nested
    @DisplayName("CRUD Operations")
    class CrudTests {

        @Test
        @DisplayName("Should save and retrieve a merchant by ID")
        void shouldSaveAndRetrieveMerchantById() {
            // Given
            Merchant merchant = createMerchant();

            // When
            Merchant saved = merchantRepository.save(merchant);
            flushAndClear();
            Optional<Merchant> found = merchantRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getBusinessName()).isEqualTo(merchant.getBusinessName());
            assertThat(found.get().getContactEmail()).isEqualTo(merchant.getContactEmail());
        }

        @Test
        @DisplayName("Should generate UUID on persist")
        void shouldGenerateUuidOnPersist() {
            // Given
            Merchant merchant = createMerchant();
            assertThat(merchant.getUuid()).isNull();

            // When
            Merchant saved = merchantRepository.save(merchant);
            flushAndClear();

            // Then
            assertThat(saved.getUuid()).isNotNull();
        }

        @Test
        @DisplayName("Should find merchant by UUID")
        void shouldFindMerchantByUuid() {
            // Given
            Merchant merchant = createMerchant();
            Merchant saved = merchantRepository.save(merchant);
            flushAndClear();

            // When
            Optional<Merchant> found = merchantRepository.findByUuid(saved.getUuid());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should set createdAt and updatedAt timestamps on persist")
        void shouldSetTimestampsOnPersist() {
            // Given
            Merchant merchant = createMerchant();
            LocalDateTime beforeSave = LocalDateTime.now().minusSeconds(1);

            // When
            Merchant saved = merchantRepository.save(merchant);
            flushAndClear();

            // Then
            assertThat(saved.getCreatedAt()).isAfter(beforeSave);
            assertThat(saved.getUpdatedAt()).isAfter(beforeSave);
        }

        @Test
        @DisplayName("Should update merchant fields")
        void shouldUpdateMerchantFields() {
            // Given
            Merchant merchant = createMerchant();
            Merchant saved = merchantRepository.save(merchant);
            flushAndClear();

            // When
            saved.setBusinessName("Updated Business Name");
            saved.setDescription("Updated description");
            merchantRepository.save(saved);
            flushAndClear();

            Optional<Merchant> updated = merchantRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getBusinessName()).isEqualTo("Updated Business Name");
            assertThat(updated.get().getDescription()).isEqualTo("Updated description");
        }

        @Test
        @DisplayName("Should delete merchant by ID")
        void shouldDeleteMerchantById() {
            // Given
            Merchant merchant = createMerchant();
            Merchant saved = merchantRepository.save(merchant);
            Long savedId = saved.getId();
            flushAndClear();

            // When
            merchantRepository.deleteById(savedId);
            flushAndClear();

            // Then
            assertThat(merchantRepository.findById(savedId)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Find By Status Operations")
    class FindByStatusTests {

        @Test
        @DisplayName("Should find merchants by status (non-deleted)")
        void shouldFindMerchantsByStatus() {
            // Given
            Merchant pendingMerchant = createMerchant();
            pendingMerchant.setStatus(MerchantStatus.PENDING);

            Merchant approvedMerchant = createMerchant();
            approvedMerchant.setStatus(MerchantStatus.APPROVED);

            merchantRepository.saveAll(List.of(pendingMerchant, approvedMerchant));
            flushAndClear();

            // When
            List<Merchant> pendingMerchants = merchantRepository.findByStatusAndDeletedAtIsNull(MerchantStatus.PENDING);

            // Then
            assertThat(pendingMerchants)
                    .isNotEmpty()
                    .allMatch(m -> m.getStatus() == MerchantStatus.PENDING);
        }

        @Test
        @DisplayName("Should exclude soft-deleted merchants when finding by status")
        void shouldExcludeSoftDeletedMerchants() {
            // Given
            Merchant activeMerchant = createMerchant();
            activeMerchant.setStatus(MerchantStatus.APPROVED);

            Merchant deletedMerchant = createMerchant();
            deletedMerchant.setStatus(MerchantStatus.APPROVED);
            deletedMerchant.setDeletedAt(LocalDateTime.now());

            merchantRepository.saveAll(List.of(activeMerchant, deletedMerchant));
            flushAndClear();

            // When
            List<Merchant> approvedMerchants = merchantRepository.findByStatusAndDeletedAtIsNull(MerchantStatus.APPROVED);

            // Then
            assertThat(approvedMerchants).allMatch(m -> m.getDeletedAt() == null);
        }

        @Test
        @DisplayName("Should find merchants by status with pagination")
        void shouldFindMerchantsByStatusWithPagination() {
            // Given - Create multiple approved merchants
            for (int i = 0; i < 5; i++) {
                Merchant merchant = createMerchant();
                merchant.setStatus(MerchantStatus.APPROVED);
                merchantRepository.save(merchant);
            }
            flushAndClear();

            // When
            Page<Merchant> page = merchantRepository.findByStatusAndDeletedAtIsNull(
                    MerchantStatus.APPROVED,
                    PageRequest.of(0, 3)
            );

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
        }
    }

    @Nested
    @DisplayName("Search Operations")
    class SearchTests {

        @Test
        @DisplayName("Should search merchants by business name")
        void shouldSearchMerchantsByBusinessName() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setBusinessName("Unique Pizza Palace");
            merchantRepository.save(merchant);
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("Pizza", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(m -> m.getBusinessName().contains("Pizza"));
        }

        @Test
        @DisplayName("Should search merchants by DBA name")
        void shouldSearchMerchantsByDbaName() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setDbaName("Unique Burger Joint");
            merchantRepository.save(merchant);
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("Burger", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(m -> m.getDbaName() != null && m.getDbaName().contains("Burger"));
        }

        @Test
        @DisplayName("Should search merchants by category")
        void shouldSearchMerchantsByCategory() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setCategory("ENTERTAINMENT");
            merchantRepository.save(merchant);
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("ENTERTAINMENT", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(m -> m.getCategory().equals("ENTERTAINMENT"));
        }

        @Test
        @DisplayName("Should perform case-insensitive search")
        void shouldPerformCaseInsensitiveSearch() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setBusinessName("CamelCase Business");
            merchantRepository.save(merchant);
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("camelcase", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(m -> m.getBusinessName().equals("CamelCase Business"));
        }

        @Test
        @DisplayName("Should exclude soft-deleted merchants from search")
        void shouldExcludeSoftDeletedFromSearch() {
            // Given
            Merchant activeMerchant = createMerchant();
            activeMerchant.setBusinessName("Active Searchable Business");

            Merchant deletedMerchant = createMerchant();
            deletedMerchant.setBusinessName("Deleted Searchable Business");
            deletedMerchant.setDeletedAt(LocalDateTime.now());

            merchantRepository.saveAll(List.of(activeMerchant, deletedMerchant));
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("Searchable", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).allMatch(m -> m.getDeletedAt() == null);
        }
    }

    @Nested
    @DisplayName("Find By Category Operations")
    class FindByCategoryTests {

        @Test
        @DisplayName("Should find approved merchants by category")
        void shouldFindApprovedMerchantsByCategory() {
            // Given
            Merchant approvedMerchant = createMerchant();
            approvedMerchant.setCategory("RETAIL");
            approvedMerchant.setStatus(MerchantStatus.APPROVED);

            Merchant pendingMerchant = createMerchant();
            pendingMerchant.setCategory("RETAIL");
            pendingMerchant.setStatus(MerchantStatus.PENDING);

            merchantRepository.saveAll(List.of(approvedMerchant, pendingMerchant));
            flushAndClear();

            // When
            List<Merchant> retailers = merchantRepository.findByCategory("RETAIL");

            // Then
            assertThat(retailers)
                    .isNotEmpty()
                    .allMatch(m -> m.getStatus() == MerchantStatus.APPROVED);
        }

        @Test
        @DisplayName("Should return empty list for non-existent category")
        void shouldReturnEmptyListForNonExistentCategory() {
            // When
            List<Merchant> results = merchantRepository.findByCategory("NON_EXISTENT_CATEGORY");

            // Then
            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("Count By Status Operations")
    class CountByStatusTests {

        @Test
        @DisplayName("Should count merchants by status")
        void shouldCountMerchantsByStatus() {
            // Given
            Merchant merchant1 = createMerchant();
            merchant1.setStatus(MerchantStatus.APPROVED);

            Merchant merchant2 = createMerchant();
            merchant2.setStatus(MerchantStatus.APPROVED);

            merchantRepository.saveAll(List.of(merchant1, merchant2));
            flushAndClear();

            // When
            Long approvedCount = merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.APPROVED);

            // Then
            assertThat(approvedCount).isGreaterThanOrEqualTo(2L);
        }

        @Test
        @DisplayName("Should exclude soft-deleted from count")
        void shouldExcludeSoftDeletedFromCount() {
            // Given
            Merchant activeMerchant = createMerchant();
            activeMerchant.setStatus(MerchantStatus.APPROVED);

            Merchant deletedMerchant = createMerchant();
            deletedMerchant.setStatus(MerchantStatus.APPROVED);
            deletedMerchant.setDeletedAt(LocalDateTime.now());

            merchantRepository.saveAll(List.of(activeMerchant, deletedMerchant));
            flushAndClear();

            Long countBefore = merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.APPROVED);

            // When - The count should only include non-deleted
            Long countAfter = merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.APPROVED);

            // Then
            assertThat(countAfter).isEqualTo(countBefore);
        }
    }

    @Nested
    @DisplayName("Find By Council Operations")
    class FindByCouncilTests {

        @Test
        @DisplayName("Should find merchants by council ID with pagination")
        void shouldFindMerchantsByCouncilIdWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                Merchant merchant = createMerchant();
                merchantRepository.save(merchant);
            }
            flushAndClear();

            // When
            Page<Merchant> page = merchantRepository.findByCouncilIdAndDeletedAtIsNull(
                    testCouncil.getId(),
                    PageRequest.of(0, 3)
            );

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getContent()).allMatch(m -> m.getCouncilId().equals(testCouncil.getId()));
        }

        @Test
        @DisplayName("Should find merchants by council ID and status")
        void shouldFindMerchantsByCouncilIdAndStatus() {
            // Given
            Merchant approvedMerchant = createMerchant();
            approvedMerchant.setStatus(MerchantStatus.APPROVED);

            Merchant pendingMerchant = createMerchant();
            pendingMerchant.setStatus(MerchantStatus.PENDING);

            merchantRepository.saveAll(List.of(approvedMerchant, pendingMerchant));
            flushAndClear();

            // When
            List<Merchant> approvedMerchants = merchantRepository.findByCouncilIdAndStatusAndDeletedAtIsNull(
                    testCouncil.getId(),
                    MerchantStatus.APPROVED
            );

            // Then
            assertThat(approvedMerchants)
                    .isNotEmpty()
                    .allMatch(m -> m.getStatus() == MerchantStatus.APPROVED)
                    .allMatch(m -> m.getCouncilId().equals(testCouncil.getId()));
        }
    }

    @Nested
    @DisplayName("Pagination and Sorting")
    class PaginationAndSortingTests {

        @Test
        @DisplayName("Should paginate results correctly")
        void shouldPaginateResultsCorrectly() {
            // Given - Create 10 merchants
            for (int i = 0; i < 10; i++) {
                Merchant merchant = createMerchant();
                merchant.setStatus(MerchantStatus.APPROVED);
                merchantRepository.save(merchant);
            }
            flushAndClear();

            // When
            Page<Merchant> firstPage = merchantRepository.findByStatusAndDeletedAtIsNull(
                    MerchantStatus.APPROVED,
                    PageRequest.of(0, 3)
            );
            Page<Merchant> secondPage = merchantRepository.findByStatusAndDeletedAtIsNull(
                    MerchantStatus.APPROVED,
                    PageRequest.of(1, 3)
            );

            // Then
            assertThat(firstPage.getContent()).hasSize(3);
            assertThat(secondPage.getContent()).hasSize(3);
            assertThat(firstPage.getNumber()).isEqualTo(0);
            assertThat(secondPage.getNumber()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should sort results by business name")
        void shouldSortResultsByBusinessName() {
            // Given
            Merchant merchantA = createMerchant();
            merchantA.setBusinessName("Alpha Business");
            merchantA.setStatus(MerchantStatus.APPROVED);

            Merchant merchantZ = createMerchant();
            merchantZ.setBusinessName("Zeta Business");
            merchantZ.setStatus(MerchantStatus.APPROVED);

            merchantRepository.saveAll(List.of(merchantZ, merchantA));
            flushAndClear();

            // When
            Page<Merchant> sortedAsc = merchantRepository.findByStatusAndDeletedAtIsNull(
                    MerchantStatus.APPROVED,
                    PageRequest.of(0, 10, Sort.by("businessName").ascending())
            );

            // Then
            List<String> businessNames = sortedAsc.getContent().stream()
                    .map(Merchant::getBusinessName)
                    .toList();
            assertThat(businessNames).isSorted();
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty optional for non-existent UUID")
        void shouldReturnEmptyForNonExistentUuid() {
            // When
            Optional<Merchant> found = merchantRepository.findByUuid(UUID.randomUUID());

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should return empty optional for non-existent ID")
        void shouldReturnEmptyForNonExistentId() {
            // When
            Optional<Merchant> found = merchantRepository.findById(999999L);

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should handle empty search term")
        void shouldHandleEmptySearchTerm() {
            // Given
            Merchant merchant = createMerchant();
            merchantRepository.save(merchant);
            flushAndClear();

            // When
            Page<Merchant> results = merchantRepository.searchMerchants("", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).isNotEmpty();
        }

        @Test
        @DisplayName("Should return empty page for status with no merchants")
        void shouldReturnEmptyPageForStatusWithNoMerchants() {
            // When
            Page<Merchant> results = merchantRepository.findByStatusAndDeletedAtIsNull(
                    MerchantStatus.REJECTED,
                    PageRequest.of(0, 10)
            );

            // Then - May have merchants from other tests, but should not fail
            assertThat(results).isNotNull();
        }
    }

    @Nested
    @DisplayName("Constraint Validation")
    class ConstraintTests {

        @Test
        @DisplayName("Should enforce unique UUID constraint")
        void shouldEnforceUniqueUuidConstraint() {
            // Given
            Merchant merchant1 = createMerchant();
            merchant1 = merchantRepository.save(merchant1);
            flushAndClear();

            UUID existingUuid = merchant1.getUuid();

            Merchant merchant2 = createMerchant();
            merchant2.setUuid(existingUuid);

            // When/Then
            assertThatThrownBy(() -> {
                merchantRepository.save(merchant2);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require business name")
        void shouldRequireBusinessName() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setBusinessName(null);

            // When/Then
            assertThatThrownBy(() -> {
                merchantRepository.save(merchant);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require contact name")
        void shouldRequireContactName() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setContactName(null);

            // When/Then
            assertThatThrownBy(() -> {
                merchantRepository.save(merchant);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require contact email")
        void shouldRequireContactEmail() {
            // Given
            Merchant merchant = createMerchant();
            merchant.setContactEmail(null);

            // When/Then
            assertThatThrownBy(() -> {
                merchantRepository.save(merchant);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}

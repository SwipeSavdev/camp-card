package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.entity.Troop.TroopStatus;
import com.bsa.campcard.entity.Troop.TroopType;
import com.bsa.campcard.repository.CouncilRepository;
import com.bsa.campcard.repository.TroopRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for TroopRepository.
 *
 * Tests database operations with real PostgreSQL via Testcontainers.
 */
@DisplayName("Troop Repository Integration Tests")
class TroopRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private TroopRepository troopRepository;

    @Autowired
    private CouncilRepository councilRepository;

    private Council testCouncil;

    @BeforeEach
    void setUpTestData() {
        // Create a council for troop foreign key relationships
        testCouncil = TestDataBuilder.createCouncil();
        testCouncil = councilRepository.save(testCouncil);
        flushAndClear();
    }

    /**
     * Helper method to create a valid troop with required fields.
     */
    private Troop createTroop() {
        Troop troop = new Troop();
        String uniqueId = TestDataBuilder.uniqueSuffix();
        troop.setTroopNumber("T-" + uniqueId);
        troop.setCouncilId(testCouncil.getId());
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

    @Nested
    @DisplayName("CRUD Operations")
    class CrudTests {

        @Test
        @DisplayName("Should save and retrieve a troop by ID")
        void shouldSaveAndRetrieveTroopById() {
            // Given
            Troop troop = createTroop();

            // When
            Troop saved = troopRepository.save(troop);
            flushAndClear();
            Optional<Troop> found = troopRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getTroopNumber()).isEqualTo(troop.getTroopNumber());
            assertThat(found.get().getTroopName()).isEqualTo(troop.getTroopName());
        }

        @Test
        @DisplayName("Should generate UUID on entity creation")
        void shouldHaveUuidOnCreation() {
            // Given
            Troop troop = createTroop();

            // When
            Troop saved = troopRepository.save(troop);
            flushAndClear();

            // Then
            assertThat(saved.getUuid()).isNotNull();
        }

        @Test
        @DisplayName("Should find troop by UUID")
        void shouldFindTroopByUuid() {
            // Given
            Troop troop = createTroop();
            Troop saved = troopRepository.save(troop);
            flushAndClear();

            // When
            Optional<Troop> found = troopRepository.findByUuid(saved.getUuid());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should find troop by troop number")
        void shouldFindTroopByTroopNumber() {
            // Given
            Troop troop = createTroop();
            Troop saved = troopRepository.save(troop);
            flushAndClear();

            // When
            Optional<Troop> found = troopRepository.findByTroopNumber(saved.getTroopNumber());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should update troop fields")
        void shouldUpdateTroopFields() {
            // Given
            Troop troop = createTroop();
            Troop saved = troopRepository.save(troop);
            flushAndClear();

            // When
            saved.setTroopName("Updated Troop Name");
            saved.setMeetingDay("Wednesday");
            troopRepository.save(saved);
            flushAndClear();

            Optional<Troop> updated = troopRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getTroopName()).isEqualTo("Updated Troop Name");
            assertThat(updated.get().getMeetingDay()).isEqualTo("Wednesday");
        }

        @Test
        @DisplayName("Should delete troop by ID")
        void shouldDeleteTroopById() {
            // Given
            Troop troop = createTroop();
            Troop saved = troopRepository.save(troop);
            Long savedId = saved.getId();
            flushAndClear();

            // When
            troopRepository.deleteById(savedId);
            flushAndClear();

            // Then
            assertThat(troopRepository.findById(savedId)).isEmpty();
        }

        @Test
        @DisplayName("Should set createdAt timestamp on persist")
        void shouldSetCreatedAtOnPersist() {
            // Given
            Troop troop = createTroop();

            // When
            Troop saved = troopRepository.save(troop);
            flushAndClear();

            // Then
            assertThat(saved.getCreatedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Find By Council ID Operations")
    class FindByCouncilIdTests {

        @Test
        @DisplayName("Should find troops by council ID with pagination")
        void shouldFindTroopsByCouncilIdWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                Troop troop = createTroop();
                troopRepository.save(troop);
            }
            flushAndClear();

            // When
            Page<Troop> page = troopRepository.findByCouncilId(testCouncil.getId(), PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getContent()).allMatch(t -> t.getCouncilId().equals(testCouncil.getId()));
        }

        @Test
        @DisplayName("Should return empty page for non-existent council")
        void shouldReturnEmptyPageForNonExistentCouncil() {
            // When
            Page<Troop> page = troopRepository.findByCouncilId(999999L, PageRequest.of(0, 10));

            // Then
            assertThat(page.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should find troops by council ID and status")
        void shouldFindTroopsByCouncilIdAndStatus() {
            // Given
            Troop activeTroop = createTroop();
            activeTroop.setStatus(TroopStatus.ACTIVE);

            Troop inactiveTroop = createTroop();
            inactiveTroop.setStatus(TroopStatus.INACTIVE);

            troopRepository.saveAll(List.of(activeTroop, inactiveTroop));
            flushAndClear();

            // When
            Page<Troop> activeTroops = troopRepository.findByCouncilIdAndStatus(
                    testCouncil.getId(),
                    TroopStatus.ACTIVE,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(activeTroops.getContent())
                    .isNotEmpty()
                    .allMatch(t -> t.getStatus() == TroopStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Search Operations")
    class SearchTests {

        @Test
        @DisplayName("Should search troops by troop number")
        void shouldSearchTroopsByTroopNumber() {
            // Given
            Troop troop = createTroop();
            troop.setTroopNumber("T-UNIQUE-123");
            troopRepository.save(troop);
            flushAndClear();

            // When
            Page<Troop> results = troopRepository.searchTroops("UNIQUE", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(t -> t.getTroopNumber().contains("UNIQUE"));
        }

        @Test
        @DisplayName("Should search troops by troop name")
        void shouldSearchTroopsByTroopName() {
            // Given
            Troop troop = createTroop();
            troop.setTroopName("Eagle Scout Troop");
            troopRepository.save(troop);
            flushAndClear();

            // When
            Page<Troop> results = troopRepository.searchTroops("Eagle", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(t -> t.getTroopName().contains("Eagle"));
        }

        @Test
        @DisplayName("Should search troops by charter organization")
        void shouldSearchTroopsByCharterOrganization() {
            // Given
            Troop troop = createTroop();
            troop.setCharterOrganization("First Methodist Church");
            troopRepository.save(troop);
            flushAndClear();

            // When
            Page<Troop> results = troopRepository.searchTroops("Methodist", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(t -> t.getCharterOrganization().contains("Methodist"));
        }

        @Test
        @DisplayName("Should perform case-insensitive search")
        void shouldPerformCaseInsensitiveSearch() {
            // Given
            Troop troop = createTroop();
            troop.setTroopName("CamelCase Troop");
            troopRepository.save(troop);
            flushAndClear();

            // When
            Page<Troop> results = troopRepository.searchTroops("camelcase", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(t -> t.getTroopName().equals("CamelCase Troop"));
        }
    }

    @Nested
    @DisplayName("Find Top Performing Troops")
    class FindTopPerformingTroopsTests {

        @Test
        @DisplayName("Should find top performing troops by total sales")
        void shouldFindTopPerformingTroopsByTotalSales() {
            // Given
            Troop highPerformer = createTroop();
            highPerformer.setTotalSales(new BigDecimal("5000.00"));

            Troop lowPerformer = createTroop();
            lowPerformer.setTotalSales(new BigDecimal("100.00"));

            troopRepository.saveAll(List.of(highPerformer, lowPerformer));
            flushAndClear();

            // When
            Page<Troop> topTroops = troopRepository.findTopPerformingTroops(PageRequest.of(0, 10));

            // Then
            assertThat(topTroops.getContent()).isNotEmpty();
            // First troop should have higher or equal sales than subsequent troops
            if (topTroops.getContent().size() > 1) {
                for (int i = 0; i < topTroops.getContent().size() - 1; i++) {
                    assertThat(topTroops.getContent().get(i).getTotalSales())
                            .isGreaterThanOrEqualTo(topTroops.getContent().get(i + 1).getTotalSales());
                }
            }
        }

        @Test
        @DisplayName("Should find top performing troops by council")
        void shouldFindTopPerformingTroopsByCouncil() {
            // Given
            Troop troop1 = createTroop();
            troop1.setTotalSales(new BigDecimal("3000.00"));

            Troop troop2 = createTroop();
            troop2.setTotalSales(new BigDecimal("1000.00"));

            troopRepository.saveAll(List.of(troop1, troop2));
            flushAndClear();

            // When
            Page<Troop> topTroops = troopRepository.findTopPerformingTroopsByCouncil(
                    testCouncil.getId(),
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(topTroops.getContent())
                    .isNotEmpty()
                    .allMatch(t -> t.getCouncilId().equals(testCouncil.getId()));
        }
    }

    @Nested
    @DisplayName("Find By Status Operations")
    class FindByStatusTests {

        @Test
        @DisplayName("Should find troops by status with pagination")
        void shouldFindTroopsByStatusWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                Troop troop = createTroop();
                troop.setStatus(TroopStatus.ACTIVE);
                troopRepository.save(troop);
            }
            flushAndClear();

            // When
            Page<Troop> activeTroops = troopRepository.findByStatus(TroopStatus.ACTIVE, PageRequest.of(0, 3));

            // Then
            assertThat(activeTroops.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(activeTroops.getContent()).allMatch(t -> t.getStatus() == TroopStatus.ACTIVE);
        }
    }

    @Nested
    @DisplayName("Find By Troop Type Operations")
    class FindByTroopTypeTests {

        @Test
        @DisplayName("Should find troops by troop type")
        void shouldFindTroopsByTroopType() {
            // Given
            Troop scoutsBsa = createTroop();
            scoutsBsa.setTroopType(TroopType.SCOUTS_BSA);

            Troop cubScouts = createTroop();
            cubScouts.setTroopType(TroopType.CUB_SCOUTS);

            troopRepository.saveAll(List.of(scoutsBsa, cubScouts));
            flushAndClear();

            // When
            Page<Troop> scoutsBsaTroops = troopRepository.findByTroopType(TroopType.SCOUTS_BSA, PageRequest.of(0, 10));

            // Then
            assertThat(scoutsBsaTroops.getContent())
                    .isNotEmpty()
                    .allMatch(t -> t.getTroopType() == TroopType.SCOUTS_BSA);
        }
    }

    @Nested
    @DisplayName("Find By Scoutmaster ID")
    class FindByScoutmasterIdTests {

        @Test
        @DisplayName("Should find troops by scoutmaster ID")
        void shouldFindTroopsByScoutmasterId() {
            // Given
            UUID scoutmasterId = UUID.randomUUID();
            Troop troop1 = createTroop();
            troop1.setScoutmasterId(scoutmasterId);

            Troop troop2 = createTroop();
            troop2.setScoutmasterId(scoutmasterId);

            troopRepository.saveAll(List.of(troop1, troop2));
            flushAndClear();

            // When
            List<Troop> troops = troopRepository.findByScoutmasterId(scoutmasterId);

            // Then
            assertThat(troops)
                    .isNotEmpty()
                    .allMatch(t -> t.getScoutmasterId().equals(scoutmasterId));
        }

        @Test
        @DisplayName("Should return empty list for non-existent scoutmaster")
        void shouldReturnEmptyListForNonExistentScoutmaster() {
            // When
            List<Troop> troops = troopRepository.findByScoutmasterId(UUID.randomUUID());

            // Then
            assertThat(troops).isEmpty();
        }
    }

    @Nested
    @DisplayName("Count Operations")
    class CountOperationsTests {

        @Test
        @DisplayName("Should count troops by council ID and status")
        void shouldCountTroopsByCouncilIdAndStatus() {
            // Given
            Troop activeTroop1 = createTroop();
            activeTroop1.setStatus(TroopStatus.ACTIVE);

            Troop activeTroop2 = createTroop();
            activeTroop2.setStatus(TroopStatus.ACTIVE);

            Troop inactiveTroop = createTroop();
            inactiveTroop.setStatus(TroopStatus.INACTIVE);

            troopRepository.saveAll(List.of(activeTroop1, activeTroop2, inactiveTroop));
            flushAndClear();

            // When
            long activeCount = troopRepository.countByCouncilIdAndStatus(testCouncil.getId(), TroopStatus.ACTIVE);
            long inactiveCount = troopRepository.countByCouncilIdAndStatus(testCouncil.getId(), TroopStatus.INACTIVE);

            // Then
            assertThat(activeCount).isGreaterThanOrEqualTo(2);
            assertThat(inactiveCount).isGreaterThanOrEqualTo(1);
        }

        @Test
        @DisplayName("Should count troops by council ID")
        void shouldCountTroopsByCouncilId() {
            // Given
            for (int i = 0; i < 3; i++) {
                Troop troop = createTroop();
                troopRepository.save(troop);
            }
            flushAndClear();

            // When
            Long count = troopRepository.countByCouncilId(testCouncil.getId());

            // Then
            assertThat(count).isGreaterThanOrEqualTo(3L);
        }
    }

    @Nested
    @DisplayName("Aggregate Operations")
    class AggregateOperationsTests {

        @Test
        @DisplayName("Should sum sales by council")
        void shouldSumSalesByCouncil() {
            // Given
            Troop troop1 = createTroop();
            troop1.setTotalSales(new BigDecimal("1000.00"));

            Troop troop2 = createTroop();
            troop2.setTotalSales(new BigDecimal("2000.00"));

            troopRepository.saveAll(List.of(troop1, troop2));
            flushAndClear();

            // When
            BigDecimal totalSales = troopRepository.sumSalesByCouncil(testCouncil.getId());

            // Then
            assertThat(totalSales).isGreaterThanOrEqualTo(new BigDecimal("3000.00"));
        }

        @Test
        @DisplayName("Should sum cards sold by council")
        void shouldSumCardsSoldByCouncil() {
            // Given
            Troop troop1 = createTroop();
            troop1.setCardsSold(50);

            Troop troop2 = createTroop();
            troop2.setCardsSold(30);

            troopRepository.saveAll(List.of(troop1, troop2));
            flushAndClear();

            // When
            Integer totalCardsSold = troopRepository.sumCardsSoldByCouncil(testCouncil.getId());

            // Then
            assertThat(totalCardsSold).isGreaterThanOrEqualTo(80);
        }
    }

    @Nested
    @DisplayName("Pagination and Sorting")
    class PaginationAndSortingTests {

        @Test
        @DisplayName("Should paginate results correctly")
        void shouldPaginateResultsCorrectly() {
            // Given - Create 10 troops
            for (int i = 0; i < 10; i++) {
                Troop troop = createTroop();
                troopRepository.save(troop);
            }
            flushAndClear();

            // When
            Page<Troop> firstPage = troopRepository.findByCouncilId(testCouncil.getId(), PageRequest.of(0, 3));
            Page<Troop> secondPage = troopRepository.findByCouncilId(testCouncil.getId(), PageRequest.of(1, 3));

            // Then
            assertThat(firstPage.getContent()).hasSize(3);
            assertThat(secondPage.getContent()).hasSize(3);
            assertThat(firstPage.getNumber()).isEqualTo(0);
            assertThat(secondPage.getNumber()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should sort results by troop name")
        void shouldSortResultsByTroopName() {
            // Given
            Troop troopA = createTroop();
            troopA.setTroopName("Alpha Troop");

            Troop troopZ = createTroop();
            troopZ.setTroopName("Zeta Troop");

            troopRepository.saveAll(List.of(troopZ, troopA));
            flushAndClear();

            // When
            Page<Troop> sortedAsc = troopRepository.findByCouncilId(
                    testCouncil.getId(),
                    PageRequest.of(0, 10, Sort.by("troopName").ascending())
            );

            // Then
            List<String> troopNames = sortedAsc.getContent().stream()
                    .map(Troop::getTroopName)
                    .toList();
            assertThat(troopNames).isSorted();
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty optional for non-existent UUID")
        void shouldReturnEmptyForNonExistentUuid() {
            // When
            Optional<Troop> found = troopRepository.findByUuid(UUID.randomUUID());

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should return empty optional for non-existent troop number")
        void shouldReturnEmptyForNonExistentTroopNumber() {
            // When
            Optional<Troop> found = troopRepository.findByTroopNumber("NON-EXISTENT-999");

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should return null for sum when no troops exist")
        void shouldReturnNullForSumWhenNoTroopsExist() {
            // Given - Create a different council with no troops
            Council emptyCouncil = TestDataBuilder.createCouncil();
            emptyCouncil = councilRepository.save(emptyCouncil);
            flushAndClear();

            // When
            BigDecimal totalSales = troopRepository.sumSalesByCouncil(emptyCouncil.getId());

            // Then
            assertThat(totalSales).isNull();
        }
    }

    @Nested
    @DisplayName("Constraint Validation")
    class ConstraintTests {

        @Test
        @DisplayName("Should require troop number")
        void shouldRequireTroopNumber() {
            // Given
            Troop troop = createTroop();
            troop.setTroopNumber(null);

            // When/Then
            assertThatThrownBy(() -> {
                troopRepository.save(troop);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require council ID")
        void shouldRequireCouncilId() {
            // Given
            Troop troop = createTroop();
            troop.setCouncilId(null);

            // When/Then
            assertThatThrownBy(() -> {
                troopRepository.save(troop);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require troop type")
        void shouldRequireTroopType() {
            // Given
            Troop troop = createTroop();
            troop.setTroopType(null);

            // When/Then
            assertThatThrownBy(() -> {
                troopRepository.save(troop);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should enforce unique UUID constraint")
        void shouldEnforceUniqueUuidConstraint() {
            // Given
            Troop troop1 = createTroop();
            troop1 = troopRepository.save(troop1);
            flushAndClear();

            UUID existingUuid = troop1.getUuid();

            Troop troop2 = createTroop();
            troop2.setUuid(existingUuid);

            // When/Then
            assertThatThrownBy(() -> {
                troopRepository.save(troop2);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}

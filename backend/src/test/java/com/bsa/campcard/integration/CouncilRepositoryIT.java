package com.bsa.campcard.integration;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.repository.CouncilRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for CouncilRepository.
 *
 * Tests database operations with real PostgreSQL via Testcontainers.
 */
@DisplayName("Council Repository Integration Tests")
class CouncilRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private CouncilRepository councilRepository;

    @Nested
    @DisplayName("Save and Retrieve Operations")
    class SaveAndRetrieveTests {

        @Test
        @DisplayName("Should save and retrieve a council by ID")
        void shouldSaveAndRetrieveCouncilById() {
            // Given
            Council council = TestDataBuilder.createCouncil();

            // When
            Council saved = councilRepository.save(council);
            flushAndClear();
            Optional<Council> found = councilRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo(council.getName());
            assertThat(found.get().getCouncilNumber()).isEqualTo(council.getCouncilNumber());
            assertThat(found.get().getUuid()).isNotNull();
        }

        @Test
        @DisplayName("Should generate UUID on persist")
        void shouldGenerateUuidOnPersist() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            assertThat(council.getUuid()).isNull();

            // When
            Council saved = councilRepository.save(council);
            flushAndClear();

            // Then
            assertThat(saved.getUuid()).isNotNull();
        }

        @Test
        @DisplayName("Should find council by UUID")
        void shouldFindCouncilByUuid() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            Council saved = councilRepository.save(council);
            flushAndClear();

            // When
            Optional<Council> found = councilRepository.findByUuid(saved.getUuid());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should find council by council number")
        void shouldFindCouncilByCouncilNumber() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            Council saved = councilRepository.save(council);
            flushAndClear();

            // When
            Optional<Council> found = councilRepository.findByCouncilNumber(saved.getCouncilNumber());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo(council.getName());
        }
    }

    @Nested
    @DisplayName("Query Operations")
    class QueryTests {

        @Test
        @DisplayName("Should find councils by status")
        void shouldFindCouncilsByStatus() {
            // Given
            Council activeCouncil = TestDataBuilder.createCouncil();
            activeCouncil.setStatus(Council.CouncilStatus.ACTIVE);

            Council inactiveCouncil = TestDataBuilder.createCouncil();
            inactiveCouncil.setStatus(Council.CouncilStatus.INACTIVE);

            councilRepository.saveAll(List.of(activeCouncil, inactiveCouncil));
            flushAndClear();

            // When
            List<Council> activeCouncils = councilRepository.findByStatus(Council.CouncilStatus.ACTIVE);

            // Then
            assertThat(activeCouncils)
                    .isNotEmpty()
                    .allMatch(c -> c.getStatus() == Council.CouncilStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should find all councils with pagination")
        void shouldFindAllWithPagination() {
            // Given - Create multiple councils
            for (int i = 0; i < 5; i++) {
                councilRepository.save(TestDataBuilder.createCouncil());
            }
            flushAndClear();

            // When
            Page<Council> page = councilRepository.findAll(PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
        }

        @Test
        @DisplayName("Should count councils by status")
        void shouldCountCouncilsByStatus() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            council.setStatus(Council.CouncilStatus.ACTIVE);
            councilRepository.save(council);
            flushAndClear();

            // When
            Long activeCount = councilRepository.countByStatus(Council.CouncilStatus.ACTIVE);

            // Then
            assertThat(activeCount).isGreaterThanOrEqualTo(1L);
        }

        @Test
        @DisplayName("Should search councils by name")
        void shouldSearchCouncilsByName() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            council.setName("Unique Searchable Council");
            councilRepository.save(council);
            flushAndClear();

            // When
            Page<Council> results = councilRepository.searchCouncils("Unique Searchable", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(c -> c.getName().contains("Unique Searchable"));
        }

        @Test
        @DisplayName("Should find councils by region")
        void shouldFindCouncilsByRegion() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            council.setRegion("WESTERN");
            councilRepository.save(council);
            flushAndClear();

            // When
            List<Council> westernCouncils = councilRepository.findByRegion("WESTERN");

            // Then
            assertThat(westernCouncils)
                    .isNotEmpty()
                    .allMatch(c -> c.getRegion().equals("WESTERN"));
        }
    }

    @Nested
    @DisplayName("Update Operations")
    class UpdateTests {

        @Test
        @DisplayName("Should update council fields")
        void shouldUpdateCouncilFields() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            Council saved = councilRepository.save(council);
            flushAndClear();

            // When
            saved.setName("Updated Name");
            saved.setCity("Updated City");
            councilRepository.save(saved);
            flushAndClear();

            Optional<Council> updated = councilRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getName()).isEqualTo("Updated Name");
            assertThat(updated.get().getCity()).isEqualTo("Updated City");
        }

        @Test
        @DisplayName("Should update council status")
        void shouldUpdateCouncilStatus() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            council.setStatus(Council.CouncilStatus.ACTIVE);
            Council saved = councilRepository.save(council);
            flushAndClear();

            // When
            saved.setStatus(Council.CouncilStatus.SUSPENDED);
            councilRepository.save(saved);
            flushAndClear();

            Optional<Council> updated = councilRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getStatus()).isEqualTo(Council.CouncilStatus.SUSPENDED);
        }
    }

    @Nested
    @DisplayName("Delete Operations")
    class DeleteTests {

        @Test
        @DisplayName("Should delete council by ID")
        void shouldDeleteCouncilById() {
            // Given
            Council council = TestDataBuilder.createCouncil();
            Council saved = councilRepository.save(council);
            Long savedId = saved.getId();
            flushAndClear();

            // When
            councilRepository.deleteById(savedId);
            flushAndClear();

            // Then
            assertThat(councilRepository.findById(savedId)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty optional for non-existent UUID")
        void shouldReturnEmptyForNonExistentUuid() {
            // When
            Optional<Council> found = councilRepository.findByUuid(UUID.randomUUID());

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should return empty optional for non-existent council number")
        void shouldReturnEmptyForNonExistentCouncilNumber() {
            // When
            Optional<Council> found = councilRepository.findByCouncilNumber("NONEXISTENT-999");

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should handle empty result set for status query")
        void shouldHandleEmptyResultForStatusQuery() {
            // Given - No councils with TRIAL status

            // When
            List<Council> trialCouncils = councilRepository.findByStatus(Council.CouncilStatus.TRIAL);

            // Then
            assertThat(trialCouncils).isEmpty();
        }
    }
}

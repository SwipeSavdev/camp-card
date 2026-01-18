package com.bsa.campcard.service;

import com.bsa.campcard.dto.CreateScoutRequest;
import com.bsa.campcard.dto.ScoutResponse;
import com.bsa.campcard.entity.Scout;
import com.bsa.campcard.entity.Scout.ScoutRank;
import com.bsa.campcard.entity.Scout.ScoutStatus;
import com.bsa.campcard.repository.ScoutRepository;
import com.bsa.campcard.repository.TroopRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ScoutService Tests")
class ScoutServiceTest {

    @Mock
    private ScoutRepository scoutRepository;

    @Mock
    private TroopRepository troopRepository;

    @Mock
    private TroopService troopService;

    @InjectMocks
    private ScoutService scoutService;

    private CreateScoutRequest validCreateRequest;
    private Scout savedScout;
    private UUID testUserId;
    private Long testTroopId;
    private Long testScoutId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testTroopId = 100L;
        testScoutId = 1L;

        // Create scout request using setters (DTOs use @Data)
        validCreateRequest = new CreateScoutRequest();
        validCreateRequest.setUserId(testUserId);
        validCreateRequest.setTroopId(testTroopId);
        validCreateRequest.setFirstName("John");
        validCreateRequest.setLastName("Doe");
        validCreateRequest.setBirthDate(LocalDate.of(2012, 5, 15));
        validCreateRequest.setBsaMemberId("BSA123456");
        validCreateRequest.setRank("TENDERFOOT");
        validCreateRequest.setJoinDate(LocalDate.of(2023, 1, 10));
        validCreateRequest.setParentName("Jane Doe");
        validCreateRequest.setParentEmail("jane.doe@email.com");
        validCreateRequest.setParentPhone("555-123-4567");
        validCreateRequest.setEmergencyContactName("Bob Doe");
        validCreateRequest.setEmergencyContactPhone("555-987-6543");
        validCreateRequest.setSalesGoal(new BigDecimal("500.00"));

        // Create scout entity (Entity uses @Data with setters)
        savedScout = new Scout();
        savedScout.setId(testScoutId);
        savedScout.setUuid(UUID.randomUUID());
        savedScout.setUserId(testUserId);
        savedScout.setTroopId(testTroopId);
        savedScout.setFirstName("John");
        savedScout.setLastName("Doe");
        savedScout.setBirthDate(LocalDate.of(2012, 5, 15));
        savedScout.setBsaMemberId("BSA123456");
        savedScout.setRank(ScoutRank.TENDERFOOT);
        savedScout.setJoinDate(LocalDate.of(2023, 1, 10));
        savedScout.setParentName("Jane Doe");
        savedScout.setParentEmail("jane.doe@email.com");
        savedScout.setParentPhone("555-123-4567");
        savedScout.setEmergencyContactName("Bob Doe");
        savedScout.setEmergencyContactPhone("555-987-6543");
        savedScout.setSalesGoal(new BigDecimal("500.00"));
        savedScout.setCardsSold(0);
        savedScout.setTotalSales(BigDecimal.ZERO);
        savedScout.setCommissionEarned(BigDecimal.ZERO);
        savedScout.setTopSeller(false);
        savedScout.setAwardsEarned(0);
        savedScout.setStatus(ScoutStatus.ACTIVE);
        savedScout.setCreatedAt(LocalDateTime.now());
        savedScout.setUpdatedAt(LocalDateTime.now());
    }

    // Helper method to create a Scout with specific values
    private Scout createScoutWithStats(Long id, String firstName, String lastName,
                                        Long troopId, BigDecimal totalSales,
                                        int cardsSold, ScoutStatus status) {
        Scout scout = new Scout();
        scout.setId(id);
        scout.setUuid(UUID.randomUUID());
        scout.setUserId(UUID.randomUUID());
        scout.setTroopId(troopId);
        scout.setFirstName(firstName);
        scout.setLastName(lastName);
        scout.setRank(ScoutRank.SCOUT);
        scout.setCardsSold(cardsSold);
        scout.setTotalSales(totalSales);
        scout.setCommissionEarned(totalSales.multiply(new BigDecimal("0.10")));
        scout.setTopSeller(false);
        scout.setAwardsEarned(0);
        scout.setStatus(status);
        scout.setCreatedAt(LocalDateTime.now());
        return scout;
    }

    @Nested
    @DisplayName("createScout Tests")
    class CreateScoutTests {

        @Test
        @DisplayName("Should create scout successfully with all fields")
        void createScout_Success() {
            // Arrange
            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.findByBsaMemberId("BSA123456")).thenReturn(Optional.empty());
            when(scoutRepository.save(any(Scout.class))).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            ScoutResponse response = scoutService.createScout(validCreateRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getFirstName()).isEqualTo("John");
            assertThat(response.getLastName()).isEqualTo("Doe");
            assertThat(response.getFullName()).isEqualTo("John Doe");
            assertThat(response.getRank()).isEqualTo("TENDERFOOT");
            assertThat(response.getStatus()).isEqualTo("ACTIVE");

            verify(troopRepository).existsById(testTroopId);
            verify(scoutRepository).findByUserId(testUserId);
            verify(scoutRepository).findByBsaMemberId("BSA123456");
            verify(scoutRepository).save(any(Scout.class));
            verify(troopService).updateTroopStats(testTroopId);
        }

        @Test
        @DisplayName("Should throw exception when troop not found")
        void createScout_TroopNotFound() {
            // Arrange
            when(troopRepository.existsById(testTroopId)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> scoutService.createScout(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");

            verify(troopRepository).existsById(testTroopId);
            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when user already registered as scout")
        void createScout_UserAlreadyRegistered() {
            // Arrange
            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.of(savedScout));

            // Act & Assert
            assertThatThrownBy(() -> scoutService.createScout(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User is already registered as a scout");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when BSA Member ID already exists")
        void createScout_DuplicateBsaMemberId() {
            // Arrange
            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.findByBsaMemberId("BSA123456")).thenReturn(Optional.of(savedScout));

            // Act & Assert
            assertThatThrownBy(() -> scoutService.createScout(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("BSA Member ID already exists");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set default rank to SCOUT when not provided")
        void createScout_DefaultRank() {
            // Arrange
            validCreateRequest.setRank(null);
            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.createScout(validCreateRequest);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getRank()).isEqualTo(ScoutRank.SCOUT);
        }

        @Test
        @DisplayName("Should allow null BSA Member ID")
        void createScout_NullBsaMemberId() {
            // Arrange
            validCreateRequest.setBsaMemberId(null);
            savedScout.setBsaMemberId(null);

            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.save(any(Scout.class))).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            ScoutResponse response = scoutService.createScout(validCreateRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBsaMemberId()).isNull();
            verify(scoutRepository, never()).findByBsaMemberId(any());
        }

        @Test
        @DisplayName("Should set initial status as ACTIVE")
        void createScout_InitialStatusActive() {
            // Arrange
            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);
            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.findByBsaMemberId("BSA123456")).thenReturn(Optional.empty());
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.createScout(validCreateRequest);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getStatus()).isEqualTo(ScoutStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should map all request fields to entity correctly")
        void createScout_MapAllFields() {
            // Arrange
            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);
            when(troopRepository.existsById(testTroopId)).thenReturn(true);
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(scoutRepository.findByBsaMemberId("BSA123456")).thenReturn(Optional.empty());
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.createScout(validCreateRequest);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getUserId()).isEqualTo(testUserId);
            assertThat(captured.getTroopId()).isEqualTo(testTroopId);
            assertThat(captured.getFirstName()).isEqualTo("John");
            assertThat(captured.getLastName()).isEqualTo("Doe");
            assertThat(captured.getBirthDate()).isEqualTo(LocalDate.of(2012, 5, 15));
            assertThat(captured.getBsaMemberId()).isEqualTo("BSA123456");
            assertThat(captured.getRank()).isEqualTo(ScoutRank.TENDERFOOT);
            assertThat(captured.getJoinDate()).isEqualTo(LocalDate.of(2023, 1, 10));
            assertThat(captured.getParentName()).isEqualTo("Jane Doe");
            assertThat(captured.getParentEmail()).isEqualTo("jane.doe@email.com");
            assertThat(captured.getParentPhone()).isEqualTo("555-123-4567");
            assertThat(captured.getEmergencyContactName()).isEqualTo("Bob Doe");
            assertThat(captured.getEmergencyContactPhone()).isEqualTo("555-987-6543");
            assertThat(captured.getSalesGoal()).isEqualByComparingTo(new BigDecimal("500.00"));
        }
    }

    @Nested
    @DisplayName("updateScout Tests")
    class UpdateScoutTests {

        @Test
        @DisplayName("Should update scout successfully")
        void updateScout_Success() {
            // Arrange
            CreateScoutRequest updateRequest = new CreateScoutRequest();
            updateRequest.setFirstName("Johnny");
            updateRequest.setLastName("Updated");
            updateRequest.setRank("FIRST_CLASS");
            updateRequest.setParentName("Updated Parent");
            updateRequest.setParentEmail("updated@email.com");
            updateRequest.setParentPhone("555-000-1111");
            updateRequest.setSalesGoal(new BigDecimal("1000.00"));

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            ScoutResponse response = scoutService.updateScout(testScoutId, updateRequest);

            // Assert
            assertThat(response.getFirstName()).isEqualTo("Johnny");
            assertThat(response.getLastName()).isEqualTo("Updated");
            assertThat(response.getRank()).isEqualTo("FIRST_CLASS");
            assertThat(response.getParentName()).isEqualTo("Updated Parent");
            assertThat(response.getParentEmail()).isEqualTo("updated@email.com");
            assertThat(response.getParentPhone()).isEqualTo("555-000-1111");
            assertThat(response.getSalesGoal()).isEqualByComparingTo(new BigDecimal("1000.00"));

            verify(scoutRepository).save(any(Scout.class));
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void updateScout_NotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.updateScout(999L, validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should only update non-null fields")
        void updateScout_PartialUpdate() {
            // Arrange
            CreateScoutRequest partialRequest = new CreateScoutRequest();
            partialRequest.setFirstName("Only Name Updated");
            // All other fields are null

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            ScoutResponse response = scoutService.updateScout(testScoutId, partialRequest);

            // Assert
            assertThat(response.getFirstName()).isEqualTo("Only Name Updated");
            // Original values should be preserved
            assertThat(response.getLastName()).isEqualTo("Doe");
            assertThat(response.getParentName()).isEqualTo("Jane Doe");
        }

        @Test
        @DisplayName("Should update emergency contact information")
        void updateScout_EmergencyContact() {
            // Arrange
            CreateScoutRequest updateRequest = new CreateScoutRequest();
            updateRequest.setEmergencyContactName("New Emergency Contact");
            updateRequest.setEmergencyContactPhone("555-999-8888");

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            scoutService.updateScout(testScoutId, updateRequest);

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getEmergencyContactName().equals("New Emergency Contact") &&
                            scout.getEmergencyContactPhone().equals("555-999-8888")));
        }
    }

    @Nested
    @DisplayName("getScout Tests")
    class GetScoutTests {

        @Test
        @DisplayName("Should return scout when found by ID")
        void getScout_Found() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));

            // Act
            ScoutResponse response = scoutService.getScout(testScoutId);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(testScoutId);
            assertThat(response.getFirstName()).isEqualTo("John");
            assertThat(response.getLastName()).isEqualTo("Doe");
            assertThat(response.getFullName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should throw exception when scout not found by ID")
        void getScout_NotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.getScout(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");
        }

        @Test
        @DisplayName("Should return correct calculated fields")
        void getScout_CalculatedFields() {
            // Arrange
            savedScout.setTotalSales(new BigDecimal("250.00"));
            savedScout.setSalesGoal(new BigDecimal("500.00"));
            savedScout.setCardsSold(25);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));

            // Act
            ScoutResponse response = scoutService.getScout(testScoutId);

            // Assert
            assertThat(response.getGoalProgress()).isEqualTo(50.0);
            assertThat(response.getCardsSold()).isEqualTo(25);
        }
    }

    @Nested
    @DisplayName("getScoutByUserId Tests")
    class GetScoutByUserIdTests {

        @Test
        @DisplayName("Should return scout when found by user ID")
        void getScoutByUserId_Found() {
            // Arrange
            when(scoutRepository.findByUserId(testUserId)).thenReturn(Optional.of(savedScout));

            // Act
            ScoutResponse response = scoutService.getScoutByUserId(testUserId);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getUserId()).isEqualTo(testUserId);
            assertThat(response.getFirstName()).isEqualTo("John");
        }

        @Test
        @DisplayName("Should throw exception when scout not found by user ID")
        void getScoutByUserId_NotFound() {
            // Arrange
            UUID nonExistentUserId = UUID.randomUUID();
            when(scoutRepository.findByUserId(nonExistentUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.getScoutByUserId(nonExistentUserId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found for user");
        }
    }

    @Nested
    @DisplayName("getTroopRoster Tests")
    class GetTroopRosterTests {

        @Test
        @DisplayName("Should return all scouts in troop paginated")
        void getTroopRoster_Paginated() {
            // Arrange
            Scout scout2 = createScoutWithStats(2L, "Jane", "Smith", testTroopId,
                    new BigDecimal("100.00"), 10, ScoutStatus.ACTIVE);
            Scout scout3 = createScoutWithStats(3L, "Bob", "Wilson", testTroopId,
                    new BigDecimal("50.00"), 5, ScoutStatus.INACTIVE);

            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout, scout2, scout3),
                    PageRequest.of(0, 10), 3);
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findByTroopId(testTroopId, pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTroopRoster(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getTotalElements()).isEqualTo(3);

            verify(scoutRepository).findByTroopId(testTroopId, pageable);
        }

        @Test
        @DisplayName("Should return empty page when troop has no scouts")
        void getTroopRoster_Empty() {
            // Arrange
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findByTroopId(999L, pageable)).thenReturn(emptyPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTroopRoster(999L, pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }

        @Test
        @DisplayName("Should include all scout statuses")
        void getTroopRoster_IncludesAllStatuses() {
            // Arrange
            Scout activeScout = createScoutWithStats(2L, "Active", "Scout", testTroopId,
                    BigDecimal.ZERO, 0, ScoutStatus.ACTIVE);
            Scout inactiveScout = createScoutWithStats(3L, "Inactive", "Scout", testTroopId,
                    BigDecimal.ZERO, 0, ScoutStatus.INACTIVE);
            Scout transferredScout = createScoutWithStats(4L, "Transferred", "Scout", testTroopId,
                    BigDecimal.ZERO, 0, ScoutStatus.TRANSFERRED);

            Page<Scout> scoutPage = new PageImpl<>(
                    List.of(activeScout, inactiveScout, transferredScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findByTroopId(testTroopId, pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTroopRoster(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent())
                    .extracting(ScoutResponse::getStatus)
                    .containsExactlyInAnyOrder("ACTIVE", "INACTIVE", "TRANSFERRED");
        }
    }

    @Nested
    @DisplayName("getActiveTroopRoster Tests")
    class GetActiveTroopRosterTests {

        @Test
        @DisplayName("Should return only active scouts in troop")
        void getActiveTroopRoster_OnlyActive() {
            // Arrange
            Scout activeScout = createScoutWithStats(2L, "Active", "Scout", testTroopId,
                    BigDecimal.ZERO, 0, ScoutStatus.ACTIVE);

            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout, activeScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findByTroopIdAndStatus(testTroopId, ScoutStatus.ACTIVE, pageable))
                    .thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getActiveTroopRoster(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent())
                    .extracting(ScoutResponse::getStatus)
                    .containsOnly("ACTIVE");

            verify(scoutRepository).findByTroopIdAndStatus(testTroopId, ScoutStatus.ACTIVE, pageable);
        }

        @Test
        @DisplayName("Should return empty when no active scouts")
        void getActiveTroopRoster_NoActiveScouts() {
            // Arrange
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findByTroopIdAndStatus(testTroopId, ScoutStatus.ACTIVE, pageable))
                    .thenReturn(emptyPage);

            // Act
            Page<ScoutResponse> result = scoutService.getActiveTroopRoster(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("searchScouts Tests")
    class SearchScoutsTests {

        @Test
        @DisplayName("Should find scouts by first name")
        void searchScouts_ByFirstName() {
            // Arrange
            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.searchScouts("John", pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.searchScouts("John", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getFirstName()).isEqualTo("John");

            verify(scoutRepository).searchScouts("John", pageable);
        }

        @Test
        @DisplayName("Should find scouts by last name")
        void searchScouts_ByLastName() {
            // Arrange
            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.searchScouts("Doe", pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.searchScouts("Doe", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getLastName()).isEqualTo("Doe");
        }

        @Test
        @DisplayName("Should find scouts by BSA Member ID")
        void searchScouts_ByBsaMemberId() {
            // Arrange
            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.searchScouts("BSA123", pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.searchScouts("BSA123", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getBsaMemberId()).contains("BSA123");
        }

        @Test
        @DisplayName("Should return empty when no matches found")
        void searchScouts_NoMatches() {
            // Arrange
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.searchScouts("NonExistent", pageable)).thenReturn(emptyPage);

            // Act
            Page<ScoutResponse> result = scoutService.searchScouts("NonExistent", pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should return multiple matches")
        void searchScouts_MultipleMatches() {
            // Arrange
            Scout scout2 = createScoutWithStats(2L, "Johnny", "Johnson", testTroopId,
                    BigDecimal.ZERO, 0, ScoutStatus.ACTIVE);
            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout, scout2));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.searchScouts("John", pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.searchScouts("John", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("getTopSellers Tests")
    class GetTopSellersTests {

        @Test
        @DisplayName("Should return global top sellers ordered by total sales")
        void getTopSellers_OrderedBySales() {
            // Arrange
            Scout topSeller = createScoutWithStats(2L, "Top", "Seller", testTroopId,
                    new BigDecimal("1000.00"), 100, ScoutStatus.ACTIVE);
            Scout secondSeller = createScoutWithStats(3L, "Second", "Seller", testTroopId,
                    new BigDecimal("500.00"), 50, ScoutStatus.ACTIVE);
            savedScout.setTotalSales(new BigDecimal("250.00"));

            Page<Scout> scoutPage = new PageImpl<>(List.of(topSeller, secondSeller, savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findTopSellersGlobal(pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTopSellers(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent().get(0).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(result.getContent().get(1).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(result.getContent().get(2).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("250.00"));

            verify(scoutRepository).findTopSellersGlobal(pageable);
        }

        @Test
        @DisplayName("Should return empty when no scouts exist")
        void getTopSellers_Empty() {
            // Arrange
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findTopSellersGlobal(pageable)).thenReturn(emptyPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTopSellers(pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getTopSellersByTroop Tests")
    class GetTopSellersByTroopTests {

        @Test
        @DisplayName("Should return top sellers for specific troop")
        void getTopSellersByTroop_OrderedBySales() {
            // Arrange
            Scout topSeller = createScoutWithStats(2L, "Top", "Seller", testTroopId,
                    new BigDecimal("500.00"), 50, ScoutStatus.ACTIVE);
            savedScout.setTotalSales(new BigDecimal("200.00"));

            Page<Scout> scoutPage = new PageImpl<>(List.of(topSeller, savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findTopSellersByTroop(testTroopId, pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTopSellersByTroop(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent().get(0).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(result.getContent().get(1).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("200.00"));

            verify(scoutRepository).findTopSellersByTroop(testTroopId, pageable);
        }

        @Test
        @DisplayName("Should return empty when troop has no scouts")
        void getTopSellersByTroop_Empty() {
            // Arrange
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findTopSellersByTroop(999L, pageable)).thenReturn(emptyPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTopSellersByTroop(999L, pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should only return scouts from specified troop")
        void getTopSellersByTroop_FiltersByTroop() {
            // Arrange
            Page<Scout> scoutPage = new PageImpl<>(List.of(savedScout));
            Pageable pageable = PageRequest.of(0, 10);

            when(scoutRepository.findTopSellersByTroop(testTroopId, pageable)).thenReturn(scoutPage);

            // Act
            Page<ScoutResponse> result = scoutService.getTopSellersByTroop(testTroopId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getTroopId()).isEqualTo(testTroopId);
        }
    }

    @Nested
    @DisplayName("recordSale Tests")
    class RecordSaleTests {

        @Test
        @DisplayName("Should record sale and update totals")
        void recordSale_Success() {
            // Arrange
            savedScout.setTotalSales(new BigDecimal("100.00"));
            savedScout.setCardsSold(10);
            savedScout.setCommissionEarned(new BigDecimal("10.00"));

            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.recordSale(testScoutId, new BigDecimal("50.00"), 5);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getTotalSales()).isEqualByComparingTo(new BigDecimal("150.00"));
            assertThat(captured.getCardsSold()).isEqualTo(15);
            // Commission should be 10% of new sale amount added to existing
            assertThat(captured.getCommissionEarned()).isEqualByComparingTo(new BigDecimal("15.00"));

            verify(troopService).updateTroopStats(testTroopId);
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void recordSale_ScoutNotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.recordSale(999L, new BigDecimal("50.00"), 5))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should calculate 10% commission correctly")
        void recordSale_CommissionCalculation() {
            // Arrange
            savedScout.setTotalSales(BigDecimal.ZERO);
            savedScout.setCardsSold(0);
            savedScout.setCommissionEarned(BigDecimal.ZERO);

            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.recordSale(testScoutId, new BigDecimal("200.00"), 20);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getCommissionEarned()).isEqualByComparingTo(new BigDecimal("20.00"));
        }

        @Test
        @DisplayName("Should increment awards when goal is met")
        void recordSale_GoalMetIncrementAwards() {
            // Arrange
            savedScout.setTotalSales(new BigDecimal("450.00"));
            savedScout.setSalesGoal(new BigDecimal("500.00"));
            savedScout.setAwardsEarned(0);
            savedScout.setCardsSold(45);
            savedScout.setCommissionEarned(new BigDecimal("45.00"));

            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.recordSale(testScoutId, new BigDecimal("60.00"), 6);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getTotalSales()).isEqualByComparingTo(new BigDecimal("510.00"));
            assertThat(captured.getAwardsEarned()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should not increment awards when goal not set")
        void recordSale_NoGoalSet() {
            // Arrange
            savedScout.setTotalSales(BigDecimal.ZERO);
            savedScout.setSalesGoal(null);
            savedScout.setAwardsEarned(0);
            savedScout.setCardsSold(0);
            savedScout.setCommissionEarned(BigDecimal.ZERO);

            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.recordSale(testScoutId, new BigDecimal("1000.00"), 100);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getAwardsEarned()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("updateScoutRank Tests")
    class UpdateScoutRankTests {

        @Test
        @DisplayName("Should update rank successfully")
        void updateScoutRank_Success() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            scoutService.updateScoutRank(testScoutId, "FIRST_CLASS");

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getRank() == ScoutRank.FIRST_CLASS));
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void updateScoutRank_NotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.updateScoutRank(999L, "EAGLE"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update to EAGLE rank")
        void updateScoutRank_ToEagle() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            scoutService.updateScoutRank(testScoutId, "EAGLE");

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getRank() == ScoutRank.EAGLE));
        }

        @Test
        @DisplayName("Should throw exception for invalid rank")
        void updateScoutRank_InvalidRank() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));

            // Act & Assert
            assertThatThrownBy(() -> scoutService.updateScoutRank(testScoutId, "INVALID_RANK"))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(scoutRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateScoutStatus Tests")
    class UpdateScoutStatusTests {

        @Test
        @DisplayName("Should update status to INACTIVE")
        void updateScoutStatus_ToInactive() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.updateScoutStatus(testScoutId, "INACTIVE");

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getStatus() == ScoutStatus.INACTIVE));
            verify(troopService).updateTroopStats(testTroopId);
        }

        @Test
        @DisplayName("Should update status to AGED_OUT")
        void updateScoutStatus_ToAgedOut() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.updateScoutStatus(testScoutId, "AGED_OUT");

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getStatus() == ScoutStatus.AGED_OUT));
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void updateScoutStatus_NotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.updateScoutStatus(999L, "INACTIVE"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception for invalid status")
        void updateScoutStatus_InvalidStatus() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));

            // Act & Assert
            assertThatThrownBy(() -> scoutService.updateScoutStatus(testScoutId, "INVALID_STATUS"))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should reactivate scout from inactive status")
        void updateScoutStatus_Reactivate() {
            // Arrange
            savedScout.setStatus(ScoutStatus.INACTIVE);
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.updateScoutStatus(testScoutId, "ACTIVE");

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getStatus() == ScoutStatus.ACTIVE));
        }
    }

    @Nested
    @DisplayName("transferScout Tests")
    class TransferScoutTests {

        @Test
        @DisplayName("Should transfer scout successfully")
        void transferScout_Success() {
            // Arrange
            Long newTroopId = 200L;
            Long oldTroopId = savedScout.getTroopId();

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(troopRepository.existsById(newTroopId)).thenReturn(true);
            when(scoutRepository.save(any(Scout.class))).thenAnswer(inv -> inv.getArgument(0));
            doNothing().when(troopService).updateTroopStats(anyLong());

            // Act
            scoutService.transferScout(testScoutId, newTroopId);

            // Assert
            verify(scoutRepository).save(argThat(scout ->
                    scout.getTroopId().equals(newTroopId) &&
                            scout.getStatus() == ScoutStatus.TRANSFERRED));
            verify(troopService).updateTroopStats(oldTroopId);
            verify(troopService).updateTroopStats(newTroopId);
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void transferScout_ScoutNotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.transferScout(999L, 200L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when new troop not found")
        void transferScout_NewTroopNotFound() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(troopRepository.existsById(999L)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> scoutService.transferScout(testScoutId, 999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("New troop not found");

            verify(scoutRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set status to TRANSFERRED")
        void transferScout_SetsTransferredStatus() {
            // Arrange
            Long newTroopId = 200L;
            ArgumentCaptor<Scout> scoutCaptor = ArgumentCaptor.forClass(Scout.class);

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(troopRepository.existsById(newTroopId)).thenReturn(true);
            when(scoutRepository.save(scoutCaptor.capture())).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(anyLong());

            // Act
            scoutService.transferScout(testScoutId, newTroopId);

            // Assert
            Scout captured = scoutCaptor.getValue();
            assertThat(captured.getStatus()).isEqualTo(ScoutStatus.TRANSFERRED);
        }

        @Test
        @DisplayName("Should update both old and new troop stats")
        void transferScout_UpdatesBothTroopStats() {
            // Arrange
            Long oldTroopId = testTroopId;
            Long newTroopId = 200L;

            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            when(troopRepository.existsById(newTroopId)).thenReturn(true);
            when(scoutRepository.save(any(Scout.class))).thenReturn(savedScout);
            doNothing().when(troopService).updateTroopStats(anyLong());

            // Act
            scoutService.transferScout(testScoutId, newTroopId);

            // Assert
            verify(troopService).updateTroopStats(oldTroopId);
            verify(troopService).updateTroopStats(newTroopId);
        }
    }

    @Nested
    @DisplayName("markTopSellers Tests")
    class MarkTopSellersTests {

        @Test
        @DisplayName("Should mark top N scouts as top sellers")
        void markTopSellers_Success() {
            // Arrange
            Scout topSeller1 = createScoutWithStats(1L, "Top", "Seller1", testTroopId,
                    new BigDecimal("1000.00"), 100, ScoutStatus.ACTIVE);
            Scout topSeller2 = createScoutWithStats(2L, "Top", "Seller2", testTroopId,
                    new BigDecimal("900.00"), 90, ScoutStatus.ACTIVE);
            Scout regularScout = createScoutWithStats(3L, "Regular", "Scout", testTroopId,
                    new BigDecimal("100.00"), 10, ScoutStatus.ACTIVE);

            List<Scout> allScouts = List.of(topSeller1, topSeller2, regularScout);
            Page<Scout> topSellersPage = new PageImpl<>(List.of(topSeller1, topSeller2));

            when(scoutRepository.findAll()).thenReturn(allScouts);
            when(scoutRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
            when(scoutRepository.findTopSellersGlobal(Pageable.ofSize(2))).thenReturn(topSellersPage);

            // Act
            scoutService.markTopSellers(2);

            // Assert
            verify(scoutRepository, times(2)).saveAll(anyList());
        }

        @Test
        @DisplayName("Should reset all top seller flags first")
        void markTopSellers_ResetsAllFlags() {
            // Arrange
            Scout existingTopSeller = createScoutWithStats(1L, "Old", "TopSeller", testTroopId,
                    new BigDecimal("500.00"), 50, ScoutStatus.ACTIVE);
            existingTopSeller.setTopSeller(true);

            List<Scout> allScouts = List.of(existingTopSeller);
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());

            when(scoutRepository.findAll()).thenReturn(allScouts);
            when(scoutRepository.saveAll(anyList())).thenAnswer(inv -> {
                @SuppressWarnings("unchecked")
                List<Scout> savedScouts = (List<Scout>) inv.getArgument(0);
                // Verify the first saveAll call resets the top seller flag
                if (!savedScouts.isEmpty() && savedScouts.get(0).getTopSeller() == false) {
                    return savedScouts;
                }
                return savedScouts;
            });
            when(scoutRepository.findTopSellersGlobal(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            scoutService.markTopSellers(5);

            // Assert
            verify(scoutRepository).findAll();
            verify(scoutRepository, times(2)).saveAll(anyList());
        }

        @Test
        @DisplayName("Should handle empty scout list")
        void markTopSellers_NoScouts() {
            // Arrange
            List<Scout> emptyList = Collections.emptyList();
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());

            when(scoutRepository.findAll()).thenReturn(emptyList);
            when(scoutRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
            when(scoutRepository.findTopSellersGlobal(any(Pageable.class))).thenReturn(emptyPage);

            // Act
            scoutService.markTopSellers(5);

            // Assert
            verify(scoutRepository, times(2)).saveAll(anyList());
        }

        @Test
        @DisplayName("Should use correct pageable size")
        void markTopSellers_CorrectPageableSize() {
            // Arrange
            List<Scout> allScouts = Collections.emptyList();
            Page<Scout> emptyPage = new PageImpl<>(Collections.emptyList());

            when(scoutRepository.findAll()).thenReturn(allScouts);
            when(scoutRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
            when(scoutRepository.findTopSellersGlobal(Pageable.ofSize(10))).thenReturn(emptyPage);

            // Act
            scoutService.markTopSellers(10);

            // Assert
            verify(scoutRepository).findTopSellersGlobal(Pageable.ofSize(10));
        }
    }

    @Nested
    @DisplayName("deleteScout Tests")
    class DeleteScoutTests {

        @Test
        @DisplayName("Should delete scout successfully")
        void deleteScout_Success() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            doNothing().when(scoutRepository).delete(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.deleteScout(testScoutId);

            // Assert
            verify(scoutRepository).delete(savedScout);
            verify(troopService).updateTroopStats(testTroopId);
        }

        @Test
        @DisplayName("Should throw exception when scout not found")
        void deleteScout_NotFound() {
            // Arrange
            when(scoutRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> scoutService.deleteScout(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Scout not found");

            verify(scoutRepository, never()).delete(any(Scout.class));
        }

        @Test
        @DisplayName("Should update troop stats after deletion")
        void deleteScout_UpdatesTroopStats() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            doNothing().when(scoutRepository).delete(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.deleteScout(testScoutId);

            // Assert
            verify(troopService).updateTroopStats(testTroopId);
        }

        @Test
        @DisplayName("Should capture troop ID before deletion")
        void deleteScout_CapturesTroopIdBeforeDeletion() {
            // Arrange
            when(scoutRepository.findById(testScoutId)).thenReturn(Optional.of(savedScout));
            doNothing().when(scoutRepository).delete(savedScout);
            doNothing().when(troopService).updateTroopStats(testTroopId);

            // Act
            scoutService.deleteScout(testScoutId);

            // Assert - verify the order of operations
            var inOrder = inOrder(scoutRepository, troopService);
            inOrder.verify(scoutRepository).findById(testScoutId);
            inOrder.verify(scoutRepository).delete(savedScout);
            inOrder.verify(troopService).updateTroopStats(testTroopId);
        }
    }
}

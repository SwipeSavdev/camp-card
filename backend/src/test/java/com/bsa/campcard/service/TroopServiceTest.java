package com.bsa.campcard.service;

import com.bsa.campcard.dto.CreateTroopRequest;
import com.bsa.campcard.dto.TroopResponse;
import com.bsa.campcard.entity.Scout;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.entity.Troop.TroopStatus;
import com.bsa.campcard.entity.Troop.TroopType;
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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TroopService Tests")
class TroopServiceTest {

    @Mock
    private TroopRepository troopRepository;

    @Mock
    private ScoutRepository scoutRepository;

    @InjectMocks
    private TroopService troopService;

    private CreateTroopRequest validCreateRequest;
    private Troop savedTroop;
    private UUID testScoutmasterId;
    private Long testCouncilId;

    @BeforeEach
    void setUp() {
        testScoutmasterId = UUID.randomUUID();
        testCouncilId = 100L;

        // Create troop request using setters (DTOs use @Data)
        validCreateRequest = new CreateTroopRequest();
        validCreateRequest.setTroopNumber("123");
        validCreateRequest.setCouncilId(testCouncilId);
        validCreateRequest.setTroopName("Troop 123 - Eagles");
        validCreateRequest.setTroopType("SCOUTS_BSA");
        validCreateRequest.setCharterOrganization("First Methodist Church");
        validCreateRequest.setMeetingLocation("123 Main St, Dallas, TX");
        validCreateRequest.setMeetingDay("Monday");
        validCreateRequest.setMeetingTime("7:00 PM");
        validCreateRequest.setScoutmasterId(testScoutmasterId);
        validCreateRequest.setScoutmasterName("John Smith");
        validCreateRequest.setScoutmasterEmail("john.smith@email.com");
        validCreateRequest.setScoutmasterPhone("555-123-4567");
        validCreateRequest.setGoalAmount(new BigDecimal("5000.00"));

        // Create troop entity (Entity uses @Data with setters)
        savedTroop = new Troop();
        savedTroop.setId(1L);
        savedTroop.setUuid(UUID.randomUUID());
        savedTroop.setTroopNumber("123");
        savedTroop.setCouncilId(testCouncilId);
        savedTroop.setTroopName("Troop 123 - Eagles");
        savedTroop.setTroopType(TroopType.SCOUTS_BSA);
        savedTroop.setCharterOrganization("First Methodist Church");
        savedTroop.setMeetingLocation("123 Main St, Dallas, TX");
        savedTroop.setMeetingDay("Monday");
        savedTroop.setMeetingTime("7:00 PM");
        savedTroop.setScoutmasterId(testScoutmasterId);
        savedTroop.setScoutmasterName("John Smith");
        savedTroop.setScoutmasterEmail("john.smith@email.com");
        savedTroop.setScoutmasterPhone("555-123-4567");
        savedTroop.setGoalAmount(new BigDecimal("5000.00"));
        savedTroop.setTotalScouts(0);
        savedTroop.setActiveScouts(0);
        savedTroop.setTotalSales(BigDecimal.ZERO);
        savedTroop.setCardsSold(0);
        savedTroop.setStatus(TroopStatus.ACTIVE);
        savedTroop.setCreatedAt(LocalDateTime.now());
        savedTroop.setUpdatedAt(LocalDateTime.now());
    }

    // Helper method to create a Troop with specific values
    private Troop createTroopWithStats(Long id, String troopNumber, Long councilId,
                                        int activeScouts, int totalScouts,
                                        BigDecimal totalSales, int cardsSold) {
        Troop troop = new Troop();
        troop.setId(id);
        troop.setUuid(UUID.randomUUID());
        troop.setTroopNumber(troopNumber);
        troop.setCouncilId(councilId);
        troop.setTroopName("Troop " + troopNumber);
        troop.setTroopType(TroopType.SCOUTS_BSA);
        troop.setActiveScouts(activeScouts);
        troop.setTotalScouts(totalScouts);
        troop.setTotalSales(totalSales);
        troop.setCardsSold(cardsSold);
        troop.setStatus(TroopStatus.ACTIVE);
        troop.setCreatedAt(LocalDateTime.now());
        return troop;
    }

    @Nested
    @DisplayName("createTroop Tests")
    class CreateTroopTests {

        @Test
        @DisplayName("Should create troop successfully with all fields")
        void createTroop_Success() {
            // Arrange
            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.empty());
            when(troopRepository.save(any(Troop.class))).thenReturn(savedTroop);

            // Act
            TroopResponse response = troopService.createTroop(validCreateRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getTroopNumber()).isEqualTo("123");
            assertThat(response.getTroopName()).isEqualTo("Troop 123 - Eagles");
            assertThat(response.getTroopType()).isEqualTo("SCOUTS_BSA");
            assertThat(response.getCouncilId()).isEqualTo(testCouncilId);
            assertThat(response.getStatus()).isEqualTo("ACTIVE");

            verify(troopRepository).findByTroopNumber("123");
            verify(troopRepository).save(any(Troop.class));
        }

        @Test
        @DisplayName("Should throw exception when troop number already exists")
        void createTroop_DuplicateTroopNumber() {
            // Arrange
            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.of(savedTroop));

            // Act & Assert
            assertThatThrownBy(() -> troopService.createTroop(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop number already exists");

            verify(troopRepository).findByTroopNumber("123");
            verify(troopRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set correct initial status as ACTIVE")
        void createTroop_InitialStatusActive() {
            // Arrange
            ArgumentCaptor<Troop> troopCaptor = ArgumentCaptor.forClass(Troop.class);
            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.empty());
            when(troopRepository.save(troopCaptor.capture())).thenReturn(savedTroop);

            // Act
            troopService.createTroop(validCreateRequest);

            // Assert
            Troop captured = troopCaptor.getValue();
            assertThat(captured.getStatus()).isEqualTo(TroopStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should map all request fields to entity correctly")
        void createTroop_MapAllFields() {
            // Arrange
            ArgumentCaptor<Troop> troopCaptor = ArgumentCaptor.forClass(Troop.class);
            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.empty());
            when(troopRepository.save(troopCaptor.capture())).thenReturn(savedTroop);

            // Act
            troopService.createTroop(validCreateRequest);

            // Assert
            Troop captured = troopCaptor.getValue();
            assertThat(captured.getTroopNumber()).isEqualTo("123");
            assertThat(captured.getCouncilId()).isEqualTo(testCouncilId);
            assertThat(captured.getTroopName()).isEqualTo("Troop 123 - Eagles");
            assertThat(captured.getTroopType()).isEqualTo(TroopType.SCOUTS_BSA);
            assertThat(captured.getCharterOrganization()).isEqualTo("First Methodist Church");
            assertThat(captured.getMeetingLocation()).isEqualTo("123 Main St, Dallas, TX");
            assertThat(captured.getMeetingDay()).isEqualTo("Monday");
            assertThat(captured.getMeetingTime()).isEqualTo("7:00 PM");
            assertThat(captured.getScoutmasterId()).isEqualTo(testScoutmasterId);
            assertThat(captured.getScoutmasterName()).isEqualTo("John Smith");
            assertThat(captured.getScoutmasterEmail()).isEqualTo("john.smith@email.com");
            assertThat(captured.getScoutmasterPhone()).isEqualTo("555-123-4567");
            assertThat(captured.getGoalAmount()).isEqualByComparingTo(new BigDecimal("5000.00"));
        }

        @Test
        @DisplayName("Should handle different troop types correctly")
        void createTroop_DifferentTroopTypes() {
            // Arrange
            validCreateRequest.setTroopType("CUB_SCOUTS");
            Troop cubScoutTroop = new Troop();
            cubScoutTroop.setId(2L);
            cubScoutTroop.setUuid(UUID.randomUUID());
            cubScoutTroop.setTroopNumber("123");
            cubScoutTroop.setCouncilId(testCouncilId);
            cubScoutTroop.setTroopType(TroopType.CUB_SCOUTS);
            cubScoutTroop.setStatus(TroopStatus.ACTIVE);
            cubScoutTroop.setTotalScouts(0);
            cubScoutTroop.setActiveScouts(0);
            cubScoutTroop.setTotalSales(BigDecimal.ZERO);
            cubScoutTroop.setCardsSold(0);
            cubScoutTroop.setCreatedAt(LocalDateTime.now());

            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.empty());
            when(troopRepository.save(any(Troop.class))).thenReturn(cubScoutTroop);

            // Act
            TroopResponse response = troopService.createTroop(validCreateRequest);

            // Assert
            assertThat(response.getTroopType()).isEqualTo("CUB_SCOUTS");
        }
    }

    @Nested
    @DisplayName("updateTroop Tests")
    class UpdateTroopTests {

        @Test
        @DisplayName("Should update troop successfully")
        void updateTroop_Success() {
            // Arrange
            CreateTroopRequest updateRequest = new CreateTroopRequest();
            updateRequest.setTroopName("Updated Troop Name");
            updateRequest.setCharterOrganization("Updated Organization");
            updateRequest.setMeetingLocation("456 Oak St, Dallas, TX");
            updateRequest.setMeetingDay("Tuesday");
            updateRequest.setMeetingTime("6:30 PM");
            updateRequest.setScoutmasterName("Jane Doe");
            updateRequest.setScoutmasterEmail("jane.doe@email.com");
            updateRequest.setScoutmasterPhone("555-987-6543");
            updateRequest.setGoalAmount(new BigDecimal("7500.00"));

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            TroopResponse response = troopService.updateTroop(1L, updateRequest);

            // Assert
            assertThat(response.getTroopName()).isEqualTo("Updated Troop Name");
            assertThat(response.getCharterOrganization()).isEqualTo("Updated Organization");
            assertThat(response.getMeetingLocation()).isEqualTo("456 Oak St, Dallas, TX");
            assertThat(response.getMeetingDay()).isEqualTo("Tuesday");
            assertThat(response.getMeetingTime()).isEqualTo("6:30 PM");
            assertThat(response.getScoutmasterName()).isEqualTo("Jane Doe");
            assertThat(response.getScoutmasterEmail()).isEqualTo("jane.doe@email.com");
            assertThat(response.getScoutmasterPhone()).isEqualTo("555-987-6543");
            assertThat(response.getGoalAmount()).isEqualByComparingTo(new BigDecimal("7500.00"));

            verify(troopRepository).save(any(Troop.class));
        }

        @Test
        @DisplayName("Should throw exception when troop not found")
        void updateTroop_NotFound() {
            // Arrange
            when(troopRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.updateTroop(999L, validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");

            verify(troopRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should only update non-null fields")
        void updateTroop_PartialUpdate() {
            // Arrange
            CreateTroopRequest partialRequest = new CreateTroopRequest();
            partialRequest.setTroopName("Only Name Updated");
            // All other fields are null

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            TroopResponse response = troopService.updateTroop(1L, partialRequest);

            // Assert
            assertThat(response.getTroopName()).isEqualTo("Only Name Updated");
            // Original values should be preserved
            assertThat(response.getCharterOrganization()).isEqualTo("First Methodist Church");
            assertThat(response.getMeetingDay()).isEqualTo("Monday");
        }

        @Test
        @DisplayName("Should update scoutmaster ID when provided")
        void updateTroop_UpdateScoutmasterId() {
            // Arrange
            UUID newScoutmasterId = UUID.randomUUID();
            CreateTroopRequest updateRequest = new CreateTroopRequest();
            updateRequest.setScoutmasterId(newScoutmasterId);

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            TroopResponse response = troopService.updateTroop(1L, updateRequest);

            // Assert
            assertThat(response.getScoutmasterId()).isEqualTo(newScoutmasterId);
        }
    }

    @Nested
    @DisplayName("getTroop Tests")
    class GetTroopTests {

        @Test
        @DisplayName("Should return troop when found by ID")
        void getTroop_Found() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));

            // Act
            TroopResponse response = troopService.getTroop(1L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getTroopNumber()).isEqualTo("123");
            assertThat(response.getTroopName()).isEqualTo("Troop 123 - Eagles");
        }

        @Test
        @DisplayName("Should throw exception when troop not found by ID")
        void getTroop_NotFound() {
            // Arrange
            when(troopRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.getTroop(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");
        }

        @Test
        @DisplayName("Should return correct calculated fields")
        void getTroop_CalculatedFields() {
            // Arrange
            savedTroop.setActiveScouts(10);
            savedTroop.setTotalSales(new BigDecimal("2500.00"));
            savedTroop.setGoalAmount(new BigDecimal("5000.00"));

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));

            // Act
            TroopResponse response = troopService.getTroop(1L);

            // Assert
            assertThat(response.getGoalProgress()).isEqualTo(50.0);
            assertThat(response.getAverageSalesPerScout()).isEqualByComparingTo(new BigDecimal("250.00"));
        }
    }

    @Nested
    @DisplayName("getTroopByNumber Tests")
    class GetTroopByNumberTests {

        @Test
        @DisplayName("Should return troop when found by number")
        void getTroopByNumber_Found() {
            // Arrange
            when(troopRepository.findByTroopNumber("123")).thenReturn(Optional.of(savedTroop));

            // Act
            TroopResponse response = troopService.getTroopByNumber("123");

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getTroopNumber()).isEqualTo("123");
            assertThat(response.getTroopName()).isEqualTo("Troop 123 - Eagles");
        }

        @Test
        @DisplayName("Should throw exception when troop not found by number")
        void getTroopByNumber_NotFound() {
            // Arrange
            when(troopRepository.findByTroopNumber("999")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.getTroopByNumber("999"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");
        }
    }

    @Nested
    @DisplayName("getAllTroops Tests")
    class GetAllTroopsTests {

        @Test
        @DisplayName("Should return paginated troops")
        void getAllTroops_Paginated() {
            // Arrange
            Troop troop2 = createTroopWithStats(2L, "456", 100L, 5, 8, new BigDecimal("1000"), 50);
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop, troop2), PageRequest.of(0, 10), 2);
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findAll(pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getAllTroops(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
            assertThat(result.getContent().get(0).getTroopNumber()).isEqualTo("123");
            assertThat(result.getContent().get(1).getTroopNumber()).isEqualTo("456");

            verify(troopRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return empty page when no troops exist")
        void getAllTroops_Empty() {
            // Arrange
            Page<Troop> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            Page<TroopResponse> result = troopService.getAllTroops(pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }

        @Test
        @DisplayName("Should handle pagination correctly")
        void getAllTroops_SecondPage() {
            // Arrange
            Troop troop3 = createTroopWithStats(3L, "789", 100L, 12, 15, new BigDecimal("3000"), 150);
            Page<Troop> secondPage = new PageImpl<>(List.of(troop3), PageRequest.of(1, 2), 3);
            Pageable pageable = PageRequest.of(1, 2);

            when(troopRepository.findAll(pageable)).thenReturn(secondPage);

            // Act
            Page<TroopResponse> result = troopService.getAllTroops(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(3);
            assertThat(result.getNumber()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("getTroopsByCouncil Tests")
    class GetTroopsByCouncilTests {

        @Test
        @DisplayName("Should return troops for specific council")
        void getTroopsByCouncil_Found() {
            // Arrange
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findByCouncilId(testCouncilId, pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTroopsByCouncil(testCouncilId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCouncilId()).isEqualTo(testCouncilId);

            verify(troopRepository).findByCouncilId(testCouncilId, pageable);
        }

        @Test
        @DisplayName("Should return empty page when council has no troops")
        void getTroopsByCouncil_Empty() {
            // Arrange
            Page<Troop> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findByCouncilId(999L, pageable)).thenReturn(emptyPage);

            // Act
            Page<TroopResponse> result = troopService.getTroopsByCouncil(999L, pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should filter by council ID correctly")
        void getTroopsByCouncil_DifferentCouncils() {
            // Arrange
            Long differentCouncilId = 200L;
            Troop troop2 = createTroopWithStats(2L, "456", differentCouncilId, 5, 8, new BigDecimal("1000"), 50);
            Page<Troop> troopPage = new PageImpl<>(List.of(troop2));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findByCouncilId(differentCouncilId, pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTroopsByCouncil(differentCouncilId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCouncilId()).isEqualTo(differentCouncilId);
        }
    }

    @Nested
    @DisplayName("searchTroops Tests")
    class SearchTroopsTests {

        @Test
        @DisplayName("Should find troops by troop number")
        void searchTroops_ByTroopNumber() {
            // Arrange
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.searchTroops("123", pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.searchTroops("123", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getTroopNumber()).isEqualTo("123");

            verify(troopRepository).searchTroops("123", pageable);
        }

        @Test
        @DisplayName("Should find troops by name")
        void searchTroops_ByName() {
            // Arrange
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.searchTroops("Eagles", pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.searchTroops("Eagles", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getTroopName()).contains("Eagles");
        }

        @Test
        @DisplayName("Should find troops by charter organization")
        void searchTroops_ByCharterOrganization() {
            // Arrange
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.searchTroops("Methodist", pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.searchTroops("Methodist", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCharterOrganization()).contains("Methodist");
        }

        @Test
        @DisplayName("Should return empty when no matches found")
        void searchTroops_NoMatches() {
            // Arrange
            Page<Troop> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.searchTroops("NonExistent", pageable)).thenReturn(emptyPage);

            // Act
            Page<TroopResponse> result = troopService.searchTroops("NonExistent", pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getTopPerformingTroops Tests")
    class GetTopPerformingTroopsTests {

        @Test
        @DisplayName("Should return troops ordered by total sales descending")
        void getTopPerformingTroops_OrderedBySales() {
            // Arrange
            Troop topTroop = createTroopWithStats(2L, "456", 100L, 20, 25, new BigDecimal("10000"), 500);
            Troop secondTroop = createTroopWithStats(3L, "789", 100L, 15, 18, new BigDecimal("7500"), 375);
            savedTroop.setTotalSales(new BigDecimal("5000"));

            Page<Troop> troopPage = new PageImpl<>(List.of(topTroop, secondTroop, savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findTopPerformingTroops(pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroops(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent().get(0).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("10000"));
            assertThat(result.getContent().get(1).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("7500"));
            assertThat(result.getContent().get(2).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("5000"));

            verify(troopRepository).findTopPerformingTroops(pageable);
        }

        @Test
        @DisplayName("Should return empty when no troops exist")
        void getTopPerformingTroops_Empty() {
            // Arrange
            Page<Troop> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findTopPerformingTroops(pageable)).thenReturn(emptyPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroops(pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should limit results based on pageable size")
        void getTopPerformingTroops_LimitedResults() {
            // Arrange
            Troop topTroop = createTroopWithStats(2L, "456", 100L, 20, 25, new BigDecimal("10000"), 500);
            Page<Troop> troopPage = new PageImpl<>(List.of(topTroop), PageRequest.of(0, 1), 5);
            Pageable pageable = PageRequest.of(0, 1);

            when(troopRepository.findTopPerformingTroops(pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroops(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("getTopPerformingTroopsByCouncil Tests")
    class GetTopPerformingTroopsByCouncilTests {

        @Test
        @DisplayName("Should return council troops ordered by total sales")
        void getTopPerformingTroopsByCouncil_OrderedBySales() {
            // Arrange
            Troop topTroop = createTroopWithStats(2L, "456", testCouncilId, 20, 25, new BigDecimal("10000"), 500);
            savedTroop.setTotalSales(new BigDecimal("5000"));

            Page<Troop> troopPage = new PageImpl<>(List.of(topTroop, savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findTopPerformingTroopsByCouncil(testCouncilId, pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroopsByCouncil(testCouncilId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent().get(0).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("10000"));
            assertThat(result.getContent().get(1).getTotalSales())
                    .isEqualByComparingTo(new BigDecimal("5000"));

            verify(troopRepository).findTopPerformingTroopsByCouncil(testCouncilId, pageable);
        }

        @Test
        @DisplayName("Should return empty when council has no troops")
        void getTopPerformingTroopsByCouncil_Empty() {
            // Arrange
            Page<Troop> emptyPage = new PageImpl<>(Collections.emptyList());
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findTopPerformingTroopsByCouncil(999L, pageable)).thenReturn(emptyPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroopsByCouncil(999L, pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should only return troops from specified council")
        void getTopPerformingTroopsByCouncil_FiltersByCouncil() {
            // Arrange
            Page<Troop> troopPage = new PageImpl<>(List.of(savedTroop));
            Pageable pageable = PageRequest.of(0, 10);

            when(troopRepository.findTopPerformingTroopsByCouncil(testCouncilId, pageable)).thenReturn(troopPage);

            // Act
            Page<TroopResponse> result = troopService.getTopPerformingTroopsByCouncil(testCouncilId, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCouncilId()).isEqualTo(testCouncilId);
        }
    }

    @Nested
    @DisplayName("updateTroopStats Tests")
    class UpdateTroopStatsTests {

        @Test
        @DisplayName("Should update all statistics correctly")
        void updateTroopStats_Success() {
            // Arrange
            ArgumentCaptor<Troop> troopCaptor = ArgumentCaptor.forClass(Troop.class);
            Page<Scout> scoutPage = new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 15);

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(10L);
            when(scoutRepository.findByTroopId(eq(1L), any(Pageable.class))).thenReturn(scoutPage);
            when(scoutRepository.sumSalesByTroop(1L)).thenReturn(new BigDecimal("2500.00"));
            when(scoutRepository.sumCardsSoldByTroop(1L)).thenReturn(125);
            when(troopRepository.save(troopCaptor.capture())).thenReturn(savedTroop);

            // Act
            troopService.updateTroopStats(1L);

            // Assert
            Troop captured = troopCaptor.getValue();
            assertThat(captured.getActiveScouts()).isEqualTo(10);
            assertThat(captured.getTotalScouts()).isEqualTo(15);
            assertThat(captured.getTotalSales()).isEqualByComparingTo(new BigDecimal("2500.00"));
            assertThat(captured.getCardsSold()).isEqualTo(125);

            verify(troopRepository).save(any(Troop.class));
        }

        @Test
        @DisplayName("Should throw exception when troop not found")
        void updateTroopStats_NotFound() {
            // Arrange
            when(troopRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.updateTroopStats(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");

            verify(troopRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should handle null sales and set to zero")
        void updateTroopStats_NullSales() {
            // Arrange
            ArgumentCaptor<Troop> troopCaptor = ArgumentCaptor.forClass(Troop.class);
            Page<Scout> scoutPage = new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 5);

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(5L);
            when(scoutRepository.findByTroopId(eq(1L), any(Pageable.class))).thenReturn(scoutPage);
            when(scoutRepository.sumSalesByTroop(1L)).thenReturn(null);
            when(scoutRepository.sumCardsSoldByTroop(1L)).thenReturn(null);
            when(troopRepository.save(troopCaptor.capture())).thenReturn(savedTroop);

            // Act
            troopService.updateTroopStats(1L);

            // Assert
            Troop captured = troopCaptor.getValue();
            assertThat(captured.getTotalSales()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(captured.getCardsSold()).isZero();
        }

        @Test
        @DisplayName("Should handle zero active scouts")
        void updateTroopStats_ZeroActiveScouts() {
            // Arrange
            ArgumentCaptor<Troop> troopCaptor = ArgumentCaptor.forClass(Troop.class);
            Page<Scout> scoutPage = new PageImpl<>(Collections.emptyList(), Pageable.unpaged(), 0);

            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(0L);
            when(scoutRepository.findByTroopId(eq(1L), any(Pageable.class))).thenReturn(scoutPage);
            when(scoutRepository.sumSalesByTroop(1L)).thenReturn(BigDecimal.ZERO);
            when(scoutRepository.sumCardsSoldByTroop(1L)).thenReturn(0);
            when(troopRepository.save(troopCaptor.capture())).thenReturn(savedTroop);

            // Act
            troopService.updateTroopStats(1L);

            // Assert
            Troop captured = troopCaptor.getValue();
            assertThat(captured.getActiveScouts()).isZero();
            assertThat(captured.getTotalScouts()).isZero();
        }
    }

    @Nested
    @DisplayName("updateTroopStatus Tests")
    class UpdateTroopStatusTests {

        @Test
        @DisplayName("Should update status to INACTIVE")
        void updateTroopStatus_ToInactive() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            troopService.updateTroopStatus(1L, "INACTIVE");

            // Assert
            verify(troopRepository).save(argThat(troop ->
                    troop.getStatus() == TroopStatus.INACTIVE));
        }

        @Test
        @DisplayName("Should update status to SUSPENDED")
        void updateTroopStatus_ToSuspended() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            troopService.updateTroopStatus(1L, "SUSPENDED");

            // Assert
            verify(troopRepository).save(argThat(troop ->
                    troop.getStatus() == TroopStatus.SUSPENDED));
        }

        @Test
        @DisplayName("Should update status to ARCHIVED")
        void updateTroopStatus_ToArchived() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            troopService.updateTroopStatus(1L, "ARCHIVED");

            // Assert
            verify(troopRepository).save(argThat(troop ->
                    troop.getStatus() == TroopStatus.ARCHIVED));
        }

        @Test
        @DisplayName("Should reactivate troop from inactive status")
        void updateTroopStatus_Reactivate() {
            // Arrange
            savedTroop.setStatus(TroopStatus.INACTIVE);
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(troopRepository.save(any(Troop.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            troopService.updateTroopStatus(1L, "ACTIVE");

            // Assert
            verify(troopRepository).save(argThat(troop ->
                    troop.getStatus() == TroopStatus.ACTIVE));
        }

        @Test
        @DisplayName("Should throw exception when troop not found")
        void updateTroopStatus_NotFound() {
            // Arrange
            when(troopRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.updateTroopStatus(999L, "INACTIVE"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");

            verify(troopRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception for invalid status")
        void updateTroopStatus_InvalidStatus() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));

            // Act & Assert
            assertThatThrownBy(() -> troopService.updateTroopStatus(1L, "INVALID_STATUS"))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(troopRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteTroop Tests")
    class DeleteTroopTests {

        @Test
        @DisplayName("Should delete troop successfully when no active scouts")
        void deleteTroop_Success() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(0L);
            doNothing().when(troopRepository).delete(savedTroop);

            // Act
            troopService.deleteTroop(1L);

            // Assert
            verify(troopRepository).delete(savedTroop);
        }

        @Test
        @DisplayName("Should throw exception when troop has active scouts")
        void deleteTroop_WithActiveScouts() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(5L);

            // Act & Assert
            assertThatThrownBy(() -> troopService.deleteTroop(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Cannot delete troop with active scouts");

            verify(troopRepository, never()).delete(any(Troop.class));
        }

        @Test
        @DisplayName("Should throw exception when troop not found")
        void deleteTroop_NotFound() {
            // Arrange
            when(troopRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> troopService.deleteTroop(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Troop not found");

            verify(troopRepository, never()).delete(any(Troop.class));
        }

        @Test
        @DisplayName("Should allow deletion when only inactive scouts exist")
        void deleteTroop_WithInactiveScouts() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(0L);
            doNothing().when(troopRepository).delete(savedTroop);

            // Act
            troopService.deleteTroop(1L);

            // Assert
            verify(scoutRepository).countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE);
            verify(troopRepository).delete(savedTroop);
        }

        @Test
        @DisplayName("Should check active scouts count before deletion")
        void deleteTroop_ChecksActiveScoutsFirst() {
            // Arrange
            when(troopRepository.findById(1L)).thenReturn(Optional.of(savedTroop));
            when(scoutRepository.countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE)).thenReturn(1L);

            // Act & Assert
            assertThatThrownBy(() -> troopService.deleteTroop(1L))
                    .isInstanceOf(IllegalStateException.class);

            // Verify the order of operations
            verify(troopRepository).findById(1L);
            verify(scoutRepository).countByTroopIdAndStatus(1L, Scout.ScoutStatus.ACTIVE);
            verify(troopRepository, never()).delete(any());
        }
    }
}

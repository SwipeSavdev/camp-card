package com.bsa.campcard.service;

import com.bsa.campcard.dto.CouncilRequest;
import com.bsa.campcard.dto.CouncilResponse;
import com.bsa.campcard.dto.CouncilStatsResponse;
import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Council.CouncilStatus;
import com.bsa.campcard.repository.CouncilRepository;
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
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CouncilService Tests")
class CouncilServiceTest {

    @Mock
    private CouncilRepository councilRepository;

    @Mock
    private TroopRepository troopRepository;

    @InjectMocks
    private CouncilService councilService;

    private CouncilRequest validCouncilRequest;
    private Council savedCouncil;
    private UUID testUuid;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();

        // Create council request using setters (DTOs use @Data)
        validCouncilRequest = new CouncilRequest();
        validCouncilRequest.setCouncilNumber("123");
        validCouncilRequest.setName("Test Council");
        validCouncilRequest.setShortName("TC");
        validCouncilRequest.setRegion("WESTERN");
        validCouncilRequest.setStreetAddress("123 Scout Way");
        validCouncilRequest.setCity("Denver");
        validCouncilRequest.setState("CO");
        validCouncilRequest.setZipCode("80202");
        validCouncilRequest.setPhone("303-555-1234");
        validCouncilRequest.setEmail("contact@testcouncil.org");
        validCouncilRequest.setWebsiteUrl("https://testcouncil.org");
        validCouncilRequest.setLogoUrl("https://testcouncil.org/logo.png");
        validCouncilRequest.setScoutExecutiveName("John Executive");
        validCouncilRequest.setScoutExecutiveEmail("john@testcouncil.org");
        validCouncilRequest.setCampCardCoordinatorName("Jane Coordinator");
        validCouncilRequest.setCampCardCoordinatorEmail("jane@testcouncil.org");
        validCouncilRequest.setCampCardCoordinatorPhone("303-555-5678");
        validCouncilRequest.setCampaignStartDate(LocalDate.now());
        validCouncilRequest.setCampaignEndDate(LocalDate.now().plusMonths(3));
        validCouncilRequest.setGoalAmount(new BigDecimal("50000.00"));
        validCouncilRequest.setStatus("ACTIVE");
        validCouncilRequest.setSubscriptionTier("PREMIUM");

        // Create council entity using builder (Entity has @Builder)
        savedCouncil = Council.builder()
                .id(1L)
                .uuid(testUuid)
                .councilNumber("123")
                .name("Test Council")
                .shortName("TC")
                .region("WESTERN")
                .streetAddress("123 Scout Way")
                .city("Denver")
                .state("CO")
                .zipCode("80202")
                .phone("303-555-1234")
                .email("contact@testcouncil.org")
                .websiteUrl("https://testcouncil.org")
                .logoUrl("https://testcouncil.org/logo.png")
                .scoutExecutiveName("John Executive")
                .scoutExecutiveEmail("john@testcouncil.org")
                .campCardCoordinatorName("Jane Coordinator")
                .campCardCoordinatorEmail("jane@testcouncil.org")
                .campCardCoordinatorPhone("303-555-5678")
                .totalTroops(10)
                .totalScouts(150)
                .totalSales(new BigDecimal("25000.00"))
                .cardsSold(500)
                .campaignStartDate(LocalDate.now())
                .campaignEndDate(LocalDate.now().plusMonths(3))
                .goalAmount(new BigDecimal("50000.00"))
                .status(CouncilStatus.ACTIVE)
                .subscriptionTier("PREMIUM")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("createCouncil Tests")
    class CreateCouncilTests {

        @Test
        @DisplayName("Should create council successfully with all fields")
        void createCouncil_Success() {
            // Arrange
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.empty());
            when(councilRepository.save(any(Council.class))).thenReturn(savedCouncil);

            // Act
            CouncilResponse response = councilService.createCouncil(validCouncilRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Test Council");
            assertThat(response.getCouncilNumber()).isEqualTo("123");
            assertThat(response.getRegion()).isEqualTo("WESTERN");
            assertThat(response.getStatus()).isEqualTo("ACTIVE");

            verify(councilRepository).findByCouncilNumber("123");
            verify(councilRepository).save(any(Council.class));
        }

        @Test
        @DisplayName("Should throw exception when council number already exists")
        void createCouncil_DuplicateCouncilNumber() {
            // Arrange
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.of(savedCouncil));

            // Act & Assert
            assertThatThrownBy(() -> councilService.createCouncil(validCouncilRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council number already exists: 123");

            verify(councilRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set default status as ACTIVE when status is null")
        void createCouncil_DefaultStatus() {
            // Arrange
            validCouncilRequest.setStatus(null);
            ArgumentCaptor<Council> councilCaptor = ArgumentCaptor.forClass(Council.class);
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.empty());
            when(councilRepository.save(councilCaptor.capture())).thenReturn(savedCouncil);

            // Act
            councilService.createCouncil(validCouncilRequest);

            // Assert
            Council captured = councilCaptor.getValue();
            assertThat(captured.getStatus()).isEqualTo(CouncilStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should set default subscription tier as BASIC when tier is null")
        void createCouncil_DefaultSubscriptionTier() {
            // Arrange
            validCouncilRequest.setSubscriptionTier(null);
            ArgumentCaptor<Council> councilCaptor = ArgumentCaptor.forClass(Council.class);
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.empty());
            when(councilRepository.save(councilCaptor.capture())).thenReturn(savedCouncil);

            // Act
            councilService.createCouncil(validCouncilRequest);

            // Assert
            Council captured = councilCaptor.getValue();
            assertThat(captured.getSubscriptionTier()).isEqualTo("BASIC");
        }

        @Test
        @DisplayName("Should correctly map all request fields to entity")
        void createCouncil_AllFieldsMapped() {
            // Arrange
            ArgumentCaptor<Council> councilCaptor = ArgumentCaptor.forClass(Council.class);
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.empty());
            when(councilRepository.save(councilCaptor.capture())).thenReturn(savedCouncil);

            // Act
            councilService.createCouncil(validCouncilRequest);

            // Assert
            Council captured = councilCaptor.getValue();
            assertThat(captured.getCouncilNumber()).isEqualTo("123");
            assertThat(captured.getName()).isEqualTo("Test Council");
            assertThat(captured.getShortName()).isEqualTo("TC");
            assertThat(captured.getRegion()).isEqualTo("WESTERN");
            assertThat(captured.getCity()).isEqualTo("Denver");
            assertThat(captured.getState()).isEqualTo("CO");
            assertThat(captured.getScoutExecutiveName()).isEqualTo("John Executive");
            assertThat(captured.getCampCardCoordinatorName()).isEqualTo("Jane Coordinator");
            assertThat(captured.getGoalAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        }
    }

    @Nested
    @DisplayName("updateCouncil Tests")
    class UpdateCouncilTests {

        @Test
        @DisplayName("Should update council successfully")
        void updateCouncil_Success() {
            // Arrange
            CouncilRequest updateRequest = new CouncilRequest();
            updateRequest.setName("Updated Council Name");
            updateRequest.setRegion("CENTRAL");

            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateCouncil(1L, updateRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Updated Council Name");
            assertThat(response.getRegion()).isEqualTo("CENTRAL");
            verify(councilRepository).save(any(Council.class));
        }

        @Test
        @DisplayName("Should throw exception when council not found")
        void updateCouncil_NotFound() {
            // Arrange
            when(councilRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.updateCouncil(999L, validCouncilRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");
        }

        @Test
        @DisplayName("Should throw exception when changing to existing council number")
        void updateCouncil_DuplicateCouncilNumber() {
            // Arrange
            CouncilRequest updateRequest = new CouncilRequest();
            updateRequest.setCouncilNumber("456");

            Council anotherCouncil = Council.builder()
                    .id(2L)
                    .councilNumber("456")
                    .build();

            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.findByCouncilNumber("456")).thenReturn(Optional.of(anotherCouncil));

            // Act & Assert
            assertThatThrownBy(() -> councilService.updateCouncil(1L, updateRequest))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council number already exists: 456");
        }

        @Test
        @DisplayName("Should allow updating to same council number")
        void updateCouncil_SameCouncilNumber() {
            // Arrange
            CouncilRequest updateRequest = new CouncilRequest();
            updateRequest.setCouncilNumber("123");
            updateRequest.setName("Updated Name");

            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateCouncil(1L, updateRequest);

            // Assert
            assertThat(response).isNotNull();
            verify(councilRepository, never()).findByCouncilNumber(anyString());
        }

        @Test
        @DisplayName("Should only update non-null fields")
        void updateCouncil_PartialUpdate() {
            // Arrange
            CouncilRequest updateRequest = new CouncilRequest();
            updateRequest.setName("Updated Name");
            // All other fields are null

            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateCouncil(1L, updateRequest);

            // Assert
            assertThat(response.getName()).isEqualTo("Updated Name");
            assertThat(response.getRegion()).isEqualTo("WESTERN"); // unchanged
            assertThat(response.getCity()).isEqualTo("Denver"); // unchanged
        }
    }

    @Nested
    @DisplayName("getCouncil Tests")
    class GetCouncilTests {

        @Test
        @DisplayName("Should return council by ID when found")
        void getCouncil_Found() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));

            // Act
            CouncilResponse response = councilService.getCouncil(1L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getName()).isEqualTo("Test Council");
        }

        @Test
        @DisplayName("Should throw exception when council not found")
        void getCouncil_NotFound() {
            // Arrange
            when(councilRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.getCouncil(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");
        }
    }

    @Nested
    @DisplayName("getCouncilByUuid Tests")
    class GetCouncilByUuidTests {

        @Test
        @DisplayName("Should return council by UUID when found")
        void getCouncilByUuid_Found() {
            // Arrange
            when(councilRepository.findByUuid(testUuid)).thenReturn(Optional.of(savedCouncil));

            // Act
            CouncilResponse response = councilService.getCouncilByUuid(testUuid);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getUuid()).isEqualTo(testUuid);
            assertThat(response.getName()).isEqualTo("Test Council");
        }

        @Test
        @DisplayName("Should throw exception when council not found by UUID")
        void getCouncilByUuid_NotFound() {
            // Arrange
            UUID unknownUuid = UUID.randomUUID();
            when(councilRepository.findByUuid(unknownUuid)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.getCouncilByUuid(unknownUuid))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Council not found");
        }
    }

    @Nested
    @DisplayName("getCouncilByNumber Tests")
    class GetCouncilByNumberTests {

        @Test
        @DisplayName("Should return council by council number when found")
        void getCouncilByNumber_Found() {
            // Arrange
            when(councilRepository.findByCouncilNumber("123")).thenReturn(Optional.of(savedCouncil));

            // Act
            CouncilResponse response = councilService.getCouncilByNumber("123");

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getCouncilNumber()).isEqualTo("123");
            assertThat(response.getName()).isEqualTo("Test Council");
        }

        @Test
        @DisplayName("Should throw exception when council number not found")
        void getCouncilByNumber_NotFound() {
            // Arrange
            when(councilRepository.findByCouncilNumber("999")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.getCouncilByNumber("999"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");
        }
    }

    @Nested
    @DisplayName("getAllCouncils Tests")
    class GetAllCouncilsTests {

        @Test
        @DisplayName("Should return paginated councils")
        void getAllCouncils_Paginated() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.findAll(pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getAllCouncils(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Test Council");
            verify(councilRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return empty page when no councils exist")
        void getAllCouncils_Empty() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> emptyPage = new PageImpl<>(Collections.emptyList());
            when(councilRepository.findAll(pageable)).thenReturn(emptyPage);

            // Act
            Page<CouncilResponse> result = councilService.getAllCouncils(pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should handle multiple pages correctly")
        void getAllCouncils_MultiplePages() {
            // Arrange
            Council secondCouncil = Council.builder()
                    .id(2L)
                    .uuid(UUID.randomUUID())
                    .councilNumber("456")
                    .name("Second Council")
                    .region("CENTRAL")
                    .status(CouncilStatus.ACTIVE)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            Pageable pageable = PageRequest.of(0, 2);
            Page<Council> councilPage = new PageImpl<>(
                    List.of(savedCouncil, secondCouncil),
                    pageable,
                    5 // total elements
            );
            when(councilRepository.findAll(pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getAllCouncils(pageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(5);
            assertThat(result.getTotalPages()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("getCouncilsByStatus Tests")
    class GetCouncilsByStatusTests {

        @Test
        @DisplayName("Should return councils filtered by ACTIVE status")
        void getCouncilsByStatus_Active() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE, pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getCouncilsByStatus("ACTIVE", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("Should return councils filtered by INACTIVE status")
        void getCouncilsByStatus_Inactive() {
            // Arrange
            Council inactiveCouncil = Council.builder()
                    .id(2L)
                    .name("Inactive Council")
                    .councilNumber("789")
                    .region("CENTRAL")
                    .status(CouncilStatus.INACTIVE)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(inactiveCouncil));
            when(councilRepository.findByStatus(CouncilStatus.INACTIVE, pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getCouncilsByStatus("INACTIVE", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("INACTIVE");
        }

        @Test
        @DisplayName("Should handle case-insensitive status input")
        void getCouncilsByStatus_CaseInsensitive() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE, pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getCouncilsByStatus("active", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Should throw exception for invalid status")
        void getCouncilsByStatus_InvalidStatus() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);

            // Act & Assert
            assertThatThrownBy(() -> councilService.getCouncilsByStatus("INVALID", pageable))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("getCouncilsByRegion Tests")
    class GetCouncilsByRegionTests {

        @Test
        @DisplayName("Should return councils filtered by region")
        void getCouncilsByRegion_Found() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.findByRegion("WESTERN", pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.getCouncilsByRegion("WESTERN", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getRegion()).isEqualTo("WESTERN");
        }

        @Test
        @DisplayName("Should return empty page when no councils in region")
        void getCouncilsByRegion_Empty() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> emptyPage = new PageImpl<>(Collections.emptyList());
            when(councilRepository.findByRegion("NORTHEAST", pageable)).thenReturn(emptyPage);

            // Act
            Page<CouncilResponse> result = councilService.getCouncilsByRegion("NORTHEAST", pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("searchCouncils Tests")
    class SearchCouncilsTests {

        @Test
        @DisplayName("Should find councils by name")
        void searchCouncils_ByName() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.searchCouncils("Test", pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.searchCouncils("Test", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).contains("Test");
        }

        @Test
        @DisplayName("Should find councils by council number")
        void searchCouncils_ByCouncilNumber() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> councilPage = new PageImpl<>(List.of(savedCouncil));
            when(councilRepository.searchCouncils("123", pageable)).thenReturn(councilPage);

            // Act
            Page<CouncilResponse> result = councilService.searchCouncils("123", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty page when no matches found")
        void searchCouncils_NoMatches() {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<Council> emptyPage = new PageImpl<>(Collections.emptyList());
            when(councilRepository.searchCouncils("nonexistent", pageable)).thenReturn(emptyPage);

            // Act
            Page<CouncilResponse> result = councilService.searchCouncils("nonexistent", pageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteCouncil Tests")
    class DeleteCouncilTests {

        @Test
        @DisplayName("Should delete council successfully when no troops exist")
        void deleteCouncil_Success() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(0L);

            // Act
            councilService.deleteCouncil(1L);

            // Assert
            verify(councilRepository).delete(savedCouncil);
        }

        @Test
        @DisplayName("Should throw exception when council not found")
        void deleteCouncil_NotFound() {
            // Arrange
            when(councilRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.deleteCouncil(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");

            verify(councilRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should throw exception when council has troops")
        void deleteCouncil_WithTroops() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(5L);

            // Act & Assert
            assertThatThrownBy(() -> councilService.deleteCouncil(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Cannot delete council with 5 troops. Remove troops first.");

            verify(councilRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should check troop count before deletion")
        void deleteCouncil_ChecksTroopCount() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(0L);

            // Act
            councilService.deleteCouncil(1L);

            // Assert
            verify(troopRepository).countByCouncilId(1L);
        }
    }

    @Nested
    @DisplayName("updateStatus Tests")
    class UpdateStatusTests {

        @Test
        @DisplayName("Should update council status to INACTIVE")
        void updateStatus_ToInactive() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateStatus(1L, "INACTIVE");

            // Assert
            assertThat(response.getStatus()).isEqualTo("INACTIVE");
        }

        @Test
        @DisplayName("Should update council status to SUSPENDED")
        void updateStatus_ToSuspended() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateStatus(1L, "SUSPENDED");

            // Assert
            assertThat(response.getStatus()).isEqualTo("SUSPENDED");
        }

        @Test
        @DisplayName("Should update council status to TRIAL")
        void updateStatus_ToTrial() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateStatus(1L, "TRIAL");

            // Assert
            assertThat(response.getStatus()).isEqualTo("TRIAL");
        }

        @Test
        @DisplayName("Should handle case-insensitive status input")
        void updateStatus_CaseInsensitive() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateStatus(1L, "inactive");

            // Assert
            assertThat(response.getStatus()).isEqualTo("INACTIVE");
        }

        @Test
        @DisplayName("Should throw exception when council not found")
        void updateStatus_NotFound() {
            // Arrange
            when(councilRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.updateStatus(999L, "ACTIVE"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");
        }

        @Test
        @DisplayName("Should throw exception for invalid status")
        void updateStatus_InvalidStatus() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));

            // Act & Assert
            assertThatThrownBy(() -> councilService.updateStatus(1L, "INVALID"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("getStats Tests")
    class GetStatsTests {

        @Test
        @DisplayName("Should return council statistics")
        void getStats_Success() {
            // Arrange
            when(councilRepository.count()).thenReturn(10L);
            when(councilRepository.countByStatus(CouncilStatus.ACTIVE)).thenReturn(7L);
            when(councilRepository.countByStatus(CouncilStatus.INACTIVE)).thenReturn(2L);
            when(councilRepository.countByStatus(CouncilStatus.TRIAL)).thenReturn(1L);
            when(councilRepository.getTotalActiveScouts()).thenReturn(500L);
            when(councilRepository.getTotalActiveSales()).thenReturn(new BigDecimal("100000.00"));

            List<Object[]> regionCounts = List.of(
                    new Object[]{"WESTERN", 3L},
                    new Object[]{"CENTRAL", 4L},
                    new Object[]{"NORTHEAST", 3L}
            );
            when(councilRepository.countByRegionGrouped()).thenReturn(regionCounts);
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE)).thenReturn(List.of(savedCouncil));

            // Act
            CouncilStatsResponse stats = councilService.getStats();

            // Assert
            assertThat(stats.getTotalCouncils()).isEqualTo(10L);
            assertThat(stats.getActiveCouncils()).isEqualTo(7L);
            assertThat(stats.getInactiveCouncils()).isEqualTo(2L);
            assertThat(stats.getTrialCouncils()).isEqualTo(1L);
            assertThat(stats.getTotalScouts()).isEqualTo(500L);
            assertThat(stats.getTotalSales()).isEqualByComparingTo(new BigDecimal("100000.00"));
            assertThat(stats.getCouncilsByRegion()).containsEntry("WESTERN", 3L);
        }

        @Test
        @DisplayName("Should handle null values from repository")
        void getStats_NullValues() {
            // Arrange
            when(councilRepository.count()).thenReturn(0L);
            when(councilRepository.countByStatus(any())).thenReturn(0L);
            when(councilRepository.getTotalActiveScouts()).thenReturn(null);
            when(councilRepository.getTotalActiveSales()).thenReturn(null);
            when(councilRepository.countByRegionGrouped()).thenReturn(Collections.emptyList());
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE)).thenReturn(Collections.emptyList());

            // Act
            CouncilStatsResponse stats = councilService.getStats();

            // Assert
            assertThat(stats.getTotalScouts()).isZero();
            assertThat(stats.getTotalSales()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should calculate active campaigns correctly")
        void getStats_ActiveCampaigns() {
            // Arrange
            Council councilWithActiveCampaign = Council.builder()
                    .id(1L)
                    .name("Active Campaign Council")
                    .status(CouncilStatus.ACTIVE)
                    .campaignStartDate(LocalDate.now().minusDays(10))
                    .campaignEndDate(LocalDate.now().plusDays(30))
                    .goalAmount(new BigDecimal("10000.00"))
                    .totalTroops(5)
                    .cardsSold(100)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            Council councilWithPastCampaign = Council.builder()
                    .id(2L)
                    .name("Past Campaign Council")
                    .status(CouncilStatus.ACTIVE)
                    .campaignStartDate(LocalDate.now().minusMonths(6))
                    .campaignEndDate(LocalDate.now().minusMonths(3))
                    .goalAmount(new BigDecimal("5000.00"))
                    .totalTroops(3)
                    .cardsSold(50)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            when(councilRepository.count()).thenReturn(2L);
            when(councilRepository.countByStatus(any())).thenReturn(2L);
            when(councilRepository.getTotalActiveScouts()).thenReturn(100L);
            when(councilRepository.getTotalActiveSales()).thenReturn(BigDecimal.ZERO);
            when(councilRepository.countByRegionGrouped()).thenReturn(Collections.emptyList());
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE))
                    .thenReturn(List.of(councilWithActiveCampaign, councilWithPastCampaign));

            // Act
            CouncilStatsResponse stats = councilService.getStats();

            // Assert
            assertThat(stats.getActiveCampaigns()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should calculate overall progress correctly")
        void getStats_OverallProgress() {
            // Arrange
            Council councilWithProgress = Council.builder()
                    .id(1L)
                    .name("Council")
                    .status(CouncilStatus.ACTIVE)
                    .goalAmount(new BigDecimal("100000.00"))
                    .totalSales(BigDecimal.ZERO)
                    .totalTroops(0)
                    .cardsSold(0)
                    .build();

            when(councilRepository.count()).thenReturn(1L);
            when(councilRepository.countByStatus(any())).thenReturn(1L);
            when(councilRepository.getTotalActiveScouts()).thenReturn(100L);
            when(councilRepository.getTotalActiveSales()).thenReturn(new BigDecimal("50000.00"));
            when(councilRepository.countByRegionGrouped()).thenReturn(Collections.emptyList());
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE)).thenReturn(List.of(councilWithProgress));

            // Act
            CouncilStatsResponse stats = councilService.getStats();

            // Assert
            assertThat(stats.getOverallProgress()).isEqualTo(50.0);
        }

        @Test
        @DisplayName("Should aggregate troops and cards sold correctly")
        void getStats_AggregatesCounts() {
            // Arrange
            Council council1 = Council.builder()
                    .id(1L)
                    .status(CouncilStatus.ACTIVE)
                    .totalTroops(10)
                    .cardsSold(100)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            Council council2 = Council.builder()
                    .id(2L)
                    .status(CouncilStatus.ACTIVE)
                    .totalTroops(15)
                    .cardsSold(150)
                    .totalSales(BigDecimal.ZERO)
                    .build();

            when(councilRepository.count()).thenReturn(2L);
            when(councilRepository.countByStatus(any())).thenReturn(2L);
            when(councilRepository.getTotalActiveScouts()).thenReturn(0L);
            when(councilRepository.getTotalActiveSales()).thenReturn(BigDecimal.ZERO);
            when(councilRepository.countByRegionGrouped()).thenReturn(Collections.emptyList());
            when(councilRepository.findByStatus(CouncilStatus.ACTIVE)).thenReturn(List.of(council1, council2));

            // Act
            CouncilStatsResponse stats = councilService.getStats();

            // Assert
            assertThat(stats.getTotalTroops()).isEqualTo(25L);
            assertThat(stats.getTotalCardsSold()).isEqualTo(250L);
        }
    }

    @Nested
    @DisplayName("updateCouncilStats Tests")
    class UpdateCouncilStatsTests {

        @Test
        @DisplayName("Should update council stats from troop data")
        void updateCouncilStats_Success() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(20L);
            when(troopRepository.sumSalesByCouncil(1L)).thenReturn(new BigDecimal("75000.00"));
            when(troopRepository.sumCardsSoldByCouncil(1L)).thenReturn(1500);
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateCouncilStats(1L);

            // Assert
            assertThat(response.getTotalTroops()).isEqualTo(20);
            assertThat(response.getTotalSales()).isEqualByComparingTo(new BigDecimal("75000.00"));
            assertThat(response.getCardsSold()).isEqualTo(1500);
        }

        @Test
        @DisplayName("Should throw exception when council not found")
        void updateCouncilStats_NotFound() {
            // Arrange
            when(councilRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> councilService.updateCouncilStats(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Council not found: 999");
        }

        @Test
        @DisplayName("Should handle null values from troop repository")
        void updateCouncilStats_NullValues() {
            // Arrange
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(null);
            when(troopRepository.sumSalesByCouncil(1L)).thenReturn(null);
            when(troopRepository.sumCardsSoldByCouncil(1L)).thenReturn(null);
            when(councilRepository.save(any(Council.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            CouncilResponse response = councilService.updateCouncilStats(1L);

            // Assert
            assertThat(response.getTotalTroops()).isZero();
            assertThat(response.getTotalSales()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.getCardsSold()).isZero();
        }

        @Test
        @DisplayName("Should save updated council with new stats")
        void updateCouncilStats_SavesCouncil() {
            // Arrange
            ArgumentCaptor<Council> councilCaptor = ArgumentCaptor.forClass(Council.class);
            when(councilRepository.findById(1L)).thenReturn(Optional.of(savedCouncil));
            when(troopRepository.countByCouncilId(1L)).thenReturn(30L);
            when(troopRepository.sumSalesByCouncil(1L)).thenReturn(new BigDecimal("90000.00"));
            when(troopRepository.sumCardsSoldByCouncil(1L)).thenReturn(2000);
            when(councilRepository.save(councilCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            councilService.updateCouncilStats(1L);

            // Assert
            Council captured = councilCaptor.getValue();
            assertThat(captured.getTotalTroops()).isEqualTo(30);
            assertThat(captured.getTotalSales()).isEqualByComparingTo(new BigDecimal("90000.00"));
            assertThat(captured.getCardsSold()).isEqualTo(2000);
            verify(councilRepository).save(any(Council.class));
        }
    }
}

package com.bsa.campcard.service;

import com.bsa.campcard.dto.merchant.*;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.Merchant.MerchantStatus;
import com.bsa.campcard.entity.MerchantLocation;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.MerchantLocationRepository;
import com.bsa.campcard.repository.MerchantRepository;
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
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MerchantService Tests")
class MerchantServiceTest {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private MerchantLocationRepository locationRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private MerchantService merchantService;

    private CreateMerchantRequest validMerchantRequest;
    private Merchant savedMerchant;
    private MerchantLocation savedLocation;
    private UUID testUuid;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();

        // Create merchant request using setters (DTOs use @Data, not @Builder)
        validMerchantRequest = new CreateMerchantRequest();
        validMerchantRequest.setBusinessName("Test Restaurant");
        validMerchantRequest.setDbaName("Test DBA");
        validMerchantRequest.setDescription("A great test restaurant");
        validMerchantRequest.setCategory("RESTAURANT");
        validMerchantRequest.setTaxId("12-3456789");
        validMerchantRequest.setContactName("John Doe");
        validMerchantRequest.setContactEmail("john@testrestaurant.com");
        validMerchantRequest.setContactPhone("555-123-4567");
        validMerchantRequest.setWebsiteUrl("https://testrestaurant.com");
        validMerchantRequest.setLogoUrl("https://testrestaurant.com/logo.png");
        validMerchantRequest.setBusinessHours("Mon-Fri 9-5");
        validMerchantRequest.setTermsAccepted(true);

        // Create merchant entity using builder (Entity has @Builder)
        savedMerchant = Merchant.builder()
                .id(1L)
                .uuid(testUuid)
                .councilId(100L)
                .businessName("Test Restaurant")
                .dbaName("Test DBA")
                .description("A great test restaurant")
                .category("RESTAURANT")
                .taxId("12-3456789")
                .contactName("John Doe")
                .contactEmail("john@testrestaurant.com")
                .contactPhone("555-123-4567")
                .websiteUrl("https://testrestaurant.com")
                .logoUrl("https://testrestaurant.com/logo.png")
                .businessHours("Mon-Fri 9-5")
                .status(MerchantStatus.PENDING)
                .termsAccepted(true)
                .termsAcceptedAt(LocalDateTime.now())
                .totalOffers(0)
                .activeOffers(0)
                .totalRedemptions(0)
                .build();

        savedLocation = MerchantLocation.builder()
                .id(1L)
                .uuid(UUID.randomUUID())
                .merchantId(1L)
                .locationName("Main Store")
                .streetAddress("123 Main St")
                .city("Test City")
                .state("TX")
                .zipCode("12345")
                .country("USA")
                .latitude(BigDecimal.valueOf(32.7767))
                .longitude(BigDecimal.valueOf(-96.7970))
                .phone("555-987-6543")
                .hours("9-5")
                .primaryLocation(true)
                .active(true)
                .build();
    }

    // Helper method to create ApproveMerchantRequest
    private ApproveMerchantRequest createApproveRequest(String action, String rejectionReason) {
        ApproveMerchantRequest request = new ApproveMerchantRequest();
        request.setAction(action);
        request.setRejectionReason(rejectionReason);
        return request;
    }

    // Helper method to create CreateLocationRequest
    private CreateLocationRequest createLocationRequest(String locationName, String streetAddress,
            String city, String state, String zipCode) {
        CreateLocationRequest request = new CreateLocationRequest();
        request.setLocationName(locationName);
        request.setStreetAddress(streetAddress);
        request.setCity(city);
        request.setState(state);
        request.setZipCode(zipCode);
        request.setCountry("USA");
        return request;
    }

    @Nested
    @DisplayName("createMerchant Tests")
    class CreateMerchantTests {

        @Test
        @DisplayName("Should create merchant successfully with all fields")
        void createMerchant_Success() {
            // Arrange
            when(merchantRepository.save(any(Merchant.class))).thenReturn(savedMerchant);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());
            doNothing().when(emailService).sendMerchantWelcomeEmail(anyString(), anyString(), anyString());

            // Act
            MerchantResponse response = merchantService.createMerchant(validMerchantRequest, 100L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBusinessName()).isEqualTo("Test Restaurant");
            assertThat(response.getStatus()).isEqualTo("PENDING");
            assertThat(response.getContactEmail()).isEqualTo("john@testrestaurant.com");

            verify(merchantRepository).save(any(Merchant.class));
            verify(emailService).sendMerchantWelcomeEmail(
                    eq("john@testrestaurant.com"),
                    eq("Test Restaurant"),
                    eq("John Doe")
            );
        }

        @Test
        @DisplayName("Should create merchant with primary location")
        void createMerchant_WithLocation() {
            // Arrange
            CreateLocationRequest locationRequest = createLocationRequest(
                    "Main Store", "123 Main St", "Test City", "TX", "12345");
            locationRequest.setPrimaryLocation(true);
            validMerchantRequest.setPrimaryLocation(locationRequest);

            when(merchantRepository.save(any(Merchant.class))).thenReturn(savedMerchant);
            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(locationRepository.save(any(MerchantLocation.class))).thenReturn(savedLocation);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(List.of(savedLocation));
            doNothing().when(emailService).sendMerchantWelcomeEmail(anyString(), anyString(), anyString());

            // Act
            MerchantResponse response = merchantService.createMerchant(validMerchantRequest, 100L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getLocations()).hasSize(1);
            assertThat(response.getLocations().get(0).getLocationName()).isEqualTo("Main Store");

            verify(locationRepository).save(any(MerchantLocation.class));
        }

        @Test
        @DisplayName("Should throw exception when terms not accepted")
        void createMerchant_TermsNotAccepted() {
            // Arrange
            validMerchantRequest.setTermsAccepted(false);

            // Act & Assert
            assertThatThrownBy(() -> merchantService.createMerchant(validMerchantRequest, 100L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Terms must be accepted");

            verify(merchantRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when terms is null")
        void createMerchant_TermsNull() {
            // Arrange
            validMerchantRequest.setTermsAccepted(null);

            // Act & Assert
            assertThatThrownBy(() -> merchantService.createMerchant(validMerchantRequest, 100L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Terms must be accepted");
        }

        @Test
        @DisplayName("Should set correct initial status as PENDING")
        void createMerchant_InitialStatusPending() {
            // Arrange
            ArgumentCaptor<Merchant> merchantCaptor = ArgumentCaptor.forClass(Merchant.class);
            when(merchantRepository.save(merchantCaptor.capture())).thenReturn(savedMerchant);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            merchantService.createMerchant(validMerchantRequest, 100L);

            // Assert
            Merchant captured = merchantCaptor.getValue();
            assertThat(captured.getStatus()).isEqualTo(MerchantStatus.PENDING);
            assertThat(captured.getTermsAccepted()).isTrue();
            assertThat(captured.getTermsAcceptedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("getMerchant Tests")
    class GetMerchantTests {

        @Test
        @DisplayName("Should return merchant by ID")
        void getMerchant_Found() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(1L))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.getMerchant(1L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getBusinessName()).isEqualTo("Test Restaurant");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when merchant not found")
        void getMerchant_NotFound() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.getMerchant(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Merchant not found");
        }

        @Test
        @DisplayName("Should include locations in merchant response")
        void getMerchant_WithLocations() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(1L))
                    .thenReturn(List.of(savedLocation));

            // Act
            MerchantResponse response = merchantService.getMerchant(1L);

            // Assert
            assertThat(response.getLocations()).hasSize(1);
            assertThat(response.getLocations().get(0).getCity()).isEqualTo("Test City");
        }
    }

    @Nested
    @DisplayName("getMerchants (Paginated) Tests")
    class GetMerchantsTests {

        @Test
        @DisplayName("Should return all merchants without filters")
        void getMerchants_NoFilters() {
            // Arrange
            Page<Merchant> merchantPage = new PageImpl<>(List.of(savedMerchant));
            Pageable pageable = PageRequest.of(0, 10);

            when(merchantRepository.findAll(pageable)).thenReturn(merchantPage);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            Page<MerchantResponse> result = merchantService.getMerchants(null, null, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(merchantRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should filter merchants by status")
        void getMerchants_FilterByStatus() {
            // Arrange
            Page<Merchant> merchantPage = new PageImpl<>(List.of(savedMerchant));
            Pageable pageable = PageRequest.of(0, 10);

            when(merchantRepository.findByStatusAndDeletedAtIsNull(MerchantStatus.PENDING, pageable))
                    .thenReturn(merchantPage);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            Page<MerchantResponse> result = merchantService.getMerchants(MerchantStatus.PENDING, null, pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(merchantRepository).findByStatusAndDeletedAtIsNull(MerchantStatus.PENDING, pageable);
        }

        @Test
        @DisplayName("Should search merchants by term")
        void getMerchants_SearchTerm() {
            // Arrange
            Page<Merchant> merchantPage = new PageImpl<>(List.of(savedMerchant));
            Pageable pageable = PageRequest.of(0, 10);

            when(merchantRepository.searchMerchants("Restaurant", pageable)).thenReturn(merchantPage);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            Page<MerchantResponse> result = merchantService.getMerchants(null, "Restaurant", pageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            verify(merchantRepository).searchMerchants("Restaurant", pageable);
        }

        @Test
        @DisplayName("Should prioritize search over status filter")
        void getMerchants_SearchOverStatus() {
            // Arrange
            Page<Merchant> merchantPage = new PageImpl<>(List.of(savedMerchant));
            Pageable pageable = PageRequest.of(0, 10);

            when(merchantRepository.searchMerchants("Test", pageable)).thenReturn(merchantPage);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            merchantService.getMerchants(MerchantStatus.APPROVED, "Test", pageable);

            // Assert
            verify(merchantRepository).searchMerchants("Test", pageable);
            verify(merchantRepository, never()).findByStatusAndDeletedAtIsNull(any(), any());
        }

        @Test
        @DisplayName("Should handle empty search term as no filter")
        void getMerchants_EmptySearchTerm() {
            // Arrange
            Page<Merchant> merchantPage = new PageImpl<>(List.of(savedMerchant));
            Pageable pageable = PageRequest.of(0, 10);

            when(merchantRepository.findAll(pageable)).thenReturn(merchantPage);
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            merchantService.getMerchants(null, "", pageable);

            // Assert
            verify(merchantRepository).findAll(pageable);
            verify(merchantRepository, never()).searchMerchants(any(), any());
        }
    }

    @Nested
    @DisplayName("getMerchantsByCategory Tests")
    class GetMerchantsByCategoryTests {

        @Test
        @DisplayName("Should return merchants in category")
        void getMerchantsByCategory_Found() {
            // Arrange
            when(merchantRepository.findByCategory("RESTAURANT")).thenReturn(List.of(savedMerchant));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            List<MerchantResponse> result = merchantService.getMerchantsByCategory("RESTAURANT");

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCategory()).isEqualTo("RESTAURANT");
        }

        @Test
        @DisplayName("Should return empty list for non-existent category")
        void getMerchantsByCategory_Empty() {
            // Arrange
            when(merchantRepository.findByCategory("NONEXISTENT")).thenReturn(Collections.emptyList());

            // Act
            List<MerchantResponse> result = merchantService.getMerchantsByCategory("NONEXISTENT");

            // Assert
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("approveMerchant Tests")
    class ApproveMerchantTests {

        private UUID adminUserId;

        @BeforeEach
        void setUp() {
            adminUserId = UUID.randomUUID();
        }

        @Test
        @DisplayName("Should approve pending merchant")
        void approveMerchant_Approve() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("APPROVE", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.approveMerchant(1L, request, adminUserId);

            // Assert
            assertThat(response.getStatus()).isEqualTo("APPROVED");
            verify(emailService).sendMerchantApprovalEmail(
                    eq("john@testrestaurant.com"),
                    eq("Test Restaurant"),
                    eq("John Doe")
            );
        }

        @Test
        @DisplayName("Should reject pending merchant with reason")
        void approveMerchant_Reject() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("REJECT", "Incomplete documentation");

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.approveMerchant(1L, request, adminUserId);

            // Assert
            assertThat(response.getStatus()).isEqualTo("REJECTED");
            verify(emailService).sendMerchantRejectionEmail(
                    eq("john@testrestaurant.com"),
                    eq("Test Restaurant"),
                    eq("John Doe"),
                    eq("Incomplete documentation")
            );
        }

        @Test
        @DisplayName("Should use default rejection reason when not provided")
        void approveMerchant_RejectDefaultReason() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("REJECT", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            merchantService.approveMerchant(1L, request, adminUserId);

            // Assert
            verify(emailService).sendMerchantRejectionEmail(
                    anyString(),
                    anyString(),
                    anyString(),
                    eq("Your application did not meet our requirements at this time.")
            );
        }

        @Test
        @DisplayName("Should throw exception for invalid action")
        void approveMerchant_InvalidAction() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("INVALID", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));

            // Act & Assert
            assertThatThrownBy(() -> merchantService.approveMerchant(1L, request, adminUserId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid action. Must be APPROVE or REJECT");
        }

        @Test
        @DisplayName("Should throw exception when merchant already processed")
        void approveMerchant_AlreadyProcessed() {
            // Arrange
            savedMerchant.setStatus(MerchantStatus.APPROVED);
            ApproveMerchantRequest request = createApproveRequest("APPROVE", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));

            // Act & Assert
            assertThatThrownBy(() -> merchantService.approveMerchant(1L, request, adminUserId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Merchant has already been processed");
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void approveMerchant_NotFound() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("APPROVE", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.approveMerchant(999L, request, adminUserId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should handle case-insensitive action")
        void approveMerchant_CaseInsensitive() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("approve", null);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.approveMerchant(1L, request, adminUserId);

            // Assert
            assertThat(response.getStatus()).isEqualTo("APPROVED");
        }

        @Test
        @DisplayName("Should set approved timestamp and admin ID on approval")
        void approveMerchant_SetsApprovalMetadata() {
            // Arrange
            ApproveMerchantRequest request = createApproveRequest("APPROVE", null);
            ArgumentCaptor<Merchant> captor = ArgumentCaptor.forClass(Merchant.class);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            merchantService.approveMerchant(1L, request, adminUserId);

            // Assert
            Merchant saved = captor.getValue();
            assertThat(saved.getApprovedAt()).isNotNull();
            assertThat(saved.getApprovedBy()).isEqualTo(adminUserId);
        }
    }

    @Nested
    @DisplayName("updateMerchant Tests")
    class UpdateMerchantTests {

        @Test
        @DisplayName("Should update merchant fields")
        void updateMerchant_Success() {
            // Arrange
            CreateMerchantRequest updateRequest = new CreateMerchantRequest();
            updateRequest.setBusinessName("Updated Restaurant");
            updateRequest.setDbaName("Updated DBA");
            updateRequest.setDescription("Updated description");
            updateRequest.setCategory("RETAIL");
            updateRequest.setContactName("Jane Doe");
            updateRequest.setContactEmail("jane@updated.com");
            updateRequest.setContactPhone("555-999-9999");
            updateRequest.setWebsiteUrl("https://updated.com");
            updateRequest.setLogoUrl("https://updated.com/logo.png");
            updateRequest.setBusinessHours("Mon-Sun 24h");

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.updateMerchant(1L, updateRequest);

            // Assert
            assertThat(response.getBusinessName()).isEqualTo("Updated Restaurant");
            assertThat(response.getCategory()).isEqualTo("RETAIL");
            assertThat(response.getContactEmail()).isEqualTo("jane@updated.com");
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void updateMerchant_NotFound() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.updateMerchant(999L, validMerchantRequest))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("updateMerchantStatus Tests")
    class UpdateMerchantStatusTests {

        @Test
        @DisplayName("Should suspend merchant")
        void updateMerchantStatus_Suspend() {
            // Arrange
            savedMerchant.setStatus(MerchantStatus.APPROVED);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.updateMerchantStatus(1L, MerchantStatus.SUSPENDED);

            // Assert
            assertThat(response.getStatus()).isEqualTo("SUSPENDED");
        }

        @Test
        @DisplayName("Should reactivate suspended merchant")
        void updateMerchantStatus_Reactivate() {
            // Arrange
            savedMerchant.setStatus(MerchantStatus.SUSPENDED);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenAnswer(inv -> inv.getArgument(0));
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(anyLong()))
                    .thenReturn(Collections.emptyList());

            // Act
            MerchantResponse response = merchantService.updateMerchantStatus(1L, MerchantStatus.APPROVED);

            // Assert
            assertThat(response.getStatus()).isEqualTo("APPROVED");
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void updateMerchantStatus_NotFound() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.updateMerchantStatus(999L, MerchantStatus.SUSPENDED))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteMerchant Tests")
    class DeleteMerchantTests {

        @Test
        @DisplayName("Should soft delete merchant")
        void deleteMerchant_Success() {
            // Arrange
            ArgumentCaptor<Merchant> captor = ArgumentCaptor.forClass(Merchant.class);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(merchantRepository.save(captor.capture())).thenReturn(savedMerchant);

            // Act
            merchantService.deleteMerchant(1L);

            // Assert
            Merchant deleted = captor.getValue();
            assertThat(deleted.getDeletedAt()).isNotNull();
            assertThat(deleted.getStatus()).isEqualTo(MerchantStatus.INACTIVE);
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void deleteMerchant_NotFound() {
            // Arrange
            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.deleteMerchant(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createLocation Tests")
    class CreateLocationTests {

        @Test
        @DisplayName("Should create location for merchant")
        void createLocation_Success() {
            // Arrange
            CreateLocationRequest request = createLocationRequest(
                    "Downtown Store", "456 Market St", "Dallas", "TX", "75201");
            request.setLatitude(BigDecimal.valueOf(32.7800));
            request.setLongitude(BigDecimal.valueOf(-96.8000));
            request.setPhone("555-111-2222");
            request.setHours("8-6");
            request.setPrimaryLocation(false);

            when(merchantRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(savedMerchant));
            when(locationRepository.save(any(MerchantLocation.class))).thenReturn(savedLocation);

            // Act
            MerchantLocationResponse response = merchantService.createLocation(1L, request);

            // Assert
            assertThat(response).isNotNull();
            verify(locationRepository).save(any(MerchantLocation.class));
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void createLocation_MerchantNotFound() {
            // Arrange
            CreateLocationRequest request = createLocationRequest(
                    "Test", "123 St", "City", "TX", "12345");
            when(merchantRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> merchantService.createLocation(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getMerchantLocations Tests")
    class GetMerchantLocationsTests {

        @Test
        @DisplayName("Should return merchant locations")
        void getMerchantLocations_Success() {
            // Arrange
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(1L))
                    .thenReturn(List.of(savedLocation));

            // Act
            List<MerchantLocationResponse> locations = merchantService.getMerchantLocations(1L);

            // Assert
            assertThat(locations).hasSize(1);
            assertThat(locations.get(0).getLocationName()).isEqualTo("Main Store");
        }

        @Test
        @DisplayName("Should return empty list when no locations")
        void getMerchantLocations_Empty() {
            // Arrange
            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(1L))
                    .thenReturn(Collections.emptyList());

            // Act
            List<MerchantLocationResponse> locations = merchantService.getMerchantLocations(1L);

            // Assert
            assertThat(locations).isEmpty();
        }

        @Test
        @DisplayName("Should return multiple locations for merchant")
        void getMerchantLocations_Multiple() {
            // Arrange
            MerchantLocation secondLocation = MerchantLocation.builder()
                    .id(2L)
                    .uuid(UUID.randomUUID())
                    .merchantId(1L)
                    .locationName("Second Store")
                    .streetAddress("456 Oak Ave")
                    .city("Other City")
                    .state("TX")
                    .zipCode("54321")
                    .country("USA")
                    .primaryLocation(false)
                    .active(true)
                    .build();

            when(locationRepository.findByMerchantIdAndDeletedAtIsNull(1L))
                    .thenReturn(List.of(savedLocation, secondLocation));

            // Act
            List<MerchantLocationResponse> locations = merchantService.getMerchantLocations(1L);

            // Assert
            assertThat(locations).hasSize(2);
        }
    }

    @Nested
    @DisplayName("findNearbyLocations Tests")
    class FindNearbyLocationsTests {

        @Test
        @DisplayName("Should find locations within radius")
        void findNearbyLocations_Found() {
            // Arrange
            BigDecimal lat = BigDecimal.valueOf(32.7767);
            BigDecimal lng = BigDecimal.valueOf(-96.7970);
            Double radiusKm = 10.0;

            when(locationRepository.findNearby(lat, lng, radiusKm))
                    .thenReturn(List.of(savedLocation));

            // Act
            List<MerchantLocationResponse> locations =
                    merchantService.findNearbyLocations(lat, lng, radiusKm);

            // Assert
            assertThat(locations).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty list when no locations nearby")
        void findNearbyLocations_Empty() {
            // Arrange
            BigDecimal lat = BigDecimal.valueOf(0.0);
            BigDecimal lng = BigDecimal.valueOf(0.0);
            Double radiusKm = 1.0;

            when(locationRepository.findNearby(lat, lng, radiusKm))
                    .thenReturn(Collections.emptyList());

            // Act
            List<MerchantLocationResponse> locations =
                    merchantService.findNearbyLocations(lat, lng, radiusKm);

            // Assert
            assertThat(locations).isEmpty();
        }
    }

    @Nested
    @DisplayName("getMerchantStats Tests")
    class GetMerchantStatsTests {

        @Test
        @DisplayName("Should return merchant statistics")
        void getMerchantStats_Success() {
            // Arrange
            when(merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.PENDING))
                    .thenReturn(5L);
            when(merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.APPROVED))
                    .thenReturn(20L);
            when(merchantRepository.countByStatusAndDeletedAtIsNull(MerchantStatus.REJECTED))
                    .thenReturn(3L);

            // Act
            MerchantService.MerchantStats stats = merchantService.getMerchantStats();

            // Assert
            assertThat(stats.getTotalPending()).isEqualTo(5L);
            assertThat(stats.getTotalApproved()).isEqualTo(20L);
            assertThat(stats.getTotalRejected()).isEqualTo(3L);
        }

        @Test
        @DisplayName("Should return zero counts when no merchants")
        void getMerchantStats_Empty() {
            // Arrange
            when(merchantRepository.countByStatusAndDeletedAtIsNull(any()))
                    .thenReturn(0L);

            // Act
            MerchantService.MerchantStats stats = merchantService.getMerchantStats();

            // Assert
            assertThat(stats.getTotalPending()).isZero();
            assertThat(stats.getTotalApproved()).isZero();
            assertThat(stats.getTotalRejected()).isZero();
        }
    }
}

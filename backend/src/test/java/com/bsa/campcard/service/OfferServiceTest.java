package com.bsa.campcard.service;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.entity.*;
import com.bsa.campcard.entity.Offer.DiscountType;
import com.bsa.campcard.entity.Offer.OfferStatus;
import com.bsa.campcard.entity.OfferRedemption.RedemptionStatus;
import com.bsa.campcard.repository.*;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OfferService Tests")
class OfferServiceTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferRedemptionRepository redemptionRepository;

    @Mock
    private MerchantRepository merchantRepository;

    @InjectMocks
    private OfferService offerService;

    private Merchant approvedMerchant;
    private Merchant pendingMerchant;
    private Offer validOffer;
    private CreateOfferRequest validCreateRequest;
    private RedeemOfferRequest validRedeemRequest;
    private UUID testUserId;
    private Pageable defaultPageable;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        defaultPageable = PageRequest.of(0, 10);

        // Create approved merchant using builder (Entity has @Builder)
        approvedMerchant = Merchant.builder()
                .id(1L)
                .uuid(UUID.randomUUID())
                .councilId(100L)
                .businessName("Test Restaurant")
                .contactEmail("test@restaurant.com")
                .contactName("John Doe")
                .status(Merchant.MerchantStatus.APPROVED)
                .logoUrl("https://example.com/logo.png")
                .totalOffers(0)
                .activeOffers(0)
                .totalRedemptions(0)
                .build();

        // Create pending merchant
        pendingMerchant = Merchant.builder()
                .id(2L)
                .uuid(UUID.randomUUID())
                .councilId(100L)
                .businessName("Pending Restaurant")
                .contactEmail("pending@restaurant.com")
                .contactName("Jane Doe")
                .status(Merchant.MerchantStatus.PENDING)
                .totalOffers(0)
                .activeOffers(0)
                .totalRedemptions(0)
                .build();

        // Create valid offer using setters (Entity uses @Data, not @Builder)
        validOffer = new Offer();
        validOffer.setId(1L);
        validOffer.setUuid(UUID.randomUUID());
        validOffer.setMerchantId(1L);
        validOffer.setTitle("10% Off All Items");
        validOffer.setDescription("Get 10% off your entire purchase");
        validOffer.setDiscountType(DiscountType.PERCENTAGE);
        validOffer.setDiscountValue(new BigDecimal("10"));
        validOffer.setMinPurchaseAmount(new BigDecimal("20"));
        validOffer.setMaxDiscountAmount(new BigDecimal("50"));
        validOffer.setCategory("RESTAURANT");
        validOffer.setTerms("Valid for dine-in only");
        validOffer.setImageUrl("https://example.com/offer.png");
        validOffer.setStatus(OfferStatus.ACTIVE);
        validOffer.setValidFrom(LocalDateTime.now().minusDays(1));
        validOffer.setValidUntil(LocalDateTime.now().plusDays(30));
        validOffer.setUsageLimit(100);
        validOffer.setUsageLimitPerUser(3);
        validOffer.setTotalRedemptions(0);
        validOffer.setFeatured(false);
        validOffer.setScoutExclusive(false);
        validOffer.setRequiresQrVerification(true);
        validOffer.setLocationSpecific(false);
        validOffer.setCreatedAt(LocalDateTime.now());

        // Create valid create offer request using setters (DTO uses @Data)
        validCreateRequest = new CreateOfferRequest();
        validCreateRequest.setMerchantId(1L);
        validCreateRequest.setTitle("20% Off Weekend Special");
        validCreateRequest.setDescription("Special weekend discount");
        validCreateRequest.setDiscountType("PERCENTAGE");
        validCreateRequest.setDiscountValue(new BigDecimal("20"));
        validCreateRequest.setMinPurchaseAmount(new BigDecimal("25"));
        validCreateRequest.setMaxDiscountAmount(new BigDecimal("100"));
        validCreateRequest.setCategory("RESTAURANT");
        validCreateRequest.setTerms("Weekend only");
        validCreateRequest.setImageUrl("https://example.com/weekend.png");
        validCreateRequest.setValidFrom(LocalDateTime.now());
        validCreateRequest.setValidUntil(LocalDateTime.now().plusDays(7));
        validCreateRequest.setUsageLimit(50);
        validCreateRequest.setUsageLimitPerUser(2);
        validCreateRequest.setFeatured(false);
        validCreateRequest.setScoutExclusive(false);
        validCreateRequest.setRequiresQrVerification(true);
        validCreateRequest.setLocationSpecific(false);

        // Create valid redeem request using setters (DTO uses @Data)
        validRedeemRequest = new RedeemOfferRequest();
        validRedeemRequest.setOfferId(1L);
        validRedeemRequest.setUserId(testUserId);
        validRedeemRequest.setPurchaseAmount(new BigDecimal("100"));
        validRedeemRequest.setMerchantLocationId(1L);
        validRedeemRequest.setRedemptionMethod("show_to_cashier");
        validRedeemRequest.setNotes("Test redemption");
    }

    // Helper method to create an offer with specific dates for testing
    private Offer createOfferWithDates(LocalDateTime validFrom, LocalDateTime validUntil) {
        Offer offer = new Offer();
        offer.setId(1L);
        offer.setUuid(UUID.randomUUID());
        offer.setMerchantId(1L);
        offer.setTitle("Test Offer");
        offer.setDescription("Test Description");
        offer.setDiscountType(DiscountType.PERCENTAGE);
        offer.setDiscountValue(new BigDecimal("10"));
        offer.setCategory("RESTAURANT");
        offer.setStatus(OfferStatus.ACTIVE);
        offer.setValidFrom(validFrom);
        offer.setValidUntil(validUntil);
        offer.setTotalRedemptions(0);
        offer.setFeatured(false);
        offer.setScoutExclusive(false);
        offer.setRequiresQrVerification(true);
        offer.setLocationSpecific(false);
        offer.setCreatedAt(LocalDateTime.now());
        return offer;
    }

    // Helper method to create an OfferRedemption
    private OfferRedemption createRedemption(Long offerId, UUID userId, RedemptionStatus status) {
        OfferRedemption redemption = new OfferRedemption();
        redemption.setId(1L);
        redemption.setUuid(UUID.randomUUID());
        redemption.setOfferId(offerId);
        redemption.setUserId(userId);
        redemption.setMerchantId(1L);
        redemption.setPurchaseAmount(new BigDecimal("100"));
        redemption.setDiscountAmount(new BigDecimal("10"));
        redemption.setFinalAmount(new BigDecimal("90"));
        redemption.setVerificationCode("ABC12345");
        redemption.setStatus(status);
        redemption.setCreatedAt(LocalDateTime.now());
        return redemption;
    }

    @Nested
    @DisplayName("createOffer Tests")
    class CreateOfferTests {

        @Test
        @DisplayName("Should create offer successfully with all fields")
        void createOffer_Success() {
            // Arrange
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> {
                Offer saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(1L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of(validOffer)));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            OfferResponse response = offerService.createOffer(validCreateRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getTitle()).isEqualTo("20% Off Weekend Special");
            assertThat(response.getDiscountType()).isEqualTo("PERCENTAGE");
            assertThat(response.getDiscountValue()).isEqualByComparingTo(new BigDecimal("20"));
            assertThat(response.getMerchantName()).isEqualTo("Test Restaurant");
            assertThat(response.getMerchantLogoUrl()).isEqualTo("https://example.com/logo.png");

            verify(offerRepository).save(any(Offer.class));
            verify(merchantRepository).save(any(Merchant.class));
        }

        @Test
        @DisplayName("Should throw exception when merchant not found")
        void createOffer_MerchantNotFound() {
            // Arrange
            when(merchantRepository.findById(999L)).thenReturn(Optional.empty());
            validCreateRequest.setMerchantId(999L);

            // Act & Assert
            assertThatThrownBy(() -> offerService.createOffer(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Merchant not found");

            verify(offerRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when merchant is not approved")
        void createOffer_MerchantNotApproved() {
            // Arrange
            when(merchantRepository.findById(2L)).thenReturn(Optional.of(pendingMerchant));
            validCreateRequest.setMerchantId(2L);

            // Act & Assert
            assertThatThrownBy(() -> offerService.createOffer(validCreateRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Only approved merchants can create offers");

            verify(offerRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when validUntil is before validFrom")
        void createOffer_InvalidDates() {
            // Arrange
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            validCreateRequest.setValidFrom(LocalDateTime.now().plusDays(7));
            validCreateRequest.setValidUntil(LocalDateTime.now());

            // Act & Assert
            assertThatThrownBy(() -> offerService.createOffer(validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Valid until date must be after valid from date");

            verify(offerRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set default values for optional boolean fields")
        void createOffer_DefaultValues() {
            // Arrange
            validCreateRequest.setFeatured(null);
            validCreateRequest.setScoutExclusive(null);
            validCreateRequest.setRequiresQrVerification(null);
            validCreateRequest.setLocationSpecific(null);

            ArgumentCaptor<Offer> captor = ArgumentCaptor.forClass(Offer.class);
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.save(captor.capture())).thenAnswer(inv -> {
                Offer saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(1L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of()));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.createOffer(validCreateRequest);

            // Assert
            Offer captured = captor.getValue();
            assertThat(captured.getFeatured()).isFalse();
            assertThat(captured.getScoutExclusive()).isFalse();
            assertThat(captured.getRequiresQrVerification()).isTrue();
            assertThat(captured.getLocationSpecific()).isFalse();
        }

        @Test
        @DisplayName("Should create offer with FIXED_AMOUNT discount type")
        void createOffer_FixedAmountDiscount() {
            // Arrange
            validCreateRequest.setDiscountType("FIXED_AMOUNT");
            validCreateRequest.setDiscountValue(new BigDecimal("15"));

            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> {
                Offer saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(1L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of()));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            OfferResponse response = offerService.createOffer(validCreateRequest);

            // Assert
            assertThat(response.getDiscountType()).isEqualTo("FIXED_AMOUNT");
            assertThat(response.getDiscountValue()).isEqualByComparingTo(new BigDecimal("15"));
        }

        @Test
        @DisplayName("Should update merchant offer counts after creation")
        void createOffer_UpdatesMerchantCounts() {
            // Arrange
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> {
                Offer saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.countByMerchantIdAndStatus(1L, OfferStatus.ACTIVE)).thenReturn(5L);
            when(offerRepository.findByMerchantId(eq(1L), any())).thenReturn(new PageImpl<>(List.of(validOffer)));

            ArgumentCaptor<Merchant> merchantCaptor = ArgumentCaptor.forClass(Merchant.class);
            when(merchantRepository.save(merchantCaptor.capture())).thenReturn(approvedMerchant);

            // Act
            offerService.createOffer(validCreateRequest);

            // Assert
            Merchant savedMerchant = merchantCaptor.getValue();
            assertThat(savedMerchant.getActiveOffers()).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("updateOffer Tests")
    class UpdateOfferTests {

        @Test
        @DisplayName("Should update offer successfully")
        void updateOffer_Success() {
            // Arrange
            CreateOfferRequest updateRequest = new CreateOfferRequest();
            updateRequest.setTitle("Updated Title");
            updateRequest.setDescription("Updated Description");

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));

            // Act
            OfferResponse response = offerService.updateOffer(1L, updateRequest);

            // Assert
            assertThat(response.getTitle()).isEqualTo("Updated Title");
            assertThat(response.getDescription()).isEqualTo("Updated Description");
            verify(offerRepository).save(any(Offer.class));
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void updateOffer_NotFound() {
            // Arrange
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.updateOffer(999L, validCreateRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");

            verify(offerRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should perform partial update when some fields are null")
        void updateOffer_PartialUpdate() {
            // Arrange
            CreateOfferRequest partialUpdate = new CreateOfferRequest();
            partialUpdate.setTitle("Only Title Updated");
            // All other fields are null

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));

            // Act
            OfferResponse response = offerService.updateOffer(1L, partialUpdate);

            // Assert
            assertThat(response.getTitle()).isEqualTo("Only Title Updated");
            // Original values should be preserved
            assertThat(response.getDescription()).isEqualTo("Get 10% off your entire purchase");
            assertThat(response.getCategory()).isEqualTo("RESTAURANT");
        }

        @Test
        @DisplayName("Should update discount type and value")
        void updateOffer_UpdateDiscountTypeAndValue() {
            // Arrange
            CreateOfferRequest updateRequest = new CreateOfferRequest();
            updateRequest.setDiscountType("FIXED_AMOUNT");
            updateRequest.setDiscountValue(new BigDecimal("25"));

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));

            // Act
            OfferResponse response = offerService.updateOffer(1L, updateRequest);

            // Assert
            assertThat(response.getDiscountType()).isEqualTo("FIXED_AMOUNT");
            assertThat(response.getDiscountValue()).isEqualByComparingTo(new BigDecimal("25"));
        }

        @Test
        @DisplayName("Should update featured and scout exclusive flags")
        void updateOffer_UpdateBooleanFlags() {
            // Arrange
            CreateOfferRequest updateRequest = new CreateOfferRequest();
            updateRequest.setFeatured(true);
            updateRequest.setScoutExclusive(true);

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));

            // Act
            OfferResponse response = offerService.updateOffer(1L, updateRequest);

            // Assert
            assertThat(response.getFeatured()).isTrue();
            assertThat(response.getScoutExclusive()).isTrue();
        }

        @Test
        @DisplayName("Should return response without merchant data when merchant not found")
        void updateOffer_MerchantNotFound() {
            // Arrange
            CreateOfferRequest updateRequest = new CreateOfferRequest();
            updateRequest.setTitle("Updated Title");

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.empty());

            // Act
            OfferResponse response = offerService.updateOffer(1L, updateRequest);

            // Assert
            assertThat(response.getTitle()).isEqualTo("Updated Title");
            assertThat(response.getMerchantName()).isNull();
            assertThat(response.getMerchantLogoUrl()).isNull();
        }
    }

    @Nested
    @DisplayName("getOffer Tests")
    class GetOfferTests {

        @Test
        @DisplayName("Should return offer when found")
        void getOffer_Found() {
            // Arrange
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));

            // Act
            OfferResponse response = offerService.getOffer(1L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getTitle()).isEqualTo("10% Off All Items");
            assertThat(response.getMerchantName()).isEqualTo("Test Restaurant");
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void getOffer_NotFound() {
            // Arrange
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.getOffer(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");
        }

        @Test
        @DisplayName("Should return offer without merchant data when merchant not found")
        void getOffer_MerchantNotFound() {
            // Arrange
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(merchantRepository.findById(1L)).thenReturn(Optional.empty());

            // Act
            OfferResponse response = offerService.getOffer(1L);

            // Assert
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getMerchantName()).isNull();
        }
    }

    @Nested
    @DisplayName("getActiveOffers Tests")
    class GetActiveOffersTests {

        @Test
        @DisplayName("Should return page of active offers")
        void getActiveOffers_WithResults() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));

            // Act
            Page<OfferResponse> result = offerService.getActiveOffers(defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("10% Off All Items");
            assertThat(result.getContent().get(0).getMerchantName()).isEqualTo("Test Restaurant");
        }

        @Test
        @DisplayName("Should return empty page when no active offers")
        void getActiveOffers_Empty() {
            // Arrange
            Page<Offer> emptyPage = new PageImpl<>(Collections.emptyList(), defaultPageable, 0);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(emptyPage);

            // Act
            Page<OfferResponse> result = offerService.getActiveOffers(defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }

        @Test
        @DisplayName("Should enrich offers with merchant data")
        void getActiveOffers_EnrichedWithMerchant() {
            // Arrange
            Offer offer2 = new Offer();
            offer2.setId(2L);
            offer2.setUuid(UUID.randomUUID());
            offer2.setMerchantId(1L);
            offer2.setTitle("Second Offer");
            offer2.setDescription("Description");
            offer2.setDiscountType(DiscountType.FIXED_AMOUNT);
            offer2.setDiscountValue(new BigDecimal("5"));
            offer2.setStatus(OfferStatus.ACTIVE);
            offer2.setValidFrom(LocalDateTime.now().minusDays(1));
            offer2.setValidUntil(LocalDateTime.now().plusDays(10));
            offer2.setTotalRedemptions(0);
            offer2.setFeatured(false);
            offer2.setScoutExclusive(false);
            offer2.setRequiresQrVerification(false);
            offer2.setLocationSpecific(false);
            offer2.setCreatedAt(LocalDateTime.now());

            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer, offer2), defaultPageable, 2);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));

            // Act
            Page<OfferResponse> result = offerService.getActiveOffers(defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getContent()).allMatch(r -> r.getMerchantName().equals("Test Restaurant"));
        }
    }

    @Nested
    @DisplayName("getActiveOffersForUser Tests")
    class GetActiveOffersForUserTests {

        @Test
        @DisplayName("Should return offers with user redemption data")
        void getActiveOffersForUser_WithRedemptionData() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));
            List<Object[]> redemptionData = new ArrayList<>();
            redemptionData.add(new Object[]{1L, 2});
            when(redemptionRepository.countUserRedemptionsByOfferIds(eq(testUserId), anyList()))
                    .thenReturn(redemptionData);

            // Act
            Page<OfferResponse> result = offerService.getActiveOffersForUser(testUserId, defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            OfferResponse response = result.getContent().get(0);
            assertThat(response.getUserRedemptionCount()).isEqualTo(2);
            assertThat(response.getUserHasReachedLimit()).isFalse(); // limit is 3, user has 2
        }

        @Test
        @DisplayName("Should show user has reached limit when at max redemptions")
        void getActiveOffersForUser_ReachedLimit() {
            // Arrange
            validOffer.setUsageLimitPerUser(2);
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));
            List<Object[]> redemptionData2 = new ArrayList<>();
            redemptionData2.add(new Object[]{1L, 2});
            when(redemptionRepository.countUserRedemptionsByOfferIds(eq(testUserId), anyList()))
                    .thenReturn(redemptionData2);

            // Act
            Page<OfferResponse> result = offerService.getActiveOffersForUser(testUserId, defaultPageable);

            // Assert
            OfferResponse response = result.getContent().get(0);
            assertThat(response.getUserRedemptionCount()).isEqualTo(2);
            assertThat(response.getUserHasReachedLimit()).isTrue();
        }

        @Test
        @DisplayName("Should return zero redemption count for new user")
        void getActiveOffersForUser_NoRedemptions() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.findActiveOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));
            when(redemptionRepository.countUserRedemptionsByOfferIds(eq(testUserId), anyList()))
                    .thenReturn(Collections.emptyList());

            // Act
            Page<OfferResponse> result = offerService.getActiveOffersForUser(testUserId, defaultPageable);

            // Assert
            OfferResponse response = result.getContent().get(0);
            assertThat(response.getUserRedemptionCount()).isEqualTo(0);
            assertThat(response.getUserHasReachedLimit()).isFalse();
        }
    }

    @Nested
    @DisplayName("getMerchantOffers Tests")
    class GetMerchantOffersTests {

        @Test
        @DisplayName("Should return merchant offers successfully")
        void getMerchantOffers_Success() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.findByMerchantId(1L, defaultPageable)).thenReturn(offerPage);

            // Act
            Page<OfferResponse> result = offerService.getMerchantOffers(1L, defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getMerchantName()).isEqualTo("Test Restaurant");
        }

        @Test
        @DisplayName("Should return offers without merchant data when merchant not found")
        void getMerchantOffers_MerchantNotFound() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(merchantRepository.findById(1L)).thenReturn(Optional.empty());
            when(offerRepository.findByMerchantId(1L, defaultPageable)).thenReturn(offerPage);

            // Act
            Page<OfferResponse> result = offerService.getMerchantOffers(1L, defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getMerchantName()).isNull();
        }
    }

    @Nested
    @DisplayName("getOffersByCategory Tests")
    class GetOffersByCategoryTests {

        @Test
        @DisplayName("Should return offers filtered by category")
        void getOffersByCategory_WithResults() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.findActiveByCategoryAndStatus(eq("RESTAURANT"), eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));

            // Act
            Page<OfferResponse> result = offerService.getOffersByCategory("RESTAURANT", defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCategory()).isEqualTo("RESTAURANT");
        }

        @Test
        @DisplayName("Should return empty page for non-existent category")
        void getOffersByCategory_Empty() {
            // Arrange
            Page<Offer> emptyPage = new PageImpl<>(Collections.emptyList(), defaultPageable, 0);
            when(offerRepository.findActiveByCategoryAndStatus(eq("NONEXISTENT"), eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(emptyPage);

            // Act
            Page<OfferResponse> result = offerService.getOffersByCategory("NONEXISTENT", defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getFeaturedOffers Tests")
    class GetFeaturedOffersTests {

        @Test
        @DisplayName("Should return featured offers")
        void getFeaturedOffers_WithResults() {
            // Arrange
            validOffer.setFeatured(true);
            when(offerRepository.findFeaturedOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(List.of(validOffer));
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));

            // Act
            Page<OfferResponse> result = offerService.getFeaturedOffers(defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getFeatured()).isTrue();
        }

        @Test
        @DisplayName("Should return empty page when no featured offers")
        void getFeaturedOffers_Empty() {
            // Arrange
            when(offerRepository.findFeaturedOffers(eq(OfferStatus.ACTIVE), any(LocalDateTime.class), eq(defaultPageable)))
                    .thenReturn(Collections.emptyList());

            // Act
            Page<OfferResponse> result = offerService.getFeaturedOffers(defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("searchOffers Tests")
    class SearchOffersTests {

        @Test
        @DisplayName("Should return offers matching search term")
        void searchOffers_WithResults() {
            // Arrange
            Page<Offer> offerPage = new PageImpl<>(List.of(validOffer), defaultPageable, 1);
            when(offerRepository.searchOffers("10%", OfferStatus.ACTIVE, defaultPageable))
                    .thenReturn(offerPage);
            when(merchantRepository.findAllById(anySet())).thenReturn(List.of(approvedMerchant));

            // Act
            Page<OfferResponse> result = offerService.searchOffers("10%", defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getTitle()).contains("10%");
        }

        @Test
        @DisplayName("Should return empty page when no matches")
        void searchOffers_NoMatches() {
            // Arrange
            Page<Offer> emptyPage = new PageImpl<>(Collections.emptyList(), defaultPageable, 0);
            when(offerRepository.searchOffers("nonexistent", OfferStatus.ACTIVE, defaultPageable))
                    .thenReturn(emptyPage);

            // Act
            Page<OfferResponse> result = offerService.searchOffers("nonexistent", defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("redeemOffer Tests")
    class RedeemOfferTests {

        @Test
        @DisplayName("Should redeem offer successfully")
        void redeemOffer_Success() {
            // Arrange
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            OfferRedemptionResponse response = offerService.redeemOffer(validRedeemRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getOfferId()).isEqualTo(1L);
            assertThat(response.getUserId()).isEqualTo(testUserId);
            assertThat(response.getStatus()).isEqualTo("PENDING");
            assertThat(response.getVerificationCode()).isNotNull();

            verify(redemptionRepository).save(any(OfferRedemption.class));
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void redeemOffer_OfferNotFound() {
            // Arrange
            validRedeemRequest.setOfferId(999L);
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");

            verify(redemptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when offer is expired")
        void redeemOffer_OfferExpired() {
            // Arrange
            Offer expiredOffer = createOfferWithDates(
                    LocalDateTime.now().minusDays(30),
                    LocalDateTime.now().minusDays(1)
            );
            when(offerRepository.findById(1L)).thenReturn(Optional.of(expiredOffer));

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Offer is not valid or has expired");

            verify(redemptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when user has reached redemption limit")
        void redeemOffer_UserLimitReached() {
            // Arrange
            validOffer.setUsageLimitPerUser(2);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(2);

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("User has reached redemption limit for this offer");

            verify(redemptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should calculate percentage discount correctly")
        void redeemOffer_PercentageDiscount() {
            // Arrange
            validOffer.setDiscountType(DiscountType.PERCENTAGE);
            validOffer.setDiscountValue(new BigDecimal("10"));
            validOffer.setMaxDiscountAmount(null);
            validOffer.setMinPurchaseAmount(null);

            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            OfferRedemption saved = captor.getValue();
            // 10% of $100 = $10
            assertThat(saved.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("10"));
            assertThat(saved.getFinalAmount()).isEqualByComparingTo(new BigDecimal("90"));
        }

        @Test
        @DisplayName("Should calculate fixed amount discount correctly")
        void redeemOffer_FixedAmountDiscount() {
            // Arrange
            validOffer.setDiscountType(DiscountType.FIXED_AMOUNT);
            validOffer.setDiscountValue(new BigDecimal("15"));
            validOffer.setMaxDiscountAmount(null);
            validOffer.setMinPurchaseAmount(null);

            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            OfferRedemption saved = captor.getValue();
            assertThat(saved.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("15"));
            assertThat(saved.getFinalAmount()).isEqualByComparingTo(new BigDecimal("85"));
        }

        @Test
        @DisplayName("Should cap discount at max discount amount")
        void redeemOffer_MaxDiscountCapped() {
            // Arrange
            validOffer.setDiscountType(DiscountType.PERCENTAGE);
            validOffer.setDiscountValue(new BigDecimal("50")); // 50% discount
            validOffer.setMaxDiscountAmount(new BigDecimal("20")); // max $20
            validOffer.setMinPurchaseAmount(null);

            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            OfferRedemption saved = captor.getValue();
            // 50% of $100 = $50, but capped at $20
            assertThat(saved.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("20"));
            assertThat(saved.getFinalAmount()).isEqualByComparingTo(new BigDecimal("80"));
        }

        @Test
        @DisplayName("Should return zero discount when below minimum purchase")
        void redeemOffer_BelowMinPurchase() {
            // Arrange
            validOffer.setMinPurchaseAmount(new BigDecimal("150")); // min $150
            validRedeemRequest.setPurchaseAmount(new BigDecimal("100")); // only $100

            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            OfferRedemption saved = captor.getValue();
            assertThat(saved.getDiscountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should increment offer total redemptions")
        void redeemOffer_IncrementsRedemptionCount() {
            // Arrange
            int originalRedemptions = validOffer.getTotalRedemptions();
            ArgumentCaptor<Offer> offerCaptor = ArgumentCaptor.forClass(Offer.class);

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(offerCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            Offer savedOffer = offerCaptor.getValue();
            assertThat(savedOffer.getTotalRedemptions()).isEqualTo(originalRedemptions + 1);
        }

        @Test
        @DisplayName("Should throw exception when offer has reached total usage limit")
        void redeemOffer_TotalLimitReached() {
            // Arrange
            validOffer.setUsageLimit(10);
            validOffer.setTotalRedemptions(10);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Offer is not valid or has expired");

            verify(redemptionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("verifyRedemption Tests")
    class VerifyRedemptionTests {

        @Test
        @DisplayName("Should verify redemption successfully")
        void verifyRedemption_Success() {
            // Arrange
            UUID verifierId = UUID.randomUUID();
            OfferRedemption pendingRedemption = createRedemption(1L, testUserId, RedemptionStatus.PENDING);

            when(redemptionRepository.findByVerificationCode("ABC12345"))
                    .thenReturn(Optional.of(pendingRedemption));
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            OfferRedemptionResponse response = offerService.verifyRedemption("ABC12345", verifierId);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo("COMPLETED");
            verify(redemptionRepository).save(any(OfferRedemption.class));
        }

        @Test
        @DisplayName("Should throw exception for invalid verification code")
        void verifyRedemption_InvalidCode() {
            // Arrange
            when(redemptionRepository.findByVerificationCode("INVALID"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.verifyRedemption("INVALID", UUID.randomUUID()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid verification code");

            verify(redemptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when redemption already processed")
        void verifyRedemption_AlreadyProcessed() {
            // Arrange
            OfferRedemption completedRedemption = createRedemption(1L, testUserId, RedemptionStatus.COMPLETED);

            when(redemptionRepository.findByVerificationCode("ABC12345"))
                    .thenReturn(Optional.of(completedRedemption));

            // Act & Assert
            assertThatThrownBy(() -> offerService.verifyRedemption("ABC12345", UUID.randomUUID()))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Redemption has already been processed");

            verify(redemptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set verifier ID and timestamps on verification")
        void verifyRedemption_SetsMetadata() {
            // Arrange
            UUID verifierId = UUID.randomUUID();
            OfferRedemption pendingRedemption = createRedemption(1L, testUserId, RedemptionStatus.PENDING);

            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(redemptionRepository.findByVerificationCode("ABC12345"))
                    .thenReturn(Optional.of(pendingRedemption));
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            offerService.verifyRedemption("ABC12345", verifierId);

            // Assert
            OfferRedemption saved = captor.getValue();
            assertThat(saved.getVerifiedByUserId()).isEqualTo(verifierId);
            assertThat(saved.getVerifiedAt()).isNotNull();
            assertThat(saved.getRedeemedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("pauseOffer Tests")
    class PauseOfferTests {

        @Test
        @DisplayName("Should pause offer successfully")
        void pauseOffer_Success() {
            // Arrange
            ArgumentCaptor<Offer> captor = ArgumentCaptor.forClass(Offer.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(0L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of()));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.pauseOffer(1L);

            // Assert
            Offer savedOffer = captor.getValue();
            assertThat(savedOffer.getStatus()).isEqualTo(OfferStatus.PAUSED);
            verify(offerRepository).save(any(Offer.class));
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void pauseOffer_NotFound() {
            // Arrange
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.pauseOffer(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");

            verify(offerRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("resumeOffer Tests")
    class ResumeOfferTests {

        @Test
        @DisplayName("Should resume offer successfully")
        void resumeOffer_Success() {
            // Arrange
            validOffer.setStatus(OfferStatus.PAUSED);
            ArgumentCaptor<Offer> captor = ArgumentCaptor.forClass(Offer.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(offerRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(1L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of(validOffer)));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.resumeOffer(1L);

            // Assert
            Offer savedOffer = captor.getValue();
            assertThat(savedOffer.getStatus()).isEqualTo(OfferStatus.ACTIVE);
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void resumeOffer_NotFound() {
            // Arrange
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.resumeOffer(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");
        }
    }

    @Nested
    @DisplayName("deleteOffer Tests")
    class DeleteOfferTests {

        @Test
        @DisplayName("Should delete offer successfully")
        void deleteOffer_Success() {
            // Arrange
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            doNothing().when(offerRepository).delete(validOffer);
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(0L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of()));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.deleteOffer(1L);

            // Assert
            verify(offerRepository).delete(validOffer);
        }

        @Test
        @DisplayName("Should throw exception when offer not found")
        void deleteOffer_NotFound() {
            // Arrange
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> offerService.deleteOffer(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Offer not found");

            verify(offerRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should update merchant offer counts after deletion")
        void deleteOffer_UpdatesMerchantCounts() {
            // Arrange
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            doNothing().when(offerRepository).delete(validOffer);
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.countByMerchantIdAndStatus(1L, OfferStatus.ACTIVE)).thenReturn(0L);
            when(offerRepository.findByMerchantId(eq(1L), any())).thenReturn(new PageImpl<>(List.of()));

            ArgumentCaptor<Merchant> merchantCaptor = ArgumentCaptor.forClass(Merchant.class);
            when(merchantRepository.save(merchantCaptor.capture())).thenReturn(approvedMerchant);

            // Act
            offerService.deleteOffer(1L);

            // Assert
            Merchant savedMerchant = merchantCaptor.getValue();
            assertThat(savedMerchant.getActiveOffers()).isZero();
            assertThat(savedMerchant.getTotalOffers()).isZero();
        }
    }

    @Nested
    @DisplayName("getUserRedemptions Tests")
    class GetUserRedemptionsTests {

        @Test
        @DisplayName("Should return user redemption history")
        void getUserRedemptions_WithResults() {
            // Arrange
            OfferRedemption redemption = createRedemption(1L, testUserId, RedemptionStatus.COMPLETED);
            Page<OfferRedemption> redemptionPage = new PageImpl<>(List.of(redemption), defaultPageable, 1);
            when(redemptionRepository.findUserRedemptionHistory(testUserId, defaultPageable))
                    .thenReturn(redemptionPage);

            // Act
            Page<OfferRedemptionResponse> result = offerService.getUserRedemptions(testUserId, defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getUserId()).isEqualTo(testUserId);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("COMPLETED");
        }

        @Test
        @DisplayName("Should return empty page when user has no redemptions")
        void getUserRedemptions_Empty() {
            // Arrange
            Page<OfferRedemption> emptyPage = new PageImpl<>(Collections.emptyList(), defaultPageable, 0);
            when(redemptionRepository.findUserRedemptionHistory(testUserId, defaultPageable))
                    .thenReturn(emptyPage);

            // Act
            Page<OfferRedemptionResponse> result = offerService.getUserRedemptions(testUserId, defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }
    }

    @Nested
    @DisplayName("getMerchantRedemptions Tests")
    class GetMerchantRedemptionsTests {

        @Test
        @DisplayName("Should return merchant redemption history")
        void getMerchantRedemptions_WithResults() {
            // Arrange
            OfferRedemption redemption = createRedemption(1L, testUserId, RedemptionStatus.COMPLETED);
            Page<OfferRedemption> redemptionPage = new PageImpl<>(List.of(redemption), defaultPageable, 1);
            when(redemptionRepository.findByMerchantId(1L, defaultPageable))
                    .thenReturn(redemptionPage);

            // Act
            Page<OfferRedemptionResponse> result = offerService.getMerchantRedemptions(1L, defaultPageable);

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getMerchantId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should return empty page when merchant has no redemptions")
        void getMerchantRedemptions_Empty() {
            // Arrange
            Page<OfferRedemption> emptyPage = new PageImpl<>(Collections.emptyList(), defaultPageable, 0);
            when(redemptionRepository.findByMerchantId(1L, defaultPageable))
                    .thenReturn(emptyPage);

            // Act
            Page<OfferRedemptionResponse> result = offerService.getMerchantRedemptions(1L, defaultPageable);

            // Assert
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should handle pagination correctly")
        void getMerchantRedemptions_Pagination() {
            // Arrange
            Pageable secondPage = PageRequest.of(1, 10);
            OfferRedemption redemption = createRedemption(1L, testUserId, RedemptionStatus.COMPLETED);
            Page<OfferRedemption> redemptionPage = new PageImpl<>(List.of(redemption), secondPage, 15);
            when(redemptionRepository.findByMerchantId(1L, secondPage))
                    .thenReturn(redemptionPage);

            // Act
            Page<OfferRedemptionResponse> result = offerService.getMerchantRedemptions(1L, secondPage);

            // Assert
            assertThat(result.getNumber()).isEqualTo(1);
            assertThat(result.getTotalElements()).isEqualTo(15);
        }
    }

    @Nested
    @DisplayName("expireOldOffers Tests")
    class ExpireOldOffersTests {

        @Test
        @DisplayName("Should expire offers that have passed valid until date")
        void expireOldOffers_ExpiresOffers() {
            // Arrange
            Offer expiredOffer = createOfferWithDates(
                    LocalDateTime.now().minusDays(30),
                    LocalDateTime.now().minusDays(1)
            );
            expiredOffer.setStatus(OfferStatus.ACTIVE);

            when(offerRepository.findByStatusAndValidUntilBefore(eq(OfferStatus.ACTIVE), any(LocalDateTime.class)))
                    .thenReturn(List.of(expiredOffer));
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(anyLong())).thenReturn(Optional.of(approvedMerchant));
            when(offerRepository.countByMerchantIdAndStatus(anyLong(), any())).thenReturn(0L);
            when(offerRepository.findByMerchantId(anyLong(), any())).thenReturn(new PageImpl<>(List.of()));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.expireOldOffers();

            // Assert
            ArgumentCaptor<Offer> captor = ArgumentCaptor.forClass(Offer.class);
            verify(offerRepository).save(captor.capture());
            assertThat(captor.getValue().getStatus()).isEqualTo(OfferStatus.EXPIRED);
        }

        @Test
        @DisplayName("Should do nothing when no offers need expiration")
        void expireOldOffers_NoOffersToExpire() {
            // Arrange
            when(offerRepository.findByStatusAndValidUntilBefore(eq(OfferStatus.ACTIVE), any(LocalDateTime.class)))
                    .thenReturn(Collections.emptyList());

            // Act
            offerService.expireOldOffers();

            // Assert
            verify(offerRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("expireOldRedemptions Tests")
    class ExpireOldRedemptionsTests {

        @Test
        @DisplayName("Should expire pending redemptions older than 7 days")
        void expireOldRedemptions_ExpiresRedemptions() {
            // Arrange
            OfferRedemption oldRedemption = createRedemption(1L, testUserId, RedemptionStatus.PENDING);
            oldRedemption.setCreatedAt(LocalDateTime.now().minusDays(10));

            when(redemptionRepository.findByStatusAndCreatedAtBefore(eq(RedemptionStatus.PENDING), any(LocalDateTime.class)))
                    .thenReturn(List.of(oldRedemption));
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            offerService.expireOldRedemptions();

            // Assert
            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            verify(redemptionRepository).save(captor.capture());
            assertThat(captor.getValue().getStatus()).isEqualTo(RedemptionStatus.EXPIRED);
        }

        @Test
        @DisplayName("Should do nothing when no redemptions need expiration")
        void expireOldRedemptions_NoRedemptionsToExpire() {
            // Arrange
            when(redemptionRepository.findByStatusAndCreatedAtBefore(eq(RedemptionStatus.PENDING), any(LocalDateTime.class)))
                    .thenReturn(Collections.emptyList());

            // Act
            offerService.expireOldRedemptions();

            // Assert
            verify(redemptionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Validation Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle null purchase amount in redemption")
        void redeemOffer_NullPurchaseAmount() {
            // Arrange
            validRedeemRequest.setPurchaseAmount(null);

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            OfferRedemptionResponse response = offerService.redeemOffer(validRedeemRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getDiscountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.getFinalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle offer with no usage limit")
        void redeemOffer_NoUsageLimit() {
            // Arrange
            validOffer.setUsageLimit(null);
            validOffer.setUsageLimitPerUser(null);

            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(100);
            when(redemptionRepository.save(any(OfferRedemption.class))).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act - should not throw even with high redemption count
            OfferRedemptionResponse response = offerService.redeemOffer(validRedeemRequest);

            // Assert
            assertThat(response).isNotNull();
        }

        @Test
        @DisplayName("Should handle paused offer status in isValid check")
        void redeemOffer_PausedOffer() {
            // Arrange
            validOffer.setStatus(OfferStatus.PAUSED);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Offer is not valid or has expired");
        }

        @Test
        @DisplayName("Should handle offer not yet valid (future start date)")
        void redeemOffer_FutureStartDate() {
            // Arrange
            Offer futureOffer = createOfferWithDates(
                    LocalDateTime.now().plusDays(1),
                    LocalDateTime.now().plusDays(30)
            );
            when(offerRepository.findById(1L)).thenReturn(Optional.of(futureOffer));

            // Act & Assert
            assertThatThrownBy(() -> offerService.redeemOffer(validRedeemRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Offer is not valid or has expired");
        }

        @Test
        @DisplayName("Should generate unique verification codes")
        void redeemOffer_GeneratesVerificationCode() {
            // Arrange
            ArgumentCaptor<OfferRedemption> captor = ArgumentCaptor.forClass(OfferRedemption.class);
            when(offerRepository.findById(1L)).thenReturn(Optional.of(validOffer));
            when(redemptionRepository.countUserRedemptions(testUserId, 1L)).thenReturn(0);
            when(redemptionRepository.save(captor.capture())).thenAnswer(inv -> {
                OfferRedemption saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(offerRepository.save(any(Offer.class))).thenAnswer(inv -> inv.getArgument(0));
            when(merchantRepository.findById(1L)).thenReturn(Optional.of(approvedMerchant));
            when(merchantRepository.save(any(Merchant.class))).thenReturn(approvedMerchant);

            // Act
            offerService.redeemOffer(validRedeemRequest);

            // Assert
            OfferRedemption saved = captor.getValue();
            assertThat(saved.getVerificationCode())
                    .isNotNull()
                    .hasSize(8)
                    .matches("[A-Z0-9]+");
        }
    }
}

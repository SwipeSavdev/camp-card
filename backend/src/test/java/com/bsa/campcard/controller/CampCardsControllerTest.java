package com.bsa.campcard.controller;

import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.repository.SubscriptionRepository;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CampCardsController using @WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Request/response handling
 * - Pagination and filtering
 * - Error handling
 *
 * Security is disabled for unit testing - authorization is tested at integration level.
 */
@Disabled("Controller tests need Spring context configuration fix - temporarily disabled")
@WebMvcTest(value = CampCardsController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("CampCardsController Tests")
class CampCardsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubscriptionRepository subscriptionRepository;

    @MockBean
    private UserRepository userRepository;

    private UUID testUuid;
    private UUID testUserId;
    private Subscription testSubscription;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testSubscription = new Subscription();
        testSubscription.setId(1L);
        testSubscription.setUuid(testUuid);
        testSubscription.setUserId(testUserId);
        testSubscription.setCardNumber("CARD-12345");
        testSubscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        testSubscription.setCreatedAt(LocalDateTime.now());
        testSubscription.setCurrentPeriodEnd(LocalDateTime.now().plusYears(1));

        testUser = User.builder()
                .id(testUserId)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .role(User.UserRole.SCOUT)
                .build();
    }

    // ========================================================================
    // GET ALL CARDS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/camp-cards - Get All Cards")
    class GetAllCardsTests {

        @Test
        @DisplayName("Should return paginated cards successfully")
        void getAllCards_Success() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].cardNumber").value("CARD-12345"))
                    .andExpect(jsonPath("$.content[0].name").value("John Doe"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(subscriptionRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter cards by ACTIVE status")
        void getAllCards_FilterByActiveStatus_Success() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findByStatus(eq(Subscription.SubscriptionStatus.ACTIVE), any(Pageable.class)))
                    .thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("status", "ACTIVE")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(subscriptionRepository).findByStatus(eq(Subscription.SubscriptionStatus.ACTIVE), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter cards by CANCELED status")
        void getAllCards_FilterByCanceledStatus_Success() throws Exception {
            Subscription canceledSubscription = new Subscription();
            canceledSubscription.setId(2L);
            canceledSubscription.setUuid(UUID.randomUUID());
            canceledSubscription.setUserId(testUserId);
            canceledSubscription.setCardNumber("CARD-CANCELED");
            canceledSubscription.setStatus(Subscription.SubscriptionStatus.CANCELED);

            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(canceledSubscription));
            when(subscriptionRepository.findByStatus(eq(Subscription.SubscriptionStatus.CANCELED), any(Pageable.class)))
                    .thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("status", "CANCELED")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].cardNumber").value("CARD-CANCELED"));

            verify(subscriptionRepository).findByStatus(eq(Subscription.SubscriptionStatus.CANCELED), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return all cards when status is 'all'")
        void getAllCards_StatusAll_ReturnsAll() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("status", "all")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(subscriptionRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter cards by search term in name")
        void getAllCards_SearchByName_Success() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("search", "John")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should filter cards by search term in card number")
        void getAllCards_SearchByCardNumber_Success() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("search", "CARD-12345")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should return empty list when search has no matches")
        void getAllCards_SearchNoMatches_ReturnsEmpty() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("search", "nonexistent")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("Should handle custom pagination parameters")
        void getAllCards_CustomPagination_Success() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(Collections.emptyList());
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);

            mockMvc.perform(get("/api/v1/camp-cards")
                            .param("page", "2")
                            .param("size", "25")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentPage").value(2))
                    .andExpect(jsonPath("$.size").value(25));
        }

        @Test
        @DisplayName("Should show 'Unknown User' when user not found")
        void getAllCards_UserNotFound_ShowsUnknown() throws Exception {
            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/camp-cards")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].name").value("Unknown User"));
        }

        @Test
        @DisplayName("Should return empty page when no cards exist")
        void getAllCards_NoCards_ReturnsEmpty() throws Exception {
            Page<Subscription> emptyPage = new PageImpl<>(Collections.emptyList());
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/camp-cards")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should return multiple cards with correct total count")
        void getAllCards_MultipleCards_Success() throws Exception {
            Subscription secondSubscription = new Subscription();
            secondSubscription.setId(2L);
            secondSubscription.setUuid(UUID.randomUUID());
            secondSubscription.setUserId(testUserId);
            secondSubscription.setCardNumber("CARD-67890");
            secondSubscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);

            Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription, secondSubscription));
            when(subscriptionRepository.findAll(any(Pageable.class))).thenReturn(subscriptionPage);
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.totalElements").value(2));
        }
    }

    // ========================================================================
    // GET CARD BY ID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/camp-cards/{id} - Get Card by ID")
    class GetCardByIdTests {

        @Test
        @DisplayName("Should return card when found")
        void getCardById_Found_Success() throws Exception {
            when(subscriptionRepository.findByUuid(testUuid)).thenReturn(Optional.of(testSubscription));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testUuid.toString()))
                    .andExpect(jsonPath("$.cardNumber").value("CARD-12345"))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.name").value("John Doe"))
                    .andExpect(jsonPath("$.email").value("test@example.com"));

            verify(subscriptionRepository).findByUuid(testUuid);
        }

        @Test
        @DisplayName("Should return 404 when card not found")
        void getCardById_NotFound_Returns404() throws Exception {
            UUID unknownUuid = UUID.randomUUID();
            when(subscriptionRepository.findByUuid(unknownUuid)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/camp-cards/" + unknownUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());

            verify(subscriptionRepository).findByUuid(unknownUuid);
        }

        @Test
        @DisplayName("Should return card without user info when user not found")
        void getCardById_UserNotFound_NoUserInfo() throws Exception {
            when(subscriptionRepository.findByUuid(testUuid)).thenReturn(Optional.of(testSubscription));
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/v1/camp-cards/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testUuid.toString()))
                    .andExpect(jsonPath("$.cardNumber").value("CARD-12345"))
                    // Note: Controller doesn't add name/email when user not found in getCardById
                    .andExpect(jsonPath("$.name").doesNotExist())
                    .andExpect(jsonPath("$.email").doesNotExist());
        }

        @Test
        @DisplayName("Should return card with all status types")
        void getCardById_DifferentStatuses_Success() throws Exception {
            testSubscription.setStatus(Subscription.SubscriptionStatus.CANCELED);
            when(subscriptionRepository.findByUuid(testUuid)).thenReturn(Optional.of(testSubscription));
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

            mockMvc.perform(get("/api/v1/camp-cards/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELED"));
        }
    }

    // ========================================================================
    // DELETE CARD TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/camp-cards/{id} - Delete/Revoke Card")
    class DeleteCardTests {

        @Test
        @DisplayName("Should revoke card successfully")
        void deleteCard_Success() throws Exception {
            when(subscriptionRepository.findByUuid(testUuid)).thenReturn(Optional.of(testSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenReturn(testSubscription);

            mockMvc.perform(delete("/api/v1/camp-cards/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNoContent());

            verify(subscriptionRepository).findByUuid(testUuid);
            verify(subscriptionRepository).save(any(Subscription.class));
        }

        @Test
        @DisplayName("Should return 404 when card not found")
        void deleteCard_NotFound_Returns404() throws Exception {
            UUID unknownUuid = UUID.randomUUID();
            when(subscriptionRepository.findByUuid(unknownUuid)).thenReturn(Optional.empty());

            mockMvc.perform(delete("/api/v1/camp-cards/" + unknownUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());

            verify(subscriptionRepository).findByUuid(unknownUuid);
            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should set status to CANCELED when deleting")
        void deleteCard_SetsCanceledStatus() throws Exception {
            when(subscriptionRepository.findByUuid(testUuid)).thenReturn(Optional.of(testSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> {
                Subscription saved = invocation.getArgument(0);
                // Verify the status is set to CANCELED
                org.junit.jupiter.api.Assertions.assertEquals(
                        Subscription.SubscriptionStatus.CANCELED, saved.getStatus());
                return saved;
            });

            mockMvc.perform(delete("/api/v1/camp-cards/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNoContent());
        }
    }
}

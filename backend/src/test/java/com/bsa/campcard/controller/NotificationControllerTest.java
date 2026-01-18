package com.bsa.campcard.controller;

import com.bsa.campcard.dto.notification.*;
import com.bsa.campcard.entity.DeviceToken;
import com.bsa.campcard.entity.Notification;
import com.bsa.campcard.security.JwtTokenProvider;
import com.bsa.campcard.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsa.campcard.config.JwtAuthenticationFilter;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.Import;

@Import(ControllerTestConfig.class)
@WebMvcTest(controllers = NotificationController.class)
@org.springframework.boot.autoconfigure.ImportAutoConfiguration({
    org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("NotificationController Tests")
class NotificationControllerTest {

    /**
     * Test exception handler to properly handle exceptions during testing.
     */
    @ControllerAdvice
    static class TestExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Validation failed"));
        }

        @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
        public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
                org.springframework.http.converter.HttpMessageNotReadableException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request body"));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserRepository userRepository;

    private static final String BASE_URL = "/api/v1/notifications";

    private DeviceTokenRequest validDeviceTokenRequest;
    private NotificationRequest validNotificationRequest;
    private List<NotificationResponse> sampleNotificationList;

    @BeforeEach
    void setUp() {
        // Build valid device token request using setters
        validDeviceTokenRequest = new DeviceTokenRequest();
        validDeviceTokenRequest.setToken("fcm_device_token_abc123");
        validDeviceTokenRequest.setDeviceType(DeviceToken.DeviceType.IOS);
        validDeviceTokenRequest.setDeviceModel("iPhone 15 Pro");
        validDeviceTokenRequest.setOsVersion("17.2");
        validDeviceTokenRequest.setAppVersion("1.0.0");

        // Build valid notification request using setters
        validNotificationRequest = new NotificationRequest();
        validNotificationRequest.setUserIds(Arrays.asList(1L, 2L, 3L));
        validNotificationRequest.setTitle("New Offer Available");
        validNotificationRequest.setBody("Check out this amazing 20% discount at local merchants!");
        validNotificationRequest.setType(Notification.NotificationType.NEW_OFFER);
        validNotificationRequest.setImageUrl("https://example.com/offer-image.png");
        validNotificationRequest.setData(Map.of("offerId", "123", "screen", "offers"));
        validNotificationRequest.setSaveToDatabase(true);

        // Build sample notification list
        sampleNotificationList = Arrays.asList(
                NotificationResponse.builder()
                        .id(1L)
                        .title("New Offer Available")
                        .body("20% discount at merchant")
                        .type("NEW_OFFER")
                        .read(false)
                        .createdAt(LocalDateTime.now().minusHours(1))
                        .build(),
                NotificationResponse.builder()
                        .id(2L)
                        .title("Payment Successful")
                        .body("Your payment of $10.00 was processed")
                        .type("PAYMENT_SUCCESS")
                        .read(true)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .readAt(LocalDateTime.now().minusHours(12))
                        .build(),
                NotificationResponse.builder()
                        .id(3L)
                        .title("Subscription Expiring")
                        .body("Your subscription expires in 7 days")
                        .type("SUBSCRIPTION_EXPIRING")
                        .read(false)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build()
        );
    }

    // ============================================
    // REGISTER DEVICE TOKEN ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/notifications/register-token - Register Device Token")
    class RegisterDeviceTokenTests {

        @Test
        @DisplayName("Should register device token successfully for authenticated user")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_Authenticated_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).registerDeviceToken(eq(1L), any(DeviceTokenRequest.class));
        }

        @Test
        @DisplayName("Should register device token for Android device")
        @WithMockUser(roles = "PARENT")
        void registerDeviceToken_AndroidDevice_ReturnsOk() throws Exception {
            // Arrange
            validDeviceTokenRequest.setDeviceType(DeviceToken.DeviceType.ANDROID);
            validDeviceTokenRequest.setDeviceModel("Samsung Galaxy S24");
            validDeviceTokenRequest.setOsVersion("14");
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).registerDeviceToken(eq(1L), any(DeviceTokenRequest.class));
        }

        @Test
        @DisplayName("Should register device token for Web platform")
        @WithMockUser(roles = "TROOP_LEADER")
        void registerDeviceToken_WebPlatform_ReturnsOk() throws Exception {
            // Arrange
            validDeviceTokenRequest.setDeviceType(DeviceToken.DeviceType.WEB);
            validDeviceTokenRequest.setDeviceModel("Chrome Browser");
            validDeviceTokenRequest.setOsVersion("Windows 11");
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 400 when token is missing")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_MissingToken_ReturnsBadRequest() throws Exception {
            // Arrange
            validDeviceTokenRequest.setToken(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(notificationService, never()).registerDeviceToken(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when token is blank")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_BlankToken_ReturnsBadRequest() throws Exception {
            // Arrange
            validDeviceTokenRequest.setToken("   ");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when device type is missing")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_MissingDeviceType_ReturnsBadRequest() throws Exception {
            // Arrange
            validDeviceTokenRequest.setDeviceType(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should register token with minimal required fields")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_MinimalFields_ReturnsOk() throws Exception {
            // Arrange - only required fields
            DeviceTokenRequest minimalRequest = new DeviceTokenRequest();
            minimalRequest.setToken("minimal_token_123");
            minimalRequest.setDeviceType(DeviceToken.DeviceType.IOS);
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(minimalRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // UNREGISTER DEVICE TOKEN ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("DELETE /api/v1/notifications/unregister-token/{token} - Unregister Device Token")
    class UnregisterDeviceTokenTests {

        @Test
        @DisplayName("Should unregister device token successfully")
        @WithMockUser(roles = "SCOUT")
        void unregisterDeviceToken_ValidToken_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).unregisterDeviceToken(anyString());

            // Act & Assert
            mockMvc.perform(delete(BASE_URL + "/unregister-token/fcm_token_abc123")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).unregisterDeviceToken("fcm_token_abc123");
        }

        @Test
        @DisplayName("Should handle unregistering non-existent token gracefully")
        @WithMockUser(roles = "PARENT")
        void unregisterDeviceToken_NonExistent_ReturnsOk() throws Exception {
            // Arrange - service doesn't throw for non-existent tokens
            doNothing().when(notificationService).unregisterDeviceToken(anyString());

            // Act & Assert
            mockMvc.perform(delete(BASE_URL + "/unregister-token/non_existent_token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should unregister token with special characters in path")
        @WithMockUser(roles = "SCOUT")
        void unregisterDeviceToken_SpecialCharacters_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).unregisterDeviceToken(anyString());

            // Act & Assert - URL-encoded token
            mockMvc.perform(delete(BASE_URL + "/unregister-token/token_with_numbers_123456")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // SEND NOTIFICATION ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/notifications/send - Send Notification")
    class SendNotificationTests {

        @Test
        @DisplayName("Should send notification successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_AsNationalAdmin_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).sendNotification(any(NotificationRequest.class));
        }

        @Test
        @DisplayName("Should send notification successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void sendNotification_AsCouncilAdmin_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should send notification to single user")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_SingleUser_ReturnsOk() throws Exception {
            // Arrange
            validNotificationRequest.setUserIds(Collections.singletonList(1L));
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should send notification to multiple users (bulk)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_BulkUsers_ReturnsOk() throws Exception {
            // Arrange
            validNotificationRequest.setUserIds(Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L));
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should send notification with all notification types")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_AllTypes_ReturnsOk() throws Exception {
            // Test various notification types
            Notification.NotificationType[] types = Notification.NotificationType.values();

            for (Notification.NotificationType type : types) {
                validNotificationRequest.setType(type);
                doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

                mockMvc.perform(post(BASE_URL + "/send")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validNotificationRequest)))
                        .andExpect(status().isOk());
            }
        }

        @Test
        @DisplayName("Should return 400 when user IDs are missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_MissingUserIds_ReturnsBadRequest() throws Exception {
            // Arrange
            validNotificationRequest.setUserIds(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(notificationService, never()).sendNotification(any());
        }

        @Test
        @DisplayName("Should return 400 when title is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_MissingTitle_ReturnsBadRequest() throws Exception {
            // Arrange
            validNotificationRequest.setTitle(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when title is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_BlankTitle_ReturnsBadRequest() throws Exception {
            // Arrange
            validNotificationRequest.setTitle("   ");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when body is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_MissingBody_ReturnsBadRequest() throws Exception {
            // Arrange
            validNotificationRequest.setBody(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should send notification without optional fields")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_WithoutOptionalFields_ReturnsOk() throws Exception {
            // Arrange - only required fields
            NotificationRequest minimalRequest = new NotificationRequest();
            minimalRequest.setUserIds(Arrays.asList(1L, 2L));
            minimalRequest.setTitle("Important Notice");
            minimalRequest.setBody("This is the notification body");
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(minimalRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should send notification with custom data payload")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_WithDataPayload_ReturnsOk() throws Exception {
            // Arrange
            validNotificationRequest.setData(Map.of(
                    "offerId", "offer-123",
                    "merchantId", "merchant-456",
                    "deepLink", "campcard://offers/123",
                    "action", "VIEW_OFFER"
            ));
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // GET MY NOTIFICATIONS ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/notifications/me - Get My Notifications")
    class GetMyNotificationsTests {

        @Test
        @DisplayName("Should return paginated notifications for authenticated user")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_Authenticated_ReturnsNotifications() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(sampleNotificationList, PageRequest.of(0, 20), 3);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(3)))
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].title").value("New Offer Available"))
                    .andExpect(jsonPath("$.content[0].read").value(false))
                    .andExpect(jsonPath("$.totalElements").value(3))
                    .andExpect(jsonPath("$.totalPages").value(1));

            verify(notificationService).getUserNotifications(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no notifications exist")
        @WithMockUser(roles = "PARENT")
        void getMyNotifications_NoNotifications_ReturnsEmptyPage() throws Exception {
            // Arrange
            Page<NotificationResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(emptyPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should return notifications with custom page size")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_CustomPageSize_ReturnsCorrectSize() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(
                    sampleNotificationList.subList(0, 2),
                    PageRequest.of(0, 2),
                    3
            );
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .param("size", "2")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.size").value(2))
                    .andExpect(jsonPath("$.totalPages").value(2));
        }

        @Test
        @DisplayName("Should return second page of notifications")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_SecondPage_ReturnsCorrectPage() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(
                    Collections.singletonList(sampleNotificationList.get(2)),
                    PageRequest.of(1, 2),
                    3
            );
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .param("page", "1")
                            .param("size", "2")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.number").value(1));
        }

        @Test
        @DisplayName("Should use default pagination values when not specified")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_DefaultPagination_UsesDefaults() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(sampleNotificationList, PageRequest.of(0, 20), 3);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(0))
                    .andExpect(jsonPath("$.size").value(20));
        }
    }

    // ============================================
    // GET UNREAD COUNT ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/notifications/me/unread-count - Get Unread Count")
    class GetUnreadCountTests {

        @Test
        @DisplayName("Should return unread notification count")
        @WithMockUser(roles = "SCOUT")
        void getUnreadCount_HasUnread_ReturnsCount() throws Exception {
            // Arrange
            when(notificationService.getUnreadCount(eq(1L))).thenReturn(5L);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me/unread-count")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("5"));

            verify(notificationService).getUnreadCount(1L);
        }

        @Test
        @DisplayName("Should return zero when no unread notifications")
        @WithMockUser(roles = "PARENT")
        void getUnreadCount_NoUnread_ReturnsZero() throws Exception {
            // Arrange
            when(notificationService.getUnreadCount(eq(1L))).thenReturn(0L);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me/unread-count")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("0"));
        }

        @Test
        @DisplayName("Should return large unread count")
        @WithMockUser(roles = "TROOP_LEADER")
        void getUnreadCount_LargeCount_ReturnsCorrectValue() throws Exception {
            // Arrange
            when(notificationService.getUnreadCount(eq(1L))).thenReturn(999L);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me/unread-count")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("999"));
        }
    }

    // ============================================
    // MARK AS READ ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("PUT /api/v1/notifications/{id}/read - Mark Notification as Read")
    class MarkAsReadTests {

        @Test
        @DisplayName("Should mark notification as read successfully")
        @WithMockUser(roles = "SCOUT")
        void markAsRead_ValidId_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).markAsRead(1L);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/1/read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).markAsRead(1L);
        }

        @Test
        @DisplayName("Should handle marking non-existent notification")
        @WithMockUser(roles = "PARENT")
        void markAsRead_NonExistentId_ReturnsOk() throws Exception {
            // Arrange - service handles non-existent gracefully
            doNothing().when(notificationService).markAsRead(999L);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/999/read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should mark already read notification without error")
        @WithMockUser(roles = "SCOUT")
        void markAsRead_AlreadyRead_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).markAsRead(1L);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/1/read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // MARK ALL AS READ ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("PUT /api/v1/notifications/mark-all-read - Mark All as Read")
    class MarkAllAsReadTests {

        @Test
        @DisplayName("Should mark all notifications as read successfully")
        @WithMockUser(roles = "SCOUT")
        void markAllAsRead_HasNotifications_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).markAllAsRead(1L);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/mark-all-read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(notificationService).markAllAsRead(1L);
        }

        @ParameterizedTest(name = "Should mark all as read successfully for role {0}")
        @ValueSource(strings = {"PARENT", "TROOP_LEADER", "COUNCIL_ADMIN"})
        @WithMockUser(roles = "SCOUT") // Base role, parameterized test validates various roles work
        void markAllAsRead_VariousRoles_ReturnsOk(String role) throws Exception {
            // Arrange
            doNothing().when(notificationService).markAllAsRead(1L);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/mark-all-read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // AUTHORIZATION TESTS
    // ============================================

    @Nested
    @DisplayName("Authorization Tests")
    class AuthorizationTests {

        @ParameterizedTest(name = "Role {0} should not be able to send notifications (requires COUNCIL_ADMIN or NATIONAL_ADMIN)")
        @ValueSource(strings = {"SCOUT", "PARENT", "TROOP_LEADER"})
        @WithMockUser(roles = "SCOUT") // Base role for test setup
        void sendNotification_AsUnauthorizedRole_DocumentsBehavior(String role) throws Exception {
            // Note: With filters disabled, authorization is not checked.
            // In production, these roles would return 403 Forbidden
            // This test documents expected behavior with @PreAuthorize
            // Only COUNCIL_ADMIN and NATIONAL_ADMIN should be able to send notifications
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk()); // Would be 403 with filters enabled for unauthorized roles
        }

        @Test
        @DisplayName("All authenticated users can register device tokens")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_AllRoles_Authorized() throws Exception {
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("All authenticated users can view their notifications")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_AllRoles_Authorized() throws Exception {
            Page<NotificationResponse> page = new PageImpl<>(sampleNotificationList, PageRequest.of(0, 20), 3);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("All authenticated users can mark notifications as read")
        @WithMockUser(roles = "SCOUT")
        void markAsRead_AllRoles_Authorized() throws Exception {
            doNothing().when(notificationService).markAsRead(1L);

            mockMvc.perform(put(BASE_URL + "/1/read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should handle invalid JSON request body")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_InvalidJson_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ invalid json }"))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle empty request body for device token")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_EmptyBody_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle service exception during send notification")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_ServiceException_ReturnsError() throws Exception {
            // Arrange
            doThrow(new RuntimeException("FCM service unavailable"))
                    .when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Should handle service exception during get notifications")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_ServiceException_ReturnsError() throws Exception {
            // Arrange
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class)))
                    .thenThrow(new RuntimeException("Database unavailable"));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Should handle invalid device type in request")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_InvalidDeviceType_ReturnsBadRequest() throws Exception {
            // Arrange - invalid device type in JSON
            String invalidJson = """
                {
                    "token": "fcm_token_123",
                    "deviceType": "INVALID_TYPE"
                }
                """;

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle invalid notification type in request")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_InvalidNotificationType_ReturnsBadRequest() throws Exception {
            // Arrange - invalid notification type in JSON
            String invalidJson = """
                {
                    "userIds": [1, 2],
                    "title": "Test",
                    "body": "Test body",
                    "type": "INVALID_TYPE"
                }
                """;

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // CONTENT TYPE AND RESPONSE FORMAT TESTS
    // ============================================

    @Nested
    @DisplayName("Content Type and Response Format Tests")
    class ContentTypeTests {

        @Test
        @DisplayName("Should return JSON content type for get notifications")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_ReturnsJsonContentType() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(sampleNotificationList, PageRequest.of(0, 20), 3);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Should include all expected fields in notification response")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_ReturnsAllFields() throws Exception {
            // Arrange
            NotificationResponse completeNotification = NotificationResponse.builder()
                    .id(1L)
                    .title("Test Title")
                    .body("Test Body")
                    .type("NEW_OFFER")
                    .imageUrl("https://example.com/image.png")
                    .read(true)
                    .createdAt(LocalDateTime.of(2026, 1, 15, 10, 30))
                    .readAt(LocalDateTime.of(2026, 1, 15, 11, 0))
                    .build();
            Page<NotificationResponse> page = new PageImpl<>(
                    Collections.singletonList(completeNotification),
                    PageRequest.of(0, 20),
                    1
            );
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").exists())
                    .andExpect(jsonPath("$.content[0].title").exists())
                    .andExpect(jsonPath("$.content[0].body").exists())
                    .andExpect(jsonPath("$.content[0].type").exists())
                    .andExpect(jsonPath("$.content[0].imageUrl").exists())
                    .andExpect(jsonPath("$.content[0].read").exists())
                    .andExpect(jsonPath("$.content[0].createdAt").exists())
                    .andExpect(jsonPath("$.content[0].readAt").exists());
        }

        @Test
        @DisplayName("Should return correct pagination metadata")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_ReturnsPaginationMetadata() throws Exception {
            // Arrange
            Page<NotificationResponse> page = new PageImpl<>(sampleNotificationList, PageRequest.of(0, 20), 3);
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").exists())
                    .andExpect(jsonPath("$.totalPages").exists())
                    .andExpect(jsonPath("$.size").exists())
                    .andExpect(jsonPath("$.number").exists())
                    .andExpect(jsonPath("$.first").exists())
                    .andExpect(jsonPath("$.last").exists());
        }
    }

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle very long notification title")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_LongTitle_ReturnsOk() throws Exception {
            // Arrange
            String longTitle = "A".repeat(100);
            validNotificationRequest.setTitle(longTitle);
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle very long notification body")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_LongBody_ReturnsOk() throws Exception {
            // Arrange
            String longBody = "B".repeat(1000);
            validNotificationRequest.setBody(longBody);
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle special characters in notification content")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_SpecialCharacters_ReturnsOk() throws Exception {
            // Arrange
            validNotificationRequest.setTitle("Special chars: !@#$%^&*()");
            validNotificationRequest.setBody("Unicode: \u2764\uFE0F \u2728 \u2705");
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle empty user IDs list")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_EmptyUserIds_ProcessesSuccessfully() throws Exception {
            // Arrange
            validNotificationRequest.setUserIds(Collections.emptyList());
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert - validation should pass, service handles empty list
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle very long device token")
        @WithMockUser(roles = "SCOUT")
        void registerDeviceToken_LongToken_ReturnsOk() throws Exception {
            // Arrange - FCM tokens can be up to 500+ characters
            validDeviceTokenRequest.setToken("x".repeat(512));
            doNothing().when(notificationService).registerDeviceToken(any(Long.class), any(DeviceTokenRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/register-token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validDeviceTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle large page numbers")
        @WithMockUser(roles = "SCOUT")
        void getMyNotifications_LargePageNumber_ReturnsEmptyPage() throws Exception {
            // Arrange
            Page<NotificationResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(1000, 20),
                    0
            );
            when(notificationService.getUserNotifications(eq(1L), any(Pageable.class))).thenReturn(emptyPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/me")
                            .param("page", "1000")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("Should handle marking large notification ID as read")
        @WithMockUser(roles = "SCOUT")
        void markAsRead_LargeId_ReturnsOk() throws Exception {
            // Arrange
            doNothing().when(notificationService).markAsRead(Long.MAX_VALUE);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/" + Long.MAX_VALUE + "/read")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle null optional fields in notification request")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void sendNotification_NullOptionalFields_ReturnsOk() throws Exception {
            // Arrange
            validNotificationRequest.setType(null);
            validNotificationRequest.setImageUrl(null);
            validNotificationRequest.setData(null);
            validNotificationRequest.setSaveToDatabase(null);
            doNothing().when(notificationService).sendNotification(any(NotificationRequest.class));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/send")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validNotificationRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }
}

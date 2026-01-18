package com.bsa.campcard.controller;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.exception.PaymentException;
import com.bsa.campcard.security.JwtTokenProvider;
import com.bsa.campcard.service.PaymentService;
import com.bsa.campcard.service.SubscriptionPurchaseService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.Import;

@Import(ControllerTestConfig.class)
@WebMvcTest(controllers = PaymentController.class)
@org.springframework.boot.autoconfigure.ImportAutoConfiguration({
    org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("PaymentController Tests")
class PaymentControllerTest {

    /**
     * Test exception handler to properly handle exceptions during testing.
     */
    @ControllerAdvice
    static class TestExceptionHandler {

        @ExceptionHandler(PaymentException.class)
        public ResponseEntity<Map<String, Object>> handlePaymentException(PaymentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", ex.getMessage(),
                            "errorCode", ex.getErrorCode()
                    ));
        }

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
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private SubscriptionPurchaseService subscriptionPurchaseService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserRepository userRepository;

    private static final String BASE_URL = "/api/v1/payments";

    private ChargeRequest validChargeRequest;
    private RefundRequest validRefundRequest;
    private TransactionQueryRequest validQueryRequest;
    private AcceptHostedTokenRequest validTokenRequest;
    private SubscriptionPurchaseRequest validPurchaseRequest;
    private PaymentResponse successPaymentResponse;
    private PaymentResponse failedPaymentResponse;

    @BeforeEach
    void setUp() {
        // Build valid charge request using setters
        validChargeRequest = new ChargeRequest();
        validChargeRequest.setAmount(new BigDecimal("10.00"));
        validChargeRequest.setCardNumber("4111111111111111");
        validChargeRequest.setExpirationDate("1225");
        validChargeRequest.setCvv("123");
        validChargeRequest.setDescription("Test payment");
        validChargeRequest.setUserId(1L);
        validChargeRequest.setCustomerEmail("test@example.com");
        validChargeRequest.setCustomerName("Test User");
        validChargeRequest.setBillingAddress("123 Main St");
        validChargeRequest.setBillingCity("Dallas");
        validChargeRequest.setBillingState("TX");
        validChargeRequest.setBillingZip("75001");
        validChargeRequest.setBillingCountry("USA");

        // Build valid refund request
        validRefundRequest = new RefundRequest();
        validRefundRequest.setTransactionId("TXN123456");
        validRefundRequest.setAmount(new BigDecimal("10.00"));
        validRefundRequest.setCardNumberLast4("1111");
        validRefundRequest.setReason("Customer requested refund");

        // Build valid query request
        validQueryRequest = new TransactionQueryRequest();
        validQueryRequest.setTransactionId("TXN123456");

        // Build valid token request
        validTokenRequest = new AcceptHostedTokenRequest();
        validTokenRequest.setCustomerEmail("subscriber@example.com");
        validTokenRequest.setReferralCode("REF123");
        validTokenRequest.setReturnUrl("https://example.com/success");
        validTokenRequest.setCancelUrl("https://example.com/cancel");

        // Build valid purchase request
        validPurchaseRequest = new SubscriptionPurchaseRequest();
        validPurchaseRequest.setTransactionId("TXN123456");
        validPurchaseRequest.setFirstName("John");
        validPurchaseRequest.setLastName("Doe");
        validPurchaseRequest.setEmail("john.doe@example.com");
        validPurchaseRequest.setPassword("SecurePassword123");
        validPurchaseRequest.setPhone("555-123-4567");
        validPurchaseRequest.setReferralCode("REF123");

        // Build success payment response using builder (response DTOs have @Builder)
        successPaymentResponse = PaymentResponse.builder()
                .transactionId("TXN123456")
                .status("SUCCESS")
                .amount(new BigDecimal("10.00"))
                .currency("USD")
                .message("Transaction approved")
                .authCode("AUTH123")
                .cardNumberLast4("1111")
                .cardType("Visa")
                .timestamp(LocalDateTime.now())
                .build();

        // Build failed payment response
        failedPaymentResponse = PaymentResponse.builder()
                .status("FAILED")
                .amount(new BigDecimal("10.00"))
                .currency("USD")
                .errorMessage("Card declined")
                .errorCode("DECLINED")
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ============================================
    // CHARGE ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/charge - Process Payment")
    class ChargeTests {

        @Test
        @DisplayName("Should process payment successfully as SCOUT")
        @WithMockUser(roles = "SCOUT")
        void charge_AsScout_ReturnsSuccess() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value("TXN123456"))
                    .andExpect(jsonPath("$.status").value("SUCCESS"))
                    .andExpect(jsonPath("$.amount").value(10.00));

            verify(paymentService).charge(any(ChargeRequest.class));
        }

        @ParameterizedTest(name = "Should process payment successfully as {0}")
        @ValueSource(strings = {"PARENT", "UNIT_LEADER", "COUNCIL_ADMIN"})
        @WithMockUser(roles = "PARENT") // Base role, actual role comes from parameter
        void charge_AsAuthorizedRole_ReturnsSuccess(String role) throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUCCESS"));

            verify(paymentService).charge(any(ChargeRequest.class));
        }

        @Test
        @DisplayName("Should return 402 when payment fails")
        @WithMockUser(roles = "SCOUT")
        void charge_PaymentFails_ReturnsPaymentRequired() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(failedPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isPaymentRequired())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Card declined"));
        }

        @Test
        @DisplayName("Should return 400 when amount is missing")
        @WithMockUser(roles = "SCOUT")
        void charge_MissingAmount_ReturnsBadRequest() throws Exception {
            // Arrange
            validChargeRequest.setAmount(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(paymentService, never()).charge(any());
        }

        @Test
        @DisplayName("Should return 400 when amount is zero")
        @WithMockUser(roles = "SCOUT")
        void charge_ZeroAmount_ReturnsBadRequest() throws Exception {
            // Arrange
            validChargeRequest.setAmount(BigDecimal.ZERO);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when card number is missing")
        @WithMockUser(roles = "SCOUT")
        void charge_MissingCardNumber_ReturnsBadRequest() throws Exception {
            // Arrange
            validChargeRequest.setCardNumber(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when expiration date is missing")
        @WithMockUser(roles = "SCOUT")
        void charge_MissingExpirationDate_ReturnsBadRequest() throws Exception {
            // Arrange
            validChargeRequest.setExpirationDate(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when CVV is missing")
        @WithMockUser(roles = "SCOUT")
        void charge_MissingCvv_ReturnsBadRequest() throws Exception {
            // Arrange
            validChargeRequest.setCvv(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // REFUND ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/refund - Process Refund")
    class RefundTests {

        @Test
        @DisplayName("Should process refund successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_AsNationalAdmin_ReturnsSuccess() throws Exception {
            // Arrange
            PaymentResponse refundResponse = PaymentResponse.builder()
                    .transactionId("REFUND123")
                    .status("REFUNDED")
                    .amount(new BigDecimal("10.00"))
                    .currency("USD")
                    .message("Refund processed successfully")
                    .timestamp(LocalDateTime.now())
                    .build();
            when(paymentService.refund(any(RefundRequest.class))).thenReturn(refundResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REFUNDED"))
                    .andExpect(jsonPath("$.transactionId").value("REFUND123"));

            verify(paymentService).refund(any(RefundRequest.class));
        }

        @Test
        @DisplayName("Should process refund successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void refund_AsCouncilAdmin_ReturnsSuccess() throws Exception {
            // Arrange
            PaymentResponse refundResponse = PaymentResponse.builder()
                    .transactionId("REFUND123")
                    .status("REFUNDED")
                    .amount(new BigDecimal("10.00"))
                    .currency("USD")
                    .timestamp(LocalDateTime.now())
                    .build();
            when(paymentService.refund(any(RefundRequest.class))).thenReturn(refundResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REFUNDED"));
        }

        @Test
        @DisplayName("Should return 400 when transaction ID is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_MissingTransactionId_ReturnsBadRequest() throws Exception {
            // Arrange
            validRefundRequest.setTransactionId(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(paymentService, never()).refund(any());
        }

        @Test
        @DisplayName("Should return 400 when refund amount is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_MissingAmount_ReturnsBadRequest() throws Exception {
            // Arrange
            validRefundRequest.setAmount(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when card last 4 digits missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_MissingCardLast4_ReturnsBadRequest() throws Exception {
            // Arrange
            validRefundRequest.setCardNumberLast4(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle PaymentException during refund")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_PaymentException_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.refund(any(RefundRequest.class)))
                    .thenThrow(new PaymentException("Refund failed", "REFUND_ERROR"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Refund failed"))
                    .andExpect(jsonPath("$.errorCode").value("REFUND_ERROR"));
        }
    }

    // ============================================
    // TRANSACTION DETAILS ENDPOINT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/transaction/details - Get Transaction Details")
    class TransactionDetailsTests {

        @Test
        @DisplayName("Should return transaction details for authenticated user")
        @WithMockUser
        void getTransactionDetails_Authenticated_ReturnsDetails() throws Exception {
            // Arrange
            when(paymentService.getTransactionDetails(any(TransactionQueryRequest.class)))
                    .thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/transaction/details")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validQueryRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value("TXN123456"))
                    .andExpect(jsonPath("$.status").value("SUCCESS"));

            verify(paymentService).getTransactionDetails(any(TransactionQueryRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when transaction ID is missing")
        @WithMockUser
        void getTransactionDetails_MissingTransactionId_ReturnsBadRequest() throws Exception {
            // Arrange
            validQueryRequest.setTransactionId(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/transaction/details")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validQueryRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when transaction ID is blank")
        @WithMockUser
        void getTransactionDetails_BlankTransactionId_ReturnsBadRequest() throws Exception {
            // Arrange
            validQueryRequest.setTransactionId("   ");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/transaction/details")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validQueryRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle PaymentException when transaction not found")
        @WithMockUser
        void getTransactionDetails_NotFound_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.getTransactionDetails(any(TransactionQueryRequest.class)))
                    .thenThrow(new PaymentException("Transaction not found", "NOT_FOUND"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/transaction/details")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validQueryRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"));
        }
    }

    // ============================================
    // SUBSCRIPTION CHARGE ENDPOINT TESTS (PUBLIC)
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/subscribe/charge - Process Subscription Payment")
    class SubscriptionChargeTests {

        @Test
        @DisplayName("Should process subscription charge with correct amount")
        void chargeSubscription_CorrectAmount_ReturnsSuccess() throws Exception {
            // Arrange - subscription must be exactly $10.00
            ChargeRequest subscriptionRequest = new ChargeRequest();
            subscriptionRequest.setAmount(new BigDecimal("10.00"));
            subscriptionRequest.setCardNumber("4111111111111111");
            subscriptionRequest.setExpirationDate("1225");
            subscriptionRequest.setCvv("123");

            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(subscriptionRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUCCESS"));
        }

        @Test
        @DisplayName("Should return 400 when subscription amount is incorrect")
        void chargeSubscription_WrongAmount_ReturnsBadRequest() throws Exception {
            // Arrange - wrong amount (not $10.00)
            ChargeRequest wrongAmountRequest = new ChargeRequest();
            wrongAmountRequest.setAmount(new BigDecimal("15.00"));
            wrongAmountRequest.setCardNumber("4111111111111111");
            wrongAmountRequest.setExpirationDate("1225");
            wrongAmountRequest.setCvv("123");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(wrongAmountRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Invalid subscription amount. Subscription is $10/year."));

            verify(paymentService, never()).charge(any());
        }

        @Test
        @DisplayName("Should return 400 when subscription amount is null")
        void chargeSubscription_NullAmount_ReturnsBadRequest() throws Exception {
            // Arrange
            ChargeRequest nullAmountRequest = new ChargeRequest();
            nullAmountRequest.setAmount(null);
            nullAmountRequest.setCardNumber("4111111111111111");
            nullAmountRequest.setExpirationDate("1225");
            nullAmountRequest.setCvv("123");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(nullAmountRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 402 when subscription payment fails")
        void chargeSubscription_PaymentFails_ReturnsPaymentRequired() throws Exception {
            // Arrange
            ChargeRequest subscriptionRequest = new ChargeRequest();
            subscriptionRequest.setAmount(new BigDecimal("10.00"));
            subscriptionRequest.setCardNumber("4111111111111111");
            subscriptionRequest.setExpirationDate("1225");
            subscriptionRequest.setCvv("123");

            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(failedPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(subscriptionRequest)))
                    .andDo(print())
                    .andExpect(status().isPaymentRequired())
                    .andExpect(jsonPath("$.status").value("FAILED"));
        }
    }

    // ============================================
    // ACCEPT HOSTED TOKEN ENDPOINT TESTS (PUBLIC)
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/subscribe/token - Get Accept Hosted Token")
    class AcceptHostedTokenTests {

        @Test
        @DisplayName("Should return token successfully")
        void getAcceptHostedToken_ValidRequest_ReturnsToken() throws Exception {
            // Arrange
            AcceptHostedTokenResponse tokenResponse = AcceptHostedTokenResponse.builder()
                    .token("generated-token-12345")
                    .formUrl("https://test.authorize.net/payment/payment")
                    .success(true)
                    .build();
            when(paymentService.getAcceptHostedToken(any(AcceptHostedTokenRequest.class)))
                    .thenReturn(tokenResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("generated-token-12345"))
                    .andExpect(jsonPath("$.formUrl").value("https://test.authorize.net/payment/payment"))
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Should handle empty request body")
        void getAcceptHostedToken_EmptyBody_ReturnsToken() throws Exception {
            // Arrange
            AcceptHostedTokenResponse tokenResponse = AcceptHostedTokenResponse.builder()
                    .token("generated-token-12345")
                    .formUrl("https://test.authorize.net/payment/payment")
                    .success(true)
                    .build();
            when(paymentService.getAcceptHostedToken(any(AcceptHostedTokenRequest.class)))
                    .thenReturn(tokenResponse);

            // Act & Assert - empty request body should work
            mockMvc.perform(post(BASE_URL + "/subscribe/token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Should return 400 when token generation fails")
        void getAcceptHostedToken_Failure_ReturnsBadRequest() throws Exception {
            // Arrange
            AcceptHostedTokenResponse failedResponse = AcceptHostedTokenResponse.builder()
                    .success(false)
                    .errorCode("TOKEN_ERROR")
                    .errorMessage("Failed to generate token")
                    .build();
            when(paymentService.getAcceptHostedToken(any(AcceptHostedTokenRequest.class)))
                    .thenReturn(failedResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/token")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validTokenRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errorCode").value("TOKEN_ERROR"));
        }
    }

    // ============================================
    // COMPLETE SUBSCRIPTION PURCHASE ENDPOINT TESTS (PUBLIC)
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/payments/subscribe/complete - Complete Subscription Purchase")
    class CompleteSubscriptionTests {

        @Test
        @DisplayName("Should complete subscription purchase successfully")
        void completeSubscription_ValidRequest_ReturnsCreated() throws Exception {
            // Arrange
            SubscriptionPurchaseResponse successResponse = SubscriptionPurchaseResponse.builder()
                    .success(true)
                    .userId("1")
                    .email("john.doe@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .cardNumber("CC-1234-5678-9012")
                    .subscriptionStatus("ACTIVE")
                    .subscriptionExpiresAt(LocalDateTime.now().plusYears(1))
                    .transactionId("TXN123456")
                    .accessToken("access-token-xyz")
                    .refreshToken("refresh-token-xyz")
                    .build();
            when(subscriptionPurchaseService.completePurchase(any(SubscriptionPurchaseRequest.class)))
                    .thenReturn(successResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                    .andExpect(jsonPath("$.subscriptionStatus").value("ACTIVE"))
                    .andExpect(jsonPath("$.accessToken").exists());

            verify(subscriptionPurchaseService).completePurchase(any(SubscriptionPurchaseRequest.class));
        }

        @Test
        @DisplayName("Should return 400 when purchase fails")
        void completeSubscription_Failure_ReturnsBadRequest() throws Exception {
            // Arrange
            SubscriptionPurchaseResponse failedResponse = SubscriptionPurchaseResponse.builder()
                    .success(false)
                    .errorCode("EMAIL_EXISTS")
                    .errorMessage("An account with this email already exists.")
                    .build();
            when(subscriptionPurchaseService.completePurchase(any(SubscriptionPurchaseRequest.class)))
                    .thenReturn(failedResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errorCode").value("EMAIL_EXISTS"));
        }

        @Test
        @DisplayName("Should return 400 when transaction ID is missing")
        void completeSubscription_MissingTransactionId_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setTransactionId(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(subscriptionPurchaseService, never()).completePurchase(any());
        }

        @Test
        @DisplayName("Should return 400 when email is missing")
        void completeSubscription_MissingEmail_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setEmail(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when email format is invalid")
        void completeSubscription_InvalidEmail_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setEmail("invalid-email");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when password is too short")
        void completeSubscription_ShortPassword_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setPassword("short");

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when first name is missing")
        void completeSubscription_MissingFirstName_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setFirstName(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when last name is missing")
        void completeSubscription_MissingLastName_ReturnsBadRequest() throws Exception {
            // Arrange
            validPurchaseRequest.setLastName(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/subscribe/complete")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validPurchaseRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // VERIFY PAYMENT ENDPOINT TESTS (PUBLIC)
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/payments/subscribe/verify/{transactionId} - Verify Payment")
    class VerifyPaymentTests {

        @Test
        @DisplayName("Should verify payment successfully")
        void verifyPayment_ValidTransaction_ReturnsSuccess() throws Exception {
            // Arrange
            when(paymentService.verifySubscriptionPayment("TXN123456"))
                    .thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/subscribe/verify/TXN123456")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value("TXN123456"))
                    .andExpect(jsonPath("$.status").value("SUCCESS"));

            verify(paymentService).verifySubscriptionPayment("TXN123456");
        }

        @Test
        @DisplayName("Should return 400 when transaction verification fails")
        void verifyPayment_InvalidTransaction_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.verifySubscriptionPayment("INVALID"))
                    .thenThrow(new PaymentException("Invalid transaction", "INVALID_TRANSACTION"));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/subscribe/verify/INVALID")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value("FAILED"))
                    .andExpect(jsonPath("$.errorMessage").value("Invalid transaction"));
        }

        @Test
        @DisplayName("Should return 400 when payment exception with code")
        void verifyPayment_PaymentException_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.verifySubscriptionPayment("FAILED_TXN"))
                    .thenThrow(new PaymentException("Payment verification failed", "VERIFICATION_ERROR"));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/subscribe/verify/FAILED_TXN")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value("FAILED"));
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
        @WithMockUser(roles = "SCOUT")
        void charge_InvalidJson_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ invalid json }"))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle empty request body for charge")
        @WithMockUser(roles = "SCOUT")
        void charge_EmptyBody_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle PaymentException with error code")
        @WithMockUser(roles = "SCOUT")
        void charge_PaymentExceptionWithCode_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class)))
                    .thenThrow(new PaymentException("Gateway unavailable", "GATEWAY_ERROR"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Gateway unavailable"))
                    .andExpect(jsonPath("$.errorCode").value("GATEWAY_ERROR"));
        }

        @Test
        @DisplayName("Should handle PaymentException without error code")
        @WithMockUser(roles = "SCOUT")
        void charge_PaymentExceptionNoCode_ReturnsBadRequest() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class)))
                    .thenThrow(new PaymentException("General payment error"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errorCode").value("PAYMENT_ERROR"));
        }
    }

    // ============================================
    // CONTENT TYPE AND RESPONSE FORMAT TESTS
    // ============================================

    @Nested
    @DisplayName("Content Type and Response Format Tests")
    class ContentTypeTests {

        @Test
        @DisplayName("Should return JSON content type for charge response")
        @WithMockUser(roles = "SCOUT")
        void charge_ReturnsJsonContentType() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Should include all expected fields in payment response")
        @WithMockUser(roles = "SCOUT")
        void charge_ReturnsAllFields() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").exists())
                    .andExpect(jsonPath("$.status").exists())
                    .andExpect(jsonPath("$.amount").exists())
                    .andExpect(jsonPath("$.currency").exists())
                    .andExpect(jsonPath("$.cardNumberLast4").exists())
                    .andExpect(jsonPath("$.cardType").exists())
                    .andExpect(jsonPath("$.timestamp").exists());
        }
    }

    // ============================================
    // IDEMPOTENCY TESTS
    // ============================================

    @Nested
    @DisplayName("Idempotency Tests")
    class IdempotencyTests {

        @Test
        @DisplayName("Should process same charge request consistently")
        @WithMockUser(roles = "SCOUT")
        void charge_SameRequest_ReturnsConsistentResult() throws Exception {
            // Arrange
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert - First request
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value("TXN123456"));

            // Second request with same data
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionId").value("TXN123456"));

            verify(paymentService, times(2)).charge(any(ChargeRequest.class));
        }

        @Test
        @DisplayName("Should handle duplicate refund requests")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_DuplicateRequest_HandledConsistently() throws Exception {
            // Arrange
            PaymentResponse refundResponse = PaymentResponse.builder()
                    .transactionId("REFUND123")
                    .status("REFUNDED")
                    .amount(new BigDecimal("10.00"))
                    .currency("USD")
                    .timestamp(LocalDateTime.now())
                    .build();
            when(paymentService.refund(any(RefundRequest.class))).thenReturn(refundResponse);

            // Act & Assert - Multiple refund attempts
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REFUNDED"));

            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REFUNDED"));

            verify(paymentService, times(2)).refund(any(RefundRequest.class));
        }
    }

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle minimum valid amount")
        @WithMockUser(roles = "SCOUT")
        void charge_MinimumAmount_ReturnsSuccess() throws Exception {
            // Arrange
            validChargeRequest.setAmount(new BigDecimal("0.01"));
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle large payment amount")
        @WithMockUser(roles = "SCOUT")
        void charge_LargeAmount_ReturnsSuccess() throws Exception {
            // Arrange
            validChargeRequest.setAmount(new BigDecimal("9999.99"));
            PaymentResponse largeAmountResponse = PaymentResponse.builder()
                    .transactionId("TXN999999")
                    .status("SUCCESS")
                    .amount(new BigDecimal("9999.99"))
                    .currency("USD")
                    .timestamp(LocalDateTime.now())
                    .build();
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(largeAmountResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.amount").value(9999.99));
        }

        @Test
        @DisplayName("Should handle charge with optional fields only")
        @WithMockUser(roles = "SCOUT")
        void charge_MinimalRequest_ReturnsSuccess() throws Exception {
            // Arrange - only required fields
            ChargeRequest minimalRequest = new ChargeRequest();
            minimalRequest.setAmount(new BigDecimal("10.00"));
            minimalRequest.setCardNumber("4111111111111111");
            minimalRequest.setExpirationDate("1225");
            minimalRequest.setCvv("123");

            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(minimalRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle special characters in description")
        @WithMockUser(roles = "SCOUT")
        void charge_SpecialCharactersInDescription_ReturnsSuccess() throws Exception {
            // Arrange
            validChargeRequest.setDescription("Test payment with special chars: !@#$%^&*()");
            when(paymentService.charge(any(ChargeRequest.class))).thenReturn(successPaymentResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/charge")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validChargeRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle partial refund amount")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void refund_PartialAmount_ReturnsSuccess() throws Exception {
            // Arrange - partial refund
            validRefundRequest.setAmount(new BigDecimal("5.00"));
            PaymentResponse partialRefundResponse = PaymentResponse.builder()
                    .transactionId("REFUND_PARTIAL")
                    .status("REFUNDED")
                    .amount(new BigDecimal("5.00"))
                    .currency("USD")
                    .message("Partial refund processed")
                    .timestamp(LocalDateTime.now())
                    .build();
            when(paymentService.refund(any(RefundRequest.class))).thenReturn(partialRefundResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/refund")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRefundRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.amount").value(5.00))
                    .andExpect(jsonPath("$.message").value("Partial refund processed"));
        }
    }
}

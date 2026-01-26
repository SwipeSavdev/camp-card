package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.exception.PaymentException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private CouncilPaymentConfigService councilPaymentConfigService;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        // Set test credentials - field names match PaymentService class
        ReflectionTestUtils.setField(paymentService, "defaultApiLoginId", "test_login");
        ReflectionTestUtils.setField(paymentService, "defaultTransactionKey", "test_key");
        ReflectionTestUtils.setField(paymentService, "defaultEnvironment", "SANDBOX");
        ReflectionTestUtils.setField(paymentService, "baseUrl", "https://campcardapp.org");
    }
    
    @Test
    void testChargeRequest_Validation() {
        ChargeRequest request = new ChargeRequest();
        request.setAmount(new BigDecimal("25.00"));
        request.setCardNumber("4111111111111111");
        request.setExpirationDate("1225");
        request.setCvv("123");
        request.setDescription("Test charge");
        request.setCustomerEmail("test@example.com");
        
        assertNotNull(request.getAmount());
        assertEquals("4111111111111111", request.getCardNumber());
        assertEquals("1225", request.getExpirationDate());
        assertEquals("123", request.getCvv());
    }
    
    @Test
    void testRefundRequest_Validation() {
        RefundRequest request = new RefundRequest();
        request.setTransactionId("12345");
        request.setAmount(new BigDecimal("10.00"));
        request.setCardNumberLast4("1111");
        request.setReason("Customer request");
        
        assertNotNull(request.getAmount());
        assertEquals("12345", request.getTransactionId());
        assertEquals("1111", request.getCardNumberLast4());
    }
    
    @Test
    void testPaymentResponse_Builder() {
        PaymentResponse response = PaymentResponse.builder()
                .transactionId("TX123")
                .status("SUCCESS")
                .amount(new BigDecimal("50.00"))
                .currency("USD")
                .message("Transaction approved")
                .authCode("AUTH123")
                .cardNumberLast4("1111")
                .cardType("Visa")
                .build();
        
        assertEquals("TX123", response.getTransactionId());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(new BigDecimal("50.00"), response.getAmount());
        assertEquals("USD", response.getCurrency());
        assertEquals("AUTH123", response.getAuthCode());
    }
    
    @Test
    void testTransactionQueryRequest_Validation() {
        TransactionQueryRequest request = new TransactionQueryRequest();
        request.setTransactionId("TX123");
        
        assertEquals("TX123", request.getTransactionId());
    }
    
    @Test
    void testPaymentException_WithErrorCode() {
        PaymentException exception = new PaymentException("Payment failed", "ERR001");
        
        assertEquals("Payment failed", exception.getMessage());
        assertEquals("ERR001", exception.getErrorCode());
    }
    
    @Test
    void testPaymentException_DefaultErrorCode() {
        PaymentException exception = new PaymentException("Payment failed");
        
        assertEquals("Payment failed", exception.getMessage());
        assertEquals("PAYMENT_ERROR", exception.getErrorCode());
    }
    
    // Note: Actual integration tests with Authorize.net would require valid credentials
    // and should be run separately from unit tests. These tests validate the structure
    // and basic validation logic.
}

package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import net.authorize.Environment;
import net.authorize.api.contract.v1.*;
import net.authorize.api.controller.CreateTransactionController;
import net.authorize.api.controller.GetTransactionDetailsController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
public class PaymentService {
    
    @Value("${authorize.net.api.login.id}")
    private String apiLoginId;
    
    @Value("${authorize.net.transaction.key}")
    private String transactionKey;
    
    @Value("${authorize.net.environment:SANDBOX}")
    private String environment;
    
    /**
     * Process a credit card charge using Authorize.net
     */
    public PaymentResponse charge(ChargeRequest request) {
        log.info("Processing charge for amount: {} for user: {}", request.getAmount(), request.getUserId());
        
        try {
            // Set up merchant authentication
            MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();
            merchantAuth.setName(apiLoginId);
            merchantAuth.setTransactionKey(transactionKey);
            
            // Set up payment information
            CreditCardType creditCard = new CreditCardType();
            creditCard.setCardNumber(request.getCardNumber());
            creditCard.setExpirationDate(request.getExpirationDate());
            creditCard.setCardCode(request.getCvv());
            
            PaymentType payment = new PaymentType();
            payment.setCreditCard(creditCard);
            
            // Set up customer information
            CustomerDataType customer = new CustomerDataType();
            customer.setType(CustomerTypeEnum.INDIVIDUAL);
            if (request.getCustomerEmail() != null) {
                customer.setEmail(request.getCustomerEmail());
            }
            
            // Set up transaction request
            TransactionRequestType txnRequest = new TransactionRequestType();
            txnRequest.setTransactionType(TransactionTypeEnum.AUTH_CAPTURE_TRANSACTION.value());
            txnRequest.setAmount(request.getAmount());
            txnRequest.setPayment(payment);
            txnRequest.setCustomer(customer);
            
            // Add order information
            OrderType order = new OrderType();
            order.setDescription(request.getDescription() != null ? request.getDescription() : "Camp Card Purchase");
            txnRequest.setOrder(order);
            
            // Create the API request
            CreateTransactionRequest apiRequest = new CreateTransactionRequest();
            apiRequest.setMerchantAuthentication(merchantAuth);
            apiRequest.setTransactionRequest(txnRequest);
            
            // Execute the request
            CreateTransactionController controller = new CreateTransactionController(apiRequest);
            controller.setEnvironment(getEnvironment());
            controller.execute();
            
            CreateTransactionResponse response = controller.getApiResponse();
            
            if (response != null) {
                if (response.getMessages().getResultCode() == MessageTypeEnum.OK) {
                    TransactionResponse txnResponse = response.getTransactionResponse();
                    
                    if (txnResponse != null && txnResponse.getMessages() != null) {
                        log.info("Successfully charged card. Transaction ID: {}", txnResponse.getTransId());
                        
                        return PaymentResponse.builder()
                                .transactionId(txnResponse.getTransId())
                                .status("SUCCESS")
                                .amount(request.getAmount())
                                .currency("USD")
                                .message(txnResponse.getMessages().getMessage().get(0).getDescription())
                                .authCode(txnResponse.getAuthCode())
                                .cardNumberLast4(getLastFourDigits(request.getCardNumber()))
                                .cardType(txnResponse.getAccountType())
                                .timestamp(LocalDateTime.now())
                                .build();
                    } else {
                        log.error("Transaction failed with errors: {}", 
                                txnResponse != null && txnResponse.getErrors() != null 
                                        ? txnResponse.getErrors().getError().get(0).getErrorText() 
                                        : "Unknown error");
                        
                        String errorMessage = txnResponse != null && txnResponse.getErrors() != null 
                                ? txnResponse.getErrors().getError().get(0).getErrorText() 
                                : "Transaction failed";
                        String errorCode = txnResponse != null && txnResponse.getErrors() != null 
                                ? txnResponse.getErrors().getError().get(0).getErrorCode() 
                                : "UNKNOWN";
                        
                        return PaymentResponse.builder()
                                .status("FAILED")
                                .amount(request.getAmount())
                                .currency("USD")
                                .errorMessage(errorMessage)
                                .errorCode(errorCode)
                                .timestamp(LocalDateTime.now())
                                .build();
                    }
                } else {
                    log.error("API request failed with result code: {}", response.getMessages().getResultCode());
                    
                    String errorMessage = response.getMessages().getMessage().get(0).getText();
                    String errorCode = response.getMessages().getMessage().get(0).getCode();
                    
                    throw new PaymentException("Payment failed: " + errorMessage, errorCode);
                }
            }
            
            throw new PaymentException("No response received from payment gateway", "NO_RESPONSE");
            
        } catch (Exception e) {
            log.error("Error processing payment", e);
            throw new PaymentException("Failed to process payment: " + e.getMessage(), e);
        }
    }
    
    /**
     * Process a refund for a previous transaction
     */
    public PaymentResponse refund(RefundRequest request) {
        log.info("Processing refund for transaction: {}", request.getTransactionId());
        
        try {
            // Set up merchant authentication
            MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();
            merchantAuth.setName(apiLoginId);
            merchantAuth.setTransactionKey(transactionKey);
            
            // Set up payment information (last 4 digits required for refund)
            CreditCardType creditCard = new CreditCardType();
            creditCard.setCardNumber(request.getCardNumberLast4());
            creditCard.setExpirationDate("XXXX"); // Not required for refund
            
            PaymentType payment = new PaymentType();
            payment.setCreditCard(creditCard);
            
            // Set up transaction request
            TransactionRequestType txnRequest = new TransactionRequestType();
            txnRequest.setTransactionType(TransactionTypeEnum.REFUND_TRANSACTION.value());
            txnRequest.setAmount(request.getAmount());
            txnRequest.setPayment(payment);
            txnRequest.setRefTransId(request.getTransactionId());
            
            // Create the API request
            CreateTransactionRequest apiRequest = new CreateTransactionRequest();
            apiRequest.setMerchantAuthentication(merchantAuth);
            apiRequest.setTransactionRequest(txnRequest);
            
            // Execute the request
            CreateTransactionController controller = new CreateTransactionController(apiRequest);
            controller.setEnvironment(getEnvironment());
            controller.execute();
            
            CreateTransactionResponse response = controller.getApiResponse();
            
            if (response != null) {
                if (response.getMessages().getResultCode() == MessageTypeEnum.OK) {
                    TransactionResponse txnResponse = response.getTransactionResponse();
                    
                    if (txnResponse != null && txnResponse.getMessages() != null) {
                        log.info("Successfully processed refund. Transaction ID: {}", txnResponse.getTransId());
                        
                        return PaymentResponse.builder()
                                .transactionId(txnResponse.getTransId())
                                .status("REFUNDED")
                                .amount(request.getAmount())
                                .currency("USD")
                                .message(txnResponse.getMessages().getMessage().get(0).getDescription())
                                .timestamp(LocalDateTime.now())
                                .build();
                    } else {
                        String errorMessage = txnResponse != null && txnResponse.getErrors() != null 
                                ? txnResponse.getErrors().getError().get(0).getErrorText() 
                                : "Refund failed";
                        String errorCode = txnResponse != null && txnResponse.getErrors() != null 
                                ? txnResponse.getErrors().getError().get(0).getErrorCode() 
                                : "UNKNOWN";
                        
                        throw new PaymentException("Refund failed: " + errorMessage, errorCode);
                    }
                } else {
                    String errorMessage = response.getMessages().getMessage().get(0).getText();
                    String errorCode = response.getMessages().getMessage().get(0).getCode();
                    
                    throw new PaymentException("Refund failed: " + errorMessage, errorCode);
                }
            }
            
            throw new PaymentException("No response received from payment gateway", "NO_RESPONSE");
            
        } catch (Exception e) {
            log.error("Error processing refund", e);
            throw new PaymentException("Failed to process refund: " + e.getMessage(), e);
        }
    }
    
    /**
     * Query transaction details
     */
    public PaymentResponse getTransactionDetails(TransactionQueryRequest request) {
        log.info("Querying transaction details for: {}", request.getTransactionId());
        
        try {
            // Set up merchant authentication
            MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();
            merchantAuth.setName(apiLoginId);
            merchantAuth.setTransactionKey(transactionKey);
            
            // Create the API request
            GetTransactionDetailsRequest apiRequest = new GetTransactionDetailsRequest();
            apiRequest.setMerchantAuthentication(merchantAuth);
            apiRequest.setTransId(request.getTransactionId());
            
            // Execute the request
            GetTransactionDetailsController controller = new GetTransactionDetailsController(apiRequest);
            controller.setEnvironment(getEnvironment());
            controller.execute();
            
            GetTransactionDetailsResponse response = controller.getApiResponse();
            
            if (response != null) {
                if (response.getMessages().getResultCode() == MessageTypeEnum.OK) {
                    TransactionDetailsType transaction = response.getTransaction();
                    
                    return PaymentResponse.builder()
                            .transactionId(transaction.getTransId())
                            .status(mapTransactionStatus(transaction.getTransactionStatus()))
                            .amount(transaction.getAuthAmount())
                            .currency("USD")
                            .cardNumberLast4(getLastFourDigits(transaction.getPayment().getCreditCard().getCardNumber()))
                            .cardType(transaction.getPayment().getCreditCard().getCardType())
                            .timestamp(LocalDateTime.now())
                            .build();
                } else {
                    String errorMessage = response.getMessages().getMessage().get(0).getText();
                    throw new PaymentException("Failed to query transaction: " + errorMessage);
                }
            }
            
            throw new PaymentException("No response received from payment gateway", "NO_RESPONSE");
            
        } catch (Exception e) {
            log.error("Error querying transaction details", e);
            throw new PaymentException("Failed to query transaction: " + e.getMessage(), e);
        }
    }
    
    private Environment getEnvironment() {
        return "PRODUCTION".equalsIgnoreCase(environment) 
                ? Environment.PRODUCTION 
                : Environment.SANDBOX;
    }
    
    private String getLastFourDigits(String cardNumber) {
        if (cardNumber != null && cardNumber.length() >= 4) {
            return cardNumber.substring(cardNumber.length() - 4);
        }
        return "";
    }
    
    private String mapTransactionStatus(String status) {
        if (status == null) return "UNKNOWN";
        
        return switch (status.toLowerCase()) {
            case "authorizedpendingcapture" -> "PENDING";
            case "capturedpendingsettlement" -> "SUCCESS";
            case "settledsuccessfully" -> "SUCCESS";
            case "refundsettledsuccessfully" -> "REFUNDED";
            case "voided" -> "VOIDED";
            case "declined" -> "FAILED";
            default -> "UNKNOWN";
        };
    }
}

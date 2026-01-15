package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import net.authorize.Environment;
import net.authorize.api.contract.v1.*;
import net.authorize.api.controller.CreateTransactionController;
import net.authorize.api.controller.GetHostedPaymentPageController;
import net.authorize.api.controller.GetTransactionDetailsController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    // Static subscription price for web purchases
    public static final BigDecimal WEB_SUBSCRIPTION_PRICE = new BigDecimal("10.00");
    public static final String WEB_SUBSCRIPTION_DESCRIPTION = "Camp Card Annual Subscription";

    @Value("${authorize.net.api.login.id}")
    private String apiLoginId;

    @Value("${authorize.net.transaction.key}")
    private String transactionKey;

    @Value("${authorize.net.environment:SANDBOX}")
    private String environment;

    @Value("${campcard.base-url:https://bsa.swipesavvy.com}")
    private String baseUrl;
    
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

    /**
     * Get Accept Hosted payment page token for web subscription purchase.
     * Uses static $10 price for annual subscription.
     */
    public AcceptHostedTokenResponse getAcceptHostedToken(AcceptHostedTokenRequest request) {
        log.info("Generating Accept Hosted token for subscription purchase");

        try {
            // Set up merchant authentication
            MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();
            merchantAuth.setName(apiLoginId);
            merchantAuth.setTransactionKey(transactionKey);

            // Set up transaction request with static $10 amount
            TransactionRequestType txnRequest = new TransactionRequestType();
            txnRequest.setTransactionType(TransactionTypeEnum.AUTH_CAPTURE_TRANSACTION.value());
            txnRequest.setAmount(WEB_SUBSCRIPTION_PRICE);

            // Order information
            OrderType order = new OrderType();
            order.setInvoiceNumber("SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            order.setDescription(WEB_SUBSCRIPTION_DESCRIPTION);
            txnRequest.setOrder(order);

            // Customer email if provided
            if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
                CustomerDataType customer = new CustomerDataType();
                customer.setEmail(request.getCustomerEmail());
                txnRequest.setCustomer(customer);
            }

            // Set up hosted payment settings
            ArrayOfSetting settings = new ArrayOfSetting();

            // Return URL after successful payment
            String returnUrl = request.getReturnUrl() != null
                    ? request.getReturnUrl()
                    : baseUrl + "/campcard/subscribe/success.html";
            SettingType returnUrlSetting = new SettingType();
            returnUrlSetting.setSettingName("hostedPaymentReturnOptions");
            returnUrlSetting.setSettingValue("{\"showReceipt\": false, \"url\": \"" + returnUrl + "\", \"urlText\": \"Continue\", \"cancelUrl\": \"" + (request.getCancelUrl() != null ? request.getCancelUrl() : baseUrl + "/campcard/subscribe/") + "\", \"cancelUrlText\": \"Cancel\"}");
            settings.getSetting().add(returnUrlSetting);

            // Button options
            SettingType buttonSetting = new SettingType();
            buttonSetting.setSettingName("hostedPaymentButtonOptions");
            buttonSetting.setSettingValue("{\"text\": \"Pay $10.00\"}");
            settings.getSetting().add(buttonSetting);

            // Style settings
            SettingType styleSetting = new SettingType();
            styleSetting.setSettingName("hostedPaymentStyleOptions");
            styleSetting.setSettingValue("{\"bgColor\": \"001a3a\"}");
            settings.getSetting().add(styleSetting);

            // Payment options - card only
            SettingType paymentSetting = new SettingType();
            paymentSetting.setSettingName("hostedPaymentPaymentOptions");
            paymentSetting.setSettingValue("{\"cardCodeRequired\": true, \"showCreditCard\": true, \"showBankAccount\": false}");
            settings.getSetting().add(paymentSetting);

            // Security options
            SettingType securitySetting = new SettingType();
            securitySetting.setSettingName("hostedPaymentSecurityOptions");
            securitySetting.setSettingValue("{\"captcha\": false}");
            settings.getSetting().add(securitySetting);

            // Shipping - not required
            SettingType shippingSetting = new SettingType();
            shippingSetting.setSettingName("hostedPaymentShippingAddressOptions");
            shippingSetting.setSettingValue("{\"show\": false, \"required\": false}");
            settings.getSetting().add(shippingSetting);

            // Billing - show but not required
            SettingType billingSetting = new SettingType();
            billingSetting.setSettingName("hostedPaymentBillingAddressOptions");
            billingSetting.setSettingValue("{\"show\": true, \"required\": false}");
            settings.getSetting().add(billingSetting);

            // Customer options
            SettingType customerSetting = new SettingType();
            customerSetting.setSettingName("hostedPaymentCustomerOptions");
            customerSetting.setSettingValue("{\"showEmail\": true, \"requiredEmail\": true, \"addPaymentProfile\": false}");
            settings.getSetting().add(customerSetting);

            // Order options
            SettingType orderSetting = new SettingType();
            orderSetting.setSettingName("hostedPaymentOrderOptions");
            orderSetting.setSettingValue("{\"show\": true, \"merchantName\": \"Camp Card - Scouting America\"}");
            settings.getSetting().add(orderSetting);

            // IFrame communicator for response
            SettingType iframeSetting = new SettingType();
            iframeSetting.setSettingName("hostedPaymentIFrameCommunicatorUrl");
            iframeSetting.setSettingValue("{\"url\": \"" + baseUrl + "/campcard/subscribe/IFrameCommunicator.html\"}");
            settings.getSetting().add(iframeSetting);

            // Create the API request
            GetHostedPaymentPageRequest apiRequest = new GetHostedPaymentPageRequest();
            apiRequest.setMerchantAuthentication(merchantAuth);
            apiRequest.setTransactionRequest(txnRequest);
            apiRequest.setHostedPaymentSettings(settings);

            // Execute the request
            GetHostedPaymentPageController controller = new GetHostedPaymentPageController(apiRequest);
            controller.setEnvironment(getEnvironment());
            controller.execute();

            GetHostedPaymentPageResponse response = controller.getApiResponse();

            if (response != null) {
                if (response.getMessages().getResultCode() == MessageTypeEnum.OK) {
                    String formUrl = "PRODUCTION".equalsIgnoreCase(environment)
                            ? "https://accept.authorize.net/payment/payment"
                            : "https://test.authorize.net/payment/payment";

                    log.info("Accept Hosted token generated successfully");

                    return AcceptHostedTokenResponse.builder()
                            .token(response.getToken())
                            .formUrl(formUrl)
                            .success(true)
                            .build();
                } else {
                    String errorMessage = response.getMessages().getMessage().get(0).getText();
                    String errorCode = response.getMessages().getMessage().get(0).getCode();

                    log.error("Failed to get Accept Hosted token: {} - {}", errorCode, errorMessage);

                    return AcceptHostedTokenResponse.builder()
                            .success(false)
                            .errorCode(errorCode)
                            .errorMessage(errorMessage)
                            .build();
                }
            }

            return AcceptHostedTokenResponse.builder()
                    .success(false)
                    .errorMessage("No response from payment gateway")
                    .errorCode("NO_RESPONSE")
                    .build();

        } catch (Exception e) {
            log.error("Error generating Accept Hosted token", e);
            return AcceptHostedTokenResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorCode("INTERNAL_ERROR")
                    .build();
        }
    }

    /**
     * Verify a completed transaction for subscription purchase.
     * Returns transaction details if valid, throws exception if not.
     */
    public PaymentResponse verifySubscriptionPayment(String transactionId) {
        log.info("Verifying subscription payment transaction: {}", transactionId);

        TransactionQueryRequest queryRequest = new TransactionQueryRequest();
        queryRequest.setTransactionId(transactionId);

        PaymentResponse response = getTransactionDetails(queryRequest);

        // Verify the amount matches our subscription price
        if (response.getAmount() != null &&
            response.getAmount().compareTo(WEB_SUBSCRIPTION_PRICE) == 0 &&
            "SUCCESS".equals(response.getStatus())) {
            log.info("Subscription payment verified: {} for ${}", transactionId, WEB_SUBSCRIPTION_PRICE);
            return response;
        }

        log.error("Subscription payment verification failed: {} - amount: {}, status: {}",
                transactionId, response.getAmount(), response.getStatus());

        throw new PaymentException("Payment verification failed. Invalid transaction.", "INVALID_TRANSACTION");
    }
}

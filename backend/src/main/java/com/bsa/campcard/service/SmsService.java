package com.bsa.campcard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.MessageAttributeValue;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SnsClient snsClient;

    @Value("${campcard.notifications.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${campcard.notifications.sms.sender-id:CampCard}")
    private String senderId;

    @Async
    public void sendVerificationCode(String phoneNumber, String code) {
        String message = String.format(
            "Your Camp Card verification code is: %s. This code expires in 10 minutes.",
            code
        );
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendPasswordResetCode(String phoneNumber, String code) {
        String message = String.format(
            "Your Camp Card password reset code is: %s. This code expires in 15 minutes. If you didn't request this, ignore this message.",
            code
        );
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendWelcomeSms(String phoneNumber, String firstName) {
        String message = String.format(
            "Welcome to Camp Card, %s! Download our app to start discovering offers and supporting your local Scout troop.",
            firstName
        );
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendReferralNotification(String phoneNumber, String customerName) {
        String message = String.format(
            "Great news! %s just signed up using your Camp Card referral link. Keep sharing to help your troop!",
            customerName
        );
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendRedemptionConfirmation(String phoneNumber, String merchantName, String offerTitle) {
        String message = String.format(
            "You've successfully redeemed \"%s\" at %s. Show this message to the merchant if needed. Thank you for using Camp Card!",
            offerTitle, merchantName
        );
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendSubscriptionReminder(String phoneNumber, int daysRemaining) {
        String message;
        if (daysRemaining <= 0) {
            message = "Your Camp Card subscription has expired. Renew now to keep enjoying exclusive offers!";
        } else if (daysRemaining == 1) {
            message = "Your Camp Card subscription expires tomorrow! Renew now to avoid losing access to exclusive offers.";
        } else {
            message = String.format(
                "Your Camp Card subscription expires in %d days. Renew soon to continue enjoying exclusive offers!",
                daysRemaining
            );
        }
        sendSms(phoneNumber, message);
    }

    public void sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.info("SMS disabled - would send to {}: {}", phoneNumber, message);
            return;
        }

        // Normalize phone number to E.164 format
        String normalizedNumber = normalizePhoneNumber(phoneNumber);

        if (normalizedNumber == null) {
            log.warn("Invalid phone number format: {}", phoneNumber);
            return;
        }

        try {
            Map<String, MessageAttributeValue> smsAttributes = new HashMap<>();

            // Set sender ID (appears as the sender name)
            smsAttributes.put("AWS.SNS.SMS.SenderID", MessageAttributeValue.builder()
                    .stringValue(senderId)
                    .dataType("String")
                    .build());

            // Set SMS type to Transactional for higher deliverability
            smsAttributes.put("AWS.SNS.SMS.SMSType", MessageAttributeValue.builder()
                    .stringValue("Transactional")
                    .dataType("String")
                    .build());

            PublishRequest request = PublishRequest.builder()
                    .message(message)
                    .phoneNumber(normalizedNumber)
                    .messageAttributes(smsAttributes)
                    .build();

            snsClient.publish(request);
            log.info("SMS sent to: {}", maskPhoneNumber(normalizedNumber));

        } catch (SnsException e) {
            log.error("Failed to send SMS to {}: {}", maskPhoneNumber(phoneNumber), e.getMessage());
        }
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }

        // Remove all non-digit characters except leading +
        String cleaned = phoneNumber.replaceAll("[^\\d+]", "");

        // If it already starts with +, assume it's in E.164 format
        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        // If it's a 10-digit US number, add +1
        if (cleaned.length() == 10) {
            return "+1" + cleaned;
        }

        // If it's an 11-digit number starting with 1 (US), add +
        if (cleaned.length() == 11 && cleaned.startsWith("1")) {
            return "+" + cleaned;
        }

        // Otherwise, assume it needs a + prefix
        return "+" + cleaned;
    }

    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "****";
        }
        return phoneNumber.substring(0, phoneNumber.length() - 4) + "****";
    }
}

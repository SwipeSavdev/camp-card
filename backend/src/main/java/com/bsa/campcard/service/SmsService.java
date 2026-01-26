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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * SMS Service for BSA Camp Card
 * Sends transactional SMS messages via AWS SNS
 *
 * All messages follow BSA Camp Card branding guidelines:
 * - Concise and clear messaging
 * - Professional tone appropriate for family audiences
 * - Include "BSA Camp Card" or "Camp Card" identifier
 * - Action-oriented with clear next steps
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SnsClient snsClient;

    @Value("${campcard.notifications.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${campcard.notifications.sms.sender-id:CampCard}")
    private String senderId;

    @Value("${campcard.base-url:https://api.campcardapp.org}")
    private String baseUrl;

    // ========================================================================
    // AUTHENTICATION SMS
    // ========================================================================

    /**
     * Send phone verification code during registration or phone number update
     */
    @Async
    public void sendVerificationCode(String phoneNumber, String code) {
        String message = String.format(
            "BSA Camp Card: Your verification code is %s. This code expires in 10 minutes. " +
            "If you didn't request this, please ignore.",
            code
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send password reset code for 2FA or phone-based reset
     */
    @Async
    public void sendPasswordResetCode(String phoneNumber, String code) {
        String message = String.format(
            "BSA Camp Card: Your password reset code is %s. Expires in 15 minutes. " +
            "If you didn't request this, contact support immediately.",
            code
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Confirm password was successfully changed
     */
    @Async
    public void sendPasswordChangedAlert(String phoneNumber) {
        String message = "BSA Camp Card: Your password was just changed. " +
            "If this wasn't you, contact support@campcardapp.org immediately.";
        sendSms(phoneNumber, message);
    }

    /**
     * Send two-factor authentication code
     */
    @Async
    public void sendTwoFactorCode(String phoneNumber, String code) {
        String message = String.format(
            "BSA Camp Card: Your login code is %s. Valid for 5 minutes. " +
            "Never share this code with anyone.",
            code
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // WELCOME & ONBOARDING SMS
    // ========================================================================

    /**
     * Welcome message for new customers
     */
    @Async
    public void sendWelcomeSms(String phoneNumber, String firstName) {
        String message = String.format(
            "Welcome to BSA Camp Card, %s! " +
            "Start discovering local offers and supporting Scouts today. " +
            "Download the app: %s/download",
            firstName, baseUrl
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Welcome message for new Scouts
     */
    @Async
    public void sendScoutWelcomeSms(String phoneNumber, String scoutName, String referralCode) {
        String message = String.format(
            "Welcome, Scout %s! Your Camp Card referral code is: %s. " +
            "Share it with family and friends to help your troop! " +
            "Track progress in the app.",
            scoutName, referralCode
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Welcome message for Troop Leaders
     */
    @Async
    public void sendTroopLeaderWelcomeSms(String phoneNumber, String firstName, String troopNumber) {
        String message = String.format(
            "Welcome, %s! You're now the Camp Card leader for Troop %s. " +
            "Access your dashboard to manage Scouts and track progress: %s/leader",
            firstName, troopNumber, baseUrl
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // REFERRAL & SALES SMS
    // ========================================================================

    /**
     * Notify Scout of new referral signup
     */
    @Async
    public void sendReferralNotification(String phoneNumber, String customerName) {
        String message = String.format(
            "Great news! %s just signed up using your Camp Card referral link. " +
            "Keep sharing to help your troop reach its goal!",
            customerName
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Notify Scout of sales milestone achievement
     */
    @Async
    public void sendSalesMilestoneNotification(String phoneNumber, String scoutName, int salesCount, String milestoneName) {
        String message = String.format(
            "Congratulations, %s! You've reached the %s milestone with %d sales! " +
            "Keep up the amazing work. Do Your Best!",
            scoutName, milestoneName, salesCount
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Weekly progress update for Scouts
     */
    @Async
    public void sendWeeklyProgressUpdate(String phoneNumber, String scoutName, int weeklySales, int totalSales, int troopRank) {
        String message = String.format(
            "Camp Card Weekly Update for %s: %d sales this week, %d total. " +
            "You're #%d in your troop! Keep going!",
            scoutName, weeklySales, totalSales, troopRank
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // SUBSCRIPTION SMS
    // ========================================================================

    /**
     * Confirm subscription purchase
     */
    @Async
    public void sendSubscriptionConfirmation(String phoneNumber, String planName, LocalDate expirationDate) {
        String formattedDate = expirationDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        String message = String.format(
            "BSA Camp Card: Your %s subscription is active until %s. " +
            "Start exploring offers now! Thank you for supporting Scouts.",
            planName, formattedDate
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Subscription expiring reminder
     */
    @Async
    public void sendSubscriptionReminder(String phoneNumber, int daysRemaining) {
        String message;
        if (daysRemaining <= 0) {
            message = "BSA Camp Card: Your subscription has expired. " +
                "Renew now to keep enjoying exclusive offers: " + baseUrl + "/renew";
        } else if (daysRemaining == 1) {
            message = "BSA Camp Card: Your subscription expires TOMORROW! " +
                "Renew now to avoid losing access: " + baseUrl + "/renew";
        } else if (daysRemaining <= 3) {
            message = String.format(
                "BSA Camp Card: Your subscription expires in %d days! " +
                "Renew now: %s/renew",
                daysRemaining, baseUrl
            );
        } else {
            message = String.format(
                "BSA Camp Card: Your subscription expires in %d days. " +
                "Renew soon to continue saving: %s/renew",
                daysRemaining, baseUrl
            );
        }
        sendSms(phoneNumber, message);
    }

    /**
     * Subscription successfully renewed
     */
    @Async
    public void sendSubscriptionRenewalConfirmation(String phoneNumber, LocalDate newExpirationDate) {
        String formattedDate = newExpirationDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        String message = String.format(
            "BSA Camp Card: Subscription renewed! Valid until %s. " +
            "Thank you for your continued support of local Scouts.",
            formattedDate
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // PAYMENT SMS
    // ========================================================================

    /**
     * Payment receipt confirmation
     */
    @Async
    public void sendPaymentConfirmation(String phoneNumber, BigDecimal amount, String last4Digits) {
        String formattedAmount = String.format("$%.2f", amount);
        String message = String.format(
            "BSA Camp Card: Payment of %s received (card ending %s). " +
            "Receipt sent to your email. Thank you!",
            formattedAmount, last4Digits
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Payment failed notification
     */
    @Async
    public void sendPaymentFailedAlert(String phoneNumber) {
        String message = "BSA Camp Card: Your recent payment could not be processed. " +
            "Please update your payment method: " + baseUrl + "/account/payment";
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // REDEMPTION SMS
    // ========================================================================

    /**
     * Confirm offer redemption
     */
    @Async
    public void sendRedemptionConfirmation(String phoneNumber, String merchantName, String offerTitle) {
        String message = String.format(
            "BSA Camp Card: You redeemed \"%s\" at %s. " +
            "Show this text to the merchant if needed. Thank you for supporting Scouts!",
            offerTitle, merchantName
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send redemption code for POS verification
     */
    @Async
    public void sendRedemptionCode(String phoneNumber, String code, String merchantName, int expiryMinutes) {
        String message = String.format(
            "BSA Camp Card: Your redemption code for %s is: %s. " +
            "Show this to the merchant. Valid for %d minutes.",
            merchantName, code, expiryMinutes
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // MERCHANT SMS
    // ========================================================================

    /**
     * Merchant application received
     */
    @Async
    public void sendMerchantApplicationReceived(String phoneNumber, String businessName) {
        String message = String.format(
            "BSA Camp Card: Application received for %s. " +
            "We'll review it within 1-2 business days. " +
            "Questions? Email merchants@campcardapp.org",
            businessName
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Merchant account approved
     */
    @Async
    public void sendMerchantApprovalNotification(String phoneNumber, String businessName) {
        String message = String.format(
            "BSA Camp Card: Congratulations! %s is now approved. " +
            "Log in to create your first offer: %s/merchant",
            businessName, baseUrl
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Notify merchant of new redemption at their location
     */
    @Async
    public void sendMerchantRedemptionAlert(String phoneNumber, String offerTitle, String customerName) {
        String message = String.format(
            "Camp Card Redemption: %s just redeemed \"%s\" at your location. " +
            "View details in your merchant dashboard.",
            customerName, offerTitle
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // TROOP & COUNCIL NOTIFICATIONS
    // ========================================================================

    /**
     * Notify Troop Leader of new Scout registration
     */
    @Async
    public void sendNewScoutNotification(String phoneNumber, String scoutName, String troopNumber) {
        String message = String.format(
            "Camp Card: %s has joined Troop %s! " +
            "View their profile and track their progress in your leader dashboard.",
            scoutName, troopNumber
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Troop milestone achieved
     */
    @Async
    public void sendTroopMilestoneNotification(String phoneNumber, String troopNumber, int totalSales, String milestoneName) {
        String message = String.format(
            "Camp Card: Troop %s has reached the %s milestone with %d total sales! " +
            "Congratulations to all your Scouts!",
            troopNumber, milestoneName, totalSales
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // SECURITY & ACCOUNT SMS
    // ========================================================================

    /**
     * New device login alert
     */
    @Async
    public void sendNewDeviceLoginAlert(String phoneNumber, String deviceInfo) {
        String message = String.format(
            "BSA Camp Card: New login detected from %s. " +
            "If this wasn't you, secure your account immediately at %s/security",
            deviceInfo, baseUrl
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Account locked due to suspicious activity
     */
    @Async
    public void sendAccountLockedAlert(String phoneNumber) {
        String message = "BSA Camp Card: Your account has been temporarily locked " +
            "due to unusual activity. Contact support@campcardapp.org to unlock.";
        sendSms(phoneNumber, message);
    }

    /**
     * Email address changed notification
     */
    @Async
    public void sendEmailChangedAlert(String phoneNumber, String newEmail) {
        // Mask email for privacy
        String maskedEmail = maskEmail(newEmail);
        String message = String.format(
            "BSA Camp Card: Your email was changed to %s. " +
            "If you didn't make this change, contact support immediately.",
            maskedEmail
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // MARKETING CAMPAIGN SMS
    // ========================================================================

    /**
     * Send a marketing campaign SMS
     * Used by CampaignDispatchService for bulk campaign delivery
     *
     * @param phoneNumber The recipient's phone number
     * @param content The campaign message content (will be prefixed and have opt-out appended)
     * @param campaignId The campaign ID for tracking/logging
     */
    @Async
    public void sendCampaignSms(String phoneNumber, String content, String campaignId) {
        if (!smsEnabled) {
            log.info("SMS disabled - would send campaign SMS to {} for campaign {}",
                maskPhoneNumber(phoneNumber), campaignId);
            return;
        }

        // Content should already be formatted by CampaignDispatchService
        // Just ensure it doesn't exceed limits
        String message = content;
        if (message.length() > 160) {
            log.debug("Campaign {} SMS truncated from {} to 160 chars", campaignId, message.length());
            message = message.substring(0, 157) + "...";
        }

        sendSms(phoneNumber, message);
        log.info("Campaign SMS sent to {} for campaign {}", maskPhoneNumber(phoneNumber), campaignId);
    }

    // ========================================================================
    // PROMOTIONAL SMS (Opt-in only)
    // ========================================================================

    /**
     * New offer available in user's area
     */
    @Async
    public void sendNewOfferAlert(String phoneNumber, String merchantName, String offerSummary) {
        String message = String.format(
            "Camp Card: New offer from %s! %s. " +
            "Open the app to redeem. Reply STOP to unsubscribe.",
            merchantName, offerSummary
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Limited time offer reminder
     */
    @Async
    public void sendLimitedTimeOfferReminder(String phoneNumber, String offerTitle, int hoursRemaining) {
        String message = String.format(
            "Camp Card: \"%s\" expires in %d hours! " +
            "Don't miss out - redeem now in the app. Reply STOP to unsubscribe.",
            offerTitle, hoursRemaining
        );
        sendSms(phoneNumber, message);
    }

    // ========================================================================
    // CORE SMS SENDING METHOD
    // ========================================================================

    /**
     * Send SMS via AWS SNS
     * Handles phone number normalization and error handling
     */
    public void sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.info("SMS disabled - would send to {}: {}", maskPhoneNumber(phoneNumber), message);
            return;
        }

        // Normalize phone number to E.164 format
        String normalizedNumber = normalizePhoneNumber(phoneNumber);

        if (normalizedNumber == null) {
            log.warn("Invalid phone number format: {}", maskPhoneNumber(phoneNumber));
            return;
        }

        // Ensure message doesn't exceed SMS limit (160 chars for single SMS, 1600 for concatenated)
        if (message.length() > 1600) {
            log.warn("SMS message truncated - original length: {}", message.length());
            message = message.substring(0, 1597) + "...";
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

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Normalize phone number to E.164 format
     * Supports US numbers with various input formats
     */
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

    /**
     * Mask phone number for logging (privacy)
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "****";
        }
        return phoneNumber.substring(0, phoneNumber.length() - 4) + "****";
    }

    /**
     * Mask email address for privacy in SMS
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "****@****.***";
        }
        int atIndex = email.indexOf("@");
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***" + domain;
        }
        return localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1) + domain;
    }
}

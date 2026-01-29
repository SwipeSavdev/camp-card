package com.bsa.campcard.controller;

import com.bsa.campcard.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Email Test Controller for testing all email templates.
 * Only accessible by NATIONAL_ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/admin/email-test")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('NATIONAL_ADMIN')")
public class EmailTestController {

    private final EmailService emailService;

    /**
     * Send test email for verification
     */
    @PostMapping("/verification")
    public ResponseEntity<Map<String, String>> testVerificationEmail(@RequestParam String to) {
        log.info("Testing verification email to: {}", to);
        String testToken = "test-verification-token-" + UUID.randomUUID().toString().substring(0, 8);
        emailService.sendVerificationEmail(to, testToken);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "verification",
            "to", to,
            "expectedUrl", "/verify-email?token=" + testToken
        ));
    }

    /**
     * Send test password reset email
     */
    @PostMapping("/password-reset")
    public ResponseEntity<Map<String, String>> testPasswordResetEmail(@RequestParam String to) {
        log.info("Testing password reset email to: {}", to);
        String testToken = "test-reset-token-" + UUID.randomUUID().toString().substring(0, 8);
        emailService.sendPasswordResetEmail(to, testToken);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "password-reset",
            "to", to,
            "expectedUrl", "/reset-password?token=" + testToken
        ));
    }

    /**
     * Send test password changed confirmation
     */
    @PostMapping("/password-changed")
    public ResponseEntity<Map<String, String>> testPasswordChangedEmail(@RequestParam String to) {
        log.info("Testing password changed email to: {}", to);
        emailService.sendPasswordChangedConfirmation(to, "Test User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "password-changed",
            "to", to
        ));
    }

    /**
     * Send test welcome email
     */
    @PostMapping("/welcome")
    public ResponseEntity<Map<String, String>> testWelcomeEmail(@RequestParam String to) {
        log.info("Testing welcome email to: {}", to);
        emailService.sendWelcomeEmail(to, "Test User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "welcome",
            "to", to,
            "expectedUrl", "/download"
        ));
    }

    /**
     * Send test scout welcome email
     */
    @PostMapping("/scout-welcome")
    public ResponseEntity<Map<String, String>> testScoutWelcomeEmail(@RequestParam String to) {
        log.info("Testing scout welcome email to: {}", to);
        String referralCode = "SCOUT" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        emailService.sendScoutWelcomeEmail(to, "Test Scout", "Troop 123", referralCode);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "scout-welcome",
            "to", to,
            "referralCode", referralCode,
            "expectedUrls", "/r/" + referralCode + ", /dashboard"
        ));
    }

    /**
     * Send test troop leader welcome email
     */
    @PostMapping("/troop-leader-welcome")
    public ResponseEntity<Map<String, String>> testTroopLeaderWelcomeEmail(@RequestParam String to) {
        log.info("Testing troop leader welcome email to: {}", to);
        emailService.sendTroopLeaderWelcomeEmail(to, "Test Leader", "Troop 123");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "troop-leader-welcome",
            "to", to,
            "expectedUrl", "/leader/dashboard"
        ));
    }

    /**
     * Send test council admin welcome email
     */
    @PostMapping("/council-admin-welcome")
    public ResponseEntity<Map<String, String>> testCouncilAdminWelcomeEmail(@RequestParam String to) {
        log.info("Testing council admin welcome email to: {}", to);
        emailService.sendCouncilAdminWelcomeEmail(to, "Test Admin", "Test Council");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "council-admin-welcome",
            "to", to,
            "expectedUrl", "/admin/dashboard"
        ));
    }

    /**
     * Send test merchant welcome email
     */
    @PostMapping("/merchant-welcome")
    public ResponseEntity<Map<String, String>> testMerchantWelcomeEmail(@RequestParam String to) {
        log.info("Testing merchant welcome email to: {}", to);
        emailService.sendMerchantWelcomeEmail(to, "Test Merchant Business", "Test Contact");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "merchant-welcome",
            "to", to
        ));
    }

    /**
     * Send test referral notification email
     */
    @PostMapping("/referral-notification")
    public ResponseEntity<Map<String, String>> testReferralNotificationEmail(@RequestParam String to) {
        log.info("Testing referral notification email to: {}", to);
        emailService.sendReferralNotification(to, "Test Scout", "New Referral User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "referral-notification",
            "to", to,
            "expectedUrl", "/dashboard"
        ));
    }

    /**
     * Send test sales milestone email
     */
    @PostMapping("/sales-milestone")
    public ResponseEntity<Map<String, String>> testSalesMilestoneEmail(@RequestParam String to) {
        log.info("Testing sales milestone email to: {}", to);
        emailService.sendSalesMilestoneEmail(to, "Test Scout", 25, "Bronze Badge");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "sales-milestone",
            "to", to,
            "milestone", "25",
            "expectedUrl", "/dashboard"
        ));
    }

    /**
     * Send test subscription confirmation email
     */
    @PostMapping("/subscription-confirmation")
    public ResponseEntity<Map<String, String>> testSubscriptionConfirmationEmail(@RequestParam String to) {
        log.info("Testing subscription confirmation email to: {}", to);
        emailService.sendSubscriptionConfirmation(to, "Test User", "Annual Plan",
            new BigDecimal("24.99"), LocalDate.now().plusYears(1));
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "subscription-confirmation",
            "to", to,
            "expectedUrl", "/offers"
        ));
    }

    /**
     * Send test subscription expiring reminder email
     */
    @PostMapping("/subscription-expiring")
    public ResponseEntity<Map<String, String>> testSubscriptionExpiringEmail(@RequestParam String to) {
        log.info("Testing subscription expiring email to: {}", to);
        emailService.sendSubscriptionExpiringReminder(to, "Test User", 7, LocalDate.now().plusDays(7));
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "subscription-expiring",
            "to", to,
            "daysRemaining", "7",
            "expectedUrl", "/subscription/renew"
        ));
    }

    /**
     * Send test subscription expired email
     */
    @PostMapping("/subscription-expired")
    public ResponseEntity<Map<String, String>> testSubscriptionExpiredEmail(@RequestParam String to) {
        log.info("Testing subscription expired email to: {}", to);
        emailService.sendSubscriptionExpiredEmail(to, "Test User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "subscription-expired",
            "to", to,
            "expectedUrl", "/subscription/renew"
        ));
    }

    /**
     * Send test payment receipt email
     */
    @PostMapping("/payment-receipt")
    public ResponseEntity<Map<String, String>> testPaymentReceiptEmail(@RequestParam String to) {
        log.info("Testing payment receipt email to: {}", to);
        emailService.sendPaymentReceiptEmail(to, "Test User",
            "TXN-TEST-" + System.currentTimeMillis(), new BigDecimal("24.99"), "Annual Subscription");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "payment-receipt",
            "to", to
        ));
    }

    /**
     * Send test gift card notification email (to recipient)
     */
    @PostMapping("/gift-notification")
    public ResponseEntity<Map<String, String>> testGiftNotificationEmail(@RequestParam String to) {
        log.info("Testing gift notification email to: {}", to);
        String claimToken = "gift-claim-" + UUID.randomUUID().toString().substring(0, 8);
        String cardNumber = "CC-GIFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        emailService.sendGiftCardNotification(to, "Gift Sender", "Gift Recipient",
            "Enjoy this Camp Card gift!", claimToken, cardNumber, LocalDate.now().plusDays(30));
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "gift-notification",
            "to", to,
            "claimToken", claimToken,
            "expectedUrl", "/claim-gift?token=" + claimToken
        ));
    }

    /**
     * Send test gift sent confirmation email (to sender)
     */
    @PostMapping("/gift-sent-confirmation")
    public ResponseEntity<Map<String, String>> testGiftSentConfirmationEmail(@RequestParam String to) {
        log.info("Testing gift sent confirmation email to: {}", to);
        String cardNumber = "CC-GIFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        emailService.sendGiftSentConfirmation(to, "Test Sender", "recipient@example.com",
            "Gift Recipient", cardNumber, LocalDate.now().plusYears(1));
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "gift-sent-confirmation",
            "to", to
        ));
    }

    /**
     * Send test gift claimed notification email (to sender)
     */
    @PostMapping("/gift-claimed")
    public ResponseEntity<Map<String, String>> testGiftClaimedNotificationEmail(@RequestParam String to) {
        log.info("Testing gift claimed notification email to: {}", to);
        String cardNumber = "CC-GIFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        emailService.sendGiftClaimedNotification(to, "Test Sender", "Gift Recipient",
            "recipient@example.com", cardNumber);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "gift-claimed",
            "to", to
        ));
    }

    /**
     * Send test gift claim reminder email (to recipient)
     */
    @PostMapping("/gift-claim-reminder")
    public ResponseEntity<Map<String, String>> testGiftClaimReminderEmail(@RequestParam String to) {
        log.info("Testing gift claim reminder email to: {}", to);
        String claimToken = "gift-reminder-" + UUID.randomUUID().toString().substring(0, 8);
        String cardNumber = "CC-GIFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        emailService.sendGiftClaimReminder(to, "Gift Sender", "Gift Recipient",
            claimToken, cardNumber, 14, LocalDate.now().plusDays(14));
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "gift-claim-reminder",
            "to", to,
            "daysRemaining", "14",
            "expectedUrl", "/claim-gift?token=" + claimToken
        ));
    }

    /**
     * Send test gift expired notification email (to sender)
     */
    @PostMapping("/gift-expired")
    public ResponseEntity<Map<String, String>> testGiftExpiredNotificationEmail(@RequestParam String to) {
        log.info("Testing gift expired notification email to: {}", to);
        String cardNumber = "CC-GIFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        emailService.sendGiftExpiredNotification(to, "Test Sender", "recipient@example.com", cardNumber);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "gift-expired",
            "to", to
        ));
    }

    /**
     * Send test card expiry reminder email
     */
    @PostMapping("/card-expiry-reminder")
    public ResponseEntity<Map<String, String>> testCardExpiryReminderEmail(@RequestParam String to) {
        log.info("Testing card expiry reminder email to: {}", to);
        emailService.sendCardExpiryReminder(to, "Test User", "CC-12345678",
            7, LocalDate.now().plusDays(7), 5);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "card-expiry-reminder",
            "to", to,
            "daysRemaining", "7"
        ));
    }

    /**
     * Send test redemption confirmation email
     */
    @PostMapping("/redemption-confirmation")
    public ResponseEntity<Map<String, String>> testRedemptionConfirmationEmail(@RequestParam String to) {
        log.info("Testing redemption confirmation email to: {}", to);
        emailService.sendRedemptionConfirmation(to, "Test User", "Test Merchant",
            "20% off any purchase", "REDEEM-" + System.currentTimeMillis());
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "redemption-confirmation",
            "to", to
        ));
    }

    /**
     * Send test merchant approval email
     */
    @PostMapping("/merchant-approval")
    public ResponseEntity<Map<String, String>> testMerchantApprovalEmail(@RequestParam String to) {
        log.info("Testing merchant approval email to: {}", to);
        emailService.sendMerchantApprovalEmail(to, "Test Business", "Test Contact");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "merchant-approval",
            "to", to,
            "expectedUrl", "/merchant/dashboard"
        ));
    }

    /**
     * Send test merchant rejection email
     */
    @PostMapping("/merchant-rejection")
    public ResponseEntity<Map<String, String>> testMerchantRejectionEmail(@RequestParam String to) {
        log.info("Testing merchant rejection email to: {}", to);
        emailService.sendMerchantRejectionEmail(to, "Test Business", "Test Contact",
            "Does not meet eligibility requirements for the program.");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "merchant-rejection",
            "to", to,
            "expectedContact", "merchants@campcardapp.org"
        ));
    }

    /**
     * Send test scout invitation email
     */
    @PostMapping("/scout-invitation")
    public ResponseEntity<Map<String, String>> testScoutInvitationEmail(@RequestParam String to) {
        log.info("Testing scout invitation email to: {}", to);
        String inviteToken = "scout-invite-" + UUID.randomUUID().toString().substring(0, 8);
        emailService.sendScoutInvitationEmail(to, "Test Scout", "Troop 123", "Test Leader", inviteToken);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "scout-invitation",
            "to", to,
            "inviteToken", inviteToken,
            "expectedUrl", "/join/scout?token=" + inviteToken
        ));
    }

    /**
     * Send test parent invitation email
     */
    @PostMapping("/parent-invitation")
    public ResponseEntity<Map<String, String>> testParentInvitationEmail(@RequestParam String to) {
        log.info("Testing parent invitation email to: {}", to);
        String inviteToken = "parent-invite-" + UUID.randomUUID().toString().substring(0, 8);
        emailService.sendParentInvitationEmail(to, "Test Parent", "Test Scout", "Troop 123", inviteToken);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "parent-invitation",
            "to", to,
            "inviteToken", inviteToken,
            "expectedUrl", "/join/parent?token=" + inviteToken
        ));
    }

    /**
     * Send test new offer notification email
     */
    @PostMapping("/new-offer")
    public ResponseEntity<Map<String, String>> testNewOfferNotificationEmail(@RequestParam String to) {
        log.info("Testing new offer notification email to: {}", to);
        emailService.sendNewOfferNotification(to, "Test User", "Test Merchant", "25% off all items", "SAVE25");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "new-offer",
            "to", to,
            "expectedUrl", "/offers"
        ));
    }

    /**
     * Send test weekly troop summary email
     */
    @PostMapping("/weekly-troop-summary")
    public ResponseEntity<Map<String, String>> testWeeklyTroopSummaryEmail(@RequestParam String to) {
        log.info("Testing weekly troop summary email to: {}", to);
        emailService.sendWeeklyTroopSummary(to, "Test Leader", "Troop 123", 15, 127,
            new BigDecimal("3175.00"), "Top Scout Name");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "weekly-troop-summary",
            "to", to,
            "expectedUrl", "/leader/dashboard"
        ));
    }

    /**
     * Send test profile update notification email
     */
    @PostMapping("/profile-update")
    public ResponseEntity<Map<String, String>> testProfileUpdateNotificationEmail(@RequestParam String to) {
        log.info("Testing profile update notification email to: {}", to);
        emailService.sendProfileUpdateNotification(to, "Test User", "first name, phone number");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "profile-update",
            "to", to
        ));
    }

    /**
     * Send test email change notification
     */
    @PostMapping("/email-change")
    public ResponseEntity<Map<String, String>> testEmailChangeNotificationEmail(@RequestParam String to) {
        log.info("Testing email change notification email to: {}", to);
        emailService.sendEmailChangeNotification(to, "newemail@example.com", "Test User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "email-change",
            "to", to,
            "note", "Sent to old email address"
        ));
    }

    /**
     * Send test security settings changed notification
     */
    @PostMapping("/security-settings-changed")
    public ResponseEntity<Map<String, String>> testSecuritySettingsChangedEmail(@RequestParam String to) {
        log.info("Testing security settings changed email to: {}", to);
        emailService.sendSecuritySettingsChangedNotification(to, "Test User", "Two-Factor Authentication");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "security-settings-changed",
            "to", to
        ));
    }

    /**
     * Send test account deactivation notice
     */
    @PostMapping("/account-deactivation")
    public ResponseEntity<Map<String, String>> testAccountDeactivationNoticeEmail(@RequestParam String to) {
        log.info("Testing account deactivation notice email to: {}", to);
        emailService.sendAccountDeactivationNotice(to, "Test User", "Violation of terms of service.");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "account-deactivation",
            "to", to,
            "expectedContact", "support@campcardapp.org"
        ));
    }

    /**
     * Send test account deletion request notification
     */
    @PostMapping("/account-deletion-request")
    public ResponseEntity<Map<String, String>> testAccountDeletionRequestEmail(@RequestParam String to) {
        log.info("Testing account deletion request email to: {}", to);
        emailService.sendAccountDeletionRequestNotification(to, "Test User");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "account-deletion-request",
            "to", to
        ));
    }

    /**
     * Send test notification settings changed email
     */
    @PostMapping("/notification-settings-changed")
    public ResponseEntity<Map<String, String>> testNotificationSettingsChangedEmail(@RequestParam String to) {
        log.info("Testing notification settings changed email to: {}", to);
        emailService.sendNotificationSettingsChangedNotification(to, "Test User", "Email notifications enabled, SMS disabled");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "notification-settings-changed",
            "to", to
        ));
    }

    /**
     * Send test parental consent request email
     */
    @PostMapping("/parental-consent-request")
    public ResponseEntity<Map<String, String>> testParentalConsentRequestEmail(@RequestParam String to) {
        log.info("Testing parental consent request email to: {}", to);
        String consentToken = "consent-" + UUID.randomUUID().toString().substring(0, 8);
        emailService.sendParentalConsentRequestEmail(to, "Parent Name", "Test Scout",
            LocalDate.now().minusYears(12), consentToken);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "parental-consent-request",
            "to", to,
            "consentToken", consentToken,
            "expectedUrl", "/consent/verify?token=" + consentToken
        ));
    }

    /**
     * Send test consent granted email
     */
    @PostMapping("/consent-granted")
    public ResponseEntity<Map<String, String>> testConsentGrantedEmail(@RequestParam String to) {
        log.info("Testing consent granted email to: {}", to);
        emailService.sendConsentGrantedEmail(to, "Test Scout", true);
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "consent-granted",
            "to", to,
            "expectedUrl", "/login"
        ));
    }

    /**
     * Send test consent denied email
     */
    @PostMapping("/consent-denied")
    public ResponseEntity<Map<String, String>> testConsentDeniedEmail(@RequestParam String to) {
        log.info("Testing consent denied email to: {}", to);
        emailService.sendConsentDeniedEmail(to, "Test Scout");
        return ResponseEntity.ok(Map.of(
            "status", "sent",
            "type", "consent-denied",
            "to", to
        ));
    }

    /**
     * Send ALL test emails to a single recipient
     */
    @PostMapping("/send-all")
    public ResponseEntity<Map<String, Object>> testAllEmails(@RequestParam String to) {
        log.info("Testing ALL emails to: {}", to);

        List<Map<String, String>> results = new ArrayList<>();

        // Authentication emails
        results.add(testVerificationEmail(to).getBody());
        results.add(testPasswordResetEmail(to).getBody());
        results.add(testPasswordChangedEmail(to).getBody());

        // Welcome & Onboarding emails
        results.add(testWelcomeEmail(to).getBody());
        results.add(testScoutWelcomeEmail(to).getBody());
        results.add(testTroopLeaderWelcomeEmail(to).getBody());
        results.add(testCouncilAdminWelcomeEmail(to).getBody());
        results.add(testMerchantWelcomeEmail(to).getBody());

        // Referral & Sales emails
        results.add(testReferralNotificationEmail(to).getBody());
        results.add(testSalesMilestoneEmail(to).getBody());

        // Subscription & Payment emails
        results.add(testSubscriptionConfirmationEmail(to).getBody());
        results.add(testSubscriptionExpiringEmail(to).getBody());
        results.add(testSubscriptionExpiredEmail(to).getBody());
        results.add(testPaymentReceiptEmail(to).getBody());

        // Gift Card emails
        results.add(testGiftNotificationEmail(to).getBody());
        results.add(testGiftSentConfirmationEmail(to).getBody());
        results.add(testGiftClaimedNotificationEmail(to).getBody());
        results.add(testGiftClaimReminderEmail(to).getBody());
        results.add(testGiftExpiredNotificationEmail(to).getBody());
        results.add(testCardExpiryReminderEmail(to).getBody());

        // Redemption emails
        results.add(testRedemptionConfirmationEmail(to).getBody());

        // Merchant emails
        results.add(testMerchantApprovalEmail(to).getBody());
        results.add(testMerchantRejectionEmail(to).getBody());

        // Invitation emails
        results.add(testScoutInvitationEmail(to).getBody());
        results.add(testParentInvitationEmail(to).getBody());

        // Notification emails
        results.add(testNewOfferNotificationEmail(to).getBody());
        results.add(testWeeklyTroopSummaryEmail(to).getBody());

        // Account Change emails
        results.add(testProfileUpdateNotificationEmail(to).getBody());
        results.add(testEmailChangeNotificationEmail(to).getBody());
        results.add(testSecuritySettingsChangedEmail(to).getBody());
        results.add(testAccountDeactivationNoticeEmail(to).getBody());
        results.add(testAccountDeletionRequestEmail(to).getBody());
        results.add(testNotificationSettingsChangedEmail(to).getBody());

        // Parental Consent emails
        results.add(testParentalConsentRequestEmail(to).getBody());
        results.add(testConsentGrantedEmail(to).getBody());
        results.add(testConsentDeniedEmail(to).getBody());

        return ResponseEntity.ok(Map.of(
            "status", "all_sent",
            "totalEmails", results.size(),
            "recipient", to,
            "results", results
        ));
    }
}

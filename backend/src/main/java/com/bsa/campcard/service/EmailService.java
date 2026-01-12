package com.bsa.campcard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final SesClient sesClient;

    @Value("${campcard.notifications.email.from:no-reply@campcard.org}")
    private String fromEmail;

    @Value("${campcard.base-url:http://localhost:7010}")
    private String baseUrl;

    @Value("${campcard.notifications.email.enabled:true}")
    private boolean emailEnabled;

    @Async
    public void sendVerificationEmail(String to, String token) {
        if (!emailEnabled) {
            log.info("Email disabled - would send verification email to: {}", to);
            return;
        }

        String subject = "Verify Your Camp Card Account";
        String htmlBody = buildVerificationEmailHtml(token);
        String textBody = buildVerificationEmailText(token);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Verification email sent to: {}", to);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        if (!emailEnabled) {
            log.info("Email disabled - would send password reset email to: {}", to);
            return;
        }

        String subject = "Reset Your Camp Card Password";
        String htmlBody = buildPasswordResetEmailHtml(token);
        String textBody = buildPasswordResetEmailText(token);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Password reset email sent to: {}", to);
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send welcome email to: {}", to);
            return;
        }

        String subject = "Welcome to Camp Card!";
        String htmlBody = buildWelcomeEmailHtml(firstName);
        String textBody = buildWelcomeEmailText(firstName);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Welcome email sent to: {}", to);
    }

    @Async
    public void sendReferralNotification(String to, String scoutName, String customerName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send referral notification to: {}", to);
            return;
        }

        String subject = "New Referral Redemption!";
        String htmlBody = buildReferralNotificationHtml(scoutName, customerName);
        String textBody = buildReferralNotificationText(scoutName, customerName);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Referral notification sent to: {}", to);
    }

    private void sendEmail(String to, String subject, String htmlBody, String textBody) {
        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .source(fromEmail)
                    .destination(Destination.builder()
                            .toAddresses(to)
                            .build())
                    .message(Message.builder()
                            .subject(Content.builder()
                                    .charset("UTF-8")
                                    .data(subject)
                                    .build())
                            .body(Body.builder()
                                    .html(Content.builder()
                                            .charset("UTF-8")
                                            .data(htmlBody)
                                            .build())
                                    .text(Content.builder()
                                            .charset("UTF-8")
                                            .data(textBody)
                                            .build())
                                    .build())
                            .build())
                    .build();

            sesClient.sendEmail(request);
        } catch (SesException e) {
            log.error("Failed to send email to: {} - {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildVerificationEmailHtml(String token) {
        String verifyUrl = baseUrl + "/api/v1/auth/verify-email?token=" + token;
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #003f87; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .button { display: inline-block; background-color: #003f87; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>BSA Camp Card</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome to Camp Card!</h2>
                        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Verify Email</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; font-size: 12px;">%s</p>
                        <p>This link will expire in 7 days.</p>
                        <p>If you did not create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Boy Scouts of America Camp Card Program</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(verifyUrl, verifyUrl);
    }

    private String buildVerificationEmailText(String token) {
        String verifyUrl = baseUrl + "/api/v1/auth/verify-email?token=" + token;
        return """
            Welcome to Camp Card!

            Please verify your email by clicking the link below:

            %s

            This link will expire in 7 days.

            If you did not create an account, please ignore this email.

            Best regards,
            The Camp Card Team
            """.formatted(verifyUrl);
    }

    private String buildPasswordResetEmailHtml(String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #003f87; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .button { display: inline-block; background-color: #ce1126; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>BSA Camp Card</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; font-size: 12px;">%s</p>
                        <p>This link will expire in 24 hours.</p>
                        <p><strong>If you did not request a password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Boy Scouts of America Camp Card Program</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetUrl, resetUrl);
    }

    private String buildPasswordResetEmailText(String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        return """
            Password Reset Request

            We received a request to reset your password.

            Click the link below to reset your password:

            %s

            This link will expire in 24 hours.

            If you did not request a password reset, please ignore this email.

            Best regards,
            The Camp Card Team
            """.formatted(resetUrl);
    }

    private String buildWelcomeEmailHtml(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #003f87; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .feature { margin: 15px 0; padding-left: 20px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>BSA Camp Card</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome, %s!</h2>
                        <p>Thank you for joining Camp Card! We're excited to have you as part of our community.</p>
                        <p>With Camp Card, you can:</p>
                        <div class="feature">✓ Track your sales progress</div>
                        <div class="feature">✓ Discover and redeem merchant offers</div>
                        <div class="feature">✓ Earn rewards for referrals</div>
                        <div class="feature">✓ Support your local Scout troop</div>
                        <p>Download our mobile app to get started and begin exploring offers in your area!</p>
                        <p>Happy Scouting!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Boy Scouts of America Camp Card Program</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName);
    }

    private String buildWelcomeEmailText(String firstName) {
        return """
            Welcome, %s!

            Thank you for joining Camp Card! We're excited to have you as part of our community.

            With Camp Card, you can:
            - Track your sales progress
            - Discover and redeem merchant offers
            - Earn rewards for referrals
            - Support your local Scout troop

            Download our mobile app to get started!

            Happy Scouting!
            The Camp Card Team
            """.formatted(firstName);
    }

    private String buildReferralNotificationHtml(String scoutName, String customerName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #003f87; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .highlight { background-color: #e8f4e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>BSA Camp Card</h1>
                    </div>
                    <div class="content">
                        <h2>Great News! 🎉</h2>
                        <div class="highlight">
                            <p><strong>%s</strong> just used your referral link!</p>
                            <p>A new customer has signed up using the referral code shared by <strong>%s</strong>.</p>
                        </div>
                        <p>Keep sharing your referral link to help your troop reach its goals!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Boy Scouts of America Camp Card Program</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(customerName, scoutName);
    }

    private String buildReferralNotificationText(String scoutName, String customerName) {
        return """
            Great News!

            %s just used your referral link!

            A new customer has signed up using the referral code shared by %s.

            Keep sharing your referral link to help your troop reach its goals!

            Best regards,
            The Camp Card Team
            """.formatted(customerName, scoutName);
    }
}

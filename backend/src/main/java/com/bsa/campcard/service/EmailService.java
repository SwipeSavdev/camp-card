package com.bsa.campcard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${campcard.notifications.email.from:no-reply@campcard.org}")
    private String fromEmail;

    @Value("${campcard.base-url:http://localhost:8080}")
    private String baseUrl;

    @Async
    public void sendVerificationEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Verify Your Camp Card Account");
            message.setText(
                    "Welcome to Camp Card!\n\n" +
                    "Please verify your email by clicking the link below:\n\n" +
                    baseUrl + "/api/v1/auth/verify-email?token=" + token + "\n\n" +
                    "This link will expire in 7 days.\n\n" +
                    "If you did not create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The Camp Card Team"
            );
            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Reset Your Camp Card Password");
            message.setText(
                    "Hello,\n\n" +
                    "We received a request to reset your password.\n\n" +
                    "Click the link below to reset your password:\n\n" +
                    baseUrl + "/reset-password?token=" + token + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The Camp Card Team"
            );
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to Camp Card!");
            message.setText(
                    "Hi " + firstName + ",\n\n" +
                    "Welcome to Camp Card! We're excited to have you join our community.\n\n" +
                    "With Camp Card, you can:\n" +
                    "- Track your sales progress\n" +
                    "- Discover and redeem merchant offers\n" +
                    "- Earn rewards for referrals\n" +
                    "- And much more!\n\n" +
                    "Download our mobile app to get started.\n\n" +
                    "Best regards,\n" +
                    "The Camp Card Team"
            );
            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }
}

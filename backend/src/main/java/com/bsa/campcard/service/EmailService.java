package com.bsa.campcard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final SesClient sesClient;

    @Value("${campcard.notifications.email.from:no-reply@bsa.swipesavvy.com}")
    private String fromEmail;

    @Value("${campcard.base-url:https://bsa.swipesavvy.com}")
    private String baseUrl;

    @Value("${campcard.web-portal-url:${campcard.base-url:https://bsa.swipesavvy.com}}")
    private String webPortalUrl;

    @Value("${campcard.notifications.email.enabled:true}")
    private boolean emailEnabled;

    // BSA Brand Colors
    private static final String BSA_NAVY = "#003f87";
    private static final String BSA_RED = "#ce1126";
    private static final String BSA_GOLD = "#fdb813";
    private static final String SUCCESS_GREEN = "#28a745";
    private static final String WARNING_ORANGE = "#fd7e14";

    // ========================================================================
    // AUTHENTICATION EMAILS
    // ========================================================================

    @Async
    public void sendVerificationEmail(String to, String token) {
        if (!emailEnabled) {
            log.info("Email disabled - would send verification email to: {}", to);
            return;
        }

        log.info("Sending verification email to {} with token: {}", to, token);

        String subject = "Verify Your BSA Camp Card Account";
        String verifyUrl = webPortalUrl + "/verify-email?token=" + token;
        log.info("Verification URL: {}", verifyUrl);

        String htmlBody = buildEmailTemplate(
            "Verify Your Email Address",
            BSA_NAVY,
            """
            <p style="font-size: 16px; color: #333333;">Thank you for creating your BSA Camp Card account!</p>
            <p style="font-size: 16px; color: #333333;">To complete your registration and start discovering exclusive offers from local merchants, please verify your email address.</p>
            """ + buildButton("Verify Email Address", verifyUrl, BSA_NAVY) + """
            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #999999; word-break: break-all;">%s</p>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>This link expires in 7 days.</strong></p>
            </div>
            <p style="font-size: 14px; color: #666666; margin-top: 24px;">If you didn't create this account, you can safely ignore this email.</p>
            """.formatted(verifyUrl)
        );

        String textBody = """
            Verify Your BSA Camp Card Account

            Thank you for creating your BSA Camp Card account!

            To complete your registration and start discovering exclusive offers from local merchants, please verify your email address by clicking the link below:

            %s

            This link expires in 7 days.

            If you didn't create this account, you can safely ignore this email.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(verifyUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Verification email sent to: {}", to);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        if (!emailEnabled) {
            log.info("Email disabled - would send password reset email to: {}", to);
            return;
        }

        String subject = "Reset Your BSA Camp Card Password";
        String resetUrl = webPortalUrl + "/reset-password?token=" + token;

        String htmlBody = buildEmailTemplate(
            "Password Reset Request",
            BSA_RED,
            """
            <p style="font-size: 16px; color: #333333;">We received a request to reset the password for your BSA Camp Card account.</p>
            <p style="font-size: 16px; color: #333333;">Click the button below to create a new password:</p>
            """ + buildButton("Reset Password", resetUrl, BSA_RED) + """
            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #999999; word-break: break-all;">%s</p>
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>This link expires in 24 hours.</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #721c24;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            """.formatted(resetUrl)
        );

        String textBody = """
            Reset Your BSA Camp Card Password

            We received a request to reset the password for your BSA Camp Card account.

            Click the link below to create a new password:

            %s

            This link expires in 24 hours.

            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(resetUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Password reset email sent to: {}", to);
    }

    @Async
    public void sendPasswordChangedConfirmation(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send password changed email to: {}", to);
            return;
        }

        String subject = "Your BSA Camp Card Password Has Been Changed";

        String htmlBody = buildEmailTemplate(
            "Password Changed Successfully",
            SUCCESS_GREEN,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card password has been successfully changed.</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #155724;"><strong>If you made this change:</strong> No further action is needed.</p>
            </div>
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>If you didn't make this change:</strong> Please contact us immediately at support@bsa.swipesavvy.com or reset your password right away.</p>
            </div>
            """.formatted(firstName)
        );

        String textBody = """
            Password Changed Successfully

            Hi %s,

            Your BSA Camp Card password has been successfully changed.

            If you made this change: No further action is needed.

            If you didn't make this change: Please contact us immediately at support@bsa.swipesavvy.com or reset your password right away.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Password changed confirmation sent to: {}", to);
    }

    // ========================================================================
    // WELCOME & ONBOARDING EMAILS
    // ========================================================================

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send welcome email to: {}", to);
            return;
        }

        String subject = "Welcome to BSA Camp Card, " + firstName + "!";
        String appUrl = baseUrl + "/download";

        String htmlBody = buildEmailTemplate(
            "Welcome to the Camp Card Family!",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Welcome to BSA Camp Card! You've joined thousands of families supporting Scouts across America.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Here's What You Can Do:</h3>
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">🎯</span>
                        </td>
                        <td style="padding: 12px 0; padding-left: 12px;">
                            <strong>Discover Local Offers</strong><br/>
                            <span style="color: #666666;">Browse exclusive discounts from merchants in your area</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">📱</span>
                        </td>
                        <td style="padding: 12px 0; padding-left: 12px;">
                            <strong>Redeem with Ease</strong><br/>
                            <span style="color: #666666;">Show your digital card at checkout - no physical card needed</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">🤝</span>
                        </td>
                        <td style="padding: 12px 0; padding-left: 12px;">
                            <strong>Support Local Scouts</strong><br/>
                            <span style="color: #666666;">Every purchase helps fund Scouting adventures</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">🎁</span>
                        </td>
                        <td style="padding: 12px 0; padding-left: 12px;">
                            <strong>Earn Rewards</strong><br/>
                            <span style="color: #666666;">Refer friends and family to earn bonus perks</span>
                        </td>
                    </tr>
                </table>
            </div>

            """ + buildButton("Download the App", appUrl, BSA_NAVY) + """

            <p style="font-size: 16px; color: #333333; margin-top: 24px;">Ready to explore? Open the app and start discovering offers near you!</p>
            <p style="font-size: 16px; color: #333333;">Happy Scouting!</p>
            <p style="font-size: 14px; color: #666666;"><em>The BSA Camp Card Team</em></p>
            """.formatted(firstName, BSA_NAVY)
        );

        String textBody = """
            Welcome to BSA Camp Card, %s!

            Welcome to the Camp Card Family!

            You've joined thousands of families supporting Scouts across America.

            Here's What You Can Do:

            - Discover Local Offers: Browse exclusive discounts from merchants in your area
            - Redeem with Ease: Show your digital card at checkout - no physical card needed
            - Support Local Scouts: Every purchase helps fund Scouting adventures
            - Earn Rewards: Refer friends and family to earn bonus perks

            Download the app: %s

            Ready to explore? Open the app and start discovering offers near you!

            Happy Scouting!
            The BSA Camp Card Team

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, appUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Welcome email sent to: {}", to);
    }

    @Async
    public void sendScoutWelcomeEmail(String to, String scoutFirstName, String troopNumber, String referralCode) {
        if (!emailEnabled) {
            log.info("Email disabled - would send scout welcome email to: {}", to);
            return;
        }

        String subject = "Welcome, Scout " + scoutFirstName + "! Your Camp Card Journey Begins";
        String referralUrl = baseUrl + "/r/" + referralCode;

        String htmlBody = buildEmailTemplate(
            "Your Scouting Adventure Awaits!",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Congratulations on joining the BSA Camp Card program with <strong>Troop %s</strong>!</p>

            <div style="background: linear-gradient(135deg, %s 0%%, #004494 100%%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <h3 style="margin: 0 0 12px 0; color: white;">Your Personal Referral Code</h3>
                <div style="background-color: white; color: %s; font-size: 28px; font-weight: bold; padding: 16px 24px; border-radius: 8px; display: inline-block; letter-spacing: 2px;">
                    %s
                </div>
                <p style="margin: 16px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Share this code with family and friends!</p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">How to Succeed:</h3>
                <ol style="padding-left: 20px; margin: 0;">
                    <li style="padding: 8px 0; color: #333333;"><strong>Share your referral link</strong> with family, friends, and neighbors</li>
                    <li style="padding: 8px 0; color: #333333;"><strong>Track your progress</strong> in the app dashboard</li>
                    <li style="padding: 8px 0; color: #333333;"><strong>Earn recognition</strong> as you reach sales milestones</li>
                    <li style="padding: 8px 0; color: #333333;"><strong>Help your troop</strong> fund amazing adventures!</li>
                </ol>
            </div>

            <p style="font-size: 14px; color: #666666;">Your shareable link: <a href="%s" style="color: %s;">%s</a></p>

            """ + buildButton("View Your Dashboard", baseUrl + "/dashboard", BSA_NAVY) + """

            <p style="font-size: 16px; color: #333333; margin-top: 24px;">Do Your Best!</p>
            <p style="font-size: 14px; color: #666666;"><em>The BSA Camp Card Team</em></p>
            """.formatted(scoutFirstName, troopNumber, BSA_NAVY, BSA_NAVY, referralCode, BSA_NAVY, referralUrl, BSA_NAVY, referralUrl)
        );

        String textBody = """
            Welcome, Scout %s!

            Congratulations on joining the BSA Camp Card program with Troop %s!

            Your Personal Referral Code: %s
            Share this code with family and friends!

            Your shareable link: %s

            How to Succeed:
            1. Share your referral link with family, friends, and neighbors
            2. Track your progress in the app dashboard
            3. Earn recognition as you reach sales milestones
            4. Help your troop fund amazing adventures!

            View your dashboard: %s/dashboard

            Do Your Best!
            The BSA Camp Card Team

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(scoutFirstName, troopNumber, referralCode, referralUrl, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Scout welcome email sent to: {}", to);
    }

    @Async
    public void sendTroopLeaderWelcomeEmail(String to, String firstName, String troopNumber) {
        if (!emailEnabled) {
            log.info("Email disabled - would send troop leader welcome email to: {}", to);
            return;
        }

        String subject = "Welcome, Troop " + troopNumber + " Leader! Your Camp Card Dashboard is Ready";

        String htmlBody = buildEmailTemplate(
            "Lead Your Troop to Success!",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Welcome to the BSA Camp Card program! As the leader of <strong>Troop %s</strong>, you now have access to powerful tools to manage your troop's fundraising campaign.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Your Leader Dashboard Features:</h3>
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                            <span style="font-size: 24px;">📊</span>
                        </td>
                        <td style="padding: 12px 0;">
                            <strong>Real-Time Analytics</strong><br/>
                            <span style="color: #666666;">Track your troop's sales progress and individual Scout performance</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">👥</span>
                        </td>
                        <td style="padding: 12px 0;">
                            <strong>Scout Management</strong><br/>
                            <span style="color: #666666;">Add Scouts, manage accounts, and assign goals</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">🏪</span>
                        </td>
                        <td style="padding: 12px 0;">
                            <strong>Merchant Insights</strong><br/>
                            <span style="color: #666666;">See which local merchants your community supports most</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; vertical-align: top;">
                            <span style="font-size: 24px;">📧</span>
                        </td>
                        <td style="padding: 12px 0;">
                            <strong>Communication Tools</strong><br/>
                            <span style="color: #666666;">Send updates and encouragement to your Scouts</span>
                        </td>
                    </tr>
                </table>
            </div>

            """ + buildButton("Access Your Dashboard", baseUrl + "/leader/dashboard", BSA_NAVY) + """

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Next Step:</strong> Invite your Scouts to join the program! They can sign up using your troop's invitation link in the dashboard.</p>
            </div>

            <p style="font-size: 16px; color: #333333; margin-top: 24px;">Thank you for leading the way!</p>
            <p style="font-size: 14px; color: #666666;"><em>The BSA Camp Card Team</em></p>
            """.formatted(firstName, troopNumber, BSA_NAVY)
        );

        String textBody = """
            Welcome, Troop %s Leader!

            Hi %s,

            Welcome to the BSA Camp Card program! As the leader of Troop %s, you now have access to powerful tools to manage your troop's fundraising campaign.

            Your Leader Dashboard Features:
            - Real-Time Analytics: Track your troop's sales progress and individual Scout performance
            - Scout Management: Add Scouts, manage accounts, and assign goals
            - Merchant Insights: See which local merchants your community supports most
            - Communication Tools: Send updates and encouragement to your Scouts

            Access your dashboard: %s/leader/dashboard

            Next Step: Invite your Scouts to join the program! They can sign up using your troop's invitation link in the dashboard.

            Thank you for leading the way!
            The BSA Camp Card Team

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(troopNumber, firstName, troopNumber, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Troop leader welcome email sent to: {}", to);
    }

    // ========================================================================
    // REFERRAL & SALES EMAILS
    // ========================================================================

    @Async
    public void sendReferralNotification(String to, String scoutName, String customerName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send referral notification to: {}", to);
            return;
        }

        String subject = "New Signup! " + customerName + " Joined Using Your Link";

        String htmlBody = buildEmailTemplate(
            "You've Got a New Referral!",
            SUCCESS_GREEN,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">🎉</span>
            </div>
            <p style="font-size: 18px; color: #333333; text-align: center;">Great job, %s!</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #155724;"><strong>%s</strong> just signed up using your referral link!</p>
            </div>
            <p style="font-size: 16px; color: #333333;">Every referral helps your troop get closer to its fundraising goal. Keep up the amazing work!</p>

            """ + buildButton("View Your Progress", baseUrl + "/dashboard", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px; text-align: center;">Keep sharing your referral link to earn more!</p>
            """.formatted(scoutName, customerName)
        );

        String textBody = """
            You've Got a New Referral!

            Great job, %s!

            %s just signed up using your referral link!

            Every referral helps your troop get closer to its fundraising goal. Keep up the amazing work!

            View your progress: %s/dashboard

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(scoutName, customerName, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Referral notification sent to: {}", to);
    }

    @Async
    public void sendSalesMilestoneEmail(String to, String scoutName, int salesCount, String milestoneName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send sales milestone email to: {}", to);
            return;
        }

        String subject = "Congratulations! You've Reached the " + milestoneName + " Milestone!";

        String htmlBody = buildEmailTemplate(
            "Milestone Achieved!",
            BSA_GOLD,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">🏆</span>
            </div>
            <p style="font-size: 18px; color: #333333; text-align: center;">Outstanding work, %s!</p>

            <div style="background: linear-gradient(135deg, %s 0%%, #e5a912 100%%); border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
                <h2 style="margin: 0 0 8px 0; color: white;">%s</h2>
                <p style="margin: 0; font-size: 48px; font-weight: bold; color: white;">%d Sales</p>
            </div>

            <p style="font-size: 16px; color: #333333;">You've reached the <strong>%s</strong> milestone! Your dedication is making a real difference for your troop.</p>
            <p style="font-size: 16px; color: #333333;">Keep going - the next milestone is within reach!</p>

            """ + buildButton("Share Your Achievement", baseUrl + "/dashboard", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px; text-align: center;">Do Your Best!</p>
            """.formatted(scoutName, BSA_GOLD, milestoneName, salesCount, milestoneName)
        );

        String textBody = """
            Milestone Achieved!

            Outstanding work, %s!

            You've reached the %s milestone with %d sales!

            Your dedication is making a real difference for your troop.
            Keep going - the next milestone is within reach!

            View your progress: %s/dashboard

            Do Your Best!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(scoutName, milestoneName, salesCount, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Sales milestone email sent to: {}", to);
    }

    // ========================================================================
    // SUBSCRIPTION & PAYMENT EMAILS
    // ========================================================================

    @Async
    public void sendSubscriptionConfirmation(String to, String firstName, String planName, BigDecimal amount, LocalDate expirationDate) {
        if (!emailEnabled) {
            log.info("Email disabled - would send subscription confirmation to: {}", to);
            return;
        }

        String subject = "Your BSA Camp Card Subscription is Active!";
        String formattedDate = expirationDate.format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        String formattedAmount = String.format("$%.2f", amount);

        String htmlBody = buildEmailTemplate(
            "Subscription Confirmed",
            SUCCESS_GREEN,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">✅</span>
            </div>
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Thank you for subscribing to BSA Camp Card! Your subscription is now active.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Subscription Details</h3>
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Plan:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Amount Paid:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Valid Until:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">%s</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 16px; color: #333333;">You now have full access to all Camp Card offers. Start exploring and saving!</p>

            """ + buildButton("Browse Offers", baseUrl + "/offers", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Thank you for supporting local Scouts!</p>
            """.formatted(firstName, BSA_NAVY, planName, formattedAmount, formattedDate)
        );

        String textBody = """
            Subscription Confirmed

            Hi %s,

            Thank you for subscribing to BSA Camp Card! Your subscription is now active.

            Subscription Details:
            - Plan: %s
            - Amount Paid: %s
            - Valid Until: %s

            You now have full access to all Camp Card offers. Start exploring and saving!

            Browse offers: %s/offers

            Thank you for supporting local Scouts!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, planName, formattedAmount, formattedDate, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Subscription confirmation sent to: {}", to);
    }

    @Async
    public void sendSubscriptionExpiringReminder(String to, String firstName, int daysRemaining, LocalDate expirationDate) {
        if (!emailEnabled) {
            log.info("Email disabled - would send subscription reminder to: {}", to);
            return;
        }

        String subject = daysRemaining == 1
            ? "Your Camp Card Subscription Expires Tomorrow!"
            : "Your Camp Card Subscription Expires in " + daysRemaining + " Days";
        String formattedDate = expirationDate.format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));

        String htmlBody = buildEmailTemplate(
            "Subscription Expiring Soon",
            WARNING_ORANGE,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">⏰</span>
            </div>
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card subscription expires on <strong>%s</strong>.</p>

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 24px; color: #856404; font-weight: bold;">%d Day%s Remaining</p>
            </div>

            <p style="font-size: 16px; color: #333333;">Don't miss out on exclusive offers from local merchants. Renew now to continue saving!</p>

            """ + buildButton("Renew Subscription", baseUrl + "/subscription/renew", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Questions? Contact us at support@bsa.swipesavvy.com</p>
            """.formatted(firstName, formattedDate, daysRemaining, daysRemaining == 1 ? "" : "s")
        );

        String textBody = """
            Subscription Expiring Soon

            Hi %s,

            Your BSA Camp Card subscription expires on %s.

            %d day%s remaining!

            Don't miss out on exclusive offers from local merchants. Renew now to continue saving!

            Renew: %s/subscription/renew

            Questions? Contact us at support@bsa.swipesavvy.com

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, formattedDate, daysRemaining, daysRemaining == 1 ? "" : "s", baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Subscription expiring reminder sent to: {}", to);
    }

    @Async
    public void sendSubscriptionExpiredEmail(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send subscription expired email to: {}", to);
            return;
        }

        String subject = "Your BSA Camp Card Subscription Has Expired";

        String htmlBody = buildEmailTemplate(
            "Subscription Expired",
            BSA_RED,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card subscription has expired. You no longer have access to exclusive merchant offers.</p>

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #721c24;">Your subscription has ended</p>
            </div>

            <p style="font-size: 16px; color: #333333;">Don't worry - you can renew anytime and pick up right where you left off!</p>
            <p style="font-size: 16px; color: #333333;">By renewing, you'll continue to:</p>
            <ul style="color: #333333;">
                <li>Access exclusive discounts from local merchants</li>
                <li>Support Scouts in your community</li>
                <li>Save money at your favorite stores</li>
            </ul>

            """ + buildButton("Renew Now", baseUrl + "/subscription/renew", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">We hope to see you back soon!</p>
            """.formatted(firstName)
        );

        String textBody = """
            Subscription Expired

            Hi %s,

            Your BSA Camp Card subscription has expired. You no longer have access to exclusive merchant offers.

            Don't worry - you can renew anytime and pick up right where you left off!

            By renewing, you'll continue to:
            - Access exclusive discounts from local merchants
            - Support Scouts in your community
            - Save money at your favorite stores

            Renew now: %s/subscription/renew

            We hope to see you back soon!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Subscription expired email sent to: {}", to);
    }

    @Async
    public void sendPaymentReceiptEmail(String to, String firstName, String transactionId, BigDecimal amount, String description) {
        if (!emailEnabled) {
            log.info("Email disabled - would send payment receipt to: {}", to);
            return;
        }

        String subject = "Payment Receipt - BSA Camp Card";
        String formattedAmount = String.format("$%.2f", amount);
        String formattedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));

        String htmlBody = buildEmailTemplate(
            "Payment Receipt",
            BSA_NAVY,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Thank you for your payment. Here's your receipt:</p>

            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Transaction ID:</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Date:</td>
                        <td style="padding: 8px 0; text-align: right;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;">Description:</td>
                        <td style="padding: 8px 0; text-align: right;">%s</td>
                    </tr>
                    <tr style="border-top: 2px solid #dee2e6;">
                        <td style="padding: 16px 0 8px 0; color: #333333; font-weight: bold;">Amount Paid:</td>
                        <td style="padding: 16px 0 8px 0; text-align: right; font-size: 20px; font-weight: bold; color: %s;">%s</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 14px; color: #666666;">This receipt serves as confirmation of your payment to BSA Camp Card.</p>
            <p style="font-size: 14px; color: #666666;">Questions about your payment? Contact support@bsa.swipesavvy.com</p>
            """.formatted(firstName, transactionId, formattedDate, description, BSA_NAVY, formattedAmount)
        );

        String textBody = """
            Payment Receipt - BSA Camp Card

            Hi %s,

            Thank you for your payment. Here's your receipt:

            Transaction ID: %s
            Date: %s
            Description: %s
            Amount Paid: %s

            This receipt serves as confirmation of your payment to BSA Camp Card.

            Questions about your payment? Contact support@bsa.swipesavvy.com

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, transactionId, formattedDate, description, formattedAmount);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Payment receipt sent to: {}", to);
    }

    // ========================================================================
    // REDEMPTION EMAILS
    // ========================================================================

    @Async
    public void sendRedemptionConfirmation(String to, String firstName, String merchantName, String offerTitle, String redemptionCode) {
        if (!emailEnabled) {
            log.info("Email disabled - would send redemption confirmation to: {}", to);
            return;
        }

        String subject = "Offer Redeemed at " + merchantName;

        String htmlBody = buildEmailTemplate(
            "Redemption Confirmed!",
            SUCCESS_GREEN,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">🎫</span>
            </div>
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">You've successfully redeemed an offer!</p>

            <div style="background-color: #f8f9fa; border: 2px solid %s; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">%s</h3>
                <p style="font-size: 18px; color: #333333; margin: 8px 0;"><strong>%s</strong></p>
                <div style="background-color: white; border: 2px dashed #ccc; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666;">Confirmation Code</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: %s;">%s</p>
                </div>
            </div>

            <p style="font-size: 14px; color: #666666;">Show this email to the merchant if they need to verify your redemption.</p>
            <p style="font-size: 14px; color: #666666;">Thank you for supporting local businesses and Scouts!</p>
            """.formatted(firstName, BSA_NAVY, BSA_NAVY, merchantName, offerTitle, BSA_NAVY, redemptionCode)
        );

        String textBody = """
            Redemption Confirmed!

            Hi %s,

            You've successfully redeemed an offer!

            Merchant: %s
            Offer: %s
            Confirmation Code: %s

            Show this email to the merchant if they need to verify your redemption.

            Thank you for supporting local businesses and Scouts!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, merchantName, offerTitle, redemptionCode);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Redemption confirmation sent to: {}", to);
    }

    // ========================================================================
    // MERCHANT EMAILS
    // ========================================================================

    @Async
    public void sendMerchantWelcomeEmail(String to, String businessName, String contactName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send merchant welcome email to: {}", to);
            return;
        }

        String subject = "Welcome to BSA Camp Card, " + businessName + "!";

        String htmlBody = buildEmailTemplate(
            "Welcome to the Camp Card Network!",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Thank you for joining the BSA Camp Card merchant network! <strong>%s</strong> is now part of a community of local businesses supporting Scouts across America.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">What Happens Next:</h3>
                <ol style="padding-left: 20px; margin: 0; color: #333333;">
                    <li style="padding: 8px 0;">Our team will review your application</li>
                    <li style="padding: 8px 0;">Once approved, you'll receive access to your merchant dashboard</li>
                    <li style="padding: 8px 0;">Create your offers and start attracting Camp Card customers</li>
                    <li style="padding: 8px 0;">Track redemptions and see your community impact</li>
                </ol>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #155724;"><strong>Approval typically takes 1-2 business days.</strong> We'll email you as soon as your account is ready!</p>
            </div>

            <p style="font-size: 14px; color: #666666;">Questions? Contact our merchant support team at merchants@bsa.swipesavvy.com</p>
            """.formatted(contactName, businessName, BSA_NAVY)
        );

        String textBody = """
            Welcome to the Camp Card Network!

            Hi %s,

            Thank you for joining the BSA Camp Card merchant network! %s is now part of a community of local businesses supporting Scouts across America.

            What Happens Next:
            1. Our team will review your application
            2. Once approved, you'll receive access to your merchant dashboard
            3. Create your offers and start attracting Camp Card customers
            4. Track redemptions and see your community impact

            Approval typically takes 1-2 business days. We'll email you as soon as your account is ready!

            Questions? Contact our merchant support team at merchants@bsa.swipesavvy.com

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(contactName, businessName);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Merchant welcome email sent to: {}", to);
    }

    // ========================================================================
    // MARKETING CAMPAIGN EMAILS
    // ========================================================================

    /**
     * Send a marketing campaign email with tracking
     * Used by CampaignDispatchService for bulk campaign delivery
     */
    @Async
    public void sendCampaignEmail(String to, String firstName, String subject,
                                   String htmlContent, String textContent, String campaignId) {
        if (!emailEnabled) {
            log.info("Email disabled - would send campaign email to: {} for campaign {}", to, campaignId);
            return;
        }

        // Add tracking pixel for open tracking
        String trackingPixel = String.format(
            "<img src=\"%s/api/v1/campaigns/%s/track/open?email=%s\" width=\"1\" height=\"1\" alt=\"\" />",
            baseUrl, campaignId, java.net.URLEncoder.encode(to, java.nio.charset.StandardCharsets.UTF_8)
        );

        // Wrap links for click tracking
        String trackedHtml = htmlContent;
        if (trackedHtml != null) {
            trackedHtml = addClickTracking(trackedHtml, campaignId, to);
        }

        // Build the campaign email template
        String personalizedHtml = trackedHtml;
        if (personalizedHtml != null && firstName != null) {
            personalizedHtml = personalizedHtml.replace("{{firstName}}", firstName);
            personalizedHtml = personalizedHtml.replace("{{first_name}}", firstName);
        }

        // Add unsubscribe link
        String unsubscribeUrl = String.format(
            "%s/unsubscribe?email=%s&campaign=%s",
            baseUrl,
            java.net.URLEncoder.encode(to, java.nio.charset.StandardCharsets.UTF_8),
            campaignId
        );

        String htmlBody = buildCampaignEmailTemplate(
            subject,
            personalizedHtml != null ? personalizedHtml : "",
            trackingPixel,
            unsubscribeUrl
        );

        String textBody = textContent;
        if (textBody != null && firstName != null) {
            textBody = textBody.replace("{{firstName}}", firstName);
            textBody = textBody.replace("{{first_name}}", firstName);
        }
        if (textBody == null) {
            textBody = "Visit " + baseUrl + " to view this message.";
        }
        textBody += "\n\n---\nTo unsubscribe: " + unsubscribeUrl;

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Campaign email sent to: {} for campaign {}", to, campaignId);
    }

    /**
     * Build email template specifically for marketing campaigns
     */
    private String buildCampaignEmailTemplate(String title, String content, String trackingPixel, String unsubscribeUrl) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px 0;">
                            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, %s 0%%, #004494 100%%); padding: 24px; text-align: center;">
                                        <h1 style="color: white; margin: 0; font-size: 24px;">BSA Camp Card</h1>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 32px 24px;">
                                        %s
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 24px; border-top: 1px solid #dee2e6;">
                                        <table role="presentation" style="width: 100%%;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                                                        <strong>BSA Camp Card</strong> | Supporting Scouts, One Card at a Time
                                                    </p>
                                                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #999999;">
                                                        You received this email because you're a BSA Camp Card member.
                                                    </p>
                                                    <p style="margin: 0; font-size: 11px; color: #aaaaaa;">
                                                        <a href="%s" style="color: #999999;">Unsubscribe</a> |
                                                        <a href="%s/privacy" style="color: #999999;">Privacy Policy</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                %s
            </body>
            </html>
            """.formatted(title, BSA_NAVY, content, unsubscribeUrl, baseUrl, trackingPixel);
    }

    /**
     * Add click tracking to links in HTML content
     */
    private String addClickTracking(String html, String campaignId, String email) {
        // Simple link wrapping for tracking - wraps href URLs
        String encodedEmail = java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8);
        String trackingPrefix = baseUrl + "/api/v1/campaigns/" + campaignId + "/track/click?email=" + encodedEmail + "&url=";

        // Use regex to find and wrap links
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "href=[\"']([^\"']+)[\"']",
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher matcher = pattern.matcher(html);

        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String originalUrl = matcher.group(1);
            // Skip mailto, tel, and anchor links
            if (!originalUrl.startsWith("mailto:") &&
                !originalUrl.startsWith("tel:") &&
                !originalUrl.startsWith("#") &&
                !originalUrl.contains("/track/")) {
                String trackedUrl = trackingPrefix + java.net.URLEncoder.encode(originalUrl, java.nio.charset.StandardCharsets.UTF_8);
                matcher.appendReplacement(result, "href=\"" + trackedUrl + "\"");
            } else {
                matcher.appendReplacement(result, matcher.group(0));
            }
        }
        matcher.appendTail(result);

        return result.toString();
    }

    @Async
    public void sendMerchantRejectionEmail(String to, String businessName, String contactName, String reason) {
        if (!emailEnabled) {
            log.info("Email disabled - would send merchant rejection email to: {}", to);
            return;
        }

        String subject = "Update on Your BSA Camp Card Application";

        String htmlBody = buildEmailTemplate(
            "Application Update",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Thank you for your interest in joining the BSA Camp Card merchant network with <strong>%s</strong>.</p>
            <p style="font-size: 16px; color: #333333;">After reviewing your application, we are unable to approve it at this time.</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid %s; padding: 16px 24px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #666666;"><strong>Reason:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #333333;">%s</p>
            </div>

            <p style="font-size: 16px; color: #333333;">If you believe this decision was made in error, or if you'd like to provide additional information, please contact our merchant support team.</p>

            """ + buildButton("Contact Support", "mailto:merchants@bsa.swipesavvy.com", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">We appreciate your interest in supporting Scouts and hope to work with you in the future.</p>
            """.formatted(contactName, businessName, BSA_NAVY, reason)
        );

        String textBody = """
            Application Update

            Hi %s,

            Thank you for your interest in joining the BSA Camp Card merchant network with %s.

            After reviewing your application, we are unable to approve it at this time.

            Reason: %s

            If you believe this decision was made in error, or if you'd like to provide additional information, please contact our merchant support team at merchants@bsa.swipesavvy.com

            We appreciate your interest in supporting Scouts and hope to work with you in the future.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(contactName, businessName, reason);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Merchant rejection email sent to: {}", to);
    }

    // ========================================================================
    // INVITATION EMAILS
    // ========================================================================

    @Async
    public void sendScoutInvitationEmail(String to, String scoutName, String troopNumber, String inviterName, String inviteToken) {
        if (!emailEnabled) {
            log.info("Email disabled - would send scout invitation email to: {}", to);
            return;
        }

        String subject = "You're Invited to Join BSA Camp Card - Troop " + troopNumber;
        String inviteUrl = baseUrl + "/join/scout?token=" + inviteToken;

        String htmlBody = buildEmailTemplate(
            "You're Invited to Join!",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;"><strong>%s</strong> has invited you to join the BSA Camp Card program with <strong>Troop %s</strong>!</p>

            <div style="background: linear-gradient(135deg, %s 0%%, #004494 100%%); border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
                <span style="font-size: 64px;">⚜️</span>
                <h2 style="color: white; margin: 16px 0 8px 0;">Join the Adventure!</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 0;">Start your Camp Card fundraising journey</p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">As a Scout, you'll be able to:</h3>
                <ul style="padding-left: 20px; margin: 0; color: #333333;">
                    <li style="padding: 6px 0;">Get your own referral code to share</li>
                    <li style="padding: 6px 0;">Track your sales progress</li>
                    <li style="padding: 6px 0;">Earn recognition for milestones</li>
                    <li style="padding: 6px 0;">Help your troop reach its fundraising goals</li>
                </ul>
            </div>

            """ + buildButton("Accept Invitation", inviteUrl, BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #999999; word-break: break-all;">%s</p>

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>This invitation expires in 7 days.</strong></p>
            </div>
            """.formatted(scoutName, inviterName, troopNumber, BSA_NAVY, BSA_NAVY, inviteUrl)
        );

        String textBody = """
            You're Invited to Join BSA Camp Card!

            Hi %s,

            %s has invited you to join the BSA Camp Card program with Troop %s!

            As a Scout, you'll be able to:
            - Get your own referral code to share
            - Track your sales progress
            - Earn recognition for milestones
            - Help your troop reach its fundraising goals

            Accept your invitation: %s

            This invitation expires in 7 days.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(scoutName, inviterName, troopNumber, inviteUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Scout invitation email sent to: {}", to);
    }

    @Async
    public void sendParentInvitationEmail(String to, String parentName, String scoutName, String troopNumber, String inviteToken) {
        if (!emailEnabled) {
            log.info("Email disabled - would send parent invitation email to: {}", to);
            return;
        }

        String subject = "Join BSA Camp Card to Support " + scoutName;
        String inviteUrl = baseUrl + "/join/parent?token=" + inviteToken;

        String htmlBody = buildEmailTemplate(
            "Support Your Scout!",
            BSA_GOLD,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your Scout, <strong>%s</strong>, is participating in the BSA Camp Card fundraising program with <strong>Troop %s</strong>!</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Why Create a Parent Account?</h3>
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                            <span style="font-size: 20px;">📊</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Track Progress</strong><br/>
                            <span style="color: #666666;">Monitor your Scout's fundraising achievements</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                            <span style="font-size: 20px;">🎫</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Access Offers</strong><br/>
                            <span style="color: #666666;">Browse and redeem exclusive merchant discounts</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                            <span style="font-size: 20px;">🔗</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Share Links</strong><br/>
                            <span style="color: #666666;">Help spread the word to friends and family</span>
                        </td>
                    </tr>
                </table>
            </div>

            """ + buildButton("Create Parent Account", inviteUrl, BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Thank you for supporting Scouting!</p>
            """.formatted(parentName, scoutName, troopNumber, BSA_NAVY)
        );

        String textBody = """
            Support Your Scout with BSA Camp Card!

            Hi %s,

            Your Scout, %s, is participating in the BSA Camp Card fundraising program with Troop %s!

            Why Create a Parent Account?
            - Track Progress: Monitor your Scout's fundraising achievements
            - Access Offers: Browse and redeem exclusive merchant discounts
            - Share Links: Help spread the word to friends and family

            Create your account: %s

            Thank you for supporting Scouting!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(parentName, scoutName, troopNumber, inviteUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Parent invitation email sent to: {}", to);
    }

    // ========================================================================
    // ADMIN & COUNCIL EMAILS
    // ========================================================================

    @Async
    public void sendCouncilAdminWelcomeEmail(String to, String firstName, String councilName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send council admin welcome email to: {}", to);
            return;
        }

        String subject = "Welcome, " + councilName + " Administrator!";

        String htmlBody = buildEmailTemplate(
            "Council Admin Access Granted",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">You've been granted administrator access for <strong>%s</strong> in the BSA Camp Card system.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Your Admin Capabilities:</h3>
                <table style="width: 100%%;">
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 40px;">
                            <span style="font-size: 20px;">🏕️</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Manage Troops</strong><br/>
                            <span style="color: #666666;">Add, edit, and monitor troops in your council</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                            <span style="font-size: 20px;">🏪</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Approve Merchants</strong><br/>
                            <span style="color: #666666;">Review and approve local merchant applications</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                            <span style="font-size: 20px;">📈</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>View Analytics</strong><br/>
                            <span style="color: #666666;">Access council-wide fundraising reports</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                            <span style="font-size: 20px;">👥</span>
                        </td>
                        <td style="padding: 10px 0;">
                            <strong>Manage Users</strong><br/>
                            <span style="color: #666666;">Oversee troop leaders and Scout accounts</span>
                        </td>
                    </tr>
                </table>
            </div>

            """ + buildButton("Access Admin Dashboard", baseUrl + "/admin/dashboard", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Questions? Contact national support at support@bsa.swipesavvy.com</p>
            """.formatted(firstName, councilName, BSA_NAVY)
        );

        String textBody = """
            Council Admin Access Granted

            Hi %s,

            You've been granted administrator access for %s in the BSA Camp Card system.

            Your Admin Capabilities:
            - Manage Troops: Add, edit, and monitor troops in your council
            - Approve Merchants: Review and approve local merchant applications
            - View Analytics: Access council-wide fundraising reports
            - Manage Users: Oversee troop leaders and Scout accounts

            Access your dashboard: %s/admin/dashboard

            Questions? Contact national support at support@bsa.swipesavvy.com

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, councilName, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Council admin welcome email sent to: {}", to);
    }

    // ========================================================================
    // NOTIFICATION EMAILS
    // ========================================================================

    @Async
    public void sendNewOfferNotification(String to, String firstName, String merchantName, String offerTitle, String discountDescription) {
        if (!emailEnabled) {
            log.info("Email disabled - would send new offer notification to: {}", to);
            return;
        }

        String subject = "New Offer: " + offerTitle + " at " + merchantName;

        String htmlBody = buildEmailTemplate(
            "New Offer Available!",
            BSA_GOLD,
            """
            <div style="text-align: center; padding: 16px 0;">
                <span style="font-size: 48px;">🎉</span>
            </div>
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">A new offer is now available from one of your favorite merchants!</p>

            <div style="background: linear-gradient(135deg, %s 0%%, #e5a912 100%%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">%s</p>
                <h2 style="margin: 0 0 12px 0; color: white; font-size: 24px;">%s</h2>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 18px;">%s</p>
            </div>

            """ + buildButton("View Offer", baseUrl + "/offers", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px; text-align: center;">Don't miss out - redeem this offer today!</p>
            """.formatted(firstName, BSA_GOLD, merchantName, offerTitle, discountDescription)
        );

        String textBody = """
            New Offer Available!

            Hi %s,

            A new offer is now available from one of your favorite merchants!

            %s
            %s
            %s

            View this offer: %s/offers

            Don't miss out - redeem this offer today!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, merchantName, offerTitle, discountDescription, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("New offer notification sent to: {}", to);
    }

    @Async
    public void sendWeeklyTroopSummary(String to, String leaderName, String troopNumber,
                                        int totalSales, int newSubscribers,
                                        BigDecimal amountRaised, String topScoutName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send weekly troop summary to: {}", to);
            return;
        }

        String subject = "Weekly Summary: Troop " + troopNumber + " Fundraising Update";
        String formattedAmount = String.format("$%.2f", amountRaised);

        String htmlBody = buildEmailTemplate(
            "Weekly Troop Summary",
            BSA_NAVY,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Here's this week's fundraising summary for <strong>Troop %s</strong>:</p>

            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0;">
                <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: %s;">%d</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">Total Sales</p>
                </div>
                <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: %s;">%d</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">New Subscribers</p>
                </div>
                <div style="flex: 1; min-width: 120px; background-color: #d4edda; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: %s;">%s</p>
                    <p style="margin: 0; font-size: 14px; color: #155724;">Amount Raised</p>
                </div>
            </div>

            %s

            """ + buildButton("View Full Report", baseUrl + "/leader/dashboard", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Keep up the great work!</p>
            """.formatted(
                leaderName, troopNumber, BSA_NAVY, totalSales, BSA_NAVY, newSubscribers,
                SUCCESS_GREEN, formattedAmount,
                topScoutName != null ? """
                <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">🏆 <strong>Top Scout This Week:</strong> %s</p>
                </div>
                """.formatted(topScoutName) : ""
            )
        );

        String textBody = """
            Weekly Troop Summary

            Hi %s,

            Here's this week's fundraising summary for Troop %s:

            - Total Sales: %d
            - New Subscribers: %d
            - Amount Raised: %s
            %s

            View full report: %s/leader/dashboard

            Keep up the great work!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(leaderName, troopNumber, totalSales, newSubscribers, formattedAmount,
                topScoutName != null ? "\nTop Scout This Week: " + topScoutName : "", baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Weekly troop summary sent to: {}", to);
    }

    @Async
    public void sendAccountDeactivationNotice(String to, String firstName, String reason) {
        if (!emailEnabled) {
            log.info("Email disabled - would send account deactivation notice to: {}", to);
            return;
        }

        String subject = "Your BSA Camp Card Account Has Been Deactivated";

        String htmlBody = buildEmailTemplate(
            "Account Deactivated",
            BSA_RED,
            """
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card account has been deactivated.</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid %s; padding: 16px 24px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #666666;"><strong>Reason:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #333333;">%s</p>
            </div>

            <p style="font-size: 16px; color: #333333;">If you believe this was done in error, or if you have questions, please contact our support team.</p>

            """ + buildButton("Contact Support", "mailto:support@bsa.swipesavvy.com", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">We're here to help if you need assistance.</p>
            """.formatted(firstName, BSA_RED, reason)
        );

        String textBody = """
            Account Deactivated

            Hi %s,

            Your BSA Camp Card account has been deactivated.

            Reason: %s

            If you believe this was done in error, or if you have questions, please contact our support team at support@bsa.swipesavvy.com

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, reason);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Account deactivation notice sent to: {}", to);
    }

    @Async
    public void sendMerchantApprovalEmail(String to, String businessName, String contactName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send merchant approval email to: {}", to);
            return;
        }

        String subject = "Congratulations! " + businessName + " is Now Approved";

        String htmlBody = buildEmailTemplate(
            "Your Merchant Account is Approved!",
            SUCCESS_GREEN,
            """
            <div style="text-align: center; padding: 24px 0;">
                <span style="font-size: 64px;">✅</span>
            </div>
            <p style="font-size: 18px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Great news! <strong>%s</strong> has been approved to join the BSA Camp Card merchant network!</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Get Started:</h3>
                <ol style="padding-left: 20px; margin: 0; color: #333333;">
                    <li style="padding: 8px 0;"><strong>Log into your dashboard</strong> to set up your business profile</li>
                    <li style="padding: 8px 0;"><strong>Create your first offer</strong> - we recommend starting with your most popular item!</li>
                    <li style="padding: 8px 0;"><strong>Download marketing materials</strong> to display at your location</li>
                    <li style="padding: 8px 0;"><strong>Start accepting Camp Card customers!</strong></li>
                </ol>
            </div>

            """ + buildButton("Access Merchant Dashboard", baseUrl + "/merchant/dashboard", BSA_NAVY) + """

            <p style="font-size: 14px; color: #666666; margin-top: 24px;">Welcome to the Camp Card family!</p>
            """.formatted(contactName, businessName, BSA_NAVY)
        );

        String textBody = """
            Your Merchant Account is Approved!

            Hi %s,

            Great news! %s has been approved to join the BSA Camp Card merchant network!

            Get Started:
            1. Log into your dashboard to set up your business profile
            2. Create your first offer - we recommend starting with your most popular item!
            3. Download marketing materials to display at your location
            4. Start accepting Camp Card customers!

            Access your dashboard: %s/merchant/dashboard

            Welcome to the Camp Card family!

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(contactName, businessName, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Merchant approval email sent to: {}", to);
    }

    // ========================================================================
    // ACCOUNT CHANGE NOTIFICATIONS
    // ========================================================================

    @Async
    public void sendProfileUpdateNotification(String to, String firstName, String changedFields) {
        if (!emailEnabled) {
            log.info("Email disabled - would send profile update notification to: {}", to);
            return;
        }

        String subject = "Your BSA Camp Card Profile Has Been Updated";

        String htmlBody = buildEmailTemplate(
            "Profile Updated",
            BSA_NAVY,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card profile has been successfully updated.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Updated Information:</h3>
                <p style="font-size: 14px; color: #666666; margin: 0;">%s</p>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>If you didn't make this change:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #856404;">Please contact us immediately at support@bsa.swipesavvy.com to secure your account.</p>
            </div>
            """.formatted(firstName, BSA_NAVY, changedFields)
        );

        String textBody = """
            Profile Updated

            Hi %s,

            Your BSA Camp Card profile has been successfully updated.

            Updated Information:
            %s

            If you didn't make this change, please contact us immediately at support@bsa.swipesavvy.com to secure your account.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, changedFields);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Profile update notification sent to: {}", to);
    }

    @Async
    public void sendEmailChangeNotification(String oldEmail, String newEmail, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send email change notification");
            return;
        }

        String subject = "Your BSA Camp Card Email Address Has Been Changed";

        // Send to both old and new email addresses
        String htmlBody = buildEmailTemplate(
            "Email Address Changed",
            WARNING_ORANGE,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your BSA Camp Card email address has been changed.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 14px; color: #666666; margin: 0 0 8px 0;"><strong>Previous Email:</strong> %s</p>
                <p style="font-size: 14px; color: #666666; margin: 0;"><strong>New Email:</strong> %s</p>
            </div>

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>⚠️ Security Alert:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #721c24;">If you didn't make this change, your account may have been compromised. Please contact us immediately at support@bsa.swipesavvy.com.</p>
            </div>
            """.formatted(firstName, oldEmail, newEmail)
        );

        String textBody = """
            Email Address Changed

            Hi %s,

            Your BSA Camp Card email address has been changed.

            Previous Email: %s
            New Email: %s

            ⚠️ Security Alert:
            If you didn't make this change, your account may have been compromised. Please contact us immediately at support@bsa.swipesavvy.com.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, oldEmail, newEmail);

        // Send to old email
        sendEmail(oldEmail, subject, htmlBody, textBody);
        // Send to new email
        sendEmail(newEmail, subject, htmlBody, textBody);

        log.info("Email change notification sent to: {} and {}", oldEmail, newEmail);
    }

    @Async
    public void sendSecuritySettingsChangedNotification(String to, String firstName, String settingChanged) {
        if (!emailEnabled) {
            log.info("Email disabled - would send security settings notification to: {}", to);
            return;
        }

        String subject = "Security Settings Changed on Your BSA Camp Card Account";

        String htmlBody = buildEmailTemplate(
            "Security Settings Updated",
            BSA_RED,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">A security setting on your BSA Camp Card account has been changed.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 14px; color: #666666; margin: 0;"><strong>Changed Setting:</strong> %s</p>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #155724;"><strong>If you made this change:</strong> No further action is needed.</p>
            </div>

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>If you didn't make this change:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #721c24;">Please contact us immediately at support@bsa.swipesavvy.com or change your password right away.</p>
            </div>
            """.formatted(firstName, settingChanged)
        );

        String textBody = """
            Security Settings Updated

            Hi %s,

            A security setting on your BSA Camp Card account has been changed.

            Changed Setting: %s

            If you made this change: No further action is needed.

            If you didn't make this change: Please contact us immediately at support@bsa.swipesavvy.com or change your password right away.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, settingChanged);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Security settings notification sent to: {}", to);
    }

    @Async
    public void sendAccountDeletionRequestNotification(String to, String firstName) {
        if (!emailEnabled) {
            log.info("Email disabled - would send account deletion notification to: {}", to);
            return;
        }

        String subject = "Account Deletion Request - BSA Camp Card";

        String htmlBody = buildEmailTemplate(
            "Account Deletion Requested",
            BSA_RED,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">We've received a request to delete your BSA Camp Card account.</p>

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>⏰ Waiting Period:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #856404;">Your account will be permanently deleted in 30 days. During this time, you can still sign in to cancel the deletion request.</p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">What happens when your account is deleted:</h3>
                <ul style="padding-left: 20px; color: #666666;">
                    <li style="margin-bottom: 8px;">All your personal information will be permanently removed</li>
                    <li style="margin-bottom: 8px;">Your subscription and payment history will be deleted</li>
                    <li style="margin-bottom: 8px;">Your referral code will be deactivated</li>
                    <li style="margin-bottom: 8px;">This action cannot be undone</li>
                </ul>
            </div>

            """ + buildButton("Cancel Deletion", baseUrl + "/cancel-deletion", BSA_NAVY) + """

            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #721c24;"><strong>Didn't request this?</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #721c24;">Contact us immediately at support@bsa.swipesavvy.com to secure your account.</p>
            </div>
            """.formatted(firstName, BSA_RED)
        );

        String textBody = """
            Account Deletion Requested

            Hi %s,

            We've received a request to delete your BSA Camp Card account.

            ⏰ Waiting Period:
            Your account will be permanently deleted in 30 days. During this time, you can still sign in to cancel the deletion request.

            What happens when your account is deleted:
            - All your personal information will be permanently removed
            - Your subscription and payment history will be deleted
            - Your referral code will be deactivated
            - This action cannot be undone

            To cancel deletion, visit: %s/cancel-deletion

            Didn't request this? Contact us immediately at support@bsa.swipesavvy.com to secure your account.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, baseUrl);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Account deletion notification sent to: {}", to);
    }

    @Async
    public void sendNotificationSettingsChangedNotification(String to, String firstName, String changes) {
        if (!emailEnabled) {
            log.info("Email disabled - would send notification settings notification to: {}", to);
            return;
        }

        String subject = "Notification Preferences Updated - BSA Camp Card";

        String htmlBody = buildEmailTemplate(
            "Notification Preferences Updated",
            BSA_GOLD,
            """
            <p style="font-size: 16px; color: #333333;">Hi %s,</p>
            <p style="font-size: 16px; color: #333333;">Your notification preferences have been updated.</p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: %s; margin-top: 0;">Updated Preferences:</h3>
                <p style="font-size: 14px; color: #666666; margin: 0;">%s</p>
            </div>

            <p style="font-size: 14px; color: #666666;">You can manage your notification preferences anytime in your account settings.</p>
            """.formatted(firstName, BSA_NAVY, changes)
        );

        String textBody = """
            Notification Preferences Updated

            Hi %s,

            Your notification preferences have been updated.

            Updated Preferences:
            %s

            You can manage your notification preferences anytime in your account settings.

            ---
            BSA Camp Card
            Supporting Scouts, One Card at a Time
            """.formatted(firstName, changes);

        sendEmail(to, subject, htmlBody, textBody);
        log.info("Notification settings notification sent to: {}", to);
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

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

    private String buildButton(String text, String url, String color) {
        return """
            <p style="text-align: center; margin: 24px 0;">
                <a href="%s" style="display: inline-block; background-color: %s; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">%s</a>
            </p>
            """.formatted(url, color, text);
    }

    private String buildEmailTemplate(String title, String headerColor, String content) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
                <!--[if mso]>
                <style type="text/css">
                    table {border-collapse: collapse;}
                    .button {padding: 14px 32px !important;}
                </style>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px 0;">
                            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, %s 0%%, %s 100%%); padding: 32px 24px; text-align: center;">
                                        <table role="presentation" style="width: 100%%;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <!-- Camp Card Logo -->
                                                    <img src="%s/images/campcard-logo.png" alt="BSA Camp Card" style="max-width: 200px; height: auto; margin-bottom: 16px;" />
                                                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Supporting Scouts, One Card at a Time</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Title Bar -->
                                <tr>
                                    <td style="background-color: %s; padding: 16px 24px; text-align: center;">
                                        <h2 style="color: white; margin: 0; font-size: 20px;">%s</h2>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 32px 24px;">
                                        %s
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 24px; border-top: 1px solid #dee2e6;">
                                        <table role="presentation" style="width: 100%%;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                                                        <strong>BSA Camp Card</strong> | A Boy Scouts of America Fundraising Program
                                                    </p>
                                                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #999999;">
                                                        Questions? Contact us at <a href="mailto:support@bsa.swipesavvy.com" style="color: %s;">support@bsa.swipesavvy.com</a>
                                                    </p>
                                                    <p style="margin: 0; font-size: 11px; color: #aaaaaa;">
                                                        © %d Boy Scouts of America. All rights reserved.<br/>
                                                        <a href="%s/privacy" style="color: #999999;">Privacy Policy</a> |
                                                        <a href="%s/terms" style="color: #999999;">Terms of Service</a> |
                                                        <a href="%s/unsubscribe" style="color: #999999;">Unsubscribe</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                title,
                BSA_NAVY,
                "#004494",
                webPortalUrl,
                headerColor,
                title,
                content,
                BSA_NAVY,
                java.time.Year.now().getValue(),
                baseUrl, baseUrl, baseUrl
            );
    }
}

// Privacy Policy Screen - Display privacy policy
// Published by Swipe Savvy, LLC

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWebsite = () => {
    Linking.openURL('https://www.campcardapp.org');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.publisherBadge}>
            <Text style={styles.publisherText}>Published by Swipe Savvy, LLC</Text>
          </View>
          <Text style={styles.lastUpdated}>Last Updated: January 30, 2026</Text>

          <View style={styles.introduction}>
            <Text style={styles.paragraph}>
              Swipe Savvy, LLC ("Swipe Savvy," "we," "us," or "our") is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use the Camp Card mobile application ("App"),
              the Camp Card website at https://www.campcardapp.org ("Website"), and all related
              services (collectively, the "Service").
            </Text>
            <Text style={styles.paragraph}>
              This Policy applies to all users of the Service, including Scouts, parents/guardians,
              troop leaders, council administrators, and national administrators. Please read this
              Privacy Policy carefully. By accessing or using the Service, you acknowledge that you
              have read, understood, and agree to the practices described herein. If you do not agree
              with this Privacy Policy, you must discontinue use of the Service immediately.
            </Text>
            <Text style={styles.paragraph}>
              Camp Card is a digital fundraising platform developed for Scouting America to facilitate camp card sales, merchant offer redemptions, and troop/council
              fundraising reporting. The Service allows Scouts and their families to purchase digital
              camp cards, redeem offers at participating merchants, and track fundraising progress
              for their troops and councils.
            </Text>
          </View>

          {/* Key Points Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Key Privacy Points</Text>
            <View style={styles.summaryItem}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <Text style={styles.summaryText}>We do NOT sell your personal information</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="lock-closed" size={16} color={COLORS.success} />
              <Text style={styles.summaryText}>Data encrypted with industry-standard security</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={16} color={COLORS.success} />
              <Text style={styles.summaryText}>COPPA compliant for children's privacy</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="document-text" size={16} color={COLORS.success} />
              <Text style={styles.summaryText}>CCPA compliant for California residents</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="ribbon" size={16} color={COLORS.success} />
              <Text style={styles.summaryText}>Scout data used only for fundraising reporting and sales tracking</Text>
            </View>
          </View>

          <Section title="1. Information We Collect">
            <Text style={styles.sectionSubtitle}>A. Information You Provide Directly</Text>
            <BulletPoint>
              <Text style={styles.bold}>Account Information:</Text> Full name, email address,
              password (stored in encrypted/hashed form only), phone number (optional), role
              designation (Scout, Parent, Troop Leader, Council Admin, or National Admin), and
              profile photo (optional)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Payment Information:</Text> Credit/debit card details
              (tokenized and processed securely by Authorize.net -- we never store raw card numbers),
              billing name, billing address, and transaction history including subscription purchases,
              renewals, and refunds
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Scout/Troop Information:</Text> Scout registration number,
              troop/unit number and affiliation, council association, pack or crew identifiers, and
              scout referral code for fundraising attribution and sales tracking
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>User-Generated Content:</Text> Saved merchant favorites,
              offer redemption history, QR code scan records, support inquiries and correspondence,
              and feedback or reviews submitted through the Service
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>B. Information Collected Automatically</Text>
            <BulletPoint>
              <Text style={styles.bold}>Device Information:</Text> Device type, model, and
              manufacturer; operating system type and version; unique device identifiers (e.g.,
              IDFA, Android Advertising ID); mobile carrier and network information; screen
              resolution and display settings
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Usage Information:</Text> App features accessed and
              frequency of use; time, date, and duration of sessions; screens and pages viewed;
              actions taken within the App (e.g., offers viewed, QR codes scanned, subscriptions
              purchased); search queries entered; crash reports and performance diagnostics
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Location Information:</Text> GPS coordinates (only with
              your explicit permission); IP address-based approximate location; Wi-Fi access
              point data used for location approximation
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>C. Information from Third Parties</Text>
            <BulletPoint>
              <Text style={styles.bold}>Scouting America Organizations:</Text> Troop rosters, council
              membership data, and Scout registration verification provided by authorized Scouting America
              representatives for account validation and fundraising attribution
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Payment Processors:</Text> Transaction confirmation,
              payment status, and fraud screening results from Authorize.net
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Analytics Providers:</Text> Aggregated usage patterns,
              app performance metrics, and anonymized behavioral data from Firebase Analytics
            </BulletPoint>
          </Section>

          <Section title="2. Scout Data Usage Limitation">
            <View style={styles.highlightBox}>
              <Ionicons name="ribbon" size={20} color={COLORS.primary} />
              <Text style={styles.highlightText}>
                Scout information -- including registration numbers, troop/unit affiliation,
                council association, and referral codes -- is collected and used solely for
                fundraising reporting and sales tracking. This data is never used for marketing,
                advertising, behavioral profiling, or any unrelated purpose.
              </Text>
            </View>
            <Text style={styles.paragraph}>
              We recognize the sensitive nature of information pertaining to youth participants.
              Scout-specific data is subject to heightened protections and strict use limitations.
              Access to Scout data is restricted on a role-based, need-to-know basis: troop
              leaders may view data for Scouts within their troop, council administrators may
              view aggregate data for their council, and national administrators may view aggregate
              data for program oversight.
            </Text>
            <Text style={styles.paragraph}>
              Scout data is never shared with merchants, advertisers, data brokers, or any third
              party for purposes unrelated to Scouting America fundraising operations. We do not create
              marketing profiles of Scouts, nor do we use Scout data to serve targeted
              advertisements or make automated decisions that produce legal or similarly
              significant effects on minors.
            </Text>
          </Section>

          <Section title="3. How We Use Your Information">
            <Text style={styles.paragraph}>We use the information we collect for the following purposes:</Text>

            <Text style={styles.sectionSubtitle}>Service Provision and Operations</Text>
            <BulletPoint>Creating, maintaining, and authenticating your account</BulletPoint>
            <BulletPoint>Processing subscriptions, payments, and refunds through Authorize.net</BulletPoint>
            <BulletPoint>Providing access to merchant offers and enabling QR code redemption</BulletPoint>
            <BulletPoint>Displaying nearby participating merchants based on your location</BulletPoint>
            <BulletPoint>Tracking savings, redemptions, and subscription status</BulletPoint>
            <BulletPoint>Generating fundraising reports and tracking sales for troops and councils (Scout data is used exclusively for this purpose)</BulletPoint>
            <BulletPoint>Attributing camp card purchases and offer redemptions to the appropriate Scout, troop, and council</BulletPoint>

            <Text style={styles.sectionSubtitle}>Communication</Text>
            <BulletPoint>Sending account-related notifications (e.g., password resets, subscription confirmations, payment receipts)</BulletPoint>
            <BulletPoint>Delivering push notifications about new offers, subscription reminders, and account activity</BulletPoint>
            <BulletPoint>Responding to customer support inquiries and technical issues</BulletPoint>
            <BulletPoint>Communicating policy changes, service updates, and security alerts</BulletPoint>

            <Text style={styles.sectionSubtitle}>Analytics and Improvement</Text>
            <BulletPoint>Analyzing usage patterns to improve App functionality, user interface, and overall experience</BulletPoint>
            <BulletPoint>Conducting research and analysis to develop new features and services</BulletPoint>
            <BulletPoint>Monitoring App performance, uptime, and error rates</BulletPoint>

            <Text style={styles.sectionSubtitle}>Security and Compliance</Text>
            <BulletPoint>Detecting, investigating, and preventing fraud, unauthorized access, and other illegal activities</BulletPoint>
            <BulletPoint>Enforcing our Terms of Service and other agreements</BulletPoint>
            <BulletPoint>Complying with applicable laws, regulations, and legal processes</BulletPoint>
            <BulletPoint>Verifying user identity and age for COPPA compliance</BulletPoint>

            <Text style={styles.sectionSubtitle}>Scout Fundraising Support</Text>
            <BulletPoint>Generating troop-level and council-level fundraising reports</BulletPoint>
            <BulletPoint>Tracking individual Scout sales contributions via referral codes</BulletPoint>
            <BulletPoint>Providing troop leaders with aggregated fundraising progress metrics</BulletPoint>
            <BulletPoint>Enabling council administrators to monitor fundraising campaigns across troops</BulletPoint>
          </Section>

          <Section title="4. Information Sharing">
            <Text style={styles.paragraph}>
              We do not sell, rent, or lease your personal information to third parties. We may
              share information in the following limited circumstances:
            </Text>

            <Text style={styles.sectionSubtitle}>Service Providers</Text>
            <BulletPoint>
              <Text style={styles.bold}>Authorize.net:</Text> Payment processing, card tokenization,
              and transaction management. Authorize.net is PCI-DSS Level 1 certified and processes
              all payment card data on our behalf. We never store raw credit card numbers on our
              servers.
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Firebase (Google):</Text> Push notification delivery,
              app analytics, and crash reporting. Firebase processes device tokens and anonymized
              usage data.
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Amazon Web Services (AWS):</Text> Cloud hosting,
              data storage, email delivery (SES), and infrastructure services. All data is
              hosted in AWS US regions with encryption at rest and in transit.
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Scouting America Organizations</Text>
            <BulletPoint>
              Local councils and troop leaders receive fundraising reporting and sales tracking
              data only. This includes aggregate and individual Scout sales figures, redemption
              counts, and troop fundraising progress. Scouting America organizations do not receive payment
              card details, device information, or location data.
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Participating Merchants</Text>
            <BulletPoint>
              Merchants receive only redemption verification data necessary to validate and
              honor offers (e.g., confirmation that a valid subscription exists). No personally
              identifiable information (PII) such as name, email, phone number, or Scout
              registration data is shared with merchants.
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Legal Requirements</Text>
            <BulletPoint>
              We may disclose information when required by law, regulation, court order, subpoena,
              or other legal process. We may also share information when we believe in good faith
              that disclosure is necessary to protect our rights, your safety or the safety of
              others, investigate fraud, or respond to a government request.
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Business Transfers</Text>
            <BulletPoint>
              In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all
              or a portion of our assets, your personal information may be transferred as part
              of that transaction. We will notify you via email and/or a prominent notice in
              the App of any change in ownership or uses of your personal information.
            </BulletPoint>

            <View style={styles.highlightBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.highlightText}>
                We do NOT sell your personal information. We have not sold personal information
                in the preceding 12 months and have no plans to do so.
              </Text>
            </View>
          </Section>

          <Section title="5. Data Security">
            <Text style={styles.paragraph}>
              We take the security of your personal information seriously and implement
              industry-standard technical, administrative, and physical safeguards to protect
              your data from unauthorized access, alteration, disclosure, or destruction:
            </Text>

            <Text style={styles.sectionSubtitle}>Technical Safeguards</Text>
            <BulletPoint>All data transmitted between the App, Website, and our servers is encrypted using TLS/SSL (Transport Layer Security) protocols</BulletPoint>
            <BulletPoint>Passwords are hashed using BCrypt with a strength factor of 12, making them computationally infeasible to reverse</BulletPoint>
            <BulletPoint>PCI-DSS compliant payment processing through Authorize.net ensures credit card data is tokenized and never stored on our systems in raw form</BulletPoint>
            <BulletPoint>Role-based access controls (RBAC) restrict data access to authorized personnel based on the principle of least privilege</BulletPoint>
            <BulletPoint>API credentials, payment gateway keys, and other sensitive configuration data are encrypted using AES-256-GCM encryption at rest</BulletPoint>
            <BulletPoint>JSON Web Tokens (JWT) with expiration controls authenticate all API requests, with automatic token refresh to prevent session hijacking</BulletPoint>
            <BulletPoint>Row-level security (RLS) policies ensure council-scoped data isolation so that users can only access data belonging to their own council</BulletPoint>

            <Text style={styles.sectionSubtitle}>Administrative Safeguards</Text>
            <BulletPoint>Regular security assessments, vulnerability scanning, and penetration testing of our infrastructure</BulletPoint>
            <BulletPoint>Employee access to personal data is restricted and logged, with background checks conducted for personnel handling sensitive information</BulletPoint>
            <BulletPoint>Incident response procedures are maintained and tested to ensure rapid response to any security events</BulletPoint>
            <BulletPoint>Third-party service providers are vetted for security compliance and bound by data processing agreements</BulletPoint>

            <Text style={styles.sectionSubtitle}>Breach Notification</Text>
            <Text style={styles.paragraph}>
              In the event of a data breach affecting your personal information, we will notify
              affected users within 72 hours of discovery via email and/or in-app notification.
              The notification will describe the nature of the breach, the types of information
              involved, the steps we are taking to address it, and recommended actions you should
              take to protect yourself. We will also notify applicable regulatory authorities as
              required by law.
            </Text>

            <Text style={styles.paragraph}>
              While we strive to use commercially acceptable means to protect your personal
              information, no method of transmission over the Internet or method of electronic
              storage is 100% secure. We cannot guarantee absolute security but are committed
              to continuous improvement of our security posture.
            </Text>
          </Section>

          <Section title="6. Data Retention">
            <Text style={styles.paragraph}>
              We retain your personal information only for as long as necessary to fulfill the
              purposes described in this Privacy Policy, comply with our legal obligations, resolve
              disputes, and enforce our agreements. Specific retention periods are as follows:
            </Text>
            <BulletPoint><Text style={styles.bold}>Account Information:</Text> Duration of active account plus 3 years following account closure or last activity</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Transaction Records:</Text> 7 years from the date of the transaction (as required by tax and financial regulations)</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Usage Analytics:</Text> 2 years in identifiable form, anonymized thereafter for aggregate statistical analysis</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Location Data:</Text> 30 days from collection, then permanently deleted</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Support Tickets:</Text> 3 years from resolution to assist with recurring issues and improve service quality</BulletPoint>

            <Text style={styles.paragraph}>
              Upon receiving a valid account deletion request, we will remove your personal
              information from our active systems within 30 days. Certain data may be retained
              in encrypted backup systems for up to 90 days before being permanently purged.
              Some information may be retained beyond these periods where required by applicable
              law (e.g., tax records, fraud prevention data, legal hold obligations).
            </Text>
          </Section>

          <Section title="7. Your Privacy Rights">
            <Text style={styles.paragraph}>
              Regardless of your location, all users of the Service have the following privacy rights:
            </Text>
            <BulletPoint><Text style={styles.bold}>Right to Access:</Text> Request a copy of the personal data we hold about you, including the categories of data collected, the purposes of processing, and the third parties with whom data has been shared</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Correction:</Text> Request that we update or correct any inaccurate or incomplete personal information in your account</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Deletion:</Text> Request deletion of your personal data, subject to certain exceptions (e.g., legal compliance obligations, pending transactions)</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Portability:</Text> Receive a copy of your personal data in a structured, commonly used, and machine-readable format (e.g., JSON or CSV)</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Opt-Out:</Text> Unsubscribe from marketing and promotional communications at any time while continuing to receive essential service notifications</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Withdraw Consent:</Text> Revoke previously given consent for any optional data processing activities, such as location services or push notifications</BulletPoint>

            <Text style={styles.paragraph}>
              To exercise any of these rights, navigate to Profile {'>'} Settings {'>'} Privacy
              within the App, or send an email to privacy@swipesavvy.com with the subject line
              "Privacy Rights Request." We will verify your identity before processing your request
              and respond within 30 calendar days. If additional time is needed, we will notify
              you of the extension and the reason for it. There is no fee for exercising your
              privacy rights.
            </Text>
          </Section>

          <Section title="8. Children's Privacy (COPPA)">
            <View style={styles.coppaBox}>
              <Ionicons name="shield" size={24} color={COLORS.primary} />
              <Text style={styles.coppaTitle}>COPPA Compliant</Text>
            </View>
            <Text style={styles.paragraph}>
              We are committed to protecting the privacy of children and comply fully with the
              Children's Online Privacy Protection Act (COPPA) and related regulations. Given
              that Camp Card serves Scouting America Scouts, many of whom are minors, we take additional
              steps to safeguard youth data:
            </Text>
            <BulletPoint>Users must be at least 13 years of age to create an account on the Service</BulletPoint>
            <BulletPoint>Users under 18 years of age require verifiable parental or legal guardian consent before account creation and use of the Service</BulletPoint>
            <BulletPoint>We practice data minimization for minor users, collecting only the information strictly necessary to provide the fundraising service and no more</BulletPoint>
            <BulletPoint>Parents and guardians may review, update, or request deletion of their child's personal data at any time by contacting us or using the in-app parental controls</BulletPoint>
            <BulletPoint>Parents and guardians may revoke consent and request that we cease collecting information from their child, which may result in the closure of the child's account</BulletPoint>
            <BulletPoint>We do not condition a child's participation in any activity on the disclosure of more personal information than is reasonably necessary</BulletPoint>
            <BulletPoint>Scout-specific data is subject to the heightened protections described in Section 2 (Scout Data Usage Limitation) of this Policy</BulletPoint>

            <Text style={styles.paragraph}>
              If we become aware that we have collected personal information from a child under
              13 without verified parental consent, we will promptly delete that information
              from our systems. Parents or guardians with questions or concerns about children's
              privacy should contact us at parents@swipesavvy.com. We aim to respond to all
              parental inquiries within 48 hours.
            </Text>
          </Section>

          <Section title="9. California Privacy Rights (CCPA)">
            <Text style={styles.paragraph}>
              If you are a California resident, the California Consumer Privacy Act (CCPA),
              as amended by the California Privacy Rights Act (CPRA), provides you with
              additional rights regarding your personal information:
            </Text>
            <BulletPoint>
              <Text style={styles.bold}>Right to Know:</Text> You have the right to request
              that we disclose the categories and specific pieces of personal information we
              have collected about you, the categories of sources from which that information
              was collected, the business or commercial purpose for collecting the information,
              and the categories of third parties with whom we share it
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Right to Delete:</Text> You have the right to request
              deletion of your personal information that we have collected, subject to certain
              exceptions provided by law (e.g., completing a transaction, detecting security
              incidents, exercising free speech, complying with legal obligations)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Right to Opt-Out of Sale:</Text> You have the right to
              opt-out of the sale or sharing of your personal information. Note: We do NOT sell
              or share personal information for cross-context behavioral advertising, so there
              is no need to opt out, though we honor any such requests
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Right to Non-Discrimination:</Text> We will not
              discriminate against you for exercising any of your CCPA/CPRA rights. You will
              not receive different pricing, quality of service, or access to features based on
              exercising your privacy rights
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Right to Correct:</Text> You have the right to request
              that we correct inaccurate personal information that we maintain about you
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Right to Limit Use of Sensitive Personal Information:</Text>{' '}
              You have the right to limit the use and disclosure of sensitive personal information
              to purposes necessary to provide the Service
            </BulletPoint>

            <Text style={styles.paragraph}>
              California residents may submit CCPA/CPRA requests by emailing ccpa@swipesavvy.com
              with the subject line "CCPA Request" or by navigating to Profile {'>'} Settings{' '}
              {'>'} Privacy {'>'} California Privacy Rights within the App. We will verify your
              identity before processing your request and respond within 45 calendar days. You
              may also designate an authorized agent to submit requests on your behalf.
            </Text>
          </Section>

          <Section title="10. Location Services">
            <Text style={styles.paragraph}>
              The App may request access to your device's location services to provide
              location-based features. When enabled, location data is used for the following
              purposes:
            </Text>
            <BulletPoint>Showing nearby participating merchants and their current offers on a map or list view</BulletPoint>
            <BulletPoint>Sorting merchant offers by distance from your current location for improved relevance</BulletPoint>
            <BulletPoint>Providing turn-by-turn directions to participating merchant locations</BulletPoint>
            <BulletPoint>Improving the relevance and personalization of local offers displayed in the App</BulletPoint>

            <Text style={styles.paragraph}>
              Location access is entirely optional. You can use the App without enabling location
              services, although some features such as nearby merchant discovery and distance-based
              sorting will be limited or unavailable. We do NOT collect your location in the
              background. Location data is accessed only while the App is actively in use and in
              the foreground.
            </Text>

            <Text style={styles.sectionSubtitle}>Managing Location Permissions</Text>
            <BulletPoint>
              <Text style={styles.bold}>iOS:</Text> Go to Settings {'>'} Privacy & Security{' '}
              {'>'} Location Services {'>'} Camp Card. Select "Never," "Ask Next Time or When I
              Share," or "While Using the App"
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Android:</Text> Go to Settings {'>'} Apps {'>'} Camp Card{' '}
              {'>'} Permissions {'>'} Location. Select "Don't allow," "Ask every time," or "Allow
              only while using the app"
            </BulletPoint>
          </Section>

          <Section title="11. Push Notifications">
            <Text style={styles.paragraph}>
              With your consent, we may send push notifications to your device to keep you
              informed about important account activity and relevant offers. Types of push
              notifications include:
            </Text>
            <BulletPoint><Text style={styles.bold}>Offer Alerts:</Text> New merchant offers near your location or matching your preferences</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Subscription Reminders:</Text> Upcoming renewals, expiration warnings, and payment confirmations</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Account Security Alerts:</Text> Suspicious activity warnings, password change confirmations, and login notifications from new devices</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Troop Activity Updates:</Text> For troop leaders -- new Scout signups, fundraising milestones, and troop performance summaries</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Fundraising Updates:</Text> Sales progress, referral conversions, and campaign milestones for Scouts and parents</BulletPoint>
            <BulletPoint><Text style={styles.bold}>System Announcements:</Text> Service updates, scheduled maintenance, and new feature announcements</BulletPoint>

            <Text style={styles.paragraph}>
              You can control which push notifications you receive by navigating to Profile{' '}
              {'>'} Settings {'>'} Notifications within the App. You may also disable push
              notifications entirely through your device's system settings. Please note that
              certain essential notifications -- including security alerts, legal notices,
              critical account updates, and breach notifications -- cannot be disabled while
              your account is active, as they are necessary for the security and integrity of
              your account.
            </Text>
          </Section>

          <Section title="12. Third-Party Services">
            <Text style={styles.paragraph}>
              We integrate with the following third-party services to provide, secure, and
              improve the Camp Card platform. Each service provider is contractually obligated
              to process your data only for the purposes specified and in accordance with
              applicable data protection laws:
            </Text>
            <BulletPoint>
              <Text style={styles.bold}>Authorize.net (Visa):</Text> PCI-DSS Level 1
              certified payment gateway for secure credit/debit card tokenization,
              transaction processing, subscription billing, and fraud detection. Authorize.net
              processes payment card data directly and provides us only with transaction
              confirmations and tokenized references -- not raw card numbers.
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Firebase (Google):</Text> Push notification delivery
              via Firebase Cloud Messaging (FCM), app analytics and performance monitoring
              via Firebase Analytics, and crash reporting via Firebase Crashlytics. Firebase
              processes device tokens, anonymized usage metrics, and app stability data.
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Amazon Web Services (AWS):</Text> Cloud infrastructure
              hosting (EC2, RDS), data storage and encryption (S3), email delivery (SES),
              content delivery (CloudFront), and secrets management. All data is stored in
              AWS US regions with encryption at rest (AES-256) and in transit (TLS 1.2+).
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Google Maps Platform:</Text> Map rendering, geocoding,
              and directions services for displaying participating merchant locations and
              providing navigation to merchants. Google Maps may process your location data
              when map features are actively in use.
            </BulletPoint>

            <Text style={styles.paragraph}>
              The App and Website may contain links to third-party websites, services, or
              applications that are not operated by us. We are not responsible for the privacy
              practices or content of such third parties. We encourage you to review the privacy
              policies of any third-party services before providing them with your personal
              information.
            </Text>
          </Section>

          <Section title="13. Do Not Track">
            <Text style={styles.paragraph}>
              Some web browsers include a "Do Not Track" (DNT) feature or similar mechanism
              that signals to websites and online services that you do not wish to be tracked.
              We honor Do Not Track signals transmitted by web browsers. When we detect a DNT
              signal, we will not collect analytics or tracking data from that browser session
              beyond what is strictly necessary for the operation of the Service.
            </Text>
            <Text style={styles.paragraph}>
              Please note that not all third-party services we use may honor DNT signals. We
              encourage you to review the privacy settings and policies of third-party services
              for additional options regarding tracking preferences.
            </Text>
          </Section>

          <Section title="14. International Users">
            <Text style={styles.paragraph}>
              The Camp Card Service is operated from and intended for use within the United
              States of America. All data collected through the Service is processed and stored
              on servers located in the United States (specifically, in AWS US-East-2 Ohio region).
            </Text>
            <Text style={styles.paragraph}>
              If you access or use the Service from outside the United States, please be aware
              that your information will be transferred to, stored, and processed in the United
              States, where data protection laws may differ from those of your jurisdiction. By
              using the Service, you consent to the transfer of your information to the United
              States and the processing of your data in accordance with this Privacy Policy and
              applicable US law.
            </Text>
          </Section>

          <Section title="15. Limitation of Liability">
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SWIPE SAVVY, LLC, ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
              ARISING OUT OF OR RELATED TO:
            </Text>
            <BulletPoint>Any unauthorized access to or use of our servers or any personal information stored therein</BulletPoint>
            <BulletPoint>Any interruption or cessation of transmission to or from the Service</BulletPoint>
            <BulletPoint>Any bugs, viruses, or similar harmful components transmitted through the Service by a third party</BulletPoint>
            <BulletPoint>Any loss or damage resulting from your failure to maintain the confidentiality of your account credentials</BulletPoint>

            <Text style={styles.paragraph}>
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR
              RELATED TO THIS PRIVACY POLICY OR THE SERVICE EXCEED THE GREATER OF (A) THE
              TOTAL AMOUNT PAID BY YOU TO US DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT
              GIVING RISE TO LIABILITY, OR (B) ONE HUNDRED UNITED STATES DOLLARS ($100.00).
            </Text>
            <Text style={styles.paragraph}>
              THE LIMITATIONS SET FORTH IN THIS SECTION SHALL APPLY REGARDLESS OF THE THEORY
              OF LIABILITY, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE),
              STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </Text>
          </Section>

          <Section title="16. Dispute Resolution">
            <Text style={styles.paragraph}>
              In the event of any dispute, claim, or controversy arising out of or relating
              to this Privacy Policy or the processing of your personal information
              ("Dispute"), the parties agree to the following resolution process:
            </Text>

            <Text style={styles.sectionSubtitle}>Informal Resolution</Text>
            <Text style={styles.paragraph}>
              Before initiating any formal proceedings, you agree to first contact us at
              privacy@swipesavvy.com and attempt to resolve the Dispute informally for a
              period of at least sixty (60) days. Most concerns can be resolved quickly and
              satisfactorily through informal communication.
            </Text>

            <Text style={styles.sectionSubtitle}>Binding Arbitration</Text>
            <Text style={styles.paragraph}>
              If the Dispute cannot be resolved informally, you and Swipe Savvy, LLC agree
              that the Dispute shall be resolved exclusively through binding arbitration
              administered by the American Arbitration Association ("AAA") under its Consumer
              Arbitration Rules. The arbitration shall be conducted by a single arbitrator
              in the English language. The arbitrator's decision shall be final and binding
              and may be entered as a judgment in any court of competent jurisdiction.
            </Text>

            <Text style={styles.sectionSubtitle}>Class Action Waiver</Text>
            <Text style={styles.paragraph}>
              YOU AND SWIPE SAVVY, LLC AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE
              OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR
              CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE
              PROCEEDING. The arbitrator may not consolidate more than one person's claims
              and may not otherwise preside over any form of a class or representative
              proceeding.
            </Text>

            <Text style={styles.sectionSubtitle}>Governing Law</Text>
            <Text style={styles.paragraph}>
              This Privacy Policy and any Dispute arising hereunder shall be governed by and
              construed in accordance with the laws of the State of Texas, without regard to
              its conflict of law principles. To the extent that litigation is permitted (e.g.,
              for injunctive relief), you consent to the exclusive jurisdiction and venue of
              the state and federal courts located in Texas.
            </Text>
          </Section>

          <Section title="17. Indemnification">
            <Text style={styles.paragraph}>
              You agree to indemnify, defend, and hold harmless Swipe Savvy, LLC, its officers,
              directors, employees, agents, licensors, and service providers from and against
              any and all claims, damages, obligations, losses, liabilities, costs, or expenses
              (including reasonable attorneys' fees) arising from or related to:
            </Text>
            <BulletPoint>Your use of the Service or violation of this Privacy Policy</BulletPoint>
            <BulletPoint>Your violation of any applicable law, regulation, or third-party right (including intellectual property, privacy, or publicity rights)</BulletPoint>
            <BulletPoint>Any content or information you provide through the Service that is inaccurate, misleading, or in violation of any third party's rights</BulletPoint>
            <BulletPoint>Your failure to maintain the security and confidentiality of your account credentials</BulletPoint>
            <BulletPoint>Any claim by a third party arising from your use of the Service</BulletPoint>

            <Text style={styles.paragraph}>
              This indemnification obligation shall survive the termination of your account
              and your use of the Service.
            </Text>
          </Section>

          <Section title="18. Changes to This Policy">
            <Text style={styles.paragraph}>
              We reserve the right to update or modify this Privacy Policy at any time. When
              we make changes, we will:
            </Text>
            <BulletPoint>Update the "Last Updated" date at the top of this Privacy Policy to reflect the date of the most recent revision</BulletPoint>
            <BulletPoint>For material changes, notify you via email to the address associated with your account at least 30 days before the changes take effect</BulletPoint>
            <BulletPoint>Post a prominent in-app notification alerting you to the updated Privacy Policy</BulletPoint>
            <BulletPoint>Where required by law, obtain your renewed consent before applying the updated policy to your data</BulletPoint>

            <Text style={styles.paragraph}>
              We encourage you to review this Privacy Policy periodically to stay informed
              about how we are protecting your information. Your continued use of the Service
              after the effective date of any updated Privacy Policy constitutes your acceptance
              of the changes. If you do not agree with the updated Privacy Policy, you must
              discontinue use of the Service and may request deletion of your account.
            </Text>
          </Section>

          <Section title="19. Contact Us">
            <Text style={styles.paragraph}>
              If you have any questions, concerns, or requests regarding this Privacy Policy
              or our privacy practices, please contact us using the appropriate channel below:
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.companyName}>Swipe Savvy, LLC</Text>
              <ContactItem
                icon="mail"
                text="privacy@swipesavvy.com (General Privacy Inquiries)"
                onPress={() => openEmail('privacy@swipesavvy.com')}
              />
              <ContactItem
                icon="people"
                text="parents@swipesavvy.com (Children's Privacy / COPPA)"
                onPress={() => openEmail('parents@swipesavvy.com')}
              />
              <ContactItem
                icon="document-text"
                text="ccpa@swipesavvy.com (California Privacy Rights / CCPA)"
                onPress={() => openEmail('ccpa@swipesavvy.com')}
              />
              <ContactItem
                icon="headset"
                text="support@swipesavvy.com (Technical Support)"
                onPress={() => openEmail('support@swipesavvy.com')}
              />
              <ContactItem
                icon="globe"
                text="www.campcardapp.org"
                onPress={openWebsite}
              />
            </View>
            <Text style={styles.paragraph}>
              We aim to respond to all privacy-related inquiries within 30 calendar days.
              For urgent security matters, please include "URGENT" in your subject line and
              we will prioritize your request.
            </Text>
          </Section>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              By using Camp Card, you acknowledge that you have read, understood, and agree
              to be bound by this Privacy Policy. If you are a parent or guardian consenting
              on behalf of a minor, you confirm that you have the legal authority to do so
              and that you accept this Privacy Policy on behalf of your child.
            </Text>
          </View>

          <View style={styles.publisherFooter}>
            <Text style={styles.footerText}>Swipe Savvy, LLC</Text>
            <Text style={styles.footerSubtext}>Publisher of Camp Card</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface BulletPointProps {
  children: React.ReactNode;
}

const BulletPoint: React.FC<BulletPointProps> = ({ children }) => (
  <View style={styles.bulletPoint}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

interface ContactItemProps {
  icon: string;
  text: string;
  onPress?: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon as any} size={18} color={COLORS.primary} />
    <Text style={[styles.contactText, onPress && styles.contactLink]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  publisherBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  publisherText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  introduction: {
    marginBottom: 24,
  },
  summaryBox: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 10,
  },
  coppaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coppaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  contactBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  contactLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  acknowledgment: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  acknowledgmentText: {
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
    fontWeight: '500',
  },
  publisherFooter: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});

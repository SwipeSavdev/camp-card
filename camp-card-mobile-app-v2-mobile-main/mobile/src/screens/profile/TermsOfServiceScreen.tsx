// Terms of Service Screen - Display terms of service
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

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
              Welcome to Camp Card ("App," "Service"), published and operated by Swipe Savvy, LLC
              ("Swipe Savvy," "we," "us," or "our"). By downloading, installing, accessing, or
              using the Camp Card mobile application, you ("User," "you," or "your") agree to be
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do
              not use the App.
            </Text>
            <Text style={styles.paragraph}>
              These Terms constitute a legally binding agreement between you and Swipe Savvy, LLC.
              The App is developed and operated by Swipe Savvy in partnership with Scouting America local councils and troops.
            </Text>
          </View>

          {/* 1. Acceptance of Terms */}
          <Section title="1. Acceptance of Terms">
            <Text style={styles.paragraph}>
              By creating an account, downloading, installing, or otherwise accessing and using the
              Camp Card app, you acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service and our Privacy Policy, which is incorporated herein by
              reference. These Terms constitute a legally binding agreement between you and Swipe
              Savvy, LLC, a limited liability company.
            </Text>
            <Text style={styles.paragraph}>
              The Camp Card application is developed and operated by Swipe Savvy, LLC in
              partnership with Scouting America and its local councils and
              troops. Your use of the App is subject to these Terms regardless of how you access
              the Service, including through mobile devices, web browsers, or any other means.
            </Text>
            <Text style={styles.paragraph}>
              If you do not agree to all of these Terms, you must immediately cease using the App
              and delete it from your device. Your continued use of the App following the posting
              of any changes to these Terms constitutes your acceptance of those changes.
            </Text>
          </Section>

          {/* 2. Description of Service */}
          <Section title="2. Description of Service">
            <Text style={styles.paragraph}>
              Camp Card is a mobile application designed to digitalize and support Scouting America fundraising efforts. The Service provides the following features and
              functionality:
            </Text>
            <BulletPoint>
              Discount Offers: Access to exclusive discounts and offers from participating local
              merchants, with details on savings, terms, and expiration dates
            </BulletPoint>
            <BulletPoint>
              QR Code Redemption: Digital redemption of offers at merchant locations using
              scannable QR codes, replacing traditional paper-based Camp Cards
            </BulletPoint>
            <BulletPoint>
              Merchant Discovery: Location-based search and browsing of participating merchants,
              including business information, available offers, and directions
            </BulletPoint>
            <BulletPoint>
              Subscription Management: Annual subscription services for accessing offers,
              including plan selection, renewal management, and payment history
            </BulletPoint>
            <BulletPoint>
              Scout Fundraising Support: A portion of subscription fees directly supports local
              Scout troops and councils, with transparent tracking of fundraising contributions
              and progress
            </BulletPoint>
            <BulletPoint>
              Gift Cards: Purchase and redemption of Camp Card gift subscriptions that can be
              sent to others to support Scout fundraising
            </BulletPoint>
            <Text style={styles.paragraph}>
              The Service is available only in the United States. We make no representations that
              the Service is appropriate or available for use in other locations. Those who access
              or use the Service from outside the United States do so at their own risk and are
              responsible for compliance with all applicable local laws and regulations.
            </Text>
          </Section>

          {/* 3. User Eligibility */}
          <Section title="3. User Eligibility">
            <Text style={styles.paragraph}>
              You must be at least thirteen (13) years of age to create an account and use the
              Camp Card application. By creating an account, you represent and warrant that you
              meet this minimum age requirement.
            </Text>
            <Text style={styles.paragraph}>
              Users under eighteen (18) years of age ("Minors") must have verifiable parental or
              legal guardian consent before creating an account or using the Service. Minors may
              not use the App without such consent.
            </Text>
            <Text style={styles.paragraph}>
              Parents or legal guardians who create accounts on behalf of Minors accept full
              responsibility for the Minor's use of the App and agree to these Terms on the
              Minor's behalf. The parent or guardian is responsible for monitoring the Minor's
              activity, managing account settings, and ensuring the Minor's use of the App
              complies with these Terms.
            </Text>
            <Text style={styles.paragraph}>
              By using the App, you further represent and warrant that you have the legal capacity
              to enter into a binding agreement and that you are not barred from using the Service
              under any applicable law.
            </Text>
          </Section>

          {/* 4. Account Registration and Security */}
          <Section title="4. Account Registration and Security">
            <Text style={styles.paragraph}>
              To access certain features of the App, you must create an account. By registering,
              you agree to the following:
            </Text>
            <BulletPoint>
              Provide accurate, current, and complete registration information, including your
              name, email address, and any other required details
            </BulletPoint>
            <BulletPoint>
              Maintain and promptly update your account information to keep it accurate, current,
              and complete at all times
            </BulletPoint>
            <BulletPoint>
              Maintain the security and confidentiality of your account credentials, including
              your password, and take all reasonable steps to prevent unauthorized access
            </BulletPoint>
            <BulletPoint>
              Notify us immediately at support@swipesavvy.com of any unauthorized access to or
              use of your account, or any other security breach
            </BulletPoint>
            <BulletPoint>
              Accept full responsibility for all activities that occur under your account,
              whether or not authorized by you
            </BulletPoint>
            <BulletPoint>
              Not share your account credentials with any third party or allow others to access
              your account
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Account Types</Text>
            <Text style={styles.paragraph}>
              Camp Card provides distinct account types with different roles and permissions to
              serve the various participants in the Scouting America fundraising ecosystem:
            </Text>
            <BulletPoint>
              Scout: Individual Scout accounts for viewing offers, tracking personal fundraising
              contributions, and managing QR code redemptions
            </BulletPoint>
            <BulletPoint>
              Parent: Parent or guardian accounts for managing Scout subscriptions, browsing
              offers, viewing merchant information, and overseeing Minor accounts
            </BulletPoint>
            <BulletPoint>
              Troop Leader: Accounts for Scouting America troop leaders to manage Scout enrollment, track
              troop-level fundraising progress, and access troop-specific reporting
            </BulletPoint>
            <BulletPoint>
              Council Admin: Administrative accounts for Scouting America council staff to oversee council
              fundraising, manage merchants and offers, and access council analytics
            </BulletPoint>
            <BulletPoint>
              National Admin: Administrative accounts for Scouting America national staff to manage the
              platform, oversee all councils, and access system-wide settings
            </BulletPoint>
            <Text style={styles.paragraph}>
              Swipe Savvy reserves the right to refuse registration, suspend, or terminate any
              account at its sole discretion if it determines that you have violated these Terms
              or that your use of the App poses a risk to the Service or other users.
            </Text>
          </Section>

          {/* 5. Subscriptions and Payments */}
          <Section title="5. Subscriptions and Payments">
            <Text style={styles.sectionSubtitle}>5.1 Subscription Plans</Text>
            <Text style={styles.paragraph}>
              Camp Card offers annual subscription plans that provide access to merchant offers
              and discounts. Subscription plans and their associated pricing, features, and
              benefits are displayed within the App prior to purchase. A portion of each
              subscription fee directly supports Scouting America Scout troops and local councils for their
              fundraising goals. Specific plan details, including the fundraising allocation, are
              provided at the time of purchase.
            </Text>

            <Text style={styles.sectionSubtitle}>5.2 Payment Processing</Text>
            <Text style={styles.paragraph}>
              All payments within the Camp Card application are processed securely through
              Authorize.net, our authorized payment gateway. By making a payment, you agree to
              the following:
            </Text>
            <BulletPoint>
              Payments are processed securely through Authorize.net using industry-standard
              encryption and PCI-DSS compliant infrastructure
            </BulletPoint>
            <BulletPoint>
              We accept major credit and debit cards, including Visa, Mastercard, American
              Express, and Discover
            </BulletPoint>
            <BulletPoint>
              All prices are quoted and charged in United States Dollars (USD)
            </BulletPoint>
            <BulletPoint>
              Applicable sales tax, use tax, or other government-imposed taxes and fees may be
              added to your purchase where required by law
            </BulletPoint>
            <Text style={styles.paragraph}>
              By providing payment information, you represent and warrant that you are authorized
              to use the payment method and that all payment information provided is accurate and
              complete. You authorize Swipe Savvy and Authorize.net to charge the provided
              payment method for all fees incurred.
            </Text>

            <Text style={styles.sectionSubtitle}>5.3 Billing and Renewal</Text>
            <BulletPoint>
              Subscriptions are billed on an annual basis from the date of initial purchase
            </BulletPoint>
            <BulletPoint>
              You will receive a notification prior to your subscription renewal date, providing
              you with the opportunity to cancel before being charged
            </BulletPoint>
            <BulletPoint>
              Subscriptions automatically renew at the then-current subscription price unless
              cancelled prior to the renewal date
            </BulletPoint>
            <BulletPoint>
              You may cancel your subscription at any time through your account settings in the
              App or by contacting support@swipesavvy.com
            </BulletPoint>
            <Text style={styles.paragraph}>
              Cancellation will take effect at the end of the current billing period. You will
              continue to have access to subscription features until your current billing period
              expires.
            </Text>

            <Text style={styles.sectionSubtitle}>5.4 Refund Policy</Text>
            <BulletPoint>
              Refund requests must be submitted within thirty (30) days of the original purchase
              date
            </BulletPoint>
            <BulletPoint>
              Refunds are evaluated and processed at our sole discretion on a case-by-case basis
            </BulletPoint>
            <BulletPoint>
              Approved refunds for annual subscriptions are prorated based on the unused
              remaining time in the subscription period
            </BulletPoint>
            <BulletPoint>
              To request a refund, contact support@swipesavvy.com with your account details
              and the reason for your request
            </BulletPoint>
            <Text style={styles.paragraph}>
              Refunds will be issued to the original payment method within ten (10) business
              days of approval. Processing times may vary depending on your financial institution.
            </Text>

            <Text style={styles.sectionSubtitle}>5.5 Price Changes</Text>
            <Text style={styles.paragraph}>
              Swipe Savvy reserves the right to change subscription pricing at any time. Any
              price changes will not affect your current subscription period. We will provide
              reasonable advance notice of any price changes before your next renewal date.
              Continued use of the Service after a price change takes effect constitutes your
              acceptance of the new pricing.
            </Text>

            <Text style={styles.sectionSubtitle}>5.6 Gift Cards</Text>
            <Text style={styles.paragraph}>
              Camp Card gift subscriptions may be purchased and redeemed through the App. Gift
              cards are non-refundable once purchased, cannot be exchanged for cash (except where
              required by law), and must be redeemed within the timeframe specified at the time
              of purchase. Gift cards are not reloadable and may not be resold or transferred for
              value. Lost or stolen gift cards will not be replaced.
            </Text>
          </Section>

          {/* 6. Scout Data and Fundraising */}
          <Section title="6. Scout Data and Fundraising">
            <View style={styles.highlightBox}>
              <Text style={[styles.paragraph, styles.bold, { marginBottom: 8 }]}>
                Scout Data Protection Commitment
              </Text>
              <Text style={styles.paragraph}>
                Scout information collected through the Camp Card application is used solely for
                the purposes of fundraising reporting and sales tracking. Scout data is never
                used for marketing, advertising, behavioral profiling, or any purpose unrelated
                to the Scouting America fundraising program.
              </Text>
              <Text style={[styles.paragraph, { marginBottom: 0 }]}>
                Scouting America councils and troop leaders receive access only to fundraising reporting and
                sales tracking data that is necessary for managing their respective fundraising
                campaigns and troop activities.
              </Text>
            </View>
            <Text style={styles.paragraph}>
              Fundraising data collected through the App includes subscription purchases,
              referral activity, and offer redemption metrics. This data is aggregated and
              reported to the appropriate Scouting America council and troop leadership to support
              transparent and accountable fundraising programs.
            </Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational safeguards to protect Scout
              data from unauthorized access, disclosure, alteration, or destruction. Access to
              Scout data is restricted to authorized personnel on a need-to-know basis consistent
              with their role within the Scouting America organizational structure.
            </Text>
            <Text style={styles.paragraph}>
              Parents and legal guardians may request access to, correction of, or deletion of
              their Minor's data at any time by contacting support@swipesavvy.com. For complete
              details on how we collect, use, and protect personal information, please refer to
              our Privacy Policy.
            </Text>
          </Section>

          {/* 7. User Conduct */}
          <Section title="7. User Conduct">
            <Text style={styles.paragraph}>
              You agree to use the Camp Card application in a lawful, responsible, and respectful
              manner. You agree NOT to:
            </Text>
            <BulletPoint>
              Violate any applicable federal, state, local, or international laws, regulations,
              or ordinances
            </BulletPoint>
            <BulletPoint>
              Impersonate any person or entity, or falsely state or misrepresent your identity,
              age, or affiliation with any person or entity
            </BulletPoint>
            <BulletPoint>
              Interfere with, disrupt, or place an undue burden on the Service, its servers,
              networks, or connected infrastructure
            </BulletPoint>
            <BulletPoint>
              Attempt to gain unauthorized access to any systems, accounts, databases, or
              networks associated with the Service
            </BulletPoint>
            <BulletPoint>
              Use the Service for any fraudulent, deceptive, or unlawful purpose, including
              payment fraud or identity theft
            </BulletPoint>
            <BulletPoint>
              Abuse, harass, threaten, stalk, or otherwise harm other users or any individual
            </BulletPoint>
            <BulletPoint>
              Circumvent, disable, or otherwise interfere with any access restrictions, security
              measures, or technical protections of the Service
            </BulletPoint>
            <BulletPoint>
              Use any automated system, software, bot, spider, scraper, or similar technology
              to access, collect data from, or interact with the Service without our express
              written permission
            </BulletPoint>
            <BulletPoint>
              Resell, redistribute, sublicense, or commercially exploit offers, discounts, or
              any content from the App without express written authorization
            </BulletPoint>
            <BulletPoint>
              Manipulate, falsify, or tamper with fundraising data, sales records, referral
              information, or any other data within the Service
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Offer Redemption Rules</Text>
            <Text style={styles.paragraph}>When redeeming offers, you agree to:</Text>
            <BulletPoint>
              Present valid digital or printed offers to merchants at the time of purchase
            </BulletPoint>
            <BulletPoint>
              Limit redemptions to one per offer per transaction unless otherwise explicitly
              specified in the offer terms
            </BulletPoint>
            <BulletPoint>
              Not combine offers unless explicitly stated in the offer terms that combination
              is permitted
            </BulletPoint>
            <BulletPoint>
              Acknowledge that merchants reserve the right to refuse redemption of invalid,
              expired, or fraudulent offers
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Reporting Violations</Text>
            <Text style={styles.paragraph}>
              If you become aware of any violation of these Terms or any misuse of the Service,
              please report it immediately to support@swipesavvy.com. We take all reports
              seriously and will investigate and take appropriate action, which may include
              suspension or termination of accounts found to be in violation.
            </Text>
          </Section>

          {/* 8. Intellectual Property */}
          <Section title="8. Intellectual Property">
            <Text style={styles.paragraph}>
              The Camp Card application, including all of its content, features, and
              functionality, is owned by Swipe Savvy, LLC and its licensors and is protected by
              United States and international copyright, trademark, trade secret, patent, and
              other intellectual property or proprietary rights laws. This includes but is not
              limited to:
            </Text>
            <BulletPoint>
              All software, source code, object code, and underlying technology
            </BulletPoint>
            <BulletPoint>
              Text, articles, descriptions, and written content
            </BulletPoint>
            <BulletPoint>
              Graphics, illustrations, photographs, and visual elements
            </BulletPoint>
            <BulletPoint>
              Logos, brand marks, service marks, and trade dress
            </BulletPoint>
            <BulletPoint>
              User interface design, layout, look and feel, and user experience elements
            </BulletPoint>
            <BulletPoint>
              Trademarks, trade names, and proprietary designations
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Limited License</Text>
            <Text style={styles.paragraph}>
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
              non-transferable, non-sublicensable, revocable license to download, install, and
              use the App on a compatible mobile device that you own or control, solely for your
              personal, non-commercial purposes in accordance with these Terms.
            </Text>

            <Text style={styles.sectionSubtitle}>Restrictions</Text>
            <Text style={styles.paragraph}>You may not:</Text>
            <BulletPoint>
              Copy, reproduce, distribute, or create derivative works based on the App or any
              of its content
            </BulletPoint>
            <BulletPoint>
              Modify, adapt, translate, reverse engineer, decompile, disassemble, or attempt
              to derive the source code of the App
            </BulletPoint>
            <BulletPoint>
              Distribute, sublicense, lease, rent, loan, or otherwise make the App available
              to any third party
            </BulletPoint>
            <BulletPoint>
              Reverse engineer, decompile, or disassemble any portion of the App, except as
              expressly permitted by applicable law
            </BulletPoint>
            <BulletPoint>
              Remove, alter, or obscure any copyright notices, trademark notices, or other
              proprietary rights notices displayed in or on the App
            </BulletPoint>
            <BulletPoint>
              Use any Swipe Savvy or Camp Card trademarks, logos, or brand elements without
              prior written authorization
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Scouting America Trademarks</Text>
            <Text style={styles.paragraph}>
              The Scouting America name, logo, and related marks are registered trademarks
              of Scouting America. Use of Scouting America trademarks within the Camp Card
              application is authorized under a separate license agreement between Swipe Savvy,
              LLC and Scouting America. No right or license to use Scouting America trademarks is
              granted to you through these Terms.
            </Text>
          </Section>

          {/* 9. Third-Party Services */}
          <Section title="9. Third-Party Services">
            <Text style={styles.sectionSubtitle}>Participating Merchants</Text>
            <Text style={styles.paragraph}>
              Participating merchants listed in the Camp Card application are independent
              businesses and are not agents, employees, or affiliates of Swipe Savvy, LLC. We
              do not:
            </Text>
            <BulletPoint>
              Control or direct the operations, products, or services of any merchant
            </BulletPoint>
            <BulletPoint>
              Guarantee the availability, hours of operation, or continued participation of any
              merchant
            </BulletPoint>
            <BulletPoint>
              Warrant or represent the quality, safety, legality, or suitability of any merchant
              products or services
            </BulletPoint>
            <BulletPoint>
              Assume any liability for the acts, omissions, errors, representations, warranties,
              breaches, or negligence of any merchant
            </BulletPoint>
            <Text style={styles.paragraph}>
              Any transaction between you and a participating merchant is solely between you and
              that merchant. We encourage you to review merchant policies and terms before
              completing any transaction.
            </Text>

            <Text style={styles.sectionSubtitle}>Third-Party Links</Text>
            <Text style={styles.paragraph}>
              The App may contain links to third-party websites, applications, or services that
              are not owned or controlled by Swipe Savvy. We are not responsible for the content,
              privacy practices, or terms of use of any third-party services. Accessing
              third-party links is at your own risk, and we encourage you to review the terms and
              privacy policies of any third-party service you visit.
            </Text>

            <Text style={styles.sectionSubtitle}>Payment Processing</Text>
            <Text style={styles.paragraph}>
              Payment processing is provided by Authorize.net. Your use of payment services
              within the App is subject to Authorize.net's terms of service and privacy policy
              in addition to these Terms. By making a payment through the App, you agree to
              comply with Authorize.net's applicable terms and conditions. Swipe Savvy is not
              responsible for any errors, delays, or failures caused by Authorize.net or any
              other third-party payment processor.
            </Text>
          </Section>

          {/* 10. Disclaimer of Warranties */}
          <Section title="10. Disclaimer of Warranties">
            <Text style={styles.paragraph}>
              THE CAMP CARD APPLICATION AND ALL CONTENT, FEATURES, FUNCTIONALITY, AND SERVICES
              PROVIDED THROUGH THE APP ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS
              WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT
              PERMITTED BY APPLICABLE LAW, SWIPE SAVVY, LLC HEREBY DISCLAIMS ALL WARRANTIES,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </Text>
            <BulletPoint>
              IMPLIED WARRANTIES OF MERCHANTABILITY
            </BulletPoint>
            <BulletPoint>
              FITNESS FOR A PARTICULAR PURPOSE
            </BulletPoint>
            <BulletPoint>
              NON-INFRINGEMENT OF THIRD-PARTY RIGHTS
            </BulletPoint>
            <BulletPoint>
              ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY CONTENT
            </BulletPoint>
            <BulletPoint>
              UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE OPERATION
            </BulletPoint>
            <Text style={styles.paragraph}>
              Without limiting the foregoing, we do not warrant or guarantee:
            </Text>
            <BulletPoint>
              Specific savings amounts or financial benefits from using the Service
            </BulletPoint>
            <BulletPoint>
              Continued merchant participation, availability, or hours of operation
            </BulletPoint>
            <BulletPoint>
              The accuracy, validity, or current availability of any offer, discount, or
              promotion
            </BulletPoint>
            <BulletPoint>
              Continuous, uninterrupted, or secure access to the Service at any time
            </BulletPoint>
            <Text style={styles.paragraph}>
              Some jurisdictions do not allow the exclusion of certain warranties, so some of
              the above exclusions may not apply to you. In such cases, the exclusions will apply
              to the greatest extent permitted by applicable law.
            </Text>
          </Section>

          {/* 11. Limitation of Liability */}
          <Section title="11. Limitation of Liability">
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SWIPE SAVVY,
              LLC, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, OR
              LICENSORS BE LIABLE FOR ANY OF THE FOLLOWING, WHETHER BASED ON WARRANTY, CONTRACT,
              TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY:
            </Text>
            <BulletPoint>
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES OF ANY KIND
            </BulletPoint>
            <BulletPoint>
              LOSS OF PROFITS, REVENUE, BUSINESS OPPORTUNITIES, DATA, OR GOODWILL
            </BulletPoint>
            <BulletPoint>
              SERVICE INTERRUPTION, COMPUTER DAMAGE, OR SYSTEM FAILURE
            </BulletPoint>
            <BulletPoint>
              UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA
            </BulletPoint>
            <BulletPoint>
              THE CONDUCT OR CONTENT OF ANY THIRD PARTY ON OR RELATED TO THE SERVICE
            </BulletPoint>
            <Text style={styles.paragraph}>
              OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO
              THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT YOU HAVE
              PAID TO SWIPE SAVVY FOR THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY
              PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </Text>
            <Text style={styles.paragraph}>
              THE LIMITATIONS SET FORTH IN THIS SECTION SHALL APPLY EVEN IF A REMEDY SET FORTH
              HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE, AND REGARDLESS OF WHETHER
              SWIPE SAVVY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </Text>
            <Text style={styles.paragraph}>
              Some jurisdictions do not allow the limitation or exclusion of liability for
              incidental or consequential damages, so the above limitation may not apply to you.
              In such jurisdictions, our liability shall be limited to the greatest extent
              permitted by law.
            </Text>
          </Section>

          {/* 12. Indemnification */}
          <Section title="12. Indemnification">
            <Text style={styles.paragraph}>
              You agree to indemnify, defend, and hold harmless Swipe Savvy, LLC, Scouting America, participating Scouting America councils, and their respective officers, directors,
              employees, agents, successors, and assigns (collectively, the "Indemnified Parties")
              from and against any and all claims, damages, losses, liabilities, costs, and
              expenses (including reasonable attorneys' fees and court costs) arising out of or
              related to:
            </Text>
            <BulletPoint>
              Your use of or access to the Camp Card application or any of its features
            </BulletPoint>
            <BulletPoint>
              Your violation of any provision of these Terms of Service
            </BulletPoint>
            <BulletPoint>
              Your violation of any rights of any third party, including but not limited to
              intellectual property rights, privacy rights, or publicity rights
            </BulletPoint>
            <BulletPoint>
              Any content, information, or materials you submit, post, or transmit through the
              Service ("User Content")
            </BulletPoint>
            <Text style={styles.paragraph}>
              We reserve the right, at our own expense, to assume the exclusive defense and
              control of any matter subject to indemnification by you, in which event you will
              cooperate with us in asserting any available defenses. This indemnification
              obligation will survive the termination or expiration of these Terms and your use
              of the Service.
            </Text>
          </Section>

          {/* 13. Termination */}
          <Section title="13. Termination">
            <Text style={styles.sectionSubtitle}>Termination by You</Text>
            <Text style={styles.paragraph}>
              You may terminate your account at any time by deleting your account through the
              App settings or by contacting us at support@swipesavvy.com with a request to
              close your account. We will process your request within a reasonable timeframe.
            </Text>

            <Text style={styles.sectionSubtitle}>Termination by Us</Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate your account, with or without notice, if we determine
              in our sole discretion that:
            </Text>
            <BulletPoint>
              You have violated any provision of these Terms of Service
            </BulletPoint>
            <BulletPoint>
              You have engaged in fraudulent, deceptive, or illegal activity
            </BulletPoint>
            <BulletPoint>
              You have failed to pay subscription fees or other charges when due
            </BulletPoint>
            <Text style={styles.paragraph}>
              Where practicable and permitted by law, we will provide reasonable notice before
              terminating your account, except in cases of fraud, legal requirement, or
              circumstances that pose a risk to the Service or other users.
            </Text>

            <Text style={styles.sectionSubtitle}>Effect of Termination</Text>
            <BulletPoint>
              Upon termination, your right to access and use the App will immediately cease
            </BulletPoint>
            <BulletPoint>
              Active subscriptions will not be refunded upon termination, except as required
              by applicable law
            </BulletPoint>
            <BulletPoint>
              We may retain certain data as required by law, regulation, or legitimate business
              purposes, including compliance with legal obligations, dispute resolution, and
              enforcement of these Terms
            </BulletPoint>
            <BulletPoint>
              The following provisions of these Terms shall survive termination: Intellectual
              Property, Disclaimer of Warranties, Limitation of Liability, Indemnification,
              Dispute Resolution, and General Provisions
            </BulletPoint>
          </Section>

          {/* 14. Dispute Resolution */}
          <Section title="14. Dispute Resolution">
            <Text style={styles.sectionSubtitle}>Informal Resolution</Text>
            <Text style={styles.paragraph}>
              Before initiating any formal dispute resolution proceedings, you agree to first
              contact us at legal@swipesavvy.com to attempt to resolve the dispute informally.
              We will make a good-faith effort to resolve any dispute through informal
              negotiation within sixty (60) days of receiving your written notice. Most disputes
              can be resolved without the need for formal arbitration or litigation.
            </Text>

            <Text style={styles.sectionSubtitle}>Binding Arbitration</Text>
            <Text style={styles.paragraph}>
              If informal resolution is unsuccessful, you and Swipe Savvy, LLC agree to resolve
              any remaining disputes, claims, or controversies arising out of or relating to
              these Terms or your use of the Service through final and binding arbitration
              administered by the American Arbitration Association ("AAA") under its Consumer
              Arbitration Rules, except where prohibited by applicable law. The arbitration will
              be conducted by a single arbitrator in the English language. The arbitrator's
              decision shall be final and binding and may be entered as a judgment in any court
              of competent jurisdiction.
            </Text>

            <Text style={[styles.paragraph, styles.bold]}>
              CLASS ACTION WAIVER: YOU AND SWIPE SAVVY, LLC AGREE THAT EACH MAY BRING CLAIMS
              AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF
              OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION OR
              PROCEEDING. THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS AND
              MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF A CLASS OR REPRESENTATIVE PROCEEDING.
              YOU ACKNOWLEDGE THAT YOU ARE WAIVING YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION
              LAWSUIT OR CLASS-WIDE ARBITRATION.
            </Text>

            <Text style={styles.sectionSubtitle}>Exceptions</Text>
            <Text style={styles.paragraph}>
              Notwithstanding the foregoing, either party may bring an individual action in small
              claims court for disputes or claims within the scope of that court's jurisdiction.
              Additionally, either party may seek injunctive or equitable relief in a court of
              competent jurisdiction to prevent the actual or threatened infringement,
              misappropriation, or violation of a party's intellectual property rights.
            </Text>

            <Text style={styles.sectionSubtitle}>Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms and any disputes arising out of or related to these Terms or the
              Service shall be governed by and construed in accordance with the laws of the State
              of Texas, without regard to its conflict of law provisions. Any litigation not
              subject to arbitration shall be filed exclusively in the state or federal courts
              located in the State of Texas.
            </Text>

            <Text style={styles.sectionSubtitle}>Opt-Out Right</Text>
            <Text style={styles.paragraph}>
              You have the right to opt out of binding arbitration within thirty (30) days of
              first accepting these Terms by sending written notice to legal@swipesavvy.com
              with the subject line "Arbitration Opt-Out." Your notice must include your full
              name, account email address, and a clear statement that you wish to opt out of the
              arbitration agreement. If you opt out, the Governing Law and jurisdiction
              provisions above will apply to any disputes.
            </Text>
          </Section>

          {/* 15. Privacy */}
          <Section title="15. Privacy">
            <Text style={styles.paragraph}>
              Your privacy is important to us. Our Privacy Policy describes how we collect, use,
              store, share, and protect your personal information when you use the Camp Card
              application. The Privacy Policy is incorporated into and forms an integral part of
              these Terms of Service by reference.
            </Text>
            <Text style={styles.paragraph}>
              By using the App, you acknowledge that you have read and understood our Privacy
              Policy and consent to the practices described therein. Our Privacy Policy is
              available within the App and on our website at www.campcardapp.org.
            </Text>
          </Section>

          {/* 16. Electronic Communications */}
          <Section title="16. Electronic Communications">
            <Text style={styles.paragraph}>
              By creating an account and using the Camp Card application, you consent to receive
              electronic communications from Swipe Savvy, LLC, including but not limited to:
            </Text>
            <BulletPoint>
              Account-related emails (registration confirmation, password reset, security alerts)
            </BulletPoint>
            <BulletPoint>
              Subscription notifications (renewal reminders, payment confirmations, receipts)
            </BulletPoint>
            <BulletPoint>
              Service updates and announcements (new features, offer alerts, maintenance notices)
            </BulletPoint>
            <BulletPoint>
              In-app notifications and push notifications (if enabled on your device)
            </BulletPoint>
            <Text style={styles.paragraph}>
              You agree that all agreements, notices, disclosures, and other communications that
              we provide to you electronically satisfy any legal requirement that such
              communications be in writing. You may manage your communication preferences through
              your account settings or by contacting support@swipesavvy.com.
            </Text>
          </Section>

          {/* 17. Changes to Terms */}
          <Section title="17. Changes to Terms">
            <Text style={styles.paragraph}>
              Swipe Savvy, LLC reserves the right to modify, amend, or update these Terms of
              Service at any time and at our sole discretion. When we make changes, we will
              update the "Last Updated" date at the top of these Terms.
            </Text>
            <Text style={styles.paragraph}>
              For material changes that significantly affect your rights or obligations, we will
              provide notice through one or more of the following methods:
            </Text>
            <BulletPoint>
              In-app notification displayed upon your next use of the App
            </BulletPoint>
            <BulletPoint>
              Email notification sent to the email address associated with your account
            </BulletPoint>
            <BulletPoint>
              Prominent notice posted on our website at www.campcardapp.org
            </BulletPoint>
            <Text style={styles.paragraph}>
              Your continued use of the Camp Card application after any changes to these Terms
              have been posted constitutes your acceptance of and agreement to the revised Terms.
              If you do not agree to the modified Terms, you must stop using the App and may
              terminate your account as described in Section 13 above.
            </Text>
          </Section>

          {/* 18. General Provisions */}
          <Section title="18. General Provisions">
            <Text style={styles.sectionSubtitle}>Entire Agreement</Text>
            <Text style={styles.paragraph}>
              These Terms of Service, together with our Privacy Policy and any other legal
              notices or policies published by Swipe Savvy on the App or website, constitute the
              entire agreement between you and Swipe Savvy, LLC regarding your use of the Camp
              Card application. These Terms supersede all prior or contemporaneous
              communications, proposals, and agreements, whether oral or written, between you and
              Swipe Savvy relating to the subject matter hereof.
            </Text>

            <Text style={styles.sectionSubtitle}>Severability</Text>
            <Text style={styles.paragraph}>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable
              by a court of competent jurisdiction, the invalidity of that provision shall not
              affect the validity or enforceability of any other provision of these Terms. The
              remaining provisions shall continue in full force and effect, and the invalid
              provision shall be modified to the minimum extent necessary to make it valid and
              enforceable while preserving its original intent.
            </Text>

            <Text style={styles.sectionSubtitle}>Waiver</Text>
            <Text style={styles.paragraph}>
              The failure of Swipe Savvy to exercise or enforce any right or provision of these
              Terms shall not constitute a waiver of such right or provision. Any waiver of any
              provision of these Terms will be effective only if in writing and signed by an
              authorized representative of Swipe Savvy, LLC.
            </Text>

            <Text style={styles.sectionSubtitle}>Assignment</Text>
            <Text style={styles.paragraph}>
              You may not assign, transfer, or delegate your rights or obligations under these
              Terms without our prior written consent. Swipe Savvy may freely assign, transfer,
              or delegate its rights and obligations under these Terms without restriction and
              without notice to you, including in connection with a merger, acquisition,
              corporate restructuring, or sale of all or substantially all of its assets.
            </Text>

            <Text style={styles.sectionSubtitle}>Force Majeure</Text>
            <Text style={styles.paragraph}>
              Swipe Savvy shall not be liable for any failure or delay in performing its
              obligations under these Terms caused by events beyond its reasonable control,
              including but not limited to acts of God, natural disasters, pandemics, war,
              terrorism, riots, government actions, power failures, internet or
              telecommunications failures, cyberattacks, or labor disputes.
            </Text>
          </Section>

          {/* 19. App Store Terms */}
          <Section title="19. App Store Terms">
            <Text style={styles.sectionSubtitle}>Apple App Store</Text>
            <Text style={styles.paragraph}>
              If you downloaded the Camp Card application from the Apple App Store, the following
              additional terms apply:
            </Text>
            <BulletPoint>
              These Terms of Service are entered into between you and Swipe Savvy, LLC only, and
              not with Apple Inc. ("Apple"). Swipe Savvy, not Apple, is solely responsible for
              the App and its content
            </BulletPoint>
            <BulletPoint>
              Apple has no obligation whatsoever to provide any maintenance, support, or
              technical assistance services with respect to the App
            </BulletPoint>
            <BulletPoint>
              Apple is not responsible for any claims by you or any third party relating to the
              App or your possession and use of the App, including product liability claims,
              consumer protection claims, intellectual property infringement claims, or any claim
              that the App fails to conform to applicable legal or regulatory requirements
            </BulletPoint>
            <BulletPoint>
              Apple and its subsidiaries are third-party beneficiaries of these Terms and, upon
              your acceptance, will have the right to enforce these Terms against you as a
              third-party beneficiary
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Google Play Store</Text>
            <Text style={styles.paragraph}>
              If you downloaded the Camp Card application from the Google Play Store, the
              following additional terms apply:
            </Text>
            <BulletPoint>
              These Terms of Service are entered into between you and Swipe Savvy, LLC only, and
              not with Google LLC ("Google"). Swipe Savvy, not Google, is solely responsible for
              the App and its content
            </BulletPoint>
            <BulletPoint>
              Google has no obligation whatsoever to provide any maintenance, support, or
              technical assistance services with respect to the App
            </BulletPoint>
            <BulletPoint>
              Google is not responsible for any claims by you or any third party relating to the
              App or your possession and use of the App, including product liability claims,
              consumer protection claims, intellectual property infringement claims, or any claim
              that the App fails to conform to applicable legal or regulatory requirements
            </BulletPoint>
            <BulletPoint>
              Google and its subsidiaries are third-party beneficiaries of these Terms and, upon
              your acceptance, will have the right to enforce these Terms against you as a
              third-party beneficiary
            </BulletPoint>
          </Section>

          {/* 20. Contact Information */}
          <Section title="20. Contact Information">
            <Text style={styles.paragraph}>
              For questions, concerns, or feedback about these Terms of Service, the Camp Card
              application, or any of our services, please contact us using the information below:
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.companyName}>Swipe Savvy, LLC</Text>
              <ContactItem
                icon="mail"
                text="support@swipesavvy.com"
                onPress={() => openEmail('support@swipesavvy.com')}
              />
              <ContactItem
                icon="document-text"
                text="legal@swipesavvy.com"
                onPress={() => openEmail('legal@swipesavvy.com')}
              />
              <ContactItem
                icon="globe"
                text="www.campcardapp.org"
                onPress={openWebsite}
              />
            </View>
          </Section>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              By using the Camp Card app, you acknowledge that you have read, understood, and agree
              to be bound by these Terms of Service.
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
  highlightBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
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

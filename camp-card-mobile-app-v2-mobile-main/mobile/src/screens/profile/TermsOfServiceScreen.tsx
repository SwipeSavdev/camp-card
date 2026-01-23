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
          <Text style={styles.lastUpdated}>Last Updated: January 23, 2026</Text>

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
              The App is developed and operated by Swipe Savvy in partnership with the Boy Scouts
              of America ("BSA") local councils and troops.
            </Text>
          </View>

          <Section title="1. Acceptance of Terms">
            <Text style={styles.paragraph}>
              By creating an account and using the Camp Card app, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and our Privacy Policy. If
              you do not agree, please do not use the app.
            </Text>
          </Section>

          <Section title="2. Description of Service">
            <Text style={styles.paragraph}>Camp Card is a mobile application that provides:</Text>
            <BulletPoint>Discount Offers: Access to exclusive discounts and offers from participating local merchants</BulletPoint>
            <BulletPoint>QR Code Redemption: Digital redemption of offers at merchant locations</BulletPoint>
            <BulletPoint>Merchant Discovery: Location-based search for participating merchants</BulletPoint>
            <BulletPoint>Subscription Management: Annual subscription services for accessing offers</BulletPoint>
            <BulletPoint>Scout Fundraising Support: A portion of subscription fees supports local Scout troops and councils</BulletPoint>
            <Text style={styles.paragraph}>
              The Service is available only in the United States. We make no representations that the
              Service is appropriate or available for use in other locations.
            </Text>
          </Section>

          <Section title="3. User Eligibility">
            <Text style={styles.paragraph}>
              Users must be at least 13 years of age to create an account. Users under 18 years of age
              ("Minors") must have verifiable parental or legal guardian consent. Parents or guardians
              who create accounts on behalf of Minors accept these Terms on the Minor's behalf.
            </Text>
          </Section>

          <Section title="4. Account Registration and Security">
            <Text style={styles.paragraph}>To access certain features, you must create an account. You agree to:</Text>
            <BulletPoint>Provide accurate and complete registration information</BulletPoint>
            <BulletPoint>Maintain the security of your account credentials</BulletPoint>
            <BulletPoint>Notify us immediately of any unauthorized access</BulletPoint>
            <BulletPoint>Accept responsibility for all activities under your account</BulletPoint>
            <BulletPoint>Not share your account with others</BulletPoint>
          </Section>

          <Section title="5. Subscriptions and Payments">
            <Text style={styles.sectionSubtitle}>5.1 Subscription Plans</Text>
            <Text style={styles.paragraph}>
              Camp Card offers annual subscription plans that provide access to merchant offers.
              Subscription pricing is displayed in the App before purchase.
            </Text>

            <Text style={styles.sectionSubtitle}>5.2 Payment Processing</Text>
            <BulletPoint>Payments are processed securely through Authorize.net</BulletPoint>
            <BulletPoint>We accept major credit and debit cards</BulletPoint>
            <BulletPoint>All prices are in US Dollars (USD)</BulletPoint>
            <BulletPoint>Sales tax may be applied where required by law</BulletPoint>

            <Text style={styles.sectionSubtitle}>5.3 Billing and Renewal</Text>
            <BulletPoint>Subscriptions are billed annually</BulletPoint>
            <BulletPoint>You will receive notification before renewal</BulletPoint>
            <BulletPoint>Subscriptions automatically renew unless cancelled</BulletPoint>
            <BulletPoint>You may cancel at any time through your account settings</BulletPoint>

            <Text style={styles.sectionSubtitle}>5.4 Refund Policy</Text>
            <BulletPoint>Refund requests must be submitted within 30 days of purchase</BulletPoint>
            <BulletPoint>Refunds are processed at our discretion</BulletPoint>
            <BulletPoint>Refunds for annual subscriptions are prorated based on unused time</BulletPoint>
            <BulletPoint>Contact support@campcardapp.org for refund requests</BulletPoint>
          </Section>

          <Section title="6. User Conduct">
            <Text style={styles.paragraph}>You agree NOT to:</Text>
            <BulletPoint>Violate any applicable laws or regulations</BulletPoint>
            <BulletPoint>Impersonate any person or entity</BulletPoint>
            <BulletPoint>Interfere with or disrupt the Service</BulletPoint>
            <BulletPoint>Attempt to gain unauthorized access to any systems</BulletPoint>
            <BulletPoint>Use the Service for any fraudulent purpose</BulletPoint>
            <BulletPoint>Abuse, harass, or harm other users</BulletPoint>
            <BulletPoint>Circumvent any access restrictions or security measures</BulletPoint>
            <BulletPoint>Resell or redistribute offers without authorization</BulletPoint>

            <Text style={styles.paragraph}>When redeeming offers:</Text>
            <BulletPoint>Present valid digital or printed offers to merchants</BulletPoint>
            <BulletPoint>One redemption per offer unless otherwise specified</BulletPoint>
            <BulletPoint>Offers cannot be combined unless explicitly stated</BulletPoint>
            <BulletPoint>Merchants reserve the right to refuse invalid offers</BulletPoint>
          </Section>

          <Section title="7. Intellectual Property">
            <Text style={styles.paragraph}>
              The App, including its content, features, and functionality, is owned by Swipe Savvy, LLC
              and its licensors. This includes software and code, text, graphics, logos, images, user
              interface design, and trademarks.
            </Text>
            <Text style={styles.paragraph}>
              We grant you a limited, non-exclusive, non-transferable, revocable license to use the App
              for personal, non-commercial purposes in accordance with these Terms.
            </Text>
            <Text style={styles.paragraph}>
              The Boy Scouts of America name, logo, and related marks are registered trademarks of the
              Boy Scouts of America. Use of BSA marks is authorized under license.
            </Text>
          </Section>

          <Section title="8. Third-Party Services">
            <Text style={styles.paragraph}>
              Participating merchants are independent businesses. We do not control merchant products
              or services, guarantee merchant availability or hours, warrant merchant quality or safety,
              or assume liability for merchant actions.
            </Text>
            <Text style={styles.paragraph}>
              Payment processing is provided by Authorize.net. Your use of payment services is subject
              to their terms and privacy policy.
            </Text>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <Text style={styles.paragraph}>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS
              OR IMPLIED. SWIPE SAVVY DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY OR RELIABILITY, AND UNINTERRUPTED OR
              ERROR-FREE OPERATION.
            </Text>
            <Text style={styles.paragraph}>We do not guarantee:</Text>
            <BulletPoint>Specific savings amounts</BulletPoint>
            <BulletPoint>Merchant participation or availability</BulletPoint>
            <BulletPoint>Offer accuracy or validity</BulletPoint>
            <BulletPoint>Continuous service availability</BulletPoint>
          </Section>

          <Section title="10. Limitation of Liability">
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SWIPE SAVVY, LLC AND ITS AFFILIATES, OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, LOSS OF PROFITS, DATA, OR GOODWILL, SERVICE
              INTERRUPTION OR SYSTEM FAILURES, UNAUTHORIZED ACCESS TO YOUR DATA, OR ANY THIRD-PARTY
              CONDUCT OR CONTENT.
            </Text>
            <Text style={styles.paragraph}>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE
              (12) MONTHS PRECEDING THE CLAIM.
            </Text>
          </Section>

          <Section title="11. Indemnification">
            <Text style={styles.paragraph}>
              You agree to indemnify and hold harmless Swipe Savvy, LLC, BSA, participating councils,
              and their respective officers, directors, employees, and agents from any claims, damages,
              losses, or expenses arising from your use of the App, your violation of these Terms, or
              your violation of any rights of others.
            </Text>
          </Section>

          <Section title="12. Termination">
            <Text style={styles.paragraph}>
              You may terminate your account at any time by deleting your account through the App or
              contacting support@campcardapp.org.
            </Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate your account if you violate these Terms, engage in fraudulent
              activity, or fail to pay subscription fees. Upon termination, your access to the App will
              cease and active subscriptions will not be refunded except as required by law.
            </Text>
          </Section>

          <Section title="13. Dispute Resolution">
            <Text style={styles.paragraph}>
              Before filing a formal claim, you agree to contact us at legal@campcardapp.org to attempt
              informal resolution.
            </Text>
            <Text style={styles.paragraph}>
              You and Swipe Savvy agree to resolve any disputes through binding arbitration administered
              by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, except
              where prohibited by law.
            </Text>
            <Text style={[styles.paragraph, styles.bold]}>
              YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
            </Text>
            <Text style={styles.paragraph}>
              These Terms are governed by the laws of the State of Texas, without regard to conflict of
              law principles.
            </Text>
          </Section>

          <Section title="14. Changes to Terms">
            <Text style={styles.paragraph}>
              We may modify these Terms at any time. Material changes will be communicated through
              in-app notifications or email to registered users. Your continued use of the App after
              changes constitutes acceptance of the modified Terms.
            </Text>
          </Section>

          <Section title="15. Contact Information">
            <Text style={styles.paragraph}>
              For questions about these Terms, please contact us:
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.companyName}>Swipe Savvy, LLC</Text>
              <ContactItem
                icon="mail"
                text="support@campcardapp.org"
                onPress={() => openEmail('support@campcardapp.org')}
              />
              <ContactItem
                icon="document-text"
                text="legal@campcardapp.org"
                onPress={() => openEmail('legal@campcardapp.org')}
              />
              <ContactItem
                icon="globe"
                text="www.campcardapp.org"
                onPress={openWebsite}
              />
            </View>
          </Section>

          <Section title="16. App Store Terms">
            <Text style={styles.paragraph}>
              If you downloaded the App from the Apple App Store or Google Play:
            </Text>
            <BulletPoint>These Terms are between you and Swipe Savvy, LLC, not Apple or Google</BulletPoint>
            <BulletPoint>Apple/Google has no obligation to provide maintenance or support</BulletPoint>
            <BulletPoint>Apple/Google is not responsible for any claims relating to the App</BulletPoint>
            <BulletPoint>Apple is a third-party beneficiary of these Terms</BulletPoint>
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

// Terms of Service Screen - Display terms of service

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();

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
          <Text style={styles.lastUpdated}>Last Updated: January 16, 2026</Text>

          <View style={styles.introduction}>
            <Text style={styles.paragraph}>
              Welcome to the BSA Camp Card mobile application. These Terms of Service ("Terms")
              govern your use of the app and services provided by the Boy Scouts of America
              ("BSA," "we," "us," or "our"). By using this app, you agree to these Terms.
            </Text>
          </View>

          <Section title="1. Acceptance of Terms">
            <Text style={styles.paragraph}>
              By creating an account and using the Camp Card app, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and our Privacy Policy. If
              you do not agree, please do not use the app.
            </Text>
          </Section>

          <Section title="2. User Eligibility">
            <Text style={styles.paragraph}>
              The Camp Card app is designed for Scout families and supporters of Scouting. Users
              under 13 must have parental or guardian consent. Parents and guardians are
              responsible for monitoring and managing their child's use of the app.
            </Text>
          </Section>

          <Section title="3. Account Responsibilities">
            <Text style={styles.paragraph}>You agree to:</Text>
            <BulletPoint>Provide accurate and complete registration information</BulletPoint>
            <BulletPoint>Maintain the security of your account credentials</BulletPoint>
            <BulletPoint>Notify us immediately of any unauthorized access</BulletPoint>
            <BulletPoint>Accept responsibility for all activities under your account</BulletPoint>
            <BulletPoint>Not share your account with others</BulletPoint>
          </Section>

          <Section title="4. Subscription Services">
            <Text style={styles.paragraph}>
              The Camp Card requires an annual subscription. Subscription details:
            </Text>
            <BulletPoint>Subscriptions are billed annually</BulletPoint>
            <BulletPoint>Payment is processed through secure third-party providers</BulletPoint>
            <BulletPoint>Subscriptions auto-renew unless cancelled</BulletPoint>
            <BulletPoint>Proceeds support Scout fundraising activities</BulletPoint>
            <BulletPoint>Refunds are subject to our refund policy</BulletPoint>
          </Section>

          <Section title="5. Merchant Offers">
            <Text style={styles.paragraph}>
              The app displays offers from local merchants. Please note:
            </Text>
            <BulletPoint>Offers are subject to merchant terms and conditions</BulletPoint>
            <BulletPoint>BSA is not responsible for merchant products or services</BulletPoint>
            <BulletPoint>
              Merchants may modify or terminate offers at any time
            </BulletPoint>
            <BulletPoint>Some offers may require verification at time of redemption</BulletPoint>
            <BulletPoint>Offer redemption limits may apply</BulletPoint>
          </Section>

          <Section title="6. Prohibited Conduct">
            <Text style={styles.paragraph}>You may not:</Text>
            <BulletPoint>
              Use the app for any illegal or unauthorized purpose
            </BulletPoint>
            <BulletPoint>
              Attempt to circumvent offer redemption limits or restrictions
            </BulletPoint>
            <BulletPoint>
              Interfere with or disrupt the app's functionality
            </BulletPoint>
            <BulletPoint>
              Use automated systems to access the app
            </BulletPoint>
            <BulletPoint>
              Reverse engineer or decompile the app
            </BulletPoint>
            <BulletPoint>
              Share or resell subscription benefits
            </BulletPoint>
            <BulletPoint>
              Impersonate others or provide false information
            </BulletPoint>
          </Section>

          <Section title="7. Intellectual Property">
            <Text style={styles.paragraph}>
              The Camp Card app, including all content, features, and functionality, is owned
              by BSA and is protected by copyright, trademark, and other intellectual property
              laws. You may not copy, modify, distribute, or create derivative works without
              our permission.
            </Text>
          </Section>

          <Section title="8. User Content">
            <Text style={styles.paragraph}>
              If you submit content to the app (such as reviews or fundraising updates), you:
            </Text>
            <BulletPoint>Grant BSA a license to use, display, and distribute that content</BulletPoint>
            <BulletPoint>Confirm you have the right to share the content</BulletPoint>
            <BulletPoint>Agree the content does not violate any laws or third-party rights</BulletPoint>
          </Section>

          <Section title="9. Disclaimers">
            <Text style={styles.paragraph}>
              THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. BSA DOES NOT GUARANTEE:
            </Text>
            <BulletPoint>The app will be uninterrupted or error-free</BulletPoint>
            <BulletPoint>All offers will be honored by merchants</BulletPoint>
            <BulletPoint>Specific savings or fundraising results</BulletPoint>
            <BulletPoint>The accuracy of third-party content</BulletPoint>
          </Section>

          <Section title="10. Limitation of Liability">
            <Text style={styles.paragraph}>
              BSA's liability for any claims related to the app is limited to the amount you
              paid for your subscription in the past 12 months. BSA is not liable for indirect,
              incidental, or consequential damages.
            </Text>
          </Section>

          <Section title="11. Indemnification">
            <Text style={styles.paragraph}>
              You agree to indemnify and hold BSA harmless from any claims, damages, or expenses
              arising from your use of the app, your violation of these Terms, or your violation
              of any rights of others.
            </Text>
          </Section>

          <Section title="12. Termination">
            <Text style={styles.paragraph}>
              We may suspend or terminate your account if you violate these Terms. You may
              cancel your account at any time through the app settings. Upon termination, your
              right to use the app ceases immediately.
            </Text>
          </Section>

          <Section title="13. Changes to Terms">
            <Text style={styles.paragraph}>
              We reserve the right to modify these Terms at any time. We will notify you of
              material changes through the app or by email. Continued use after changes
              constitutes acceptance of the modified Terms.
            </Text>
          </Section>

          <Section title="14. Governing Law">
            <Text style={styles.paragraph}>
              These Terms are governed by the laws of the State of Texas, without regard to
              conflict of law principles. Any disputes will be resolved in the courts of Texas.
            </Text>
          </Section>

          <Section title="15. Contact Information">
            <Text style={styles.paragraph}>
              For questions about these Terms, please contact us:
            </Text>
            <View style={styles.contactBox}>
              <ContactItem icon="mail" text="legal@campcard.org" />
              <ContactItem icon="call" text="1-800-BSA-CAMP" />
              <ContactItem icon="location" text="Boy Scouts of America
1325 West Walnut Hill Lane
Irving, TX 75015" />
            </View>
          </Section>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              By using the BSA Camp Card app, you acknowledge that you have read and understood
              these Terms of Service and agree to be bound by them.
            </Text>
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
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text }) => (
  <View style={styles.contactItem}>
    <Ionicons name={icon as any} size={18} color={COLORS.primary} />
    <Text style={styles.contactText}>{text}</Text>
  </View>
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
  paragraph: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
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
  bottomSpacer: {
    height: 40,
  },
});

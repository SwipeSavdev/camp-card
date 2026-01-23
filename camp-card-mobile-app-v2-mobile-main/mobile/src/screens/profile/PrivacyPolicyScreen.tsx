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
          <Text style={styles.lastUpdated}>Last Updated: January 23, 2026</Text>

          <View style={styles.introduction}>
            <Text style={styles.paragraph}>
              Swipe Savvy, LLC ("Swipe Savvy," "we," "us," or "our") is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use the Camp Card mobile application ("App,"
              "Service") and related services.
            </Text>
            <Text style={styles.paragraph}>
              This Policy applies to all users of the Camp Card mobile application, including
              Scouts, parents, troop leaders, and administrators. Please read this Privacy Policy
              carefully. By using the App, you consent to the practices described herein.
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
          </View>

          <Section title="1. Information We Collect">
            <Text style={styles.sectionSubtitle}>Information You Provide</Text>
            <BulletPoint>
              <Text style={styles.bold}>Account Information:</Text> Name, email address,
              password (encrypted), phone number (optional)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Payment Information:</Text> Credit/debit card details
              (processed securely by Authorize.net), billing address, transaction history
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Scout/Troop Information:</Text> Scout registration number,
              troop/unit affiliation, council association, scout code for referral tracking
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>User-Generated Content:</Text> Saved merchant favorites,
              redemption history, support inquiries
            </BulletPoint>

            <Text style={styles.sectionSubtitle}>Information Collected Automatically</Text>
            <BulletPoint>
              <Text style={styles.bold}>Device Information:</Text> Device type, operating system,
              unique device identifiers, mobile network information
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Usage Information:</Text> App features accessed, time and
              duration of use, screens viewed, actions taken
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Location Information:</Text> GPS coordinates (with your
              permission), IP address-based approximate location
            </BulletPoint>
          </Section>

          <Section title="2. How We Use Your Information">
            <Text style={styles.paragraph}>We use collected information for:</Text>
            <BulletPoint>Creating and managing your account</BulletPoint>
            <BulletPoint>Processing subscriptions and payments</BulletPoint>
            <BulletPoint>Providing access to merchant offers</BulletPoint>
            <BulletPoint>Enabling QR code redemption</BulletPoint>
            <BulletPoint>Displaying nearby merchants</BulletPoint>
            <BulletPoint>Tracking savings and redemptions</BulletPoint>
            <BulletPoint>Sending account-related notifications</BulletPoint>
            <BulletPoint>Providing customer support</BulletPoint>
            <BulletPoint>Improving App functionality and user experience</BulletPoint>
            <BulletPoint>Detecting and preventing fraud</BulletPoint>
            <BulletPoint>Attributing purchases to Scout troops</BulletPoint>
          </Section>

          <Section title="3. Information Sharing">
            <Text style={styles.paragraph}>We share information with:</Text>
            <BulletPoint>
              <Text style={styles.bold}>Service Providers:</Text> Authorize.net (payments),
              Firebase (notifications), AWS (hosting)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>BSA Organizations:</Text> Local councils (troop management),
              troop leaders (scout activity)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Participating Merchants:</Text> Redemption verification only
              (no personal identifying information)
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Legal Requirements:</Text> Court orders, law enforcement,
              regulatory compliance
            </BulletPoint>

            <View style={styles.highlightBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.highlightText}>
                We do NOT sell your personal information to third parties.
              </Text>
            </View>
          </Section>

          <Section title="4. Data Security">
            <Text style={styles.paragraph}>
              We implement industry-standard security measures:
            </Text>
            <BulletPoint>All data transmitted using TLS/SSL encryption</BulletPoint>
            <BulletPoint>Passwords hashed using BCrypt (strength 12)</BulletPoint>
            <BulletPoint>PCI-DSS compliant payment processing via Authorize.net</BulletPoint>
            <BulletPoint>Role-based access controls for internal systems</BulletPoint>
            <BulletPoint>API credentials encrypted using AES-256-GCM</BulletPoint>
            <BulletPoint>Regular security assessments and audits</BulletPoint>

            <Text style={styles.paragraph}>
              In the event of a data breach affecting your personal information, we will notify
              affected users within 72 hours and take immediate remedial action.
            </Text>
          </Section>

          <Section title="5. Data Retention">
            <Text style={styles.paragraph}>We retain your data for:</Text>
            <BulletPoint>Account Information: Duration of account + 3 years</BulletPoint>
            <BulletPoint>Transaction Records: 7 years (legal requirement)</BulletPoint>
            <BulletPoint>Usage Analytics: 2 years (anonymized thereafter)</BulletPoint>
            <BulletPoint>Location Data: 30 days</BulletPoint>
            <BulletPoint>Support Tickets: 3 years</BulletPoint>

            <Text style={styles.paragraph}>
              Upon account deletion request, personal information is removed within 30 days.
              Some data may be retained for legal compliance.
            </Text>
          </Section>

          <Section title="6. Your Privacy Rights">
            <Text style={styles.paragraph}>All users have the right to:</Text>
            <BulletPoint><Text style={styles.bold}>Access:</Text> Request a copy of your personal data</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Correction:</Text> Update or correct inaccurate information</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Deletion:</Text> Request deletion of your personal data</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Portability:</Text> Receive your data in a portable format</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Opt-Out:</Text> Unsubscribe from marketing communications</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Withdraw Consent:</Text> Revoke previously given consent</BulletPoint>

            <Text style={styles.paragraph}>
              To exercise any privacy right, navigate to Profile {'>'} Settings {'>'} Privacy in the app,
              or email privacy@campcardapp.org. We will respond within 30 days.
            </Text>
          </Section>

          <Section title="7. Children's Privacy (COPPA)">
            <View style={styles.coppaBox}>
              <Ionicons name="shield" size={24} color={COLORS.primary} />
              <Text style={styles.coppaTitle}>COPPA Compliant</Text>
            </View>
            <Text style={styles.paragraph}>
              We comply with the Children's Online Privacy Protection Act (COPPA):
            </Text>
            <BulletPoint>Users must be at least 13 years old to create an account</BulletPoint>
            <BulletPoint>Users under 18 require parental consent</BulletPoint>
            <BulletPoint>Parents/guardians must approve account creation for minors</BulletPoint>
            <BulletPoint>Parents can review and request deletion of their child's data</BulletPoint>
            <BulletPoint>We collect only information necessary for service provision</BulletPoint>

            <Text style={styles.paragraph}>
              Parents with questions about children's privacy can contact us at parents@campcardapp.org.
            </Text>
          </Section>

          <Section title="8. California Privacy Rights (CCPA)">
            <Text style={styles.paragraph}>
              California residents have additional rights under the California Consumer Privacy Act:
            </Text>
            <BulletPoint><Text style={styles.bold}>Right to Know:</Text> Categories of personal information collected and purposes</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Delete:</Text> Request deletion of personal information</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Opt-Out:</Text> Opt-out of sale of personal information (Note: We do NOT sell data)</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Right to Non-Discrimination:</Text> No discrimination for exercising rights</BulletPoint>

            <Text style={styles.paragraph}>
              California residents may submit requests to ccpa@campcardapp.org.
            </Text>
          </Section>

          <Section title="9. Location Services">
            <Text style={styles.paragraph}>With your permission, we use location to:</Text>
            <BulletPoint>Show nearby merchants</BulletPoint>
            <BulletPoint>Sort offers by distance</BulletPoint>
            <BulletPoint>Provide directions to merchants</BulletPoint>
            <BulletPoint>Improve local offer relevance</BulletPoint>

            <Text style={styles.paragraph}>
              Location access is optional. You can use the App without location enabled, though
              some functionality may be limited. We do NOT collect location in the background.
            </Text>
          </Section>

          <Section title="10. Push Notifications">
            <Text style={styles.paragraph}>We may send push notifications for:</Text>
            <BulletPoint>New offers near you</BulletPoint>
            <BulletPoint>Subscription reminders</BulletPoint>
            <BulletPoint>Account security alerts</BulletPoint>
            <BulletPoint>Troop activity updates (for leaders)</BulletPoint>

            <Text style={styles.paragraph}>
              You can control notifications in Profile {'>'} Settings {'>'} Notifications or through
              your device settings. Some essential notifications (security alerts, legal notices)
              cannot be disabled.
            </Text>
          </Section>

          <Section title="11. Third-Party Services">
            <Text style={styles.paragraph}>We use the following third-party services:</Text>
            <BulletPoint><Text style={styles.bold}>Authorize.net:</Text> Payment processing</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Firebase:</Text> Push notifications, analytics</BulletPoint>
            <BulletPoint><Text style={styles.bold}>AWS:</Text> Cloud hosting</BulletPoint>
            <BulletPoint><Text style={styles.bold}>Google Maps:</Text> Location services</BulletPoint>

            <Text style={styles.paragraph}>
              The App may contain links to third-party websites or services. We are not responsible
              for their privacy practices.
            </Text>
          </Section>

          <Section title="12. Changes to This Policy">
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. When we make changes, we will update
              the "Last Updated" date and communicate material changes via email or in-app notification.
              Continued use after changes constitutes acceptance.
            </Text>
          </Section>

          <Section title="13. Contact Us">
            <Text style={styles.paragraph}>
              For questions about this Privacy Policy or our privacy practices:
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.companyName}>Swipe Savvy, LLC</Text>
              <ContactItem
                icon="mail"
                text="privacy@campcardapp.org"
                onPress={() => openEmail('privacy@campcardapp.org')}
              />
              <ContactItem
                icon="people"
                text="parents@campcardapp.org (Children's Privacy)"
                onPress={() => openEmail('parents@campcardapp.org')}
              />
              <ContactItem
                icon="document-text"
                text="ccpa@campcardapp.org (California Residents)"
                onPress={() => openEmail('ccpa@campcardapp.org')}
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
              By using Camp Card, you acknowledge that you have read and understood this Privacy Policy.
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

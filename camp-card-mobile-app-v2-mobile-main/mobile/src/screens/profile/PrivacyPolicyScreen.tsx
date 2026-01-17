// Privacy Policy Screen - Display privacy policy

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

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: January 16, 2026</Text>

          <View style={styles.introduction}>
            <Text style={styles.paragraph}>
              The Boy Scouts of America ("BSA," "we," "us," or "our") respects your
              privacy and is committed to protecting your personal information. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use the BSA Camp Card mobile application.
            </Text>
          </View>

          <Section title="1. Information We Collect">
            <Text style={styles.paragraph}>
              We collect information that you provide directly to us, including:
            </Text>
            <BulletPoint>
              <Text style={styles.bold}>Account Information:</Text> Name, email address,
              phone number, and password
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Profile Information:</Text> Scout troop, council,
              and fundraising data
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Transaction Data:</Text> Subscription purchases and
              offer redemptions
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Location Data:</Text> Your location (with your
              permission) to show nearby offers
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Device Information:</Text> Device type, operating
              system, and app usage data
            </BulletPoint>
          </Section>

          <Section title="2. How We Use Your Information">
            <Text style={styles.paragraph}>We use your information to:</Text>
            <BulletPoint>Provide and maintain the Camp Card service</BulletPoint>
            <BulletPoint>Process transactions and send related notifications</BulletPoint>
            <BulletPoint>Show you relevant offers from local merchants</BulletPoint>
            <BulletPoint>Track fundraising for Scout troops</BulletPoint>
            <BulletPoint>Communicate with you about updates and promotions</BulletPoint>
            <BulletPoint>Improve our services and user experience</BulletPoint>
            <BulletPoint>Comply with legal obligations</BulletPoint>
          </Section>

          <Section title="3. Information Sharing">
            <Text style={styles.paragraph}>We may share your information with:</Text>
            <BulletPoint>
              <Text style={styles.bold}>Merchants:</Text> To verify offer redemptions
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Scout Leaders:</Text> To track troop fundraising
              progress
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Service Providers:</Text> Who help us operate the app
            </BulletPoint>
            <BulletPoint>
              <Text style={styles.bold}>Payment Processors:</Text> To process subscription
              payments
            </BulletPoint>
            <Text style={styles.paragraph}>
              We do not sell your personal information to third parties.
            </Text>
          </Section>

          <Section title="4. Data Security">
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your information,
              including:
            </Text>
            <BulletPoint>Encrypted data transmission (SSL/TLS)</BulletPoint>
            <BulletPoint>Secure password storage</BulletPoint>
            <BulletPoint>Regular security audits</BulletPoint>
            <BulletPoint>Limited employee access to personal data</BulletPoint>
          </Section>

          <Section title="5. Your Privacy Rights">
            <Text style={styles.paragraph}>You have the right to:</Text>
            <BulletPoint>Access your personal information</BulletPoint>
            <BulletPoint>Correct inaccurate data</BulletPoint>
            <BulletPoint>Request deletion of your account</BulletPoint>
            <BulletPoint>Opt-out of marketing communications</BulletPoint>
            <BulletPoint>Disable location services</BulletPoint>
          </Section>

          <Section title="6. Children's Privacy">
            <Text style={styles.paragraph}>
              The Camp Card app is designed for Scout families. For users under 13, we
              require parental consent and only collect information necessary for the
              service. Parents can review and request deletion of their child's
              information at any time.
            </Text>
          </Section>

          <Section title="7. Cookies and Tracking">
            <Text style={styles.paragraph}>
              We use analytics tools to understand app usage and improve our services.
              These tools may collect information about your device and app interactions.
              You can limit tracking through your device settings.
            </Text>
          </Section>

          <Section title="8. Changes to This Policy">
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes through the app or by email. Continued use after changes
              constitutes acceptance of the updated policy.
            </Text>
          </Section>

          <Section title="9. Contact Us">
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy or our privacy practices,
              please contact us:
            </Text>
            <View style={styles.contactBox}>
              <ContactItem icon="mail" text="privacy@campcard.org" />
              <ContactItem icon="call" text="1-800-BSA-CAMP" />
              <ContactItem icon="location" text="Boy Scouts of America
1325 West Walnut Hill Lane
Irving, TX 75015" />
            </View>
          </Section>
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
  bottomSpacer: {
    height: 40,
  },
});

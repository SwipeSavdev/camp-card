// Help & Support Screen - FAQs, Contact, and Support Resources

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface SupportOption {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How do I redeem an offer?',
      answer: 'To redeem an offer, navigate to the offer details and tap "Redeem". Show the redemption screen to the cashier at the participating merchant. The offer will be automatically marked as redeemed after use.',
    },
    {
      question: 'How does the referral program work?',
      answer: 'Share your unique referral link or QR code with friends and family. When they sign up and subscribe using your link, you earn credit towards your fundraising goals. You can track your referrals in the Referrals section.',
    },
    {
      question: 'What happens when my subscription expires?',
      answer: 'When your subscription expires, you will no longer be able to redeem offers. Your referral links will remain active, and any new signups will still count towards your goals. You can renew your subscription at any time.',
    },
    {
      question: 'How do I update my payment method?',
      answer: 'Go to Profile > Subscription > Manage Payment Method. You can add a new card or update your existing payment information from there.',
    },
    {
      question: 'Can I use offers at any location?',
      answer: 'Offers are valid at participating merchant locations only. Check the offer details for specific location information and any restrictions that may apply.',
    },
    {
      question: 'How do fundraising credits work?',
      answer: 'When customers use your referral link to subscribe, a portion of their subscription fee is credited to your Scout unit as fundraising. The exact amount depends on your council\'s arrangement with Camp Card.',
    },
    {
      question: 'What if an offer doesn\'t work?',
      answer: 'If you experience issues redeeming an offer, please contact the merchant directly first. If the issue persists, reach out to our support team through the Contact Us option below with details about the offer and merchant.',
    },
  ];

  const supportOptions: SupportOption[] = [
    {
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'support@campcardapp.org',
      onPress: () => {
        Linking.openURL('mailto:support@campcardapp.org?subject=Camp Card App Support');
      },
    },
    {
      icon: 'call',
      title: 'Phone Support',
      subtitle: '1-800-CAMP-CARD',
      onPress: () => {
        Alert.alert(
          'Call Support',
          'Would you like to call Camp Card support?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => Linking.openURL('tel:18002267227') },
          ]
        );
      },
    },
    {
      icon: 'chatbubbles',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      onPress: () => {
        Alert.alert('Coming Soon', 'Live chat support will be available soon.');
      },
    },
    {
      icon: 'globe',
      title: 'Visit Website',
      subtitle: 'campcardapp.org/help',
      onPress: () => {
        Linking.openURL('https://www.campcardapp.org/help');
      },
    },
  ];

  const quickLinks: SupportOption[] = [
    {
      icon: 'document-text',
      title: 'User Guide',
      subtitle: 'Learn how to use the app',
      onPress: () => {
        Linking.openURL('https://www.campcardapp.org/guide');
      },
    },
    {
      icon: 'videocam',
      title: 'Video Tutorials',
      subtitle: 'Watch step-by-step guides',
      onPress: () => {
        Linking.openURL('https://www.campcardapp.org/tutorials');
      },
    },
    {
      icon: 'megaphone',
      title: 'Report a Problem',
      subtitle: 'Let us know about issues',
      onPress: () => {
        Linking.openURL('mailto:support@campcardapp.org?subject=Problem Report - Camp Card App');
      },
    },
    {
      icon: 'star',
      title: 'Rate the App',
      subtitle: 'Share your feedback',
      onPress: () => {
        Alert.alert('Thank You!', 'Your feedback helps us improve. Please rate us on the App Store.');
      },
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.heroIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="help-buoy" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>How can we help?</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Contact Support</Text>
          <View style={styles.supportGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.supportCard}
                onPress={option.onPress}
                accessibilityLabel={option.title}
                accessibilityRole="button"
              >
                <View style={[styles.supportIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={option.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.supportTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Frequently Asked Questions</Text>
          <View style={[styles.faqContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqItem,
                  { borderBottomColor: colors.border },
                  index === faqs.length - 1 && styles.faqItemLast,
                ]}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
                accessibilityLabel={faq.question}
                accessibilityRole="button"
              >
                <View style={styles.faqQuestion}>
                  <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFAQ === index && (
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary, borderTopColor: colors.border }]}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Links Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Quick Links</Text>
          <View style={[styles.quickLinksContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickLinkItem,
                  { borderBottomColor: colors.border },
                  index === quickLinks.length - 1 && styles.quickLinkItemLast,
                ]}
                onPress={link.onPress}
                accessibilityLabel={link.title}
                accessibilityRole="button"
              >
                <View style={[styles.quickLinkIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={link.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={styles.quickLinkContent}>
                  <Text style={[styles.quickLinkTitle, { color: colors.text }]}>{link.title}</Text>
                  <Text style={[styles.quickLinkSubtitle, { color: colors.textSecondary }]}>{link.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={[styles.supportHoursCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <View style={styles.supportHoursContent}>
            <Text style={[styles.supportHoursTitle, { color: colors.text }]}>Support Hours</Text>
            <Text style={[styles.supportHoursText, { color: colors.textSecondary }]}>
              Monday - Friday: 8:00 AM - 8:00 PM EST{'\n'}
              Saturday: 9:00 AM - 5:00 PM EST{'\n'}
              Sunday: Closed
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  supportCard: {
    width: '50%',
    padding: 4,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  faqContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    paddingRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickLinksContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickLinkItemLast: {
    borderBottomWidth: 0,
  },
  quickLinkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkContent: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  quickLinkSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  supportHoursCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  supportHoursContent: {
    marginLeft: 12,
    flex: 1,
  },
  supportHoursTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  supportHoursText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';

interface SubscriptionDisclosureModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  productName: string;
  price: string;
  period: string;
  loading?: boolean;
}

const PRIVACY_POLICY_URL = 'https://www.campcardapp.org/privacy';
const TERMS_OF_USE_URL = 'https://www.campcardapp.org/terms';

/**
 * Apple Guideline 3.1.2 compliance modal.
 * Must be shown before the native IAP payment sheet for auto-renewable subscriptions.
 * Displays: subscription name, length, price, and links to Privacy Policy & Terms of Use.
 */
export default function SubscriptionDisclosureModal({
  visible,
  onConfirm,
  onCancel,
  productName,
  price,
  period,
  loading = false,
}: SubscriptionDisclosureModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="card-outline" size={32} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                Confirm Subscription
              </Text>
            </View>

            {/* Subscription Details */}
            <View style={[styles.detailsCard, { backgroundColor: colors.background }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Subscription
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {productName}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {period}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Price
                </Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>
                  {price}
                </Text>
              </View>
            </View>

            {/* Auto-Renewal Disclosure */}
            <Text style={[styles.disclosure, { color: colors.textSecondary }]}>
              Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account
              at confirmation of purchase. Subscription automatically renews unless auto-renew
              is turned off at least 24 hours before the end of the current period. Your account
              will be charged for renewal within 24 hours prior to the end of the current period.
              You can manage and cancel your subscriptions by going to your{' '}
              {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} account settings after purchase.
            </Text>

            {/* Legal Links */}
            <View style={styles.linksRow}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
                accessibilityLabel="Terms of Use"
                accessibilityRole="link"
              >
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Terms of Use
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                accessibilityLabel="Privacy Policy"
                accessibilityRole="link"
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={loading}
              accessibilityLabel="Subscribe"
              accessibilityRole="button"
            >
              <Text style={[styles.confirmButtonText, { color: colors.textOnPrimary }]}>
                Subscribe
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  disclosure: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

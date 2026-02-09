// SubscriptionCardBanner Component
// Shows contextual alerts based on combined subscription + card status

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../config/ThemeContext';
import { CombinedStatus } from '../hooks/useSubscriptionCardStatus';

interface SubscriptionCardBannerProps {
  combinedStatus: CombinedStatus;
  statusMessage: string;
  onAction: () => void;
  onDismiss?: () => void;
}

interface StatusConfigEntry {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionText: string;
}

export default function SubscriptionCardBanner({
  combinedStatus,
  statusMessage,
  onAction,
  onDismiss,
}: SubscriptionCardBannerProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const STATUS_CONFIG: Record<CombinedStatus, StatusConfigEntry | null> = {
    HEALTHY: null,
    NEEDS_CARD_ACTIVATION: {
      backgroundColor: colors.info + '15',
      borderColor: colors.info,
      iconColor: colors.info,
      textColor: colors.info,
      icon: 'card-outline',
      actionText: 'Activate Card',
    },
    NEEDS_CARDS: {
      backgroundColor: colors.warning + '15',
      borderColor: colors.warning,
      iconColor: colors.warning,
      textColor: colors.warning,
      icon: 'cart-outline',
      actionText: 'Purchase Cards',
    },
    SUBSCRIPTION_EXPIRED: {
      backgroundColor: colors.error + '15',
      borderColor: colors.error,
      iconColor: colors.error,
      textColor: colors.error,
      icon: 'warning',
      actionText: 'Renew Subscription',
    },
    NOTHING_ACTIVE: {
      backgroundColor: colors.background,
      borderColor: colors.disabled,
      iconColor: colors.textSecondary,
      textColor: colors.textSecondary,
      icon: 'alert-circle-outline',
      actionText: 'Subscribe Now',
    },
    SUBSCRIPTION_SUSPENDED: {
      backgroundColor: colors.warning + '15',
      borderColor: colors.warning,
      iconColor: colors.warning,
      textColor: colors.warning,
      icon: 'alert-circle',
      actionText: 'Contact Support',
    },
  };

  const config = STATUS_CONFIG[combinedStatus];

  if (!config) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.message, { color: config.textColor }]}>
          {statusMessage}
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={onAction} accessibilityLabel={config.actionText} accessibilityRole="button">
          <Text style={[styles.actionText, { color: config.iconColor }]}>
            {config.actionText}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={config.iconColor} />
        </TouchableOpacity>
      </View>

      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} accessibilityLabel="Dismiss alert" accessibilityRole="button">
          <Ionicons name="close" size={20} color={config.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

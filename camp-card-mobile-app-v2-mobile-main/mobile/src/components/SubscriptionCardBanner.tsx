// SubscriptionCardBanner Component
// Shows contextual alerts based on combined subscription + card status

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CombinedStatus } from '../hooks/useSubscriptionCardStatus';

interface SubscriptionCardBannerProps {
  combinedStatus: CombinedStatus;
  statusMessage: string;
  onAction: () => void;
  onDismiss?: () => void;
}

const STATUS_CONFIG: Record<CombinedStatus, {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionText: string;
} | null> = {
  HEALTHY: null,
  NEEDS_CARD_ACTIVATION: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    iconColor: '#1976D2',
    textColor: '#1565C0',
    icon: 'card-outline',
    actionText: 'Activate Card',
  },
  NEEDS_CARDS: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    iconColor: '#F57C00',
    textColor: '#E65100',
    icon: 'cart-outline',
    actionText: 'Purchase Cards',
  },
  SUBSCRIPTION_EXPIRED: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    iconColor: '#D32F2F',
    textColor: '#C62828',
    icon: 'warning',
    actionText: 'Renew Subscription',
  },
  NOTHING_ACTIVE: {
    backgroundColor: '#F5F5F5',
    borderColor: '#BDBDBD',
    iconColor: '#757575',
    textColor: '#616161',
    icon: 'alert-circle-outline',
    actionText: 'Subscribe Now',
  },
  SUBSCRIPTION_SUSPENDED: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    iconColor: '#F57C00',
    textColor: '#E65100',
    icon: 'alert-circle',
    actionText: 'Contact Support',
  },
};

export default function SubscriptionCardBanner({
  combinedStatus,
  statusMessage,
  onAction,
  onDismiss,
}: SubscriptionCardBannerProps) {
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
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={[styles.actionText, { color: config.iconColor }]}>
            {config.actionText}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={config.iconColor} />
        </TouchableOpacity>
      </View>

      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
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

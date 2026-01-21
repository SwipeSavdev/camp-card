// Expiry Alert Banner Component
// Shows warning when cards are expiring soon (30, 15, 7, 3 days)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/constants';

interface ExpiryAlertBannerProps {
  daysUntilExpiry: number;
  cardCount: number;
  onDismiss?: () => void;
}

export default function ExpiryAlertBanner({
  daysUntilExpiry,
  cardCount,
  onDismiss,
}: ExpiryAlertBannerProps) {
  const navigation = useNavigation();

  // Only show for specific thresholds: 30, 15, 7, 3, 1, 0
  const shouldShow =
    daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  if (!shouldShow || cardCount === 0) {
    return null;
  }

  // Determine urgency level
  const getUrgencyConfig = () => {
    if (daysUntilExpiry <= 3) {
      return {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
        iconColor: '#D32F2F',
        textColor: '#C62828',
        urgency: 'critical',
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
        iconColor: '#F57C00',
        textColor: '#E65100',
        urgency: 'high',
      };
    } else if (daysUntilExpiry <= 15) {
      return {
        backgroundColor: '#FFFDE7',
        borderColor: '#FDD835',
        iconColor: '#F9A825',
        textColor: '#F57F17',
        urgency: 'medium',
      };
    } else {
      return {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
        iconColor: '#1976D2',
        textColor: '#1565C0',
        urgency: 'low',
      };
    }
  };

  const config = getUrgencyConfig();

  const getMessage = () => {
    const cardText = cardCount === 1 ? 'card' : 'cards';

    if (daysUntilExpiry === 0) {
      return `Your ${cardCount} Camp Card ${cardText} expire${cardCount === 1 ? 's' : ''} TODAY!`;
    } else if (daysUntilExpiry === 1) {
      return `Your ${cardCount} Camp Card ${cardText} expire${cardCount === 1 ? 's' : ''} TOMORROW!`;
    } else {
      return `Your ${cardCount} Camp Card ${cardText} expire${cardCount === 1 ? 's' : ''} in ${daysUntilExpiry} days`;
    }
  };

  const getActionText = () => {
    if (daysUntilExpiry <= 3) {
      return 'Use them now!';
    } else if (daysUntilExpiry <= 7) {
      return 'Use or gift before they expire!';
    } else {
      return 'View your cards';
    }
  };

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
        <Ionicons
          name={daysUntilExpiry <= 7 ? 'warning' : 'time-outline'}
          size={24}
          color={config.iconColor}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.message, { color: config.textColor }]}>
          {getMessage()}
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (navigation as any).navigate('CardInventory')}
        >
          <Text style={[styles.actionText, { color: config.iconColor }]}>
            {getActionText()}
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

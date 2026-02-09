// QR Scanner Screen for redeeming offers and scanning merchant codes

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigation } from '../../types/navigation';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';

export default function ScanScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* QR Scanner Area Placeholder */}
        <View style={[styles.scannerPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="qr-code" size={120} color={colors.border} />
          <Text style={[styles.scannerText, { color: colors.text }]}>QR Code Scanner</Text>
          <Text style={[styles.scannerSubtext, { color: colors.textSecondary }]}>
            Position QR code within the frame
          </Text>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>How to use:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Scan merchant QR codes to redeem offers
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Show your QR code to merchants
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Scan Scout QR codes for referrals
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('QRScanner')}
            accessibilityLabel="Show My QR Code"
            accessibilityRole="button"
          >
            <Ionicons name="qr-code-outline" size={24} color={colors.surface} />
            <Text style={[styles.actionText, { color: colors.surface }]}>Show My QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Offers')}
            accessibilityLabel="Browse Offers"
            accessibilityRole="button"
          >
            <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, styles.actionTextSecondary, { color: colors.primary }]}>
              Browse Offers
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  scannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  scannerSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  actionTextSecondary: {
    color: COLORS.primary,
  },
});

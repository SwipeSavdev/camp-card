import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, IAP_CARD_PRODUCTS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { useIAP } from '../../hooks/useIAP';

const CAMP_CARD_LOGO = require('../../../assets/campcard_lockup_left.png');

type QuantitySelectionRouteProp = RouteProp<{
  QuantitySelection: {
    selectedPlan: {
      id: number;
      uuid: string;
      name: string;
      priceCents: number;
      billingInterval: 'MONTHLY' | 'ANNUAL';
    };
    scoutCode?: string;
  };
}, 'QuantitySelection'>;

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const IAP_TIER_OPTIONS = [1, 3, 5, 10]; // iOS only supports these fixed tiers

export default function QuantitySelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute<QuantitySelectionRouteProp>();
  const { selectedPlan, scoutCode } = route.params;
  const { width } = useWindowDimensions();
  const isIOS = Platform.OS === 'ios';
  const { theme } = useTheme();
  const { colors } = theme;

  const [quantity, setQuantity] = useState(1);

  const headerLogoSize = Math.min(80, Math.max(60, Math.round(width * 0.2)));

  // IAP hook for localized pricing
  const { getLocalizedPrice } = useIAP({ autoInit: true });

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const subtotal = selectedPlan.priceCents * quantity;
  const processingFee = isIOS ? 0 : Math.round(subtotal * 0.03); // 3% credit card processing fee (Android only)
  const totalPrice = subtotal + processingFee;

  const handleContinue = () => {
    (navigation as any).navigate('Payment', {
      selectedPlan: selectedPlan,
      quantity: quantity,
      scoutCode: scoutCode,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerLogoContainer}>
          <Image
            source={CAMP_CARD_LOGO}
            style={[styles.logoImage, { width: headerLogoSize, height: headerLogoSize * 0.4 }]}
          />
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>How Many Cards?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Purchase multiple Camp Cards to gift to friends and family, or save them for later!
          </Text>
        </View>

        {/* Plan Info */}
        <View style={[styles.planInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <View style={styles.planInfoRow}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={[styles.planName, { color: colors.text }]}>{selectedPlan.name}</Text>
          </View>
          <Text style={[styles.pricePerCard, { color: colors.textSecondary }]}>
            {isIOS
              ? (getLocalizedPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === 1)?.productId || '') || formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === 1)?.priceCents || 1499)) + ' per card'
              : formatPrice(selectedPlan.priceCents) + ' per card'
            }
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {isIOS ? 'Select a Package' : 'Select Quantity (1-10)'}
          </Text>

          <View style={styles.quantityGrid}>
            {(isIOS ? IAP_TIER_OPTIONS : QUANTITY_OPTIONS).map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.quantityButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isIOS && styles.quantityButtonWide,
                  quantity === num && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setQuantity(num)}
                activeOpacity={0.7}
                accessibilityLabel={isIOS ? `Select ${num} card${num > 1 ? 's' : ''}` : `Select quantity ${num}`}
                accessibilityRole="button"
              >
                <Text style={[
                  styles.quantityButtonText,
                  { color: colors.text },
                  quantity === num && { color: colors.white },
                ]}>
                  {isIOS ? `${num} Card${num > 1 ? 's' : ''}` : num}
                </Text>
                {isIOS && (
                  <Text style={[
                    styles.quantityButtonPrice,
                    { color: colors.textSecondary },
                    quantity === num && { color: colors.white },
                  ]}>
                    {getLocalizedPrice(
                      IAP_CARD_PRODUCTS.find(p => p.quantity === num)?.productId || ''
                    ) || formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === num)?.priceCents || num * 1499)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What You Get */}
        <View style={[styles.benefitsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>What You'll Get</Text>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="card" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitLabel, { color: colors.text }]}>{quantity} Camp Card{quantity > 1 ? 's' : ''}</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                {quantity === 1
                  ? 'Your personal card will be activated immediately'
                  : `First card activates now, ${quantity - 1} saved for gifting or later use`
                }
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="gift" size={20} color="#9C27B0" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitLabel, { color: colors.text }]}>Gift to Friends & Family</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                Send extra cards via email anytime before Dec 31st
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="refresh" size={20} color={colors.success} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitLabel, { color: colors.text }]}>Replenish Your Offers</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                Used all your one-time offers? Activate another card for fresh deals!
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="calendar" size={20} color={colors.warning} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitLabel, { color: colors.text }]}>Valid Until December 31st</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                All cards expire at end of year - use or gift before then!
              </Text>
            </View>
          </View>
        </View>

        {/* Scout Attribution */}
        {scoutCode && (
          <View style={[styles.scoutAttribution, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="ribbon" size={20} color={colors.primary} />
            <Text style={[styles.scoutAttributionText, { color: colors.secondary }]}>
              Scout referral code: {scoutCode}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          {/* Cards Line Item - subscription is included in first card */}
          <View style={styles.orderRow}>
            <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>
              {quantity} Camp Card{quantity > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>
              {isIOS
                ? (getLocalizedPrice(
                    IAP_CARD_PRODUCTS.find(p => p.quantity === quantity)?.productId || ''
                  ) || formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === quantity)?.priceCents || quantity * 1499))
                : formatPrice(subtotal)
              }
            </Text>
          </View>
          {/* Note about subscription included */}
          <Text style={[styles.subscriptionIncludedNote, { color: colors.textSecondary }]}>
            Annual subscription included with first card
          </Text>
          {!isIOS && (
            <View style={styles.orderRow}>
              <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Processing Fee (3%)</Text>
              <Text style={[styles.feeValue, { color: colors.text }]}>{formatPrice(processingFee)}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.orderRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {isIOS
                ? formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === quantity)?.priceCents || quantity * 1499)
                : formatPrice(totalPrice)
              }
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          accessibilityLabel="Continue to payment"
          accessibilityRole="button"
        >
          <Text style={[styles.continueButtonText, { color: colors.white }]}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  logoImage: {
    resizeMode: 'contain',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  planInfo: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  planInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  pricePerCard: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 28,
  },
  quantitySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  quantityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quantityButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  quantityButtonWide: {
    width: '46%',
    aspectRatio: undefined,
    paddingVertical: 16,
  },
  quantityButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  quantityButtonPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quantityButtonTextSelected: {
    color: '#fff',
  },
  benefitsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  scoutAttribution: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  scoutAttributionText: {
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  orderSummary: {
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  feeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  subscriptionIncludedNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

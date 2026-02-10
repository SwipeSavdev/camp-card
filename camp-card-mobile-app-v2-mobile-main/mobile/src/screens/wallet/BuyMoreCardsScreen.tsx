// BuyMoreCardsScreen - Allows existing users to purchase additional Camp Cards
// Supports quantity selection (1, 3, 5, 10 card packages)
// Uses In-App Purchase: iOS StoreKit / Android Google Play Billing

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, IAP_PRODUCTS, IAP_CARD_PRODUCTS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useIAP } from '../../hooks/useIAP';

// Valid IAP tier quantities
const IAP_TIERS = [1, 3, 5, 10] as const;

export default function BuyMoreCardsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // IAP hook for in-app purchases (iOS StoreKit / Android Google Play Billing)
  const {
    loading: iapLoading,
    purchasing: iapPurchasing,
    purchaseProduct,
    getProductForQuantity,
    getLocalizedPrice,
  } = useIAP({
    autoInit: true,
    userId: user?.id,
    onPurchaseComplete: () => {
      Alert.alert(
        'Purchase Successful!',
        `You have purchased ${quantity} Camp Card${quantity !== 1 ? 's' : ''}. Check your Card Inventory to view and activate them.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onPurchaseError: (error) => {
      Alert.alert('Purchase Failed', error);
    },
  });

  // Check if the selected quantity product is available
  const selectedProduct = getProductForQuantity(quantity);
  const iapProductAvailable = !!selectedProduct;

  const handlePurchasePress = async () => {
    if (iapLoading) {
      Alert.alert('Please Wait', 'Loading payment options. Please try again in a moment.');
      return;
    }

    if (!iapProductAvailable || !selectedProduct) {
      Alert.alert(
        'Product Unavailable',
        'This card package is not available for purchase. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await purchaseProduct(selectedProduct.id);
    } catch (error: any) {
      console.error('IAP card purchase error:', error);
      const message = error?.message || 'Unable to process purchase. Please try again.';
      Alert.alert('Purchase Error', message);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Buy More Cards</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoBannerText, { color: colors.text }]}>
            Purchase additional Camp Cards to gift to friends and family, or to
            replenish your offers when you've used them all.
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a Package</Text>

          {/* Tier buttons */}
          <View style={styles.quickSelectRow}>
            {IAP_TIERS.map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.quickSelectButton, { backgroundColor: colors.surface, borderColor: colors.border }, quantity === num && [styles.quickSelectButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
                onPress={() => setQuantity(num)}
                accessibilityLabel={`Select ${num} card${num !== 1 ? 's' : ''}`}
                accessibilityRole="button"
              >
                <Text style={[styles.quickSelectText, { color: colors.text }, quantity === num && { color: colors.textOnPrimary }]}>
                  {num} {num === 1 ? 'Card' : 'Cards'}
                </Text>
                <Text style={[styles.quickSelectPrice, { color: colors.textSecondary }, quantity === num && { color: colors.textOnPrimary }]}>
                  {getLocalizedPrice(
                    IAP_CARD_PRODUCTS.find(p => p.quantity === num)?.productId || ''
                  ) || formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === num)?.priceCents || num * 1499)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Summary</Text>

          <View style={[styles.priceCard, { backgroundColor: colors.surface }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>
                {quantity} Camp Card{quantity !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {getLocalizedPrice(
                  IAP_CARD_PRODUCTS.find(p => p.quantity === quantity)?.productId || ''
                ) || formatPrice(IAP_CARD_PRODUCTS.find(p => p.quantity === quantity)?.priceCents || quantity * 1499)}
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What You Get</Text>

          <View style={[styles.benefitItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="gift-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Gift to Friends & Family</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                Share the savings with loved ones by gifting unused cards
              </Text>
            </View>
          </View>

          <View style={[styles.benefitItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="refresh-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Replenish Your Offers</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                Used all your offers? Activate a new card to reset them all
              </Text>
            </View>
          </View>

          <View style={[styles.benefitItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>Support Scout Fundraising</Text>
              <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                Every card purchase helps support local Scout units
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Note */}
        <View style={styles.pricingNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.secondary} />
          <Text style={[styles.pricingNoteText, { color: colors.secondary }]}>
In-app price: $14.99/card. Buy from a Scout for only $10/card and support their fundraising goals!
          </Text>
        </View>

        {/* Expiry Notice */}
        <View style={styles.expiryNotice}>
          <Ionicons name="calendar-outline" size={20} color={colors.warning} />
          <Text style={styles.expiryText}>
            All Camp Cards expire on December 31st of the purchase year.
          </Text>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            { backgroundColor: colors.primary },
            (loading || iapPurchasing || iapLoading) && styles.purchaseButtonDisabled,
            !iapLoading && !iapProductAvailable && styles.purchaseButtonWarning,
          ]}
          onPress={handlePurchasePress}
          disabled={loading || iapPurchasing || iapLoading}
          accessibilityLabel={`Purchase ${quantity} card${quantity !== 1 ? 's' : ''}`}
          accessibilityRole="button"
        >
          {loading || iapPurchasing || iapLoading ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={24} color={colors.textOnPrimary} />
              <Text style={[styles.purchaseButtonText, { color: colors.textOnPrimary }]}>
                {iapProductAvailable
                  ? `Purchase ${quantity} Card${quantity !== 1 ? 's' : ''}`
                  : 'Product Unavailable'
                }
              </Text>
            </>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
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
  contentContainer: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickSelectButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickSelectButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickSelectPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceSection: {
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  pricingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pricingNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  expiryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 100, // Space for fixed footer
  },
  expiryText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonWarning: {
    backgroundColor: '#FF9800',
  },
  purchaseButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

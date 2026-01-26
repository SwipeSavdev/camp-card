import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

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

export default function QuantitySelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute<QuantitySelectionRouteProp>();
  const { selectedPlan, scoutCode } = route.params;
  const { width } = useWindowDimensions();

  const [quantity, setQuantity] = useState(1);

  const headerLogoSize = Math.min(80, Math.max(60, Math.round(width * 0.2)));

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const subtotal = selectedPlan.priceCents * quantity;
  const processingFee = Math.round(subtotal * 0.03); // 3% credit card processing fee
  const totalPrice = subtotal + processingFee;

  const handleContinue = () => {
    (navigation as any).navigate('Payment', {
      selectedPlan: selectedPlan,
      quantity: quantity,
      scoutCode: scoutCode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
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
          <Text style={styles.title}>How Many Cards?</Text>
          <Text style={styles.subtitle}>
            Purchase multiple Camp Cards to gift to friends and family, or save them for later!
          </Text>
        </View>

        {/* Plan Info */}
        <View style={styles.planInfo}>
          <View style={styles.planInfoRow}>
            <Ionicons name="pricetag" size={20} color={COLORS.primary} />
            <Text style={styles.planName}>{selectedPlan.name}</Text>
          </View>
          <Text style={styles.pricePerCard}>{formatPrice(selectedPlan.priceCents)} per card</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionLabel}>Select Quantity (1-10)</Text>

          <View style={styles.quantityGrid}>
            {QUANTITY_OPTIONS.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.quantityButton,
                  quantity === num && styles.quantityButtonSelected,
                ]}
                onPress={() => setQuantity(num)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity === num && styles.quantityButtonTextSelected,
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What You Get */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What You'll Get</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="card" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>{quantity} Camp Card{quantity > 1 ? 's' : ''}</Text>
              <Text style={styles.benefitDescription}>
                {quantity === 1
                  ? 'Your personal card will be activated immediately'
                  : `First card activates now, ${quantity - 1} saved for gifting or later use`
                }
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="gift" size={20} color="#9C27B0" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>Gift to Friends & Family</Text>
              <Text style={styles.benefitDescription}>
                Send extra cards via email anytime before Dec 31st
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="refresh" size={20} color="#4CAF50" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>Replenish Your Offers</Text>
              <Text style={styles.benefitDescription}>
                Used all your one-time offers? Activate another card for fresh deals!
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="calendar" size={20} color="#FF9800" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>Valid Until December 31st</Text>
              <Text style={styles.benefitDescription}>
                All cards expire at end of year - use or gift before then!
              </Text>
            </View>
          </View>
        </View>

        {/* Scout Attribution */}
        {scoutCode && (
          <View style={styles.scoutAttribution}>
            <Ionicons name="ribbon" size={20} color={COLORS.primary} />
            <Text style={styles.scoutAttributionText}>
              Scout referral code: {scoutCode}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>{quantity} Card{quantity > 1 ? 's' : ''} × {formatPrice(selectedPlan.priceCents)}</Text>
            <Text style={styles.orderValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.feeLabel}>Processing Fee (3%)</Text>
            <Text style={styles.feeValue}>{formatPrice(processingFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  quantityButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
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

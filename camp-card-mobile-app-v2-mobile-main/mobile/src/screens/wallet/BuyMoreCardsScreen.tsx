// BuyMoreCardsScreen - Allows existing users to purchase additional Camp Cards
// Supports quantity selection (1-10) with bulk discount
// In-app purchases are $15 per card (direct purchase price)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { cardsApi, paymentsApi } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import CardPaymentModal, { CardData } from '../../components/CardPaymentModal';

// In-app direct purchase price is $15 per card
const CARD_PRICE_CENTS = 1500; // $15 per card
const BULK_DISCOUNT_PERCENT = 5; // 5% off for 2+ cards

export default function BuyMoreCardsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const calculatePrice = (qty: number) => {
    const basePrice = qty * CARD_PRICE_CENTS;
    if (qty >= 2) {
      return Math.round(basePrice * (1 - BULK_DISCOUNT_PERCENT / 100));
    }
    return basePrice;
  };

  const totalPrice = calculatePrice(quantity);
  const savings = quantity >= 2 ? (quantity * CARD_PRICE_CENTS) - totalPrice : 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchasePress = () => {
    // Show payment modal to collect card details
    setShowPaymentModal(true);
  };

  const processPayment = async (cardData: CardData): Promise<{ transactionId: string }> => {
    // Process payment via Authorize.net
    const response = await paymentsApi.charge({
      amount: totalPrice / 100, // Convert cents to dollars
      cardNumber: cardData.cardNumber,
      expirationDate: cardData.expirationDate,
      cvv: cardData.cvv,
      description: `Camp Card Purchase - ${quantity} card${quantity !== 1 ? 's' : ''}`,
      customerEmail: user?.email,
      customerName: cardData.cardholderName,
      billingZip: cardData.billingZip,
    });

    if (response.data.status !== 'SUCCESS') {
      throw new Error(response.data.errorMessage || 'Payment failed');
    }

    // After payment success, create the cards in the system
    await cardsApi.purchaseCards({
      quantity,
      paymentToken: response.data.transactionId,
    });

    return { transactionId: response.data.transactionId };
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentModal(false);
    Alert.alert(
      'Purchase Successful!',
      `You have purchased ${quantity} Camp Card${quantity !== 1 ? 's' : ''}. Check your Card Inventory to view and activate them.\n\nTransaction ID: ${transactionId}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Failed', error);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy More Cards</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoBannerText}>
            Purchase additional Camp Cards to gift to friends and family, or to
            replenish your offers when you've used them all.
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>How many cards?</Text>

          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={28}
                color={quantity <= 1 ? COLORS.border : COLORS.text}
              />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityNumber}>{quantity}</Text>
              <Text style={styles.quantityLabel}>card{quantity !== 1 ? 's' : ''}</Text>
            </View>

            <TouchableOpacity
              style={[styles.quantityButton, quantity >= 10 && styles.quantityButtonDisabled]}
              onPress={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
            >
              <Ionicons
                name="add"
                size={28}
                color={quantity >= 10 ? COLORS.border : COLORS.text}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.quickSelectRow}>
            {[1, 3, 5, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.quickSelectButton, quantity === num && styles.quickSelectButtonActive]}
                onPress={() => setQuantity(num)}
              >
                <Text style={[styles.quickSelectText, quantity === num && styles.quickSelectTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {quantity} Camp Card{quantity !== 1 ? 's' : ''} × {formatPrice(CARD_PRICE_CENTS)}
              </Text>
              <Text style={styles.priceValue}>{formatPrice(quantity * CARD_PRICE_CENTS)}</Text>
            </View>

            {quantity >= 2 && (
              <View style={styles.priceRow}>
                <View style={styles.discountLabel}>
                  <Ionicons name="pricetag" size={16} color={COLORS.success} />
                  <Text style={styles.discountText}>Bulk Discount ({BULK_DISCOUNT_PERCENT}%)</Text>
                </View>
                <Text style={styles.discountValue}>-{formatPrice(savings)}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
            </View>

            {quantity >= 2 && (
              <View style={styles.savingsTag}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.savingsText}>You save {formatPrice(savings)}!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Gift to Friends & Family</Text>
              <Text style={styles.benefitDescription}>
                Share the savings with loved ones by gifting unused cards
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Replenish Your Offers</Text>
              <Text style={styles.benefitDescription}>
                Used all your offers? Activate a new card to reset them all
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Support Scout Fundraising</Text>
              <Text style={styles.benefitDescription}>
                Every card purchase helps support local Scout troops
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Note */}
        <View style={styles.pricingNote}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
          <Text style={styles.pricingNoteText}>
            In-app price: $15/card. Buy from a Scout for only $10/card and support their fundraising goals!
          </Text>
        </View>

        {/* Expiry Notice */}
        <View style={styles.expiryNotice}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.warning} />
          <Text style={styles.expiryText}>
            All Camp Cards expire on December 31st of the purchase year.
          </Text>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
          onPress={handlePurchasePress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <>
              <Ionicons name="card" size={24} color={COLORS.surface} />
              <Text style={styles.purchaseButtonText}>
                Purchase {quantity} Card{quantity !== 1 ? 's' : ''} - {formatPrice(totalPrice)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <CardPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        amount={totalPrice}
        description={`${quantity} Camp Card${quantity !== 1 ? 's' : ''}`}
        processPayment={processPayment}
      />
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
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  quantityNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
  quickSelectTextActive: {
    color: COLORS.surface,
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
  priceValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 16,
    color: COLORS.success,
    marginLeft: 8,
  },
  discountValue: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  savingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
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
  purchaseButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

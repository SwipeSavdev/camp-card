import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, IAP_PRODUCTS, IAP_CARD_PRODUCTS, IAP_PRICES } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { paymentsApi } from '../../services/apiClient';
import { useIAP } from '../../hooks/useIAP';

type PaymentScreenRouteProp = RouteProp<AuthStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();
  const { selectedPlan, quantity = 1, scoutCode } = route.params;
  const isIOS = Platform.OS === 'ios';
  const { theme } = useTheme();
  const { colors } = theme;

  // Get card product details for the selected quantity
  // Note: Card price INCLUDES the annual subscription (bundled)
  const cardProduct = IAP_CARD_PRODUCTS.find(p => p.quantity === quantity);
  const cardPriceCents = isIOS
    ? (cardProduct?.priceCents || IAP_PRICES.CARDS_1)
    : selectedPlan.priceCents * quantity;

  // Calculate totals - subscription is included in card price
  const processingFee = isIOS ? 0 : Math.round(cardPriceCents * 0.03); // 3% credit card processing fee (Android only)
  const totalPrice = cardPriceCents + processingFee;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get the card product SKU for the selected quantity
  const getCardSku = (): string => {
    return cardProduct?.productId || IAP_PRODUCTS.CARDS_1;
  };

  // IAP hook for in-app purchases (iOS StoreKit / Android Google Play Billing)
  const {
    products: iapProducts,
    loading: iapLoading,
    purchasing: iapPurchasing,
    purchaseProduct,
    getLocalizedPrice,
  } = useIAP({
    autoInit: true,
    onPurchaseComplete: (result) => {
      // Card purchase complete (subscription included) - navigate to signup
      (navigation as any).navigate('Signup', {
        selectedPlan: selectedPlan,
        paymentCompleted: true,
        quantity: quantity,
        scoutCode: scoutCode,
        transactionId: result.transactionId,
      });
    },
    onPurchaseError: (error) => {
      Alert.alert('Purchase Failed', error);
    },
  });

  // Check if the required IAP product is available
  const iapProductAvailable = iapProducts.some(p => p.id === getCardSku());

  // Purchase cards (subscription is included in price)
  const handleIAPPurchase = async () => {
    // Check if IAP products are loaded
    if (iapLoading) {
      Alert.alert('Please Wait', 'Loading payment options. Please try again in a moment.');
      return;
    }

    if (!iapProductAvailable) {
      Alert.alert(
        'Product Unavailable',
        'This product is not available for purchase at this time. Please ensure you are using a Sandbox tester account and the products are configured in App Store Connect.',
        [
          { text: 'OK' },
          {
            text: 'View Details',
            onPress: () => {
              console.log('[IAP] Available products:', iapProducts.map(p => p.id));
              console.log('[IAP] Requested SKU:', getCardSku());
              Alert.alert('Debug Info', `Requested: ${getCardSku()}\nAvailable: ${iapProducts.length} products\n\n${iapProducts.map(p => p.id).join('\n') || 'None loaded'}`);
            },
          },
        ]
      );
      return;
    }

    try {
      await purchaseProduct(getCardSku());
      // Success handled by onPurchaseComplete callback
    } catch (error: any) {
      console.error('IAP purchase error:', error);
      const message = error?.message || 'Unable to process purchase. Please try again.';
      Alert.alert('Purchase Error', message);
    }
  };

  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const zipRef = useRef<TextInput>(null);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (formatted.replace(/\s/g, '').length === 16) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
    if (formatted.length === 5) {
      cvvRef.current?.focus();
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
    setCvv(cleaned);
    if (cleaned.length >= 3) {
      nameRef.current?.focus();
    }
  };

  const validateCard = () => {
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 15) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    if (expiryDate.length !== 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }
    if (cardholderName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    if (zipCode.length < 5) {
      Alert.alert('Invalid ZIP', 'Please enter a valid ZIP code');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) return;

    setProcessing(true);

    try {
      // Process payment via Authorize.net using the public mobile-charge endpoint
      // This endpoint doesn't require authentication (for signup flow)
      // Charging for: Cards + Annual Subscription
      const response = await paymentsApi.mobileCharge({
        amount: totalPrice / 100, // Convert cents to dollars (cards + subscription + fee)
        cardNumber: cardNumber.replace(/\s/g, ''),
        expirationDate: expiryDate.replace('/', ''), // MMYY format
        cvv,
        description: `Camp Card - ${quantity} card${quantity > 1 ? 's' : ''} + Annual Subscription`,
        customerName: cardholderName.trim(),
        billingZip: zipCode,
      });

      if (response.data.status !== 'SUCCESS') {
        throw new Error(response.data.errorMessage || 'Payment failed');
      }

      // Navigate to signup with payment completed and transaction ID
      (navigation as any).navigate('Signup', {
        selectedPlan: selectedPlan,
        paymentCompleted: true,
        quantity: quantity,
        scoutCode: scoutCode,
        transactionId: response.data.transactionId,
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error.response?.data?.error ||
                      error.response?.data?.errorMessage ||
                      error.response?.data?.message ||
                      error.message ||
                      'There was an error processing your payment. Please try again.';
      Alert.alert('Payment Failed', message);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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

          <Text style={[styles.headerTitle, { color: colors.text }]}>Payment</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Summary */}
          <View style={[styles.orderSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>

            {/* Camp Cards (subscription included in first card) */}
            <View style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={[styles.planName, { color: colors.text }]}>{quantity} Camp Card{quantity > 1 ? 's' : ''}</Text>
                <Text style={[styles.planInterval, { color: colors.textSecondary }]}>
                  {isIOS ? 'Includes annual subscription' : `${quantity} × ${formatPrice(selectedPlan.priceCents)}`}
                </Text>
              </View>
              <Text style={[styles.planPrice, { color: colors.text }]}>
                {isIOS
                  ? (getLocalizedPrice(getCardSku()) || formatPrice(cardPriceCents))
                  : formatPrice(cardPriceCents)
                }
              </Text>
            </View>

            {/* Subscription included note */}
            <Text style={[styles.subscriptionNote, { color: colors.textSecondary }]}>
              Annual subscription included with first card
            </Text>

            {!isIOS && (
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Credit Card Processing Fee (3%)</Text>
                <Text style={[styles.feeAmount, { color: colors.text }]}>{formatPrice(processingFee)}</Text>
              </View>
            )}
            {scoutCode ? (
              <View style={styles.scoutRow}>
                <Text style={[styles.scoutLabel, { color: colors.secondary }]}>Scout Referral: {scoutCode}</Text>
              </View>
            ) : null}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Due Today</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {formatPrice(isIOS ? cardPriceCents : totalPrice)}
              </Text>
            </View>
          </View>

          {isIOS ? (
            <>
              {/* iOS IAP Info */}
              <View style={[styles.paymentForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Apple In-App Purchase</Text>
                <View style={[styles.securityNotice, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="logo-apple" size={20} color={colors.text} />
                  <Text style={[styles.securityText, { color: colors.success }]}>
                    Your purchase will be processed securely through your Apple ID. No card details needed.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Payment Form (Android — Authorize.net) */}
              <View style={[styles.paymentForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="card-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={colors.textSecondary}
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      keyboardType="numeric"
                      maxLength={19}
                      returnKeyType="next"
                      accessibilityLabel="Card number"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <TextInput
                        ref={expiryRef}
                        style={[styles.input, { color: colors.text }]}
                        placeholder="MM/YY"
                        placeholderTextColor={colors.textSecondary}
                        value={expiryDate}
                        onChangeText={handleExpiryChange}
                        keyboardType="numeric"
                        maxLength={5}
                        returnKeyType="next"
                        accessibilityLabel="Expiry date"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>CVV</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <TextInput
                        ref={cvvRef}
                        style={[styles.input, { color: colors.text }]}
                        placeholder="123"
                        placeholderTextColor={colors.textSecondary}
                        value={cvv}
                        onChangeText={handleCvvChange}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                        returnKeyType="next"
                        accessibilityLabel="CVV"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Cardholder Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={nameRef}
                      style={[styles.input, { color: colors.text }]}
                      placeholder="John Doe"
                      placeholderTextColor={colors.textSecondary}
                      value={cardholderName}
                      onChangeText={setCardholderName}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => zipRef.current?.focus()}
                      accessibilityLabel="Cardholder name"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Billing ZIP Code</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={zipRef}
                      style={[styles.input, { color: colors.text }]}
                      placeholder="12345"
                      placeholderTextColor={colors.textSecondary}
                      value={zipCode}
                      onChangeText={(text) => setZipCode(text.replace(/\D/g, '').substring(0, 5))}
                      keyboardType="numeric"
                      maxLength={5}
                      returnKeyType="done"
                      accessibilityLabel="Billing ZIP code"
                    />
                  </View>
                </View>
              </View>

              {/* Security Notice (Android only) */}
              <View style={[styles.securityNotice, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={[styles.securityText, { color: colors.success }]}>
                  Your payment is secured by Authorize.net with 256-bit SSL encryption
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Pay Button */}
        <View style={[styles.bottomSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: colors.primary },
              (processing || iapPurchasing || (isIOS && iapLoading)) && styles.payButtonDisabled,
              isIOS && !iapLoading && !iapProductAvailable && styles.payButtonWarning,
            ]}
            onPress={isIOS ? handleIAPPurchase : handlePayment}
            disabled={processing || iapPurchasing || (isIOS && iapLoading)}
            accessibilityLabel={isIOS ? (iapProductAvailable ? 'Purchase with Apple' : 'Product unavailable') : `Pay ${formatPrice(totalPrice)}`}
            accessibilityRole="button"
          >
            {processing || iapPurchasing || (isIOS && iapLoading) ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name={isIOS ? 'logo-apple' : 'lock-closed'} size={20} color={colors.white} />
                <Text style={[styles.payButtonText, { color: colors.white }]}>
                  {isIOS
                    ? (iapProductAvailable ? 'Purchase with Apple' : 'Product Unavailable')
                    : `Pay ${formatPrice(totalPrice)}`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isIOS && (
            <View style={styles.cardLogos}>
              <Text style={[styles.acceptedText, { color: colors.textSecondary }]}>We accept</Text>
              <View style={styles.logoRow}>
                <View style={[styles.cardBadge, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.cardBadgeText, { color: colors.textSecondary }]}>VISA</Text></View>
                <View style={[styles.cardBadge, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.cardBadgeText, { color: colors.textSecondary }]}>MC</Text></View>
                <View style={[styles.cardBadge, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.cardBadgeText, { color: colors.textSecondary }]}>AMEX</Text></View>
                <View style={[styles.cardBadge, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.cardBadgeText, { color: colors.textSecondary }]}>DISC</Text></View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  orderSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  planInterval: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  scoutRow: {
    marginTop: 12,
  },
  scoutLabel: {
    fontSize: 13,
    color: '#1565C0',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subscriptionNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
  },
  paymentForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonWarning: {
    backgroundColor: '#FF9800',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardLogos: {
    marginTop: 16,
    alignItems: 'center',
  },
  acceptedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
});

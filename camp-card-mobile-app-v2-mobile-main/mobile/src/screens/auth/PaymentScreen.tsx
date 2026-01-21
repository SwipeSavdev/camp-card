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
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { AuthStackParamList } from '../../navigation/RootNavigator';

const CAMP_CARD_LOGO = require('../../../assets/campcard_lockup_left.png');

type PaymentScreenRouteProp = RouteProp<AuthStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();
  const { selectedPlan, quantity = 1, scoutCode } = route.params;
  const { width } = useWindowDimensions();

  // Calculate totals
  const unitPrice = selectedPlan.priceCents;
  const subtotal = unitPrice * quantity;
  const bulkDiscount = quantity > 1 ? Math.round(subtotal * 0.05) : 0; // 5% bulk discount for 2+ cards
  const totalPrice = subtotal - bulkDiscount;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const zipRef = useRef<TextInput>(null);

  const headerLogoSize = Math.min(80, Math.max(60, Math.round(width * 0.2)));

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
      // In production, this would:
      // 1. Use Authorize.net Accept.js to tokenize the card
      // 2. Send the token to the backend
      // 3. Backend processes payment via Authorize.net

      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to signup with payment completed
      (navigation as any).navigate('Signup', {
        selectedPlan: selectedPlan,
        paymentCompleted: true,
        quantity: quantity,
        scoutCode: scoutCode,
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.planName}>{selectedPlan.name}</Text>
                <Text style={styles.planInterval}>
                  {quantity} Camp Card{quantity > 1 ? 's' : ''} × {formatPrice(unitPrice)}
                </Text>
              </View>
              <Text style={styles.planPrice}>{formatPrice(subtotal)}</Text>
            </View>
            {bulkDiscount > 0 ? (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>Bulk Discount (5%)</Text>
                <Text style={styles.discountAmount}>-{formatPrice(bulkDiscount)}</Text>
              </View>
            ) : null}
            {scoutCode ? (
              <View style={styles.scoutRow}>
                <Text style={styles.scoutLabel}>Scout Referral: {scoutCode}</Text>
              </View>
            ) : null}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due Today</Text>
              <Text style={styles.totalAmount}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>

          {/* Payment Form */}
          <View style={styles.paymentForm}>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={expiryRef}
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={cvvRef}
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#999"
                    value={cvv}
                    onChangeText={handleCvvChange}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  ref={nameRef}
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => zipRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Billing ZIP Code</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  ref={zipRef}
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor="#999"
                  value={zipCode}
                  onChangeText={(text) => setZipCode(text.replace(/\D/g, '').substring(0, 5))}
                  keyboardType="numeric"
                  maxLength={5}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment is secured by Authorize.net with 256-bit SSL encryption
            </Text>
          </View>
        </ScrollView>

        {/* Pay Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.payButton, processing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={20} color="#fff" />
                <Text style={styles.payButtonText}>
                  Pay {formatPrice(totalPrice)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.cardLogos}>
            <Text style={styles.acceptedText}>We accept</Text>
            <View style={styles.logoRow}>
              <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>VISA</Text></View>
              <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>MC</Text></View>
              <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>AMEX</Text></View>
              <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>DISC</Text></View>
            </View>
          </View>
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
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  discountLabel: {
    fontSize: 14,
    color: '#4CAF50',
  },
  discountAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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

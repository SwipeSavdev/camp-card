// CardPaymentModal - Secure credit card collection form for Authorize.net payments
// Collects card details and sends to backend for processing

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

interface CardPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number; // in cents
  description: string;
  processPayment: (cardData: CardData) => Promise<{ transactionId: string }>;
}

export interface CardData {
  cardNumber: string;
  expirationDate: string; // Format: MMYY
  cvv: string;
  cardholderName: string;
  billingZip: string;
}

export default function CardPaymentModal({
  visible,
  onClose,
  onPaymentSuccess,
  onPaymentError,
  amount,
  description,
  processPayment,
}: CardPaymentModalProps) {
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

  const validateCard = (): string | null => {
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 15) {
      return 'Please enter a valid card number';
    }
    if (expiryDate.length !== 5) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    // Validate expiry is not in the past
    const [month, year] = expiryDate.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = parseInt('20' + year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return 'Card has expired';
    }
    if (cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    if (cardholderName.trim().length < 2) {
      return 'Please enter the cardholder name';
    }
    if (zipCode.length < 5) {
      return 'Please enter a valid ZIP code';
    }
    return null;
  };

  const handlePayment = async () => {
    const validationError = validateCard();
    if (validationError) {
      onPaymentError(validationError);
      return;
    }

    setProcessing(true);

    try {
      // Format card data for backend
      const cardData: CardData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expirationDate: expiryDate.replace('/', ''), // MMYY format
        cvv,
        cardholderName: cardholderName.trim(),
        billingZip: zipCode,
      };

      const result = await processPayment(cardData);

      // Clear form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setZipCode('');

      onPaymentSuccess(result.transactionId);
    } catch (error: any) {
      const message = error.response?.data?.errorMessage ||
                      error.response?.data?.message ||
                      error.message ||
                      'Payment failed. Please try again.';
      onPaymentError(message);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleClose = () => {
    if (!processing) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setZipCode('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={processing}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <Text style={styles.orderLabel}>{description}</Text>
              <Text style={styles.orderAmount}>{formatPrice(amount)}</Text>
            </View>

            {/* Card Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={COLORS.textSecondary}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="numeric"
                    maxLength={19}
                    returnKeyType="next"
                    editable={!processing}
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
                      placeholderTextColor={COLORS.textSecondary}
                      value={expiryDate}
                      onChangeText={handleExpiryChange}
                      keyboardType="numeric"
                      maxLength={5}
                      returnKeyType="next"
                      editable={!processing}
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
                      placeholderTextColor={COLORS.textSecondary}
                      value={cvv}
                      onChangeText={handleCvvChange}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      returnKeyType="next"
                      editable={!processing}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    ref={nameRef}
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textSecondary}
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => zipRef.current?.focus()}
                    editable={!processing}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Billing ZIP Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    ref={zipRef}
                    style={styles.input}
                    placeholder="12345"
                    placeholderTextColor={COLORS.textSecondary}
                    value={zipCode}
                    onChangeText={(text) => setZipCode(text.replace(/\D/g, '').substring(0, 5))}
                    keyboardType="numeric"
                    maxLength={5}
                    returnKeyType="done"
                    editable={!processing}
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

            {/* Card Logos */}
            <View style={styles.cardLogos}>
              <Text style={styles.acceptedText}>We accept</Text>
              <View style={styles.logoRow}>
                <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>VISA</Text></View>
                <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>MC</Text></View>
                <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>AMEX</Text></View>
                <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>DISC</Text></View>
              </View>
            </View>
          </ScrollView>

          {/* Pay Button */}
          <View style={styles.footer}>
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
                    Pay {formatPrice(amount)}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderLabel: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  form: {
    marginBottom: 16,
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
  },
  cardLogos: {
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: COLORS.surface,
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
  footer: {
    padding: 16,
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
});

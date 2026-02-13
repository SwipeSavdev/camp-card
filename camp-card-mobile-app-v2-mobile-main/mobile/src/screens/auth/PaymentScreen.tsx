import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, IAP_PRODUCTS, IAP_CARD_PRODUCTS, IAP_PRICES } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { useIAP } from '../../hooks/useIAP';
import SubscriptionDisclosureModal from '../../components/SubscriptionDisclosureModal';

type PaymentScreenRouteProp = RouteProp<AuthStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();
  const { selectedPlan, quantity = 1, scoutCode } = route.params;
  const { theme } = useTheme();
  const { colors } = theme;
  const [showDisclosure, setShowDisclosure] = React.useState(false);

  // Get card product details for the selected quantity
  // Note: Card price INCLUDES the annual subscription (bundled)
  const cardProduct = IAP_CARD_PRODUCTS.find(p => p.quantity === quantity);
  const cardPriceCents = cardProduct?.priceCents || IAP_PRICES.CARDS_1;

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

  // Show disclosure modal before purchase (Apple Guideline 3.1.2)
  const handleIAPPurchase = () => {
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

    setShowDisclosure(true);
  };

  // Actual purchase after disclosure confirmation
  const handleDisclosureConfirm = async () => {
    setShowDisclosure(false);
    try {
      await purchaseProduct(getCardSku());
    } catch (error: any) {
      console.error('IAP purchase error:', error);
      const message = error?.message || 'Unable to process purchase. Please try again.';
      Alert.alert('Purchase Error', message);
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
                  Includes annual subscription
                </Text>
              </View>
              <Text style={[styles.planPrice, { color: colors.text }]}>
                {getLocalizedPrice(getCardSku()) || formatPrice(cardPriceCents)}
              </Text>
            </View>

            {/* Subscription included note */}
            <Text style={[styles.subscriptionNote, { color: colors.textSecondary }]}>
              Annual subscription included with first card
            </Text>

            {scoutCode ? (
              <View style={styles.scoutRow}>
                <Text style={[styles.scoutLabel, { color: colors.secondary }]}>Scout Referral: {scoutCode}</Text>
              </View>
            ) : null}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Due Today</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {formatPrice(cardPriceCents)}
              </Text>
            </View>
          </View>

          {/* In-App Purchase Info */}
          <View style={[styles.paymentForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>In-App Purchase</Text>
            <View style={[styles.securityNotice, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={20} color={colors.text} />
              <Text style={[styles.securityText, { color: colors.success }]}>
                {Platform.OS === 'ios'
                  ? 'Your purchase will be processed securely through your Apple ID. No card details needed.'
                  : 'Your purchase will be processed securely through Google Play. No card details needed.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Pay Button */}
        <View style={[styles.bottomSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: colors.primary },
              (iapPurchasing || iapLoading) && styles.payButtonDisabled,
              !iapLoading && !iapProductAvailable && styles.payButtonWarning,
            ]}
            onPress={handleIAPPurchase}
            disabled={iapPurchasing || iapLoading}
            accessibilityLabel={iapProductAvailable ? 'Purchase' : 'Product unavailable'}
            accessibilityRole="button"
          >
            {(iapPurchasing || iapLoading) ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={20} color={colors.white} />
                <Text style={[styles.payButtonText, { color: colors.white }]}>
                  {iapProductAvailable ? 'Purchase' : 'Product Unavailable'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Apple Guideline 3.1.2 - Subscription disclosure before payment */}
        <SubscriptionDisclosureModal
          visible={showDisclosure}
          onConfirm={handleDisclosureConfirm}
          onCancel={() => setShowDisclosure(false)}
          productName={`${quantity} Camp Card${quantity > 1 ? 's' : ''} + Annual Subscription`}
          price={getLocalizedPrice(getCardSku()) || formatPrice(cardPriceCents)}
          period="1 Year (Auto-Renewable)"
          loading={iapPurchasing}
        />
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
});

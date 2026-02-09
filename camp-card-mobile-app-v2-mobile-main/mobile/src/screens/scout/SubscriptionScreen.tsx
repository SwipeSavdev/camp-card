import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, paymentsApi, paymentMethodsApi } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { TroopLeaderStackParamList } from '../../navigation/RootNavigator';
import CardPaymentModal, { CardData } from '../../components/CardPaymentModal';
import { useSubscriptionCardStatus } from '../../hooks/useSubscriptionCardStatus';
import SubscriptionCardBanner from '../../components/SubscriptionCardBanner';
import { useIAP } from '../../hooks/useIAP';
import { IAP_PRODUCTS, IAP_PRICES } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';

interface SubscriptionPlan {
  id: number;
  uuid: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  trialDays: number;
  features: string[];
}

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  scoutAttribution?: {
    scoutName: string;
    troopNumber: string;
  };
  totalSavings: number;
}

type TroopLeaderNavProp = NativeStackNavigationProp<TroopLeaderStackParamList>;

export default function SubscriptionScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);
  const [savedCards, setSavedCards] = useState<Array<{
    id: number;
    cardLastFour: string;
    cardType: string;
    expirationMonth: number;
    expirationYear: number;
    isDefault: boolean;
  }>>([]);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [savingCard, setSavingCard] = useState(false);
  const navigation = useNavigation<TroopLeaderNavProp>();
  const { user, updateUser } = useAuthStore();

  // Combined subscription + card status
  const {
    activeCard: statusActiveCard,
    hasActiveCard,
    unusedCardCount,
    totalCardCount,
    combinedStatus,
    statusMessage,
    actionType,
  } = useSubscriptionCardStatus();

  // Check if user is a Unit Leader - they need to select a scout before subscribing
  const isUnitLeader = user?.role === 'UNIT_LEADER';
  const isIOS = Platform.OS === 'ios';

  // IAP hook for in-app purchases (iOS StoreKit / Android Google Play Billing)
  const {
    purchasing: iapPurchasing,
    purchaseSubscription,
    restorePurchases,
    getLocalizedPrice,
  } = useIAP({
    autoInit: true,
    userId: user?.id,
    onPurchaseComplete: async (result) => {
      Alert.alert('Success!', 'Your subscription is now active');
      await loadSubscriptionData();
      try {
        const meResponse = await apiClient.get('/api/v1/auth/me');
        updateUser(meResponse.data);
      } catch (e) {
        console.log('Failed to refresh user after IAP subscription:', e);
      }
    },
    onPurchaseError: (error) => {
      Alert.alert('Purchase Failed', error);
    },
  });

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [subResponse, plansResponse] = await Promise.all([
        apiClient.get('/api/v1/subscriptions/me'),
        apiClient.get('/api/v1/subscription-plans')
      ]);

      setSubscription(subResponse.data);
      // For in-app subscription/renewal, only show the $15 Direct plan
      // The $10 Scout Referral plan is only available when scanning a Scout's QR code
      const allPlans = plansResponse.data.data || [];
      const directPlan = allPlans.find((p: any) => p.priceCents === 1500);
      setAvailablePlans(directPlan ? [directPlan] : allPlans.slice(0, 1));
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No subscription yet, just load plans
        const plansResponse = await apiClient.get('/api/v1/subscription-plans');
        // For in-app subscription, only show the $15 Direct plan
        const allPlans = plansResponse.data.data || [];
        const directPlan = allPlans.find((p: any) => p.priceCents === 1500);
        setAvailablePlans(directPlan ? [directPlan] : allPlans.slice(0, 1));
      } else {
        console.error('Error loading subscription:', error);
        Alert.alert('Error', 'Failed to load subscription information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Unit Leaders must select a scout before subscribing
    if (isUnitLeader) {
      navigation.navigate('SelectScoutForSubscription', { planId: plan.uuid });
      return;
    }

    // iOS: Use Apple In-App Purchase
    if (isIOS) {
      try {
        const sku = IAP_PRODUCTS.SUBSCRIPTION_ANNUAL;
        await purchaseSubscription(sku);
        // Result handled by onPurchaseComplete callback in useIAP
      } catch (error: any) {
        console.error('IAP subscription error:', error);
      }
      return;
    }

    // Android: Show credit card payment modal (Authorize.net)
    setPendingPlan(plan);
    setShowPaymentModal(true);
  };

  const processPayment = async (cardData: CardData): Promise<{ transactionId: string }> => {
    if (!pendingPlan) {
      throw new Error('No plan selected');
    }

    // Process payment via Authorize.net
    const response = await paymentsApi.charge({
      amount: pendingPlan.priceCents / 100,
      cardNumber: cardData.cardNumber,
      expirationDate: cardData.expirationDate,
      cvv: cardData.cvv,
      description: `Subscription: ${pendingPlan.name}`,
      customerEmail: user?.email,
      customerName: cardData.cardholderName,
      billingZip: cardData.billingZip,
    });

    if (response.data.status !== 'SUCCESS') {
      throw new Error(response.data.errorMessage || 'Payment failed');
    }

    // Create subscription with payment transaction ID
    await apiClient.post('/api/v1/subscriptions', {
      planId: pendingPlan.id,
      paymentMethod: {
        type: 'AUTHORIZE_NET',
        transactionId: response.data.transactionId,
      }
    });

    return { transactionId: response.data.transactionId };
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setShowPaymentModal(false);
    setPendingPlan(null);
    Alert.alert('Success!', 'Your subscription is now active');
    await loadSubscriptionData();
    // Refresh user in auth store so Offers tab becomes visible
    try {
      const meResponse = await apiClient.get('/api/v1/auth/me');
      updateUser(meResponse.data);
    } catch (e) {
      console.log('Failed to refresh user after subscription:', e);
    }
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Failed', error);
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    // iOS: Direct to Apple's subscription management
    if (isIOS) {
      Alert.alert(
        'Manage Subscription',
        'Your subscription is managed through Apple. You\'ll be taken to your Apple ID subscription settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openURL('https://apps.apple.com/account/subscriptions'),
          }
        ]
      );
      return;
    }

    // Android: Cancel via backend
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel? You've saved $${subscription.totalSavings.toFixed(2)} this year!\n\nYour subscription will remain active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`,
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.patch('/api/v1/subscriptions/me', {
                cancelAtPeriodEnd: true
              });
              Alert.alert('Subscription Canceled', 'Your subscription will end at the current billing period.');
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || 'Failed to cancel subscription');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      await apiClient.post('/api/v1/subscriptions/me/reactivate');
      Alert.alert('Success!', 'Your subscription has been reactivated');
      loadSubscriptionData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewNow = () => {
    if (!subscription) return;

    Alert.alert(
      'Renew Subscription',
      `Renew your ${subscription.plan.name} subscription for $${(subscription.plan.priceCents / 100).toFixed(2)}?\n\nThis will:\n• Extend your subscription period\n• Replenish all one-time offers`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew Now',
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.post('/api/v1/subscriptions/me/renew');
              Alert.alert(
                'Subscription Renewed!',
                'Your subscription has been renewed and all one-time offers have been replenished.'
              );
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || 'Failed to renew subscription');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const loadSavedCards = async () => {
    try {
      const response = await paymentMethodsApi.getAll();
      setSavedCards(response.data || []);
    } catch (error) {
      console.error('Error loading saved cards:', error);
    }
  };

  const handleUpdatePayment = async () => {
    await loadSavedCards();
    setShowUpdatePaymentModal(true);
  };

  const handleSaveNewCard = async () => {
    if (!newCardNumber || !newCardExpiry || !newCardCvv) {
      Alert.alert('Missing Info', 'Please fill in all card fields.');
      return;
    }

    // Validate expiry format (MMYY)
    const expiryClean = newCardExpiry.replace(/\//g, '');
    if (expiryClean.length !== 4) {
      Alert.alert('Invalid Expiry', 'Enter expiration as MM/YY.');
      return;
    }

    setSavingCard(true);
    try {
      const nameParts = newCardName.trim().split(' ');
      await paymentMethodsApi.save({
        cardNumber: newCardNumber.replace(/\s/g, ''),
        expirationDate: expiryClean,
        cvv: newCardCvv,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
        setAsDefault: true,
      });

      Alert.alert('Success', 'Payment method saved for auto-renew.');
      setNewCardNumber('');
      setNewCardExpiry('');
      setNewCardCvv('');
      setNewCardName('');
      await loadSavedCards();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.response?.data?.errorMessage || 'Failed to save card. Please check your details.');
    } finally {
      setSavingCard(false);
    }
  };

  const handleRemoveCard = (cardId: number, lastFour: string) => {
    Alert.alert(
      'Remove Card',
      `Remove card ending in ${lastFour}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentMethodsApi.remove(cardId);
              await loadSavedCards();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove card.');
            }
          },
        },
      ]
    );
  };

  const formatCardInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  const formatExpiryInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const toggleAutoRenew = async (value: boolean) => {
    try {
      await apiClient.patch('/api/v1/subscriptions/me', {
        cancelAtPeriodEnd: !value
      });
      loadSubscriptionData();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update auto-renew setting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return colors.success;
      case 'SUSPENDED': return colors.warning;
      case 'CANCELED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView style={{flex: 1}}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.secondary }]}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Card Status Banner (only card-related alerts, not subscription alerts since we're on that page) */}
      {(combinedStatus === 'NEEDS_CARD_ACTIVATION' || combinedStatus === 'NEEDS_CARDS') && (
        <SubscriptionCardBanner
          combinedStatus={combinedStatus}
          statusMessage={statusMessage}
          onAction={() => {
            if (actionType === 'activate_card') {
              (navigation as any).navigate('CardInventory');
            } else if (actionType === 'purchase_cards') {
              (navigation as any).navigate('BuyMoreCards');
            }
          }}
        />
      )}

      {subscription ? (
        <>
          {/* Current Subscription */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.secondary }]}>Current Plan</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                  {subscription.status}
                </Text>
              </View>
            </View>

            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: colors.text }]}>{subscription.plan.name}</Text>
              <Text style={[styles.planPrice, { color: colors.textSecondary }]}>
                {isIOS
                  ? `$${(IAP_PRICES.SUBSCRIPTION_ANNUAL / 100).toFixed(2)}`
                  : `$${(subscription.plan.priceCents / 100).toFixed(2)}`
                }/{subscription.plan.billingInterval.toLowerCase()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Next billing: {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Total saved: ${subscription.totalSavings.toFixed(2)}
              </Text>
            </View>

            {subscription.scoutAttribution && (
              <View style={styles.infoRow}>
                <Ionicons name="ribbon-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Supporting {subscription.scoutAttribution.scoutName}, Unit {subscription.scoutAttribution.troopNumber}
                </Text>
              </View>
            )}

            {subscription.cancelAtPeriodEnd && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            )}
          </View>

          {/* Auto-Renew / Subscription Management */}
          {isIOS ? (
            <>
              {/* iOS: Apple manages auto-renew */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-Renew</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Auto-renewal is managed in your Apple ID settings
                    </Text>
                  </View>
                  <Ionicons name="logo-apple" size={24} color={colors.text} />
                </View>
              </View>

              {/* iOS: Actions */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderBottomColor: colors.border }]}
                  onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
                  accessibilityLabel="Manage Subscription"
                  accessibilityRole="button"
                >
                  <Ionicons name="settings-outline" size={24} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Manage Subscription</Text>
                  <Ionicons name="chevron-forward" size={24} color={colors.border} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { borderBottomColor: colors.border }]}
                  onPress={restorePurchases}
                  accessibilityLabel="Restore Purchases"
                  accessibilityRole="button"
                >
                  <Ionicons name="refresh-outline" size={24} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Restore Purchases</Text>
                  <Ionicons name="chevron-forward" size={24} color={colors.border} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Android: Auto-Renew Toggle */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-Renew</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Automatically renew at end of billing period
                    </Text>
                  </View>
                  <Switch
                    value={!subscription.cancelAtPeriodEnd}
                    onValueChange={toggleAutoRenew}
                    trackColor={{ false: colors.border, true: colors.secondary }}
                  />
                </View>
              </View>

              {/* Android: Renew Now Button */}
              <View style={styles.renewCard}>
                <View style={styles.renewInfo}>
                  <Ionicons name="sparkles" size={24} color={colors.secondary} />
                  <View style={styles.renewTextContainer}>
                    <Text style={[styles.renewTitle, { color: colors.secondary }]}>Ready for more savings?</Text>
                    <Text style={[styles.renewDescription, { color: colors.textSecondary }]}>
                      Renew now to replenish all one-time offers
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.renewButton, { backgroundColor: colors.secondary }]}
                  onPress={handleRenewNow}
                  accessibilityLabel="Renew Now"
                  accessibilityRole="button"
                >
                  <Ionicons name="refresh" size={20} color={colors.textOnPrimary} />
                  <Text style={[styles.renewButtonText, { color: colors.textOnPrimary }]}>Renew Now</Text>
                </TouchableOpacity>
              </View>

              {/* Android: Actions */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderBottomColor: colors.border }]}
                  onPress={handleUpdatePayment}
                  accessibilityLabel="Update Payment Method"
                  accessibilityRole="button"
                >
                  <Ionicons name="card-outline" size={24} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Update Payment Method</Text>
                  <Ionicons name="chevron-forward" size={24} color={colors.border} />
                </TouchableOpacity>

                {subscription.cancelAtPeriodEnd ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { borderBottomColor: colors.border }]}
                    onPress={handleReactivate}
                    accessibilityLabel="Reactivate Subscription"
                    accessibilityRole="button"
                  >
                    <Ionicons name="refresh-outline" size={24} color={colors.success} />
                    <Text style={[styles.actionButtonText, { color: colors.success }]}>Reactivate Subscription</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.border} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, { borderBottomColor: colors.border }]}
                    onPress={handleCancelSubscription}
                    accessibilityLabel="Cancel Subscription"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close-circle-outline" size={24} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Cancel Subscription</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.border} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Features */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.secondary }]}>Plan Features</Text>
            {subscription.plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Your Cards */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.secondary }]}>Your Cards</Text>

            {hasActiveCard ? (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Active card: {statusActiveCard?.cardNumber}
                </Text>
              </View>
            ) : (
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  {unusedCardCount > 0
                    ? `No active card. You have ${unusedCardCount} unused card${unusedCardCount !== 1 ? 's' : ''} to activate.`
                    : 'No cards yet. Purchase cards to start using offers at merchants.'}
                </Text>
              </View>
            )}

            {totalCardCount > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="layers-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>Total cards: {totalCardCount}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { borderBottomColor: colors.border }]}
              onPress={() => {
                if (hasActiveCard || unusedCardCount > 0) {
                  (navigation as any).navigate('CardInventory');
                } else {
                  (navigation as any).navigate('BuyMoreCards');
                }
              }}
              accessibilityLabel={hasActiveCard ? 'View Cards' : unusedCardCount > 0 ? 'Activate a Card' : 'Purchase Cards'}
              accessibilityRole="button"
            >
              <Ionicons name="wallet-outline" size={24} color={colors.secondary} />
              <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                {hasActiveCard ? 'View Cards' : unusedCardCount > 0 ? 'Activate a Card' : 'Purchase Cards'}
              </Text>
              <Ionicons name="chevron-forward" size={24} color={colors.border} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* No Subscription - Show Plans */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Subscription</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Choose a plan below to start saving at local merchants!
            </Text>
          </View>

          {totalCardCount > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.warningBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                <Text style={[styles.warningText, { color: colors.secondary }]}>
                  You have {totalCardCount} card{totalCardCount !== 1 ? 's' : ''} but need an active subscription to use them at merchants.
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Available Plans</Text>

          {availablePlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                plan.billingInterval === 'ANNUAL' && [styles.recommendedPlan, { borderColor: colors.primary }]
              ]}
              onPress={() => handleSubscribe(plan)}
              accessibilityLabel={`Select ${plan.name} plan`}
              accessibilityRole="button"
            >
              {plan.billingInterval === 'ANNUAL' && (
                <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.recommendedText, { color: colors.textOnPrimary }]}>BEST VALUE</Text>
                </View>
              )}

              <Text style={[styles.planCardName, { color: colors.secondary }]}>{plan.name}</Text>
              <Text style={[styles.planCardDescription, { color: colors.textSecondary }]}>{plan.description}</Text>

              <View style={styles.priceContainer}>
                <Text style={[styles.planCardPrice, { color: colors.text }]}>
                  {isIOS
                    ? (getLocalizedPrice(IAP_PRODUCTS.SUBSCRIPTION_ANNUAL) || `$${(IAP_PRICES.SUBSCRIPTION_ANNUAL / 100).toFixed(2)}`)
                    : `$${(plan.priceCents / 100).toFixed(2)}`
                  }
                </Text>
                <Text style={[styles.planCardInterval, { color: colors.textSecondary }]}>
                  /{plan.billingInterval.toLowerCase()}
                </Text>
              </View>

{/* Trial text removed - no trial offered */}

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={[styles.planFeatureText, { color: colors.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  { backgroundColor: colors.secondary },
                  plan.billingInterval === 'ANNUAL' && [styles.subscribeButtonRecommended, { backgroundColor: colors.primary }]
                ]}
                onPress={() => handleSubscribe(plan)}
                disabled={isIOS && iapPurchasing}
                accessibilityLabel={isIOS ? 'Subscribe with Apple' : 'Subscribe Now'}
                accessibilityRole="button"
              >
                {isIOS && iapPurchasing ? (
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                ) : (
                  <Text style={[styles.subscribeButtonText, { color: colors.textOnPrimary }]}>
                    {isIOS ? 'Subscribe with Apple' : 'Subscribe Now'}
                  </Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Info Section */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.secondary }]}>Why Subscribe?</Text>
            <View style={styles.benefitRow}>
              <Ionicons name="pricetag" size={24} color={colors.secondary} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Save Money</Text>
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Average customer saves $200/year at local merchants
                </Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Support Scouts</Text>
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Your subscription helps Scouts attend summer camp
                </Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="refresh" size={24} color={colors.success} />
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Cancel Anytime</Text>
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  No long-term commitment, cancel before next billing
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Update Payment Method Modal (Android only — iOS uses Apple's payment management) */}
      {!isIOS && <Modal
        visible={showUpdatePaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpdatePaymentModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.secondary }]}>Payment Methods</Text>
            <TouchableOpacity
              onPress={() => setShowUpdatePaymentModal(false)}
              accessibilityLabel="Close payment methods"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <View style={styles.savedCardsSection}>
                <Text style={[styles.savedCardsTitle, { color: colors.text }]}>Saved Cards</Text>
                {savedCards.map((card) => (
                  <View key={card.id} style={[styles.savedCardRow, { backgroundColor: colors.surface }]}>
                    <View style={styles.savedCardInfo}>
                      <Ionicons name="card" size={24} color={colors.secondary} />
                      <View style={styles.savedCardDetails}>
                        <Text style={[styles.savedCardType, { color: colors.text }]}>
                          {card.cardType} ending in {card.cardLastFour}
                          {card.isDefault ? ' (Default)' : ''}
                        </Text>
                        <Text style={[styles.savedCardExpiry, { color: colors.textSecondary }]}>
                          Expires {String(card.expirationMonth).padStart(2, '0')}/{card.expirationYear}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveCard(card.id, card.cardLastFour)}
                      accessibilityLabel={`Remove card ending in ${card.cardLastFour}`}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add New Card */}
            <View style={[styles.addCardSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.addCardTitle, { color: colors.secondary }]}>
                {savedCards.length > 0 ? 'Replace Payment Method' : 'Add Payment Method'}
              </Text>
              <Text style={[styles.addCardDescription, { color: colors.textSecondary }]}>
                Your card will be securely stored for subscription auto-renewal.
              </Text>

              <TextInput
                style={[styles.cardInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Cardholder Name"
                placeholderTextColor={colors.textSecondary}
                value={newCardName}
                onChangeText={setNewCardName}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.cardInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Card Number"
                placeholderTextColor={colors.textSecondary}
                value={newCardNumber}
                onChangeText={(text) => setNewCardNumber(formatCardInput(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
              <View style={styles.cardInputRow}>
                <TextInput
                  style={[styles.cardInput, styles.cardInputHalf, { borderColor: colors.border, color: colors.text }]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textSecondary}
                  value={newCardExpiry}
                  onChangeText={(text) => setNewCardExpiry(formatExpiryInput(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.cardInputHalf, { borderColor: colors.border, color: colors.text }]}
                  placeholder="CVV"
                  placeholderTextColor={colors.textSecondary}
                  value={newCardCvv}
                  onChangeText={setNewCardCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.saveCardButton, { backgroundColor: colors.secondary }, savingCard && styles.saveCardButtonDisabled]}
                onPress={handleSaveNewCard}
                disabled={savingCard}
                accessibilityLabel="Save Payment Method"
                accessibilityRole="button"
              >
                {savingCard ? (
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                ) : (
                  <Text style={[styles.saveCardButtonText, { color: colors.textOnPrimary }]}>Save Payment Method</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>}

      {/* Payment Modal (Android only — iOS uses Apple IAP) */}
      {!isIOS && <CardPaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingPlan(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        amount={pendingPlan?.priceCents || 0}
        description={pendingPlan ? `${pendingPlan.name} Subscription` : 'Subscription'}
        processPayment={processPayment}
      />}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003f87',
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planInfo: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#003f87',
    marginLeft: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedPlan: {
    borderColor: '#ce1126',
    borderWidth: 3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#ce1126',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 8,
  },
  planCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planCardPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  planCardInterval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  trialText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: '#003f87',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonRecommended: {
    backgroundColor: '#ce1126',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
  renewCard: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#90caf9',
  },
  renewInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  renewTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  renewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 4,
  },
  renewDescription: {
    fontSize: 14,
    color: '#666',
  },
  renewButton: {
    backgroundColor: '#003f87',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  renewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003f87',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  savedCardsSection: {
    marginBottom: 24,
  },
  savedCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  savedCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  savedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCardDetails: {
    marginLeft: 12,
  },
  savedCardType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  savedCardExpiry: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  addCardSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003f87',
    marginBottom: 4,
  },
  addCardDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  cardInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  cardInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardInputHalf: {
    flex: 1,
  },
  saveCardButton: {
    backgroundColor: '#003f87',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveCardButtonDisabled: {
    opacity: 0.6,
  },
  saveCardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

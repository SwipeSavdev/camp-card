import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { TroopLeaderStackParamList } from '../../navigation/RootNavigator';
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
      // For in-app subscription/renewal, only show the $14.99 Direct plan
      // The $10 Scout Referral plan is only available when scanning a Scout's QR code
      const allPlans = plansResponse.data.data || [];
      const directPlan = allPlans.find((p: any) => p.priceCents >= 1499 && p.priceCents <= 1500);
      setAvailablePlans(directPlan ? [directPlan] : allPlans.slice(0, 1));
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No subscription yet, just load plans
        const plansResponse = await apiClient.get('/api/v1/subscription-plans');
        // For in-app subscription, only show the $14.99 Direct plan
        const allPlans = plansResponse.data.data || [];
        const directPlan = allPlans.find((p: any) => p.priceCents >= 1499 && p.priceCents <= 1500);
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
    if (isUnitLeader) {
      navigation.navigate('SelectScoutForSubscription', { planId: plan.uuid });
      return;
    }

    try {
      const sku = IAP_PRODUCTS.SUBSCRIPTION_ANNUAL;
      await purchaseSubscription(sku);
    } catch (error: any) {
      console.error('IAP subscription error:', error);
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

    const storeName = Platform.OS === 'ios' ? 'Apple' : 'Google Play';
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';

    Alert.alert(
      'Manage Subscription',
      `Your subscription is managed through ${storeName}. You'll be taken to your subscription settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openURL(storeUrl),
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
      `Renew your ${subscription.plan.name} subscription for $14.99?\n\nThis will:\n• Extend your subscription period\n• Replenish all one-time offers`,
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
                {`$${(IAP_PRICES.SUBSCRIPTION_ANNUAL / 100).toFixed(2)}`}/{subscription.plan.billingInterval.toLowerCase()}
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

          {/* Subscription Management - managed by store */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-Renew</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {Platform.OS === 'ios'
                    ? 'Auto-renewal is managed in your Apple ID settings'
                    : 'Auto-renewal is managed in your Google Play settings'}
                </Text>
              </View>
              <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={24} color={colors.text} />
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.actionButton, { borderBottomColor: colors.border }]}
              onPress={() => {
                const storeUrl = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions';
                Linking.openURL(storeUrl);
              }}
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
                  {getLocalizedPrice(IAP_PRODUCTS.SUBSCRIPTION_ANNUAL) || `$${(IAP_PRICES.SUBSCRIPTION_ANNUAL / 100).toFixed(2)}`}
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
                disabled={iapPurchasing}
                accessibilityLabel="Subscribe"
                accessibilityRole="button"
              >
                {iapPurchasing ? (
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                ) : (
                  <Text style={[styles.subscribeButtonText, { color: colors.textOnPrimary }]}>
                    Subscribe
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
});

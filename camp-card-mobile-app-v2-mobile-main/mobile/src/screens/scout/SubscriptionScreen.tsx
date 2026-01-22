import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { TroopLeaderStackParamList } from '../../navigation/RootNavigator';

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
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const navigation = useNavigation<TroopLeaderNavProp>();
  const { user } = useAuthStore();

  // Check if user is a Troop Leader - they need to select a scout before subscribing
  const isTroopLeader = user?.role === 'UNIT_LEADER';

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
    // Troop Leaders must select a scout before subscribing
    if (isTroopLeader) {
      navigation.navigate('SelectScoutForSubscription', { planId: plan.uuid });
      return;
    }

    // For Scouts and Parents, proceed directly to subscription
    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${plan.name} for $${(plan.priceCents / 100).toFixed(2)}/${plan.billingInterval.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              setLoading(true);

              // In production, this would integrate with Authorize.net Accept.js
              // Backend expects camelCase property names
              await apiClient.post('/api/v1/subscriptions', {
                planId: plan.id,
                paymentMethod: {
                  type: 'AUTHORIZE_NET',
                  // This would come from Authorize.net Accept.js tokenization
                  paymentNonce: 'mock_token'
                }
              });

              Alert.alert('Success!', 'Your subscription is now active');
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Subscription failed');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;

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
                cancel_at_period_end: true
              });
              Alert.alert('Subscription Canceled', 'Your subscription will end at the current billing period.');
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel subscription');
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to reactivate subscription');
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
              Alert.alert('Error', error.response?.data?.message || 'Failed to renew subscription');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdatePayment = () => {
    // In production, this would open Authorize.net payment method update flow
    Alert.alert('Update Payment', 'This would integrate with Authorize.net to update card details');
  };

  const toggleAutoRenew = async (value: boolean) => {
    try {
      await apiClient.patch('/api/v1/subscriptions/me', {
        cancel_at_period_end: !value
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
      case 'ACTIVE': return '#4CAF50';
      case 'SUSPENDED': return '#ff9800';
      case 'CANCELED': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003f87" />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      {subscription ? (
        <>
          {/* Current Subscription */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Plan</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                  {subscription.status}
                </Text>
              </View>
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planName}>{subscription.plan.name}</Text>
              <Text style={styles.planPrice}>
                ${(subscription.plan.priceCents / 100).toFixed(2)}/{subscription.plan.billingInterval.toLowerCase()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Next billing: {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Total saved: ${subscription.totalSavings.toFixed(2)}
              </Text>
            </View>

            {subscription.scoutAttribution && (
              <View style={styles.infoRow}>
                <Ionicons name="ribbon-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Supporting {subscription.scoutAttribution.scoutName}, Troop {subscription.scoutAttribution.troopNumber}
                </Text>
              </View>
            )}

            {subscription.cancelAtPeriodEnd && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color="#ff9800" />
                <Text style={styles.warningText}>
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            )}
          </View>

          {/* Auto-Renew Toggle */}
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto-Renew</Text>
                <Text style={styles.settingDescription}>
                  Automatically renew at end of billing period
                </Text>
              </View>
              <Switch
                value={!subscription.cancelAtPeriodEnd}
                onValueChange={toggleAutoRenew}
                trackColor={{ false: '#ccc', true: '#003f87' }}
              />
            </View>
          </View>

          {/* Renew Now Button */}
          <View style={styles.renewCard}>
            <View style={styles.renewInfo}>
              <Ionicons name="sparkles" size={24} color="#003f87" />
              <View style={styles.renewTextContainer}>
                <Text style={styles.renewTitle}>Ready for more savings?</Text>
                <Text style={styles.renewDescription}>
                  Renew now to replenish all one-time offers
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.renewButton} onPress={handleRenewNow}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.renewButtonText}>Renew Now</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionButton} onPress={handleUpdatePayment}>
              <Ionicons name="card-outline" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Update Payment Method</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            {subscription.cancelAtPeriodEnd ? (
              <TouchableOpacity style={styles.actionButton} onPress={handleReactivate}>
                <Ionicons name="refresh-outline" size={24} color="#4CAF50" />
                <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Reactivate Subscription</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionButton} onPress={handleCancelSubscription}>
                <Ionicons name="close-circle-outline" size={24} color="#f44336" />
                <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Cancel Subscription</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>

          {/* Features */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Features</Text>
            {subscription.plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* No Subscription - Show Plans */}
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No Active Subscription</Text>
            <Text style={styles.emptyText}>
              Choose a plan below to start saving at local merchants!
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Available Plans</Text>

          {availablePlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.billingInterval === 'ANNUAL' && styles.recommendedPlan
              ]}
              onPress={() => handleSubscribe(plan)}
            >
              {plan.billingInterval === 'ANNUAL' && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>BEST VALUE</Text>
                </View>
              )}

              <Text style={styles.planCardName}>{plan.name}</Text>
              <Text style={styles.planCardDescription}>{plan.description}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.planCardPrice}>
                  ${(plan.priceCents / 100).toFixed(2)}
                </Text>
                <Text style={styles.planCardInterval}>
                  /{plan.billingInterval.toLowerCase()}
                </Text>
              </View>

              {plan.trialDays > 0 && (
                <Text style={styles.trialText}>
                  {plan.trialDays} days free trial
                </Text>
              )}

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.billingInterval === 'ANNUAL' && styles.subscribeButtonRecommended
                ]}
                onPress={() => handleSubscribe(plan)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Info Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Why Subscribe?</Text>
            <View style={styles.benefitRow}>
              <Ionicons name="pricetag" size={24} color="#003f87" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Save Money</Text>
                <Text style={styles.benefitText}>
                  Average customer saves $200/year at local merchants
                </Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="heart" size={24} color="#ce1126" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Support Scouts</Text>
                <Text style={styles.benefitText}>
                  Your subscription helps Scouts attend summer camp
                </Text>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="refresh" size={24} color="#4CAF50" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Cancel Anytime</Text>
                <Text style={styles.benefitText}>
                  No long-term commitment, cancel before next billing
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
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
    paddingTop: 60,
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
});

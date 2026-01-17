import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../utils/api';
import { COLORS } from '../../config/constants';

const COUNCIL_LOGO = require('../../../assets/council_logo.png');

interface SubscriptionPlan {
  id: number;
  uuid: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  features: string[];
  trialDays: number;
}

export default function SubscriptionSelectionScreen() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const headerLogoSize = Math.min(100, Math.max(80, Math.round(width * 0.25)));

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await apiClient.get('/api/v1/subscription-plans');
      const plansData = response.data.data || response.data || [];
      // Backend already filters to only active plans, no need to filter again
      setPlans(plansData);
      // Auto-select the $15 direct plan (higher price) for direct sign-ups
      if (plansData.length > 0) {
        // Find the direct plan ($15) - it has the higher price
        const directPlan = plansData.find((p: any) => p.priceCents === 1500) || plansData[0];
        setSelectedPlan(directPlan);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceCents: number, interval: string) => {
    const price = (priceCents / 100).toFixed(2);
    const period = interval === 'ANNUAL' ? '/year' : '/month';
    return `$${price}${period}`;
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please select a subscription plan to continue.');
      return;
    }

    // In a real app, this would integrate with Authorize.net for payment
    // For now, we'll simulate the payment process
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // Navigate to signup with the selected plan
      (navigation as any).navigate('Signup', {
        selectedPlan: {
          id: selectedPlan.id,
          uuid: selectedPlan.uuid,
          name: selectedPlan.name,
          priceCents: selectedPlan.priceCents,
          billingInterval: selectedPlan.billingInterval,
        },
        paymentCompleted: true,
      });
    }, 1500);
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const isPopular = plan.name.toLowerCase().includes('premium');

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isPopular && styles.planCardPopular,
        ]}
        onPress={() => setSelectedPlan(plan)}
        activeOpacity={0.7}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
              {plan.name}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.planPrice}>
            {formatPrice(plan.priceCents, plan.billingInterval)}
          </Text>
        </View>

        {plan.description && (
          <Text style={styles.planDescription}>{plan.description}</Text>
        )}

        {plan.features && plan.features.length > 0 && (
          <View style={styles.featuresList}>
            {plan.features.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {plan.trialDays > 0 && (
          <View style={styles.trialBadge}>
            <Ionicons name="gift-outline" size={14} color="#FF9800" />
            <Text style={styles.trialText}>{plan.trialDays}-day free trial</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            source={COUNCIL_LOGO}
            style={[styles.logoImage, { width: headerLogoSize, height: headerLogoSize }]}
          />
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select a subscription to unlock exclusive discounts and support BSA
        </Text>
      </View>

      {/* Plans List */}
      <ScrollView
        style={styles.plansContainer}
        contentContainerStyle={styles.plansContent}
        showsVerticalScrollIndicator={false}
      >
        {plans.length > 0 ? (
          plans.map(renderPlanCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No plans available</Text>
            <TouchableOpacity onPress={loadPlans} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <View style={styles.securePayment}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.securePaymentText}>Secure payment powered by Authorize.net</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPlan || processing) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                Continue to Payment
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => (navigation as any).navigate('Signup')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
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
  },
  plansContainer: {
    flex: 1,
  },
  plansContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  planCardPopular: {
    borderColor: '#FF9800',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  planNameSelected: {
    color: COLORS.primary,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trialText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  securePaymentText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

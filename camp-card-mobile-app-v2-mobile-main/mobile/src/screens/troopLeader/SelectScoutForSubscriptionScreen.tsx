// Select Scout for Subscription - Unit Leaders select which scout to attribute the subscription to
// This screen is shown before checkout when a Unit Leader purchases a subscription

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { TroopLeaderStackParamList } from '../../navigation/RootNavigator';
import { apiClient } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

interface Scout {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
}

type SelectScoutRouteProp = RouteProp<TroopLeaderStackParamList, 'SelectScoutForSubscription'>;

// Mock data - will be replaced with API call
const mockScouts: Scout[] = [
  {
    id: '1',
    firstName: 'Ethan',
    lastName: 'Anderson',
    email: 'ethan.anderson@email.com',
    subscriptionStatus: 'inactive',
  },
  {
    id: '2',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@email.com',
    subscriptionStatus: 'inactive',
  },
  {
    id: '3',
    firstName: 'Noah',
    lastName: 'Taylor',
    email: 'noah.taylor@email.com',
    subscriptionStatus: 'inactive',
  },
  {
    id: '4',
    firstName: 'Olivia',
    lastName: 'Brown',
    email: 'olivia.brown@email.com',
    subscriptionStatus: 'active',
  },
  {
    id: '5',
    firstName: 'Liam',
    lastName: 'Wilson',
    email: 'liam.wilson@email.com',
    subscriptionStatus: 'expired',
  },
];

export default function SelectScoutForSubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TroopLeaderStackParamList>>();
  const route = useRoute<SelectScoutRouteProp>();
  const { planId } = route.params;
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const [loading, setLoading] = useState(true);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [processingSubscription, setProcessingSubscription] = useState(false);

  useEffect(() => {
    loadScouts();
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const response = await apiClient.get('/api/v1/subscription-plans');
      const plans = response.data.data || [];
      // Find the plan by UUID
      const plan = plans.find((p: any) => p.uuid === planId || p.id?.toString() === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const loadScouts = async () => {
    try {
      // Get scouts from the user's unit
      const unitId = user?.troopId;
      if (unitId) {
        const response = await apiClient.get(`/api/v1/troops/${unitId}/scouts`);
        const scoutsData = response.data.content || response.data || [];
        setScouts(scoutsData.map((scout: any) => ({
          id: scout.id?.toString() || scout.uuid,
          firstName: scout.firstName,
          lastName: scout.lastName,
          email: scout.email,
          subscriptionStatus: scout.subscriptionStatus || 'inactive',
        })));
      } else {
        // Fallback to mock data if no unit ID
        setScouts(mockScouts);
      }
    } catch (error) {
      console.error('Error loading scouts:', error);
      // Fallback to mock data on error
      setScouts(mockScouts);
    } finally {
      setLoading(false);
    }
  };

  const filteredScouts = scouts.filter(
    (scout) =>
      scout.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectScout = (scout: Scout) => {
    if (scout.subscriptionStatus === 'active') {
      Alert.alert(
        'Already Active',
        `${scout.firstName} already has an active subscription. Please select a different scout.`
      );
      return;
    }
    setSelectedScout(scout);
  };

  const handleContinue = () => {
    if (!selectedScout) {
      Alert.alert('Select a Scout', 'Please select a scout to attribute this subscription to.');
      return;
    }

    if (!selectedPlan) {
      Alert.alert('Error', 'Subscription plan not loaded. Please try again.');
      return;
    }

    // Confirm and create subscription
    const planPrice = '$14.99';
    Alert.alert(
      'Confirm Subscription',
      `Subscribe ${selectedScout.firstName} ${selectedScout.lastName} to ${selectedPlan.name} for ${planPrice}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            setProcessingSubscription(true);
            try {
              // Create subscription with scout attribution
              await apiClient.post('/api/v1/subscriptions', {
                planId: selectedPlan.id,
                referralCode: selectedScout.id, // Use scout ID as referral for attribution
                paymentMethod: {
                  type: 'IAP',
                  paymentNonce: 'iap_pending' // TODO: Integrate with IAP purchase flow
                }
              });

              Alert.alert(
                'Success!',
                `Subscription created for ${selectedScout.firstName} ${selectedScout.lastName}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              console.error('Subscription error:', error);
              Alert.alert(
                'Subscription Failed',
                error.response?.data?.error || error.response?.data?.message || 'Failed to create subscription. Please try again.'
              );
            } finally {
              setProcessingSubscription(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Scout['subscriptionStatus']) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'inactive':
        return colors.warning;
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderScoutItem = ({ item }: { item: Scout }) => {
    const isSelected = selectedScout?.id === item.id;
    const isActive = item.subscriptionStatus === 'active';

    return (
      <TouchableOpacity
        style={[
          styles.scoutCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isSelected && [styles.scoutCardSelected, { borderColor: colors.secondary }],
          isActive && [styles.scoutCardDisabled, { backgroundColor: colors.background }],
        ]}
        onPress={() => handleSelectScout(item)}
        disabled={isActive}
        accessibilityLabel={`Select ${item.firstName} ${item.lastName}`}
        accessibilityRole="button"
      >
        <View style={[styles.avatarContainer, { backgroundColor: colors.secondary }, isActive && { backgroundColor: colors.textSecondary }]}>
          <Text style={[styles.avatarText, { color: colors.surface }]}>
            {item.firstName[0]}
            {item.lastName[0]}
          </Text>
        </View>
        <View style={styles.scoutInfo}>
          <Text style={[styles.scoutName, { color: colors.text }, isActive && { color: colors.textSecondary }]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.scoutEmail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          {isActive && (
            <View style={styles.activeTag}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.activeTagText, { color: colors.success }]}>Already has subscription</Text>
            </View>
          )}
        </View>
        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={28} color={colors.secondary} />
          ) : isActive ? (
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          ) : (
            <View style={[styles.radioOuter, { borderColor: colors.border }]}>
              <View style={styles.radioInner} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading scouts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select Scout</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="information-circle" size={24} color={colors.secondary} />
        <Text style={[styles.instructionsText, { color: colors.secondary }]}>
          Select which scout this subscription will support. The scout will receive credit for the sale.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search scouts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Scouts List */}
      <FlatList
        data={filteredScouts}
        keyExtractor={(item) => item.id}
        renderItem={renderScoutItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No scouts found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add scouts to your unit first'}
            </Text>
          </View>
        }
      />

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.secondary },
            (!selectedScout || processingSubscription) && [styles.continueButtonDisabled, { backgroundColor: colors.textSecondary }],
          ]}
          onPress={handleContinue}
          disabled={!selectedScout || processingSubscription}
          accessibilityLabel={selectedScout ? `Subscribe ${selectedScout.firstName}` : 'Select a Scout to Continue'}
          accessibilityRole="button"
        >
          {processingSubscription ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <>
              <Text style={[styles.continueButtonText, { color: colors.surface }]}>
                {selectedScout
                  ? `Subscribe ${selectedScout.firstName}`
                  : 'Select a Scout to Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
            </>
          )}
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  placeholder: {
    width: 40,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  scoutCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#E3F2FD',
  },
  scoutCardDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.background,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  scoutInfo: {
    flex: 1,
  },
  scoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoutEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  activeTagText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
});

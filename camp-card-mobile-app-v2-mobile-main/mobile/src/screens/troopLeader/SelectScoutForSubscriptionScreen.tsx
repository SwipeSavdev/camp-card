// Select Scout for Subscription - Troop Leaders select which scout to attribute the subscription to
// This screen is shown before checkout when a Troop Leader purchases a subscription

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
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { TroopLeaderStackParamList } from '../../navigation/RootNavigator';

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
  const navigation = useNavigation();
  const route = useRoute<SelectScoutRouteProp>();
  const { planId } = route.params;

  const [loading, setLoading] = useState(true);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);

  useEffect(() => {
    loadScouts();
  }, []);

  const loadScouts = async () => {
    try {
      // TODO: Replace with actual API call
      // GET /api/v1/troops/{troopId}/scouts
      await new Promise(resolve => setTimeout(resolve, 500));
      setScouts(mockScouts);
    } catch (error) {
      console.error('Error loading scouts:', error);
      Alert.alert('Error', 'Failed to load scouts');
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

    // Navigate to checkout with the selected scout
    // In production, this would go to a payment screen
    Alert.alert(
      'Confirm Selection',
      `This subscription will be attributed to ${selectedScout.firstName} ${selectedScout.lastName}. Continue to checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // TODO: Navigate to checkout screen with planId and scoutId
            // For now, show success and go back
            Alert.alert(
              'Success',
              `Proceeding to checkout for ${selectedScout.firstName}'s subscription...`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Scout['subscriptionStatus']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'inactive':
        return COLORS.warning;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderScoutItem = ({ item }: { item: Scout }) => {
    const isSelected = selectedScout?.id === item.id;
    const isActive = item.subscriptionStatus === 'active';

    return (
      <TouchableOpacity
        style={[
          styles.scoutCard,
          isSelected && styles.scoutCardSelected,
          isActive && styles.scoutCardDisabled,
        ]}
        onPress={() => handleSelectScout(item)}
        disabled={isActive}
      >
        <View style={[styles.avatarContainer, isActive && styles.avatarDisabled]}>
          <Text style={styles.avatarText}>
            {item.firstName[0]}
            {item.lastName[0]}
          </Text>
        </View>
        <View style={styles.scoutInfo}>
          <Text style={[styles.scoutName, isActive && styles.textDisabled]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.scoutEmail, isActive && styles.textDisabled]}>
            {item.email}
          </Text>
          {isActive && (
            <View style={styles.activeTag}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.activeTagText}>Already has subscription</Text>
            </View>
          )}
        </View>
        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={28} color={COLORS.secondary} />
          ) : isActive ? (
            <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
          ) : (
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading scouts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Scout</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="information-circle" size={24} color={COLORS.secondary} />
        <Text style={styles.instructionsText}>
          Select which scout this subscription will support. The scout will receive credit for the sale.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scouts..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
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
            <Ionicons name="people-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No scouts found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add scouts to your troop first'}
            </Text>
          </View>
        }
      />

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedScout && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedScout}
        >
          <Text style={styles.continueButtonText}>
            {selectedScout
              ? `Continue with ${selectedScout.firstName}`
              : 'Select a Scout to Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
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

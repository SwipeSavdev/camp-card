// Redemption History Screen - Full list of past redemptions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { redemptionsApi } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

interface Redemption {
  id: string;
  merchantName: string;
  offerTitle: string;
  category: string;
  savings: number;
  redeemedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function RedemptionHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadRedemptions();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadRedemptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await redemptionsApi.getRedemptionHistory(user.id);
      // Handle paginated response from backend
      const data = response.data?.content || response.data || [];
      // Transform API response to our format
      const formattedRedemptions = data.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(),
        merchantName: item.merchantName || item.merchant?.name || 'Unknown Merchant',
        offerTitle: item.offerTitle || item.offer?.title || 'Offer',
        category: item.category || item.offer?.category || 'General',
        savings: item.savings || item.discountAmount || 0,
        redeemedAt: item.redeemedAt || item.createdAt || new Date().toISOString(),
        status: item.status || 'completed',
      }));
      setRedemptions(formattedRedemptions);
    } catch (error) {
      console.log('Failed to load redemption history:', error);
      // Set empty array on error, could also set mock data for demo
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRedemptions();
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Food & Dining': 'restaurant-outline',
      'Shopping': 'cart-outline',
      'Entertainment': 'game-controller-outline',
      'Services': 'construct-outline',
      'Health & Fitness': 'fitness-outline',
      'Travel': 'airplane-outline',
      'Auto': 'car-outline',
      'Coffee': 'cafe-outline',
    };
    return categoryIcons[category] || 'pricetag-outline';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: Redemption['status']): string => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderRedemptionItem = ({ item }: { item: Redemption }) => (
    <View style={[styles.redemptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.redemptionIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons
          name={getCategoryIcon(item.category)}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.redemptionInfo}>
        <Text style={[styles.merchantName, { color: colors.text }]}>{item.merchantName}</Text>
        <Text style={[styles.offerTitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.offerTitle}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(item.redeemedAt)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.savingsContainer}>
        <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>Saved</Text>
        <Text style={[styles.savingsAmount, { color: colors.success }]}>-${item.savings.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Redemptions Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        When you redeem offers at participating merchants, they'll appear here.
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Browse Offers"
        accessibilityRole="button"
      >
        <Text style={styles.browseButtonText}>Browse Offers</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
        <Text style={[styles.statValue, { color: colors.text }]}>{redemptions.length}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="cash-outline" size={20} color={colors.success} />
        <Text style={[styles.statValue, { color: colors.text }]}>
          ${redemptions.reduce((sum, r) => sum + r.savings, 0).toFixed(2)}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
        <Text style={[styles.statValue, { color: colors.text }]}>
          {redemptions.filter(r => {
            const redemptionDate = new Date(r.redeemedAt);
            const now = new Date();
            return (
              redemptionDate.getMonth() === now.getMonth() &&
              redemptionDate.getFullYear() === now.getFullYear()
            );
          }).length}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Redemption History</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Redemption History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={redemptions}
        keyExtractor={(item) => item.id}
        renderItem={renderRedemptionItem}
        ListHeaderComponent={redemptions.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          redemptions.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyListContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  redemptionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  redemptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  redemptionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  offerTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savingsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  savingsLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

// Troop Statistics screen for Troop Leaders
// Per requirements: See Troop Metrics, See their Cash Code to give to customers
// Metrics: # of cards, TotalSold, # of Referrals, # of Conversions - Broken up by Units / Scouts

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';
import { apiClient, scoutApi } from '../../services/apiClient';

interface TroopStats {
  totalFundsRaised: number;
  goalAmount: number;
  totalCardsSold: number;
  activeScouts: number;
  totalRedemptions: number;
  totalReferrals: number;
  totalConversions: number;
  conversionRate: number;
}

interface ScoutPerformance {
  id: string;
  name: string;
  cardsSold: number;
  referrals: number;
  conversions: number;
  totalRaised: number;
}

export default function TroopStatsScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  // Troop Leader's Cash Code - unique code for customers to use
  const troopId = user?.troopId || '101';
  const cashCode = `TROOP-${troopId}-${new Date().getFullYear()}`;
  const cashCodeLink = `https://www.campcardapp.org/support/${cashCode}`;

  const [stats, setStats] = useState<TroopStats>({
    totalFundsRaised: 0,
    goalAmount: 5000,
    totalCardsSold: 0,
    activeScouts: 0,
    totalRedemptions: 0,
    totalReferrals: 0,
    totalConversions: 0,
    conversionRate: 0,
  });

  const [topPerformers, setTopPerformers] = useState<ScoutPerformance[]>([]);

  const loadStats = useCallback(async () => {
    try {
      // Fetch dashboard summary for troop-level stats
      const dashResponse = await apiClient.get('/api/v1/dashboard/summary');
      const data = dashResponse.data;
      if (data) {
        const fundsRaised = data.totalSales ? Number(data.totalSales) : 0;
        const fundsFromCents = !fundsRaised && data.totalRevenueCents ? data.totalRevenueCents / 100 : fundsRaised;
        setStats({
          totalFundsRaised: fundsFromCents,
          goalAmount: 5000,
          totalCardsSold: data.totalCardsSold || 0,
          activeScouts: data.activeScouts ? Number(data.activeScouts) : 0,
          totalRedemptions: data.totalRedemptions ? Number(data.totalRedemptions) : 0,
          totalReferrals: data.totalReferrals ? Number(data.totalReferrals) : 0,
          totalConversions: data.successfulReferrals ? Number(data.successfulReferrals) : 0,
          conversionRate: data.referralConversionRate ? Number(data.referralConversionRate) : 0,
        });
      }

      // Fetch scout roster for top performers
      if (troopId) {
        const scoutsResponse = await scoutApi.getTroopScouts(String(troopId));
        const scoutsData = scoutsResponse.data?.content || scoutsResponse.data || [];
        if (Array.isArray(scoutsData) && scoutsData.length > 0) {
          const performers: ScoutPerformance[] = scoutsData
            .map((s: any) => ({
              id: String(s.id || s.uuid),
              name: s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
              cardsSold: s.cardsSold || 0,
              referrals: s.referralCount || 0,
              conversions: s.conversionCount || 0,
              totalRaised: s.totalSales ? Number(s.totalSales) : 0,
            }))
            .sort((a: ScoutPerformance, b: ScoutPerformance) => b.totalRaised - a.totalRaised)
            .slice(0, 5);
          setTopPerformers(performers);
        }
      }
    } catch (error) {
      console.log('Failed to load troop stats:', error);
    }
  }, [troopId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const progressPercentage = Math.min(
    (stats.totalFundsRaised / stats.goalAmount) * 100,
    100
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleCopyCashCode = async () => {
    await Clipboard.setStringAsync(cashCode);
    Alert.alert('Copied!', 'Cash code has been copied to clipboard');
  };

  const handleShareCashCode = async () => {
    try {
      await Share.share({
        message: `Support our Scout Troop ${troopId}! Get great local deals with Camp Card while helping scouts go to camp. Use our troop code: ${cashCode}\n\nSign up: ${cashCodeLink}`,
        title: 'Support Our Scout Troop',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Troop Cash Code Section */}
        <View style={styles.cashCodeSection}>
          <View style={styles.cashCodeHeader}>
            <Ionicons name="ticket" size={24} color={COLORS.accent} />
            <Text style={styles.cashCodeTitle}>Your Troop Cash Code</Text>
          </View>
          <Text style={styles.cashCodeDescription}>
            Share this code with customers to support your troop's fundraising
          </Text>
          <View style={styles.cashCodeCard}>
            <Text style={styles.cashCodeText}>{cashCode}</Text>
          </View>
          <View style={styles.cashCodeActions}>
            <TouchableOpacity style={styles.cashCodeButton} onPress={handleCopyCashCode}>
              <Ionicons name="copy-outline" size={18} color={COLORS.secondary} />
              <Text style={styles.cashCodeButtonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cashCodeButton, styles.shareButton]}
              onPress={handleShareCashCode}
            >
              <Ionicons name="share-social" size={18} color={COLORS.surface} />
              <Text style={[styles.cashCodeButtonText, styles.shareButtonText]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fundraising Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fundraising Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressAmount}>
                ${stats.totalFundsRaised.toLocaleString()}
              </Text>
              <Text style={styles.progressGoal}>
                of ${stats.goalAmount.toLocaleString()} goal
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {progressPercentage.toFixed(0)}% complete
            </Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'all'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' && 'This Week'}
                {period === 'month' && 'This Month'}
                {period === 'all' && 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="card" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.metricValue}>{stats.totalCardsSold}</Text>
              <Text style={styles.metricLabel}>Cards Sold</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="people" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.metricValue}>{stats.activeScouts}</Text>
              <Text style={styles.metricLabel}>Active Scouts</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="share-social" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.metricValue}>{stats.totalReferrals}</Text>
              <Text style={styles.metricLabel}>Referrals</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{stats.totalConversions}</Text>
              <Text style={styles.metricLabel}>Conversions</Text>
            </View>
          </View>
        </View>

        {/* Conversion Stats */}
        <View style={styles.section}>
          <View style={styles.conversionCard}>
            <View style={styles.conversionHeader}>
              <Ionicons name="trending-up" size={20} color={COLORS.success} />
              <Text style={styles.conversionTitle}>Conversion Rate</Text>
            </View>
            <View style={styles.conversionContent}>
              <Text style={styles.conversionValue}>{stats.conversionRate}%</Text>
              <Text style={styles.conversionDescription}>
                {stats.totalConversions} of {stats.totalReferrals} referrals converted to subscribers
              </Text>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <Text style={styles.sectionSubtitle}>By total raised</Text>
          </View>
          {topPerformers.map((performer, index) => (
            <View key={performer.id} style={styles.performerCard}>
              <View style={[
                styles.rankBadge,
                index === 0 && { backgroundColor: '#FFD700' },
                index === 1 && { backgroundColor: '#C0C0C0' },
                index === 2 && { backgroundColor: '#CD7F32' },
              ]}>
                <Text style={[
                  styles.rankText,
                  index < 3 && { color: '#333' },
                ]}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{performer.name}</Text>
                <View style={styles.performerStats}>
                  <View style={styles.performerStat}>
                    <Ionicons name="card-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.performerStatText}>{performer.cardsSold} cards</Text>
                  </View>
                  <View style={styles.performerStat}>
                    <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.performerStatText}>{performer.referrals} refs</Text>
                  </View>
                  <View style={styles.performerStat}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.performerStatText}>{performer.conversions} conv</Text>
                  </View>
                </View>
              </View>
              <View style={styles.performerAmount}>
                <Text style={styles.performerAmountValue}>${performer.totalRaised}</Text>
                {index === 0 && (
                  <Ionicons name="trophy" size={20} color="#FFD700" />
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Redemptions Summary */}
        <View style={styles.section}>
          <View style={styles.redemptionCard}>
            <Ionicons name="receipt" size={32} color={COLORS.secondary} />
            <View style={styles.redemptionContent}>
              <Text style={styles.redemptionValue}>{stats.totalRedemptions}</Text>
              <Text style={styles.redemptionLabel}>Total Redemptions</Text>
              <Text style={styles.redemptionDescription}>
                Offers redeemed by customers using your troop's cards
              </Text>
            </View>
          </View>
        </View>

        {/* Period Selection Info */}
        <View style={[styles.section, styles.infoSection]}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.textSecondary}
          />
          <Text style={styles.infoText}>
            Statistics shown are for {selectedPeriod === 'week' && 'the current week'}{selectedPeriod === 'month' && 'the current month'}{selectedPeriod === 'all' && 'all time'}. Pull down to refresh.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  cashCodeSection: {
    backgroundColor: COLORS.secondary,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  cashCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cashCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.surface,
  },
  cashCodeDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  cashCodeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  cashCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  cashCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cashCodeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  cashCodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  shareButton: {
    backgroundColor: COLORS.accent,
  },
  shareButtonText: {
    color: COLORS.text,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  progressGoal: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodButtonTextActive: {
    color: COLORS.surface,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  conversionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conversionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  conversionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  conversionContent: {
    alignItems: 'center',
  },
  conversionValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  conversionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  performerStats: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  performerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performerStatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  performerAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performerAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  redemptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  redemptionContent: {
    flex: 1,
  },
  redemptionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  redemptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
  },
  redemptionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

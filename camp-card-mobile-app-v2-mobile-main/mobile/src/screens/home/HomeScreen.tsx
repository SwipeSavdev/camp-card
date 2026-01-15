// Home Screen - Role-based Dashboard
// Shows analytics dashboard for Troop Leaders and Scouts

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootNavigation } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';

// ============================================================================
// TROOP LEADER DASHBOARD
// ============================================================================

interface TroopLeaderStats {
  totalFundsRaised: number;
  goalAmount: number;
  totalCardsSold: number;
  activeScouts: number;
  totalReferrals: number;
  totalConversions: number;
  weeklyGrowth: number;
  topScout: { name: string; amount: number };
}

function TroopLeaderDashboard() {
  const { user } = useAuthStore();
  const navigation = useNavigation<RootNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState<TroopLeaderStats>({
    totalFundsRaised: 1250,
    goalAmount: 5000,
    totalCardsSold: 50,
    activeScouts: 12,
    totalReferrals: 156,
    totalConversions: 42,
    weeklyGrowth: 15.5,
    topScout: { name: 'Sophia M.', amount: 200 },
  });

  const progressPercentage = Math.min(
    (stats.totalFundsRaised / stats.goalAmount) * 100,
    100
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulated refresh - will be replaced with API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#003F87' }]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
            <Text style={styles.roleTag}>Troop Leader</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fundraising Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.progressTitle}>Troop Fundraising</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="arrow-up" size={14} color={COLORS.success} />
              <Text style={styles.growthText}>+{stats.weeklyGrowth}%</Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>${stats.totalFundsRaised.toLocaleString()}</Text>
            <Text style={styles.goalText}>of ${stats.goalAmount.toLocaleString()} goal</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressPercent}>{progressPercentage.toFixed(0)}%</Text>
          </View>

          <View style={styles.topScoutBanner}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
            <Text style={styles.topScoutText}>
              Top Scout: <Text style={styles.topScoutName}>{stats.topScout.name}</Text> - ${stats.topScout.amount}
            </Text>
          </View>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troop Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="card" size={24} color="#003F87" />
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
                <Ionicons name="git-network" size={24} color="#F57C00" />
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('TroopStats')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="stats-chart" size={24} color="#003F87" />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>View Detailed Stats</Text>
              <Text style={styles.actionRowSubtitle}>See full troop analytics & Cash Code</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('ManageScouts')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people" size={24} color={COLORS.success} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>Manage Scouts</Text>
              <Text style={styles.actionRowSubtitle}>Add, remove, or view scout details</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('InviteScouts')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="person-add" size={24} color="#F57C00" />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>Invite Scouts</Text>
              <Text style={styles.actionRowSubtitle}>Send invitations to new scouts</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New subscription from referral</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#003F87' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Ethan A. earned $25 commission</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#F57C00' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>5 new QR code scans</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// SCOUT DASHBOARD
// ============================================================================

interface ScoutStats {
  totalEarned: number;
  monthlyGoal: number;
  totalSubscribers: number;
  linkClicks: number;
  qrScans: number;
  conversionRate: number;
  rankInTroop: number;
  troopSize: number;
}

function ScoutDashboard() {
  const { user } = useAuthStore();
  const navigation = useNavigation<RootNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState<ScoutStats>({
    totalEarned: 80,
    monthlyGoal: 200,
    totalSubscribers: 8,
    linkClicks: 45,
    qrScans: 12,
    conversionRate: 14,
    rankInTroop: 2,
    troopSize: 12,
  });

  const progressPercentage = Math.min(
    (stats.totalEarned / stats.monthlyGoal) * 100,
    100
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulated refresh - will be replaced with API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
            <Text style={styles.roleTag}>Scout</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Earnings Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons name="wallet" size={24} color={COLORS.success} />
              <Text style={styles.progressTitle}>Your Earnings</Text>
            </View>
            <View style={styles.rankBadge}>
              <Ionicons name="trophy" size={14} color="#F59E0B" />
              <Text style={styles.rankText}>#{stats.rankInTroop} in Troop</Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>${stats.totalEarned}</Text>
            <Text style={styles.goalText}>of ${stats.monthlyGoal} monthly goal</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%`, backgroundColor: COLORS.primary },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{progressPercentage.toFixed(0)}%</Text>
          </View>

          <View style={styles.subscribersBanner}>
            <Ionicons name="people" size={18} color={COLORS.secondary} />
            <Text style={styles.subscribersText}>
              You have <Text style={styles.subscribersCount}>{stats.totalSubscribers}</Text> subscribers!
            </Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Performance</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="link" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.metricValue}>{stats.linkClicks}</Text>
              <Text style={styles.metricLabel}>Link Clicks</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="qr-code" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.metricValue}>{stats.qrScans}</Text>
              <Text style={styles.metricLabel}>QR Scans</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="people" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{stats.totalSubscribers}</Text>
              <Text style={styles.metricLabel}>Subscribers</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="analytics" size={24} color="#F57C00" />
              </View>
              <Text style={styles.metricValue}>{stats.conversionRate}%</Text>
              <Text style={styles.metricLabel}>Conversion</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Referral')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="share-social" size={24} color={COLORS.success} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>Share My Link</Text>
              <Text style={styles.actionRowSubtitle}>Get more subscribers with your QR & link</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('ViewOffers')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="pricetag" size={24} color="#F57C00" />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>View Offers</Text>
              <Text style={styles.actionRowSubtitle}>See available discounts for customers</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="card" size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>My Subscription</Text>
              <Text style={styles.actionRowSubtitle}>View your plan and benefits</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips to Earn More</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>1</Text>
              </View>
              <Text style={styles.tipText}>Share your QR code at local events and gatherings</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>2</Text>
              </View>
              <Text style={styles.tipText}>Post your link on social media with family permission</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>3</Text>
              </View>
              <Text style={styles.tipText}>Ask family and friends to spread the word</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// CUSTOMER/PARENT DASHBOARD (Default)
// ============================================================================

interface ParentStats {
  totalSavings: number;
  offersRedeemed: number;
  referralsMade: number;
  referralChain: number;
  supportedScout: { name: string; troopNumber: string } | null;
  recentSavings: number;
  memberSince: string;
}

function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigation = useNavigation<RootNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState<ParentStats>({
    totalSavings: 127.50,
    offersRedeemed: 15,
    referralsMade: 3,
    referralChain: 8,
    supportedScout: { name: 'Ethan A.', troopNumber: '234' },
    recentSavings: 12.50,
    memberSince: 'January 2026',
  });

  // Generate Parent's unique referral link that tracks back to originating scout
  const parentId = user?.id || 'parent123';
  const referralCode = `PR-${parentId.toString().slice(0, 8).toUpperCase()}`;
  const referralLink = `https://campcard.org/refer/${referralCode}`;

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#F59E0B' }]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
            <Text style={styles.roleTag}>Parent Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Savings Overview Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons name="wallet" size={24} color={COLORS.success} />
              <Text style={styles.progressTitle}>Your Savings</Text>
            </View>
            {stats.recentSavings > 0 && (
              <View style={styles.growthBadge}>
                <Ionicons name="arrow-up" size={14} color={COLORS.success} />
                <Text style={styles.growthText}>+${stats.recentSavings.toFixed(2)}</Text>
              </View>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>${stats.totalSavings.toFixed(2)}</Text>
            <Text style={styles.goalText}>Total Saved with Camp Card</Text>
          </View>

          {stats.supportedScout && (
            <View style={styles.topScoutBanner}>
              <Ionicons name="heart" size={18} color={COLORS.primary} />
              <Text style={styles.topScoutText}>
                Supporting <Text style={styles.topScoutName}>{stats.supportedScout.name}</Text> - Troop {stats.supportedScout.troopNumber}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-done" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.metricValue}>{stats.offersRedeemed}</Text>
              <Text style={styles.metricLabel}>Offers Used</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="people" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.metricValue}>{stats.referralsMade}</Text>
              <Text style={styles.metricLabel}>Your Referrals</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="git-network" size={24} color="#F57C00" />
              </View>
              <Text style={styles.metricValue}>{stats.referralChain}</Text>
              <Text style={styles.metricLabel}>Referral Chain</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <Text style={[styles.metricValue, { fontSize: 14 }]}>{stats.memberSince}</Text>
              <Text style={styles.metricLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Offers')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#FFE5E5' }]}>
              <Ionicons name="pricetag" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>Browse Offers</Text>
              <Text style={styles.actionRowSubtitle}>Find deals at local merchants</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Merchants')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#E5F0FF' }]}>
              <Ionicons name="storefront" size={24} color={COLORS.secondary} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>View Merchants</Text>
              <Text style={styles.actionRowSubtitle}>See participating businesses nearby</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <View style={[styles.actionRowIcon, { backgroundColor: '#FFF5E5' }]}>
              <Ionicons name="qr-code" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.actionRowContent}>
              <Text style={styles.actionRowTitle}>My QR Code</Text>
              <Text style={styles.actionRowSubtitle}>Share to support your scout's fundraising</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Referral Chain Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Chain</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <View style={[styles.tipNumber, { backgroundColor: COLORS.success }]}>
                <Ionicons name="person" size={14} color="#fff" />
              </View>
              <Text style={styles.tipText}>
                Your referrals earn credit for <Text style={{ fontWeight: 'bold' }}>{stats.supportedScout?.name || 'your scout'}</Text>
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipNumber, { backgroundColor: '#F57C00' }]}>
                <Ionicons name="git-branch" size={14} color="#fff" />
              </View>
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: 'bold' }}>{stats.referralChain}</Text> people in your referral chain are also supporting scouts
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipNumber, { backgroundColor: COLORS.secondary }]}>
                <Ionicons name="share-social" size={14} color="#fff" />
              </View>
              <Text style={styles.tipText}>
                Share your QR code to grow your referral chain and maximize impact!
              </Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <View style={styles.infoBanner}>
            <Ionicons name="heart" size={24} color={COLORS.primary} />
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Support Scout Fundraising</Text>
              <Text style={styles.infoBannerText}>
                Every offer you redeem and referral you make helps local scouts fund their camp experiences!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// MAIN HOME SCREEN - Role Router
// ============================================================================

export default function HomeScreen() {
  const { user } = useAuthStore();
  const userRole = user?.role;

  switch (userRole) {
    case 'TROOP_LEADER':
      return <TroopLeaderDashboard />;
    case 'SCOUT':
      return <ScoutDashboard />;
    case 'PARENT':
    default:
      return <CustomerDashboard />;
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleTag: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  goalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 45,
    textAlign: 'right',
  },
  topScoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  topScoutText: {
    fontSize: 13,
    color: COLORS.text,
  },
  topScoutName: {
    fontWeight: '600',
  },
  subscribersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  subscribersText: {
    fontSize: 13,
    color: COLORS.text,
  },
  subscribersCount: {
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionRowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionRowContent: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionRowSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  // Customer Dashboard Styles
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FCE4EC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

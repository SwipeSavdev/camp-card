// Unit Leader Dashboard showing unit management and quick actions

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigation } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { apiClient } from '../../services/apiClient';

interface DashboardStats {
  activeScouts: number;
  fundsRaised: number;
  cardsSold: number;
  redemptions: number;
}

export default function TroopLeaderDashboardScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeScouts: 0,
    fundsRaised: 0,
    cardsSold: 0,
    redemptions: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/dashboard/summary');
      const data = response.data;
      if (data) {
        const funds = data.totalSales ? Number(data.totalSales) : 0;
        const fundsFromCents = !funds && data.totalRevenueCents ? data.totalRevenueCents / 100 : funds;
        setStats({
          activeScouts: data.activeScouts ? Number(data.activeScouts) : 0,
          fundsRaised: fundsFromCents,
          cardsSold: data.totalCardsSold || 0,
          redemptions: data.totalRedemptions ? Number(data.totalRedemptions) : 0,
        });
      }
    } catch (error) {
      console.log('Failed to load dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.title, { color: colors.surface }]}>Unit Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.firstName || 'Leader'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Unit Management</Text>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ManageScouts')}
            accessibilityLabel="Manage Scouts"
            accessibilityRole="button"
          >
            <View style={[styles.cardIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="people" size={32} color={colors.secondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Manage Scouts</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>View and manage your unit members</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('TroopStats')}
            accessibilityLabel="Unit Statistics"
            accessibilityRole="button"
          >
            <View style={[styles.cardIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="stats-chart" size={32} color={colors.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Unit Statistics</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>View fundraising progress and reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

        </View>

        {/* Unit Stats Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Unit Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.activeScouts}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Scouts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>${stats.fundsRaised.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Funds Raised</Text>
            </View>
          </View>
          <View style={[styles.statsGrid, { marginTop: 12 }]}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.cardsSold}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cards Sold</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.redemptions}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Redemptions</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <View style={[styles.cardIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="notifications" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>View alerts and updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.secondary }]}
            onPress={() => {
              if (user?.subscriptionStatus === 'active') {
                navigation.navigate('Offers');
              } else {
                Alert.alert(
                  'Subscription Required',
                  'You need an active subscription to view offers. Would you like to subscribe?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Subscribe', onPress: () => navigation.navigate('Subscription') },
                  ]
                );
              }
            }}
            accessibilityLabel="View Available Offers"
            accessibilityRole="button"
          >
            <Ionicons name="pricetag" size={20} color={colors.surface} />
            <Text style={[styles.browseText, { color: colors.surface }]}>View Available Offers</Text>
          </TouchableOpacity>
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
  header: {
    padding: 24,
    backgroundColor: COLORS.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  browseText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
});

// Troop Leader Dashboard showing troop management and quick actions

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigation } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Troop Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.firstName || 'Leader'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troop Management</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ManageScouts')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="people" size={32} color={COLORS.secondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manage Scouts</Text>
              <Text style={styles.cardSubtitle}>View and manage your troop members</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TroopStats')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="stats-chart" size={32} color={COLORS.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Troop Statistics</Text>
              <Text style={styles.cardSubtitle}>View fundraising progress and reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InviteScouts')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="person-add" size={32} color={COLORS.warning} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Invite Scouts</Text>
              <Text style={styles.cardSubtitle}>Send invitations to join your troop</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Troop Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troop Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeScouts}</Text>
              <Text style={styles.statLabel}>Active Scouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.fundsRaised.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Funds Raised</Text>
            </View>
          </View>
          <View style={[styles.statsGrid, { marginTop: 12 }]}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.cardsSold}</Text>
              <Text style={styles.statLabel}>Cards Sold</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.redemptions}</Text>
              <Text style={styles.statLabel}>Redemptions</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="notifications" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>View alerts and updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Offers')}
          >
            <Ionicons name="pricetag" size={20} color={COLORS.surface} />
            <Text style={styles.browseText}>View Available Offers</Text>
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

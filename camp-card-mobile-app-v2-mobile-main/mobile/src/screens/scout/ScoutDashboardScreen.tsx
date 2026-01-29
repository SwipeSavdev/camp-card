// Scout Dashboard - FR-18: Display total subscribers, link clicks/QR scans
// Shows Scout's fundraising progress, affiliate stats, and quick actions
// My Cards screen with scannable QR code for affiliate tracking

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { RootNavigation } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { scoutApi, qrCodeApi } from '../../services/apiClient';

interface ScoutStats {
  totalSubscribers: number;
  directReferrals: number;
  indirectReferrals: number;
  linkClicks: number;
  qrScans: number;
  totalEarnings: number;
  redemptionsUsed: number;
  savingsEarned: number;
}

export default function ScoutDashboardScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ScoutStats>({
    totalSubscribers: 0,
    directReferrals: 0,
    indirectReferrals: 0,
    linkClicks: 0,
    qrScans: 0,
    totalEarnings: 0,
    redemptionsUsed: 0,
    savingsEarned: 0,
  });

  // QR Code state - fetched from backend API
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(true);

  const scoutId = user?.id || 'scout123';

  useEffect(() => {
    loadScoutData();
  }, [scoutId]);

  const loadScoutData = async () => {
    await Promise.all([loadScoutStats(), loadQRCode()]);
  };

  const loadQRCode = async () => {
    try {
      setIsLoadingQR(true);
      // Fetch QR code from backend - returns shareable link pointing to /buy-campcard/
      const response = await qrCodeApi.getUserQRCode();
      const data = response.data;

      setAffiliateLink(data.shareableLink || '');
      setAffiliateCode(data.uniqueCode || '');
    } catch (error) {
      console.log('Failed to load QR code, using fallback:', error);
      // Fallback to local generation if API fails
      const fallbackCode = `SC-${scoutId.slice(0, 8).toUpperCase()}`;
      setAffiliateCode(fallbackCode);
      setAffiliateLink(`https://www.campcardapp.org/buy-campcard/?scout=${fallbackCode}`);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const loadScoutStats = async () => {
    try {
      // Fetch scout stats from API
      const response = await scoutApi.getStats(scoutId);
      const data = response.data;

      setStats({
        totalSubscribers: data.totalSubscribers || 0,
        directReferrals: data.directReferrals || 0,
        indirectReferrals: data.indirectReferrals || 0,
        linkClicks: data.linkClicks || 0,
        qrScans: data.qrScans || 0,
        totalEarnings: data.totalEarnings || 0,
        redemptionsUsed: data.redemptionsUsed || 0,
        savingsEarned: data.savingsEarned || 0,
      });
    } catch (error) {
      console.log('Failed to load scout stats, using defaults:', error);
      // Keep default values on error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScoutData();
    setRefreshing(false);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(affiliateLink);
    Alert.alert('Copied!', 'Your affiliate link has been copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Support my Scout fundraising! Get amazing local deals with Camp Card. Use my link to sign up: ${affiliateLink}`,
        title: 'Join Camp Card - Support Scout Fundraising',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'Scout'}!</Text>
            <Text style={styles.subtitle}>Your Camp Card Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        {/* Fundraising Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="trophy" size={24} color={COLORS.accent} />
            <Text style={styles.progressTitle}>Your Fundraising Impact</Text>
          </View>
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsAmount}>${stats.totalEarnings}</Text>
            <Text style={styles.earningsLabel}>Total Funds Raised</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{stats.totalSubscribers}</Text>
              <Text style={styles.progressStatLabel}>Subscribers</Text>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{stats.directReferrals}</Text>
              <Text style={styles.progressStatLabel}>Direct</Text>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{stats.indirectReferrals}</Text>
              <Text style={styles.progressStatLabel}>Indirect</Text>
            </View>
          </View>
        </View>

        {/* Scannable QR Code Section - Main Feature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Camp Card QR Code</Text>
          <View style={styles.qrCard}>
            <View style={styles.qrContainer}>
              {isLoadingQR ? (
                <View style={styles.qrLoading}>
                  <Text style={styles.qrLoadingText}>Loading...</Text>
                </View>
              ) : affiliateLink ? (
                <QRCode
                  value={affiliateLink}
                  size={180}
                  color={COLORS.text}
                  backgroundColor={COLORS.surface}
                />
              ) : (
                <View style={styles.qrLoading}>
                  <Ionicons name="qr-code-outline" size={60} color={COLORS.textSecondary} />
                </View>
              )}
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.qrLabel}>Your Affiliate Code</Text>
              <Text style={styles.qrCode}>{affiliateCode || '---'}</Text>
              <Text style={styles.qrHint}>
                Have customers scan this code to support your fundraising
              </Text>
            </View>
            <View style={styles.linkActions}>
              <TouchableOpacity style={styles.linkButton} onPress={handleCopyLink} disabled={!affiliateLink}>
                <Ionicons name="copy-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.linkButtonText}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.linkButton, styles.shareButton]}
                onPress={handleShareLink}
                disabled={!affiliateLink}
              >
                <Ionicons name="share-social" size={20} color={COLORS.surface} />
                <Text style={[styles.linkButtonText, styles.shareButtonText]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Link Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="link" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{stats.linkClicks}</Text>
              <Text style={styles.statLabel}>Link Clicks</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="qr-code" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{stats.qrScans}</Text>
              <Text style={styles.statLabel}>QR Scans</Text>
            </View>
          </View>
        </View>

        {/* Your Savings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Savings</Text>
          <View style={styles.savingsCard}>
            <View style={styles.savingsRow}>
              <View style={styles.savingsItem}>
                <Ionicons name="wallet" size={28} color={COLORS.success} />
                <Text style={styles.savingsValue}>${stats.savingsEarned.toFixed(2)}</Text>
                <Text style={styles.savingsLabel}>Total Saved</Text>
              </View>
              <View style={styles.savingsDivider} />
              <View style={styles.savingsItem}>
                <Ionicons name="checkmark-done" size={28} color={COLORS.secondary} />
                <Text style={styles.savingsValue}>{stats.redemptionsUsed}</Text>
                <Text style={styles.savingsLabel}>Offers Used</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ViewOffers')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="pricetag" size={28} color="#F57C00" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Offers</Text>
              <Text style={styles.actionSubtitle}>See available discounts for customers</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Referral')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people" size={28} color={COLORS.success} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Referrals</Text>
              <Text style={styles.actionSubtitle}>See who signed up with your link</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Subscription')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="card" size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Subscription</Text>
              <Text style={styles.actionSubtitle}>View and manage your plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.helpText}>
            Share your link with family and friends. When they subscribe, you earn credit toward your camp fees!
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  subtitle: {
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
    marginTop: -20,
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  earningsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
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
  qrCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  qrLoading: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  qrInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  qrCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  shareButtonText: {
    color: COLORS.surface,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  savingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  savingsItem: {
    alignItems: 'center',
  },
  savingsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  savingsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  savingsDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  browseText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

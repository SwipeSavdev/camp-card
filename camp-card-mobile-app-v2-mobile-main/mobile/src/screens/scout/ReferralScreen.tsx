// Scout Referral Screen - FR-16, FR-17, FR-19
// Shows QR code, shareable link, and referral tracking with chain attribution

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { referralApi, qrCodeApi } from '../../services/apiClient';

interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionDate: string;
  planType: string;
  status: 'active' | 'cancelled' | 'expired';
  isDirectReferral: boolean;
  referredBy?: string; // Name of person who referred them (for indirect)
}

export default function ReferralScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'indirect'>('direct');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    directReferrals: 0,
    indirectReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });

  // Generate Scout's unique affiliate link (FR-16)
  const scoutId = user?.id || 'scout123';
  const [affiliateCode, setAffiliateCode] = useState(`SC-${scoutId.slice(0, 8).toUpperCase()}`);
  const [affiliateLink, setAffiliateLink] = useState(`https://www.campcardapp.org/buy-campcard/?scout=SC-${scoutId.slice(0, 8).toUpperCase()}`);
  const shortLink = affiliateLink.replace('https://www.', '').replace('https://', '');

  const loadQRCode = async () => {
    try {
      const response = await qrCodeApi.getUserQRCode();
      const data = response.data;
      if (data.shareableLink) setAffiliateLink(data.shareableLink);
      if (data.uniqueCode) setAffiliateCode(data.uniqueCode);
    } catch (error) {
      console.log('Failed to load QR code from API, using fallback:', error);
    }
  };

  useEffect(() => {
    loadQRCode();
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      // Fetch referrals from API
      const response = await referralApi.getMyReferrals();
      const data = response.data;

      // Map API response to local format
      const mappedReferrals: Referral[] = (data.referrals || []).map((r: any) => ({
        id: r.id,
        firstName: r.referredUser?.firstName || r.firstName || 'Unknown',
        lastName: r.referredUser?.lastName || r.lastName || '',
        email: r.referredUser?.email || r.email || '',
        subscriptionDate: r.createdAt || r.subscriptionDate,
        planType: r.planType || 'Annual',
        status: r.status || 'active',
        isDirectReferral: r.isDirectReferral ?? r.level === 1,
        referredBy: r.referredByName || r.referredBy,
      }));

      setReferrals(mappedReferrals);

      // Calculate stats from data or use provided stats
      const directCount = mappedReferrals.filter(r => r.isDirectReferral).length;
      const indirectCount = mappedReferrals.filter(r => !r.isDirectReferral).length;

      setStats({
        totalReferrals: data.totalReferrals || mappedReferrals.length,
        directReferrals: data.directReferrals || directCount,
        indirectReferrals: data.indirectReferrals || indirectCount,
        totalEarnings: data.totalEarnings || 0,
        pendingEarnings: data.pendingEarnings || 0,
      });
    } catch (error) {
      console.log('Failed to load referrals:', error);
      // Keep empty state on error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(affiliateLink);
    Alert.alert('Copied!', 'Your referral link has been copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Help me reach my Scout fundraising goal! Get great local deals with Camp Card. Sign up here: ${affiliateLink}`,
        title: 'Join Camp Card',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // FR-19: Generate printable poster with QR code
  const handlePrintPoster = async () => {
    const posterHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 40px;
            max-width: 8.5in;
            margin: 0 auto;
          }
          .header {
            color: #CE1126;
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .subheader {
            color: #003F87;
            font-size: 24px;
            margin-bottom: 30px;
          }
          .qr-container {
            margin: 30px auto;
            padding: 20px;
            border: 3px solid #003F87;
            border-radius: 20px;
            display: inline-block;
          }
          .qr-placeholder {
            width: 200px;
            height: 200px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #666;
            border: 2px dashed #ccc;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #CE1126;
            letter-spacing: 3px;
            margin: 20px 0;
          }
          .link {
            font-size: 18px;
            color: #003F87;
            margin-bottom: 30px;
          }
          .benefits {
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
            font-size: 16px;
            line-height: 1.8;
          }
          .benefit-item {
            margin: 10px 0;
          }
          .check {
            color: #4CAF50;
            font-weight: bold;
          }
          .tagline {
            font-size: 20px;
            color: #333;
            margin-top: 30px;
            font-weight: 500;
          }
          .scout-name {
            font-size: 18px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">BSA Camp Card</div>
        <div class="subheader">Support Scout Fundraising!</div>

        <div class="qr-container">
          <div class="qr-placeholder">
            [QR Code: ${affiliateLink}]
          </div>
        </div>

        <div class="code">${affiliateCode}</div>
        <div class="link">Visit: ${shortLink}</div>

        <div class="benefits">
          <div class="benefit-item"><span class="check">✓</span> Access exclusive local deals</div>
          <div class="benefit-item"><span class="check">✓</span> Save money at participating merchants</div>
          <div class="benefit-item"><span class="check">✓</span> Support Scout camp fees</div>
          <div class="benefit-item"><span class="check">✓</span> Monthly, Quarterly & Annual plans</div>
        </div>

        <div class="tagline">Pay a little. Get deals. Help Scouts go to camp.</div>
        <div class="scout-name">Supporting: ${user?.firstName} ${user?.lastName}</div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: posterHtml });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Camp Card Poster',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', 'Poster saved! You can print it from your Files app.');
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to generate poster. Please try again.');
    }
  };

  const filteredReferrals = referrals.filter(r =>
    activeTab === 'direct' ? r.isDirectReferral : !r.isDirectReferral
  );

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'cancelled': return COLORS.error;
      case 'expired': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderReferralItem = ({ item }: { item: Referral }) => (
    <View style={styles.referralCard}>
      <View style={styles.referralAvatar}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}{item.lastName[0]}
        </Text>
      </View>
      <View style={styles.referralInfo}>
        <Text style={styles.referralName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.referralEmail}>{item.email}</Text>
        <View style={styles.referralMeta}>
          <Text style={styles.referralPlan}>{item.planType}</Text>
          <Text style={styles.referralDate}>{formatDate(item.subscriptionDate)}</Text>
        </View>
        {!item.isDirectReferral && Boolean(item.referredBy) && (
          <View style={styles.chainInfo}>
            <Ionicons name="git-branch-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.chainText}>via {item.referredBy}</Text>
          </View>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Earnings Summary */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet" size={24} color={COLORS.accent} />
            <Text style={styles.earningsTitle}>Your Referral Earnings</Text>
          </View>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsValue}>${stats.totalEarnings}</Text>
              <Text style={styles.earningsLabel}>Total Earned</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={[styles.earningsValue, { color: COLORS.warning }]}>
                ${stats.pendingEarnings}
              </Text>
              <Text style={styles.earningsLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Link</Text>

          {/* QR Code Card */}
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={COLORS.secondary} />
              <Text style={styles.qrHint}>Scan to join</Text>
            </View>
            <Text style={styles.affiliateCode}>{affiliateCode}</Text>
            <Text style={styles.affiliateLink}>{shortLink}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={22} color={COLORS.secondary} />
              <Text style={styles.actionButtonText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleShareLink}
            >
              <Ionicons name="share-social" size={22} color={COLORS.surface} />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Print Poster Button (FR-19) */}
          <TouchableOpacity style={styles.printButton} onPress={handlePrintPoster}>
            <Ionicons name="print-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.printButtonText}>Print Poster</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.directReferrals}</Text>
              <Text style={styles.statLabel}>Direct</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.secondary }]}>{stats.indirectReferrals}</Text>
              <Text style={styles.statLabel}>Indirect</Text>
            </View>
          </View>
        </View>

        {/* Referrals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
              onPress={() => setActiveTab('direct')}
            >
              <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>
                Direct ({stats.directReferrals})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'indirect' && styles.activeTab]}
              onPress={() => setActiveTab('indirect')}
            >
              <Text style={[styles.tabText, activeTab === 'indirect' && styles.activeTabText]}>
                Indirect ({stats.indirectReferrals})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text for Indirect */}
          {activeTab === 'indirect' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.infoText}>
                Indirect referrals are people who signed up through someone you referred. You still earn credit! (FR-17)
              </Text>
            </View>
          )}

          {/* Referrals List */}
          {filteredReferrals.length > 0 ? (
            filteredReferrals.map(item => (
              <View key={item.id}>
                {renderReferralItem({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>
                No {activeTab} referrals yet
              </Text>
              <Text style={styles.emptySubtext}>
                Share your link to start earning!
              </Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb" size={24} color={COLORS.warning} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips for More Referrals</Text>
            <Text style={styles.tipsText}>
              • Share at family gatherings and events{'\n'}
              • Post on social media with your story{'\n'}
              • Ask parents to share with neighbors{'\n'}
              • Hand out printed posters at troop meetings
            </Text>
          </View>
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
  earningsCard: {
    backgroundColor: COLORS.primary,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  earningsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  earningsDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  affiliateCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  affiliateLink: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  primaryButtonText: {
    color: COLORS.surface,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  printButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.surface,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referralAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  referralEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  referralMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  referralPlan: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  referralDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  chainText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

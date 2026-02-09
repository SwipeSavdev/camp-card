import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { apiClient } from '../utils/api';
import { useTheme } from '../config/ThemeContext';

interface ReferralData {
  referralCode: string;
  shareableLink: string;
  totalReferrals: number;
  directReferrals: number;
  indirectReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  pendingRewards: number;
}

interface Referral {
  id: number;
  referredUserName: string;
  referredUserEmail: string;
  status: string;
  rewardAmount: number;
  rewardClaimed: boolean;
  createdAt: string;
  completedAt?: string;
}

export default function ReferralScreen() {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeResponse, referralsResponse, statsResponse] = await Promise.all([
        apiClient.get('/referrals/my-code'),
        apiClient.get('/referrals/my-referrals'),
        apiClient.get('/referrals/my-stats').catch(() => ({ data: null })),
      ]);

      const codeData = codeResponse.data;
      const statsData = statsResponse.data;
      setReferralData({
        ...codeData,
        directReferrals: statsData?.directReferrals || codeData?.directReferrals || 0,
        indirectReferrals: statsData?.indirectReferrals || codeData?.indirectReferrals || 0,
      });
      setReferrals(referralsResponse.data);
    } catch (error) {
      console.error('Error loading referral data:', error);
      Alert.alert('Error', 'Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!referralData) return;
    
    try {
      await Share.share({
        message: `Join Camp Card and support Scout fundraising! Use my referral code ${referralData.referralCode} to get started.\n\n${referralData.shareableLink}`,
        title: 'Join Camp Card'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!referralData) return;
    
    await Clipboard.setStringAsync(referralData.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleCopyLink = async () => {
    if (!referralData) return;
    
    await Clipboard.setStringAsync(referralData.shareableLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleClaimReward = async (referralId: number) => {
    try {
      await apiClient.post(`/referrals/${referralId}/claim`);
      Alert.alert('Success!', 'Your reward has been claimed and will be processed shortly.');
      loadReferralData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || 'Failed to claim reward');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'REWARDED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.secondary }]}>Referral Program</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Referral Code Card */}
            <View style={[styles.codeCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.secondary }]}>Your Referral Code</Text>
              <View style={[styles.codeContainer, { borderColor: colors.secondary }]}>
                <Text style={[styles.code, { color: colors.secondary }]}>{referralData?.referralCode}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.secondary }]}
                  onPress={handleCopyCode}
                  accessibilityLabel="Copy referral code"
                  accessibilityRole="button"
                >
                  <Ionicons name="copy-outline" size={20} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Copy Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.secondary }]}
                  onPress={handleCopyLink}
                  accessibilityLabel="Copy referral link"
                  accessibilityRole="button"
                >
                  <Ionicons name="link-outline" size={20} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Copy Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={handleShare}
                  accessibilityLabel="Share referral"
                  accessibilityRole="button"
                >
                  <Ionicons name="share-social-outline" size={20} color={colors.white} />
                  <Text style={[styles.actionButtonText, styles.shareButtonText, { color: colors.white }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="people" size={32} color={colors.secondary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{referralData?.directReferrals || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Direct Referrals</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="git-network" size={32} color={colors.warning} />
                <Text style={[styles.statValue, { color: colors.text }]}>{referralData?.indirectReferrals || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Indirect Referrals</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="cash" size={32} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  ${referralData?.totalRewardsEarned?.toFixed(2) || '0.00'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Earned</Text>
              </View>
            </View>

            {referralData && referralData.pendingRewards > 0 && (
              <View style={styles.pendingCard}>
                <Ionicons name="gift" size={24} color={colors.warning} />
                <View style={styles.pendingContent}>
                  <Text style={styles.pendingTitle}>Pending Rewards</Text>
                  <Text style={styles.pendingAmount}>
                    ${referralData.pendingRewards.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* How it Works */}
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoTitle, { color: colors.secondary }]}>How It Works</Text>
              <View style={styles.infoStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.stepNumberText, { color: colors.white }]}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  Share your referral code with friends and family
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.stepNumberText, { color: colors.white }]}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  They sign up and purchase a Camp Card subscription
                </Text>
              </View>
              <View style={styles.infoStep}>
                <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.stepNumberText, { color: colors.white }]}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  You both earn rewards to support your unit!
                </Text>
              </View>
            </View>

            {referrals.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Your Referrals</Text>
            )}
          </>
        }
        data={referrals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.referralItem, { backgroundColor: colors.surface }]}>
            <View style={styles.referralInfo}>
              <Text style={[styles.referralName, { color: colors.text }]}>{item.referredUserName}</Text>
              <Text style={[styles.referralEmail, { color: colors.textSecondary }]}>{item.referredUserEmail}</Text>
              <View style={styles.referralMeta}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '20' }
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={[styles.rewardAmount, { color: colors.success }]}>${item.rewardAmount.toFixed(2)}</Text>
              </View>
            </View>
            {item.status === 'COMPLETED' && !item.rewardClaimed && (
              <TouchableOpacity
                style={[styles.claimButton, { backgroundColor: colors.primary }]}
                onPress={() => handleClaimReward(item.id)}
                accessibilityLabel={`Claim reward for ${item.referredUserName}`}
                accessibilityRole="button"
              >
                <Text style={[styles.claimButtonText, { color: colors.white }]}>Claim</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          referrals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No referrals yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start sharing your code to earn rewards!
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003f87',
  },
  codeCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#f0f7ff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#003f87',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003f87',
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#003f87',
  },
  shareButton: {
    backgroundColor: '#ce1126',
    borderColor: '#ce1126',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003f87',
    marginLeft: 4,
  },
  shareButtonText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  pendingContent: {
    marginLeft: 12,
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  pendingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003f87',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  referralEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  referralMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  claimButton: {
    backgroundColor: '#ce1126',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

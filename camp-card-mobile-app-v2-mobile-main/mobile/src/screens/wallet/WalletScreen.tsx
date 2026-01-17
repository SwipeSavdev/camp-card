// Wallet Screen - Digital Camp Card with Flip Animation & Analytics

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ImageBackground,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { RootNavigation } from '../../types/navigation';
import { apiClient } from '../../services/apiClient';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = CARD_WIDTH * 0.63; // Standard card ratio

interface CardData {
  cardNumber: string;
  memberName: string;
  expiryDate: string;
  memberSince: string;
  status: 'active' | 'expired' | 'pending';
  troopNumber?: string;
  councilName?: string;
  email?: string;
}

interface RedemptionStats {
  totalRedemptions: number;
  totalSavings: number;
  thisMonth: number;
  favoriteCategory: string;
}

// Generate unique card number from user ID or use provided cardNumber
const generateCardNumber = (userId: string | number, existingCardNumber?: string): string => {
  if (existingCardNumber) return existingCardNumber;
  const numStr = userId.toString().padStart(8, '0');
  const prefix = 'CC';
  const part1 = numStr.slice(0, 4);
  const part2 = numStr.slice(4, 8);
  const checksum = (parseInt(numStr) % 10000).toString().padStart(4, '0');
  return `${prefix}-${part1}-${part2}-${checksum}`;
};

export default function WalletScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<RootNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Generate card data from user info
  const userAny = user as any;
  const cardData: CardData = {
    cardNumber: generateCardNumber(user?.id || Date.now(), userAny?.cardNumber),
    memberName: `${user?.firstName || 'Member'} ${user?.lastName || ''}`.trim(),
    expiryDate: userAny?.subscriptionExpiresAt
      ? new Date(userAny.subscriptionExpiresAt).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
      : '12/26',
    memberSince: userAny?.createdAt
      ? new Date(userAny.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Jan 2026',
    status: user?.subscriptionStatus === 'active' ? 'active' : 'pending',
    troopNumber: userAny?.troopNumber || '234',
    councilName: userAny?.councilName || 'Central Florida Council',
    email: user?.email,
  };

  // Redemption stats state
  const [redemptionStats, setRedemptionStats] = useState<RedemptionStats>({
    totalRedemptions: 0,
    totalSavings: 0,
    thisMonth: 0,
    favoriteCategory: 'None yet',
  });

  // Load wallet analytics on mount
  useEffect(() => {
    loadWalletStats();
  }, []);

  const loadWalletStats = async () => {
    try {
      const response = await apiClient.get('/api/v1/analytics/wallet');
      const data = response.data;
      setRedemptionStats({
        totalRedemptions: data.totalRedemptions || 0,
        totalSavings: data.totalSavings || 0,
        thisMonth: data.thisMonth || 0,
        favoriteCategory: data.favoriteCategory || 'None yet',
      });
    } catch (error) {
      console.log('Failed to load wallet stats:', error);
      // Keep default values on error
    }
  };

  // Flip animation
  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Interpolations for flip animation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletStats();
    setRefreshing(false);
  };

  const handleAddToWallet = () => {
    alert('Coming Soon! Apple Wallet and Google Wallet integration will be available in a future update.');
  };

  const getStatusColor = (status: CardData['status']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'expired':
        return COLORS.error;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: CardData['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Digital Card with Flip */}
        <View style={styles.cardSection}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>Your Camp Card</Text>
            <TouchableOpacity onPress={flipCard} style={styles.flipButton}>
              <Ionicons name="sync-outline" size={18} color={COLORS.primary} />
              <Text style={styles.flipButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>
            {/* Front of Card */}
            <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
              <ImageBackground
                source={require('../../../assets/campcard_bg.png')}
                style={styles.card}
                imageStyle={styles.cardBackgroundImage}
                resizeMode="cover"
              >
                {/* Lockup Logo Centered */}
                <View style={styles.cardContent}>
                  <Image
                    source={require('../../../assets/campcard_lockup_left.png')}
                    style={styles.cardLockup}
                    resizeMode="contain"
                  />
                </View>

                {/* Status Badge */}
                <View style={styles.cardStatusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cardData.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(cardData.status)}</Text>
                  </View>
                </View>
              </ImageBackground>
            </Animated.View>

            {/* Back of Card */}
            <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
              <View style={styles.cardBackContent}>
                {/* Magnetic Strip */}
                <View style={styles.magneticStrip} />

                {/* Card Details */}
                <View style={styles.cardBackDetails}>
                  <View style={styles.cardBackRow}>
                    <Text style={styles.cardBackLabel}>Card Number</Text>
                    <Text style={styles.cardBackValue}>{cardData.cardNumber}</Text>
                  </View>

                  <View style={styles.cardBackRow}>
                    <Text style={styles.cardBackLabel}>Member Name</Text>
                    <Text style={styles.cardBackValue}>{cardData.memberName}</Text>
                  </View>

                  <View style={styles.cardBackRow}>
                    <Text style={styles.cardBackLabel}>Email</Text>
                    <Text style={styles.cardBackValue}>{cardData.email || 'Not provided'}</Text>
                  </View>

                  <View style={styles.cardBackRowDouble}>
                    <View style={styles.cardBackCol}>
                      <Text style={styles.cardBackLabel}>Valid Thru</Text>
                      <Text style={styles.cardBackValue}>{cardData.expiryDate}</Text>
                    </View>
                    <View style={styles.cardBackCol}>
                      <Text style={styles.cardBackLabel}>Member Since</Text>
                      <Text style={styles.cardBackValue}>{cardData.memberSince}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBackRow}>
                    <Text style={styles.cardBackLabel}>Council</Text>
                    <Text style={styles.cardBackValue}>{cardData.councilName}</Text>
                  </View>
                </View>

                {/* QR Code */}
                <View style={styles.qrSection}>
                  <QRCode
                    value={cardData.cardNumber}
                    size={60}
                    backgroundColor="white"
                    color={COLORS.navy || '#001a3a'}
                  />
                </View>
              </View>
            </Animated.View>
          </View>

          <Text style={styles.cardHint}>Tap the flip button to see card details</Text>
        </View>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Your Savings</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="cash-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>${redemptionStats.totalSavings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Saved</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{redemptionStats.totalRedemptions}</Text>
              <Text style={styles.statLabel}>Redemptions</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="calendar-outline" size={24} color="#F57C00" />
              </View>
              <Text style={styles.statValue}>{redemptionStats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={1}>{redemptionStats.favoriteCategory}</Text>
              <Text style={styles.statLabel}>Top Category</Text>
            </View>
          </View>
        </View>

        {/* Recent Redemptions */}
        <View style={styles.redemptionsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Redemptions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RedemptionHistory' as any)}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.redemptionsList}>
            <View style={styles.redemptionItem}>
              <View style={styles.redemptionIcon}>
                <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.redemptionInfo}>
                <Text style={styles.redemptionName}>Pizza Palace</Text>
                <Text style={styles.redemptionDate}>Jan 14, 2026</Text>
              </View>
              <Text style={styles.redemptionSavings}>-$5.00</Text>
            </View>

            <View style={styles.redemptionItem}>
              <View style={styles.redemptionIcon}>
                <Ionicons name="cart-outline" size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.redemptionInfo}>
                <Text style={styles.redemptionName}>Sports Gear Pro</Text>
                <Text style={styles.redemptionDate}>Jan 12, 2026</Text>
              </View>
              <Text style={styles.redemptionSavings}>-$12.50</Text>
            </View>

            <View style={styles.redemptionItem}>
              <View style={styles.redemptionIcon}>
                <Ionicons name="cafe-outline" size={20} color="#795548" />
              </View>
              <View style={styles.redemptionInfo}>
                <Text style={styles.redemptionName}>Coffee Corner</Text>
                <Text style={styles.redemptionDate}>Jan 10, 2026</Text>
              </View>
              <Text style={styles.redemptionSavings}>-$2.50</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleAddToWallet}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="wallet" size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionLabel}>Add to Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={flipCard}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="qr-code" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Show QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Subscription')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="refresh" size={24} color="#F57C00" />
              </View>
              <Text style={styles.actionLabel}>Renew Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="help-circle" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={COLORS.secondary} />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>How to use your card</Text>
            <Text style={styles.infoBannerText}>
              Show your QR code or card number at participating merchants to redeem offers and discounts.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  cardSection: {
    padding: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(206, 17, 38, 0.1)',
    borderRadius: 16,
  },
  flipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    perspective: 1000,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: '#001a3a',
  },
  card: {
    width: '100%',
    height: '100%',
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardLockup: {
    width: '85%',
    height: '70%',
  },
  cardStatusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cardBackContent: {
    flex: 1,
    padding: 0,
  },
  magneticStrip: {
    width: '100%',
    height: 40,
    backgroundColor: '#1a1a1a',
    marginTop: 20,
  },
  cardBackDetails: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
  },
  cardBackRow: {
    marginBottom: 8,
  },
  cardBackRowDouble: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardBackCol: {
    flex: 1,
  },
  cardBackLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardBackValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  qrSection: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
  },
  cardHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  analyticsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  redemptionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  redemptionsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  redemptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  redemptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  redemptionInfo: {
    flex: 1,
  },
  redemptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  redemptionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  redemptionSavings: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.success,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
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

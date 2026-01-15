// Wallet Screen - Digital Camp Card display

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { RootNavigation } from '../../types/navigation';

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
}

// Generate unique card number from user ID
const generateCardNumber = (userId: string | number): string => {
  const numStr = userId.toString().padStart(8, '0');
  const prefix = 'CC';
  // Format: CC-XXXX-XXXX-XXXX
  const part1 = numStr.slice(0, 4);
  const part2 = numStr.slice(4, 8);
  const checksum = (parseInt(numStr) % 10000).toString().padStart(4, '0');
  return `${prefix}-${part1}-${part2}-${checksum}`;
};

export default function WalletScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<RootNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generate card data from user info
  // Note: troopNumber and councilName may be returned by API but not typed in User interface
  const userAny = user as any;
  const cardData: CardData = {
    cardNumber: generateCardNumber(user?.id || Date.now()),
    memberName: `${user?.firstName || 'Member'} ${user?.lastName || ''}`.trim(),
    expiryDate: '12/26', // TODO: Get from subscription
    memberSince: 'Jan 2026',
    status: user?.subscriptionStatus === 'active' ? 'active' : 'pending',
    troopNumber: userAny?.troopNumber || '234',
    councilName: userAny?.councilName || 'Local Council',
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh card data from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleAddToWallet = () => {
    // TODO: Implement Apple Wallet / Google Wallet integration
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
        {/* Digital Card */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Your Camp Card</Text>

          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => setShowQR(!showQR)}
            activeOpacity={0.95}
          >
            <ImageBackground
              source={require('../../../assets/campcard_bg.png')}
              style={styles.card}
              imageStyle={styles.cardBackgroundImage}
              resizeMode="cover"
            >
              {/* Card Overlay for better text visibility */}
              <View style={styles.cardOverlay}>
                {/* Logo */}
                <View style={styles.cardHeader}>
                  <Image
                    source={require('../../../assets/campcard_lockup_left.png')}
                    style={styles.cardLogo}
                    resizeMode="contain"
                  />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cardData.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(cardData.status)}</Text>
                  </View>
                </View>

                {/* QR Code or Card Number */}
                {showQR ? (
                  <View style={styles.qrContainer}>
                    <QRCode
                      value={cardData.cardNumber}
                      size={100}
                      backgroundColor="white"
                      color={COLORS.primary}
                    />
                    <Text style={styles.qrHint}>Tap to show card details</Text>
                  </View>
                ) : (
                  <View style={styles.cardNumberContainer}>
                    <Text style={styles.cardNumber}>{cardData.cardNumber}</Text>
                    <Text style={styles.tapHint}>Tap to show QR code</Text>
                  </View>
                )}

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterLeft}>
                    <Text style={styles.cardLabel}>MEMBER</Text>
                    <Text style={styles.cardValue}>{cardData.memberName}</Text>
                  </View>
                  <View style={styles.cardFooterRight}>
                    <Text style={styles.cardLabel}>VALID THRU</Text>
                    <Text style={styles.cardValue}>{cardData.expiryDate}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="card" size={20} color={COLORS.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Card Number</Text>
                  <Text style={styles.detailValue}>{cardData.cardNumber}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Member Name</Text>
                  <Text style={styles.detailValue}>{cardData.memberName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Troop</Text>
                  <Text style={styles.detailValue}>Troop {cardData.troopNumber}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Council</Text>
                  <Text style={styles.detailValue}>{cardData.councilName}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.detailRow, styles.lastRow]}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Member Since</Text>
                  <Text style={styles.detailValue}>{cardData.memberSince}</Text>
                </View>
              </View>
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
              onPress={() => setShowQR(true)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 63, 135, 0.85)',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLogo: {
    width: 120,
    height: 40,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardNumberContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  qrHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFooterLeft: {},
  cardFooterRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  actionsSection: {
    padding: 20,
  },
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

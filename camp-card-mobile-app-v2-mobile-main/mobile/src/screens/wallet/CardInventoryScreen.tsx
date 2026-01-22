// Card Inventory Screen - Multi-Card Wallet with Gift & Activate Actions
// Part of the Multi-Card Purchase & Gifting System

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { apiClient } from '../../services/apiClient';

const { width: screenWidth } = Dimensions.get('window');

// Card status types matching backend
type CardStatus = 'UNASSIGNED' | 'ACTIVE' | 'GIFTED' | 'REPLACED' | 'EXPIRED' | 'REVOKED';

interface CampCard {
  id: number;
  uuid: string;
  cardNumber: string;
  status: CardStatus;
  activatedAt: string | null;
  expiresAt: string;
  createdAt: string;
  giftedAt: string | null;
  giftedToEmail: string | null;
  giftMessage: string | null;
  giftClaimedAt: string | null;
  offersUsed: number;
  totalOffers: number;
  scoutName: string | null;
}

interface MyCardsResponse {
  activeCard: CampCard | null;
  unusedCards: CampCard[];
  giftedCards: CampCard[];
  totalCards: number;
  activeCardOffersUsed: number;
  activeCardTotalOffers: number;
}

const STATUS_CONFIG: Record<CardStatus, { color: string; label: string; icon: string }> = {
  UNASSIGNED: { color: '#9E9E9E', label: 'Unused', icon: 'card-outline' },
  ACTIVE: { color: '#4CAF50', label: 'Active', icon: 'checkmark-circle' },
  GIFTED: { color: '#9C27B0', label: 'Gifted', icon: 'gift' },
  REPLACED: { color: '#607D8B', label: 'Replaced', icon: 'swap-horizontal' },
  EXPIRED: { color: '#F44336', label: 'Expired', icon: 'time' },
  REVOKED: { color: '#F44336', label: 'Revoked', icon: 'close-circle' },
};

export default function CardInventoryScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cardsData, setCardsData] = useState<MyCardsResponse | null>(null);
  const [activatingCardId, setActivatingCardId] = useState<number | null>(null);

  const loadCards = async () => {
    try {
      const response = await apiClient.get('/api/v1/cards/my-cards');
      setCardsData(response.data);
    } catch (error) {
      console.error('Failed to load cards:', error);
      Alert.alert('Error', 'Failed to load your cards. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCards();
  };

  const handleActivateCard = async (cardId: number) => {
    Alert.alert(
      'Activate Card',
      'Activating this card will replenish all your one-time offers. Your current active card will be replaced. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          style: 'default',
          onPress: async () => {
            setActivatingCardId(cardId);
            try {
              await apiClient.post(`/api/v1/cards/${cardId}/activate`);
              Alert.alert('Success', 'Card activated! Your offers have been refreshed.');
              loadCards();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to activate card.');
            } finally {
              setActivatingCardId(null);
            }
          },
        },
      ]
    );
  };

  const handleGiftCard = (cardId: number) => {
    (navigation as any).navigate('GiftCard', { cardId });
  };

  const handleCancelGift = async (cardId: number) => {
    Alert.alert(
      'Cancel Gift',
      'Are you sure you want to cancel this gift? The card will be returned to your unused cards.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Gift',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/v1/cards/${cardId}/cancel-gift`);
              Alert.alert('Gift Canceled', 'The card has been returned to your unused cards.');
              loadCards();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel gift.');
            }
          },
        },
      ]
    );
  };

  const handleResendGift = async (cardId: number) => {
    try {
      await apiClient.post(`/api/v1/cards/${cardId}/resend-gift`);
      Alert.alert('Email Sent', 'Gift notification email has been resent to the recipient.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend gift email.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderCardItem = (card: CampCard, showActions: boolean = true) => {
    const statusConfig = STATUS_CONFIG[card.status];
    const daysLeft = getDaysUntilExpiry(card.expiresAt);
    const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;

    return (
      <View key={card.id} style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.cardNumberContainer}>
            <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
            <Text style={styles.cardNumber}>{card.cardNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          {card.status === 'ACTIVE' && (
            <View style={styles.offersInfo}>
              <Ionicons name="pricetag" size={16} color={COLORS.primary} />
              <Text style={styles.offersText}>
                {card.offersUsed} / {card.totalOffers} offers used
              </Text>
            </View>
          )}

          {card.status === 'GIFTED' && card.giftedToEmail && (
            <View style={styles.giftInfo}>
              <Ionicons name="mail" size={16} color="#9C27B0" />
              <Text style={styles.giftText}>Sent to: {card.giftedToEmail}</Text>
            </View>
          )}

          {card.scoutName && (
            <View style={styles.scoutInfo}>
              <Ionicons name="ribbon" size={16} color={COLORS.secondary} />
              <Text style={styles.scoutText}>Supporting: {card.scoutName}</Text>
            </View>
          )}

          <View style={styles.expiryInfo}>
            <Ionicons
              name="calendar"
              size={16}
              color={isExpiringSoon ? '#FF9800' : COLORS.textSecondary}
            />
            <Text style={[styles.expiryText, isExpiringSoon && styles.expiryWarning]}>
              {isExpiringSoon
                ? `Expires in ${daysLeft} days`
                : `Expires: ${formatDate(card.expiresAt)}`}
            </Text>
          </View>
        </View>

        {showActions && (
          <View style={styles.cardActions}>
            {card.status === 'UNASSIGNED' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.activateButton]}
                  onPress={() => handleActivateCard(card.id)}
                  disabled={activatingCardId === card.id}
                >
                  {activatingCardId === card.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="flash" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Activate</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.giftButton]}
                  onPress={() => handleGiftCard(card.id)}
                >
                  <Ionicons name="gift" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Gift</Text>
                </TouchableOpacity>
              </>
            )}

            {card.status === 'GIFTED' && !card.giftClaimedAt && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resendButton]}
                  onPress={() => handleResendGift(card.id)}
                >
                  <Ionicons name="mail" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Resend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancelGift(card.id)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { activeCard, unusedCards, giftedCards, totalCards } = cardsData || {
    activeCard: null,
    unusedCards: [],
    giftedCards: [],
    totalCards: 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cards</Text>
        <TouchableOpacity
          style={styles.buyMoreButton}
          onPress={() => (navigation as any).navigate('BuyMoreCards')}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <Text style={styles.buyMoreText}>Buy More</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCards}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{unusedCards.length}</Text>
            <Text style={styles.statLabel}>Unused</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {giftedCards.filter((c) => !c.giftClaimedAt).length}
            </Text>
            <Text style={styles.statLabel}>Pending Gifts</Text>
          </View>
        </View>

        {/* Active Card Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Card</Text>
          {activeCard ? (
            renderCardItem(activeCard, false)
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="card-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No active card</Text>
              {unusedCards.length > 0 && (
                <Text style={styles.emptyHint}>Activate one of your unused cards below</Text>
              )}
            </View>
          )}
        </View>

        {/* Unused Cards Section */}
        {unusedCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Unused Cards ({unusedCards.length})
            </Text>
            <Text style={styles.sectionHint}>
              Activate to replenish offers, or gift to friends & family
            </Text>
            {unusedCards.map((card) => renderCardItem(card))}
          </View>
        )}

        {/* Gifted Cards Section */}
        {giftedCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Gifted Cards ({giftedCards.length})
            </Text>
            {giftedCards.map((card) => renderCardItem(card))}
          </View>
        )}

        {/* Empty State */}
        {totalCards === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Cards Yet</Text>
            <Text style={styles.emptyStateText}>
              Purchase Camp Cards to unlock exclusive offers and support Scouts in your community.
            </Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => (navigation as any).navigate('BuyMoreCards')}
            >
              <Text style={styles.purchaseButtonText}>Purchase Cards</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Banner */}
        {totalCards > 0 && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
            <Text style={styles.infoBannerText}>
              All Camp Cards expire on December 31st. Use or gift your cards before they expire!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  buyMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 20,
  },
  buyMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  summarySection: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  cardItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: COLORS.text,
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
  cardDetails: {
    gap: 8,
  },
  offersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offersText: {
    fontSize: 14,
    color: COLORS.text,
  },
  giftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  giftText: {
    fontSize: 14,
    color: '#9C27B0',
  },
  scoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoutText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  expiryWarning: {
    color: '#FF9800',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  giftButton: {
    backgroundColor: '#9C27B0',
  },
  resendButton: {
    backgroundColor: COLORS.secondary,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptySection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
});

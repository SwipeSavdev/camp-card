// Replenish Card Screen - Activate an unused card to replenish offers
// Part of the Multi-Card Purchase & Gifting System

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../config/constants';
import { apiClient } from '../../services/apiClient';

interface UnusedCard {
  id: number;
  cardNumber: string;
  status: string;
  purchasedAt: string;
  expiresAt: string;
}

export default function ReplenishCardScreen() {
  const navigation = useNavigation();

  const [unusedCards, setUnusedCards] = useState<UnusedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);

  useEffect(() => {
    fetchUnusedCards();
  }, []);

  const fetchUnusedCards = async () => {
    try {
      const response = await apiClient.get('/api/v1/cards/inventory');
      const cards = response.data?.cards || [];
      // Filter to only show unassigned cards
      const unassigned = cards.filter((card: UnusedCard) => card.status === 'UNASSIGNED');
      setUnusedCards(unassigned);
    } catch (error) {
      console.error('Failed to fetch unused cards:', error);
      Alert.alert('Error', 'Failed to load unused cards');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCard = async (cardId: number) => {
    Alert.alert(
      'Activate Card',
      'Activating this card will replenish all your one-time use offers. Your current card will be marked as replaced. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            setActivating(cardId);
            try {
              await apiClient.post(`/api/v1/cards/${cardId}/activate`);
              Alert.alert(
                'Card Activated!',
                'Your offers have been replenished. You can now use all one-time offers again.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to activate card';
              Alert.alert('Error', message);
            } finally {
              setActivating(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Replenish Card</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Replenish Card</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="refresh" size={48} color={COLORS.primary} />
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Used up your one-time offers? Activate a new card from your inventory to replenish
          all offers and continue saving!
        </Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={COLORS.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              • Your current card will be marked as "replaced"{'\n'}
              • All one-time use offers will be refreshed{'\n'}
              • Multi-use offers continue as normal{'\n'}
              • The new card keeps the same expiration date
            </Text>
          </View>
        </View>

        {/* Unused Cards List */}
        <Text style={styles.sectionTitle}>Available Cards ({unusedCards.length})</Text>

        {unusedCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Unused Cards</Text>
            <Text style={styles.emptyText}>
              You don't have any unused cards in your inventory. Purchase additional cards to
              replenish your offers later.
            </Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => (navigation as any).navigate('Subscription')}
            >
              <Text style={styles.purchaseButtonText}>Purchase Cards</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {unusedCards.map((card) => {
              const daysLeft = getDaysUntilExpiry(card.expiresAt);
              const isExpiringSoon = daysLeft <= 30;

              return (
                <View key={card.id} style={styles.cardItem}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="card" size={20} color={COLORS.primary} />
                      <Text style={styles.cardNumber}>{card.cardNumber}</Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      Purchased: {formatDate(card.purchasedAt)}
                    </Text>
                    <View style={styles.expiryRow}>
                      <Text
                        style={[styles.expiryText, isExpiringSoon && styles.expiryWarning]}
                      >
                        Expires: {formatDate(card.expiresAt)}
                      </Text>
                      {isExpiringSoon && (
                        <View style={styles.expiryBadge}>
                          <Text style={styles.expiryBadgeText}>{daysLeft} days left</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.activateButton,
                      activating === card.id && styles.activateButtonDisabled,
                    ]}
                    onPress={() => handleActivateCard(card.id)}
                    disabled={activating !== null}
                  >
                    {activating === card.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={16} color="#fff" />
                        <Text style={styles.activateButtonText}>Activate</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardsList: {
    gap: 12,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  expiryWarning: {
    color: '#E65100',
  },
  expiryBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E65100',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activateButtonDisabled: {
    opacity: 0.6,
  },
  activateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

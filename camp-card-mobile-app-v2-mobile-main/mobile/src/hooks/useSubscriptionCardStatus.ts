// useSubscriptionCardStatus Hook
// Fetches subscription and card data in parallel, computes combined status

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import * as SecureStore from 'expo-secure-store';

export type CombinedStatus =
  | 'HEALTHY'                // Active subscription + Active card
  | 'NEEDS_CARD_ACTIVATION'  // Active subscription + Unused cards exist but none active
  | 'NEEDS_CARDS'            // Active subscription + No cards at all
  | 'SUBSCRIPTION_EXPIRED'   // No active subscription + Cards exist
  | 'NOTHING_ACTIVE'         // No subscription + No cards
  | 'SUBSCRIPTION_SUSPENDED'; // Suspended subscription

export type StatusSeverity = 'success' | 'warning' | 'error' | 'info';

interface SubscriptionData {
  id: string;
  plan: {
    id: number;
    name: string;
    priceCents: number;
    billingInterval: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface ActiveCardData {
  cardNumber: string;
  status: string;
  expiresAt: string | null;
}

interface UseSubscriptionCardStatusResult {
  // Subscription
  subscription: SubscriptionData | null;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;

  // Cards
  activeCard: ActiveCardData | null;
  hasActiveCard: boolean;
  unusedCardCount: number;
  totalCardCount: number;

  // Combined
  combinedStatus: CombinedStatus;
  statusMessage: string;
  statusSeverity: StatusSeverity;
  actionType: 'none' | 'renew_subscription' | 'activate_card' | 'purchase_cards' | 'contact_support' | 'subscribe';

  // State
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function computeCombinedStatus(
  subscription: SubscriptionData | null,
  activeCard: ActiveCardData | null,
  unusedCardCount: number,
  totalCardCount: number,
): CombinedStatus {
  const subActive = subscription?.status === 'ACTIVE';
  const subSuspended = subscription?.status === 'SUSPENDED';
  const hasActive = !!activeCard;
  const hasUnused = unusedCardCount > 0;

  if (subSuspended) return 'SUBSCRIPTION_SUSPENDED';
  if (subActive && hasActive) return 'HEALTHY';
  if (subActive && !hasActive && hasUnused) return 'NEEDS_CARD_ACTIVATION';
  if (subActive && !hasActive) return 'NEEDS_CARDS';
  if (!subActive && (hasActive || totalCardCount > 0)) return 'SUBSCRIPTION_EXPIRED';
  return 'NOTHING_ACTIVE';
}

function getStatusDetails(status: CombinedStatus, unusedCardCount: number): {
  message: string;
  severity: StatusSeverity;
  actionType: UseSubscriptionCardStatusResult['actionType'];
} {
  switch (status) {
    case 'HEALTHY':
      return {
        message: 'Your subscription and card are active.',
        severity: 'success',
        actionType: 'none',
      };
    case 'NEEDS_CARD_ACTIVATION':
      return {
        message: `You have ${unusedCardCount} unused card${unusedCardCount !== 1 ? 's' : ''}. Activate one to start using offers.`,
        severity: 'info',
        actionType: 'activate_card',
      };
    case 'NEEDS_CARDS':
      return {
        message: 'Your subscription is active but you have no cards. Purchase cards to start saving.',
        severity: 'warning',
        actionType: 'purchase_cards',
      };
    case 'SUBSCRIPTION_EXPIRED':
      return {
        message: 'Your subscription is inactive. Renew to use your card at merchants.',
        severity: 'error',
        actionType: 'renew_subscription',
      };
    case 'NOTHING_ACTIVE':
      return {
        message: 'Subscribe and get a card to start saving at local merchants.',
        severity: 'warning',
        actionType: 'subscribe',
      };
    case 'SUBSCRIPTION_SUSPENDED':
      return {
        message: 'Your subscription is suspended. Please contact support.',
        severity: 'warning',
        actionType: 'contact_support',
      };
  }
}

export function useSubscriptionCardStatus(): UseSubscriptionCardStatusResult {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCardData | null>(null);
  const [unusedCardCount, setUnusedCardCount] = useState(0);
  const [totalCardCount, setTotalCardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const [subResult, cardsResult] = await Promise.allSettled([
        apiClient.get('/api/v1/subscriptions/me'),
        apiClient.get('/api/v1/cards/my-cards'),
      ]);

      // Handle subscription response
      if (subResult.status === 'fulfilled') {
        setSubscription(subResult.value.data);
      } else {
        const err = subResult.reason as any;
        if (err.response?.status === 404) {
          setSubscription(null);
        } else {
          console.log('Failed to load subscription:', err);
          setSubscription(null);
        }
      }

      // Handle cards response
      if (cardsResult.status === 'fulfilled') {
        const data = cardsResult.value.data;
        if (data.activeCard) {
          setActiveCard({
            cardNumber: data.activeCard.cardNumber,
            status: data.activeCard.status,
            expiresAt: data.activeCard.expiresAt,
          });
        } else {
          setActiveCard(null);
        }
        setUnusedCardCount(data.unusedCards?.length || 0);
        setTotalCardCount(data.totalCards || 0);
      } else {
        const err = cardsResult.reason as any;
        if (err.response?.status === 404) {
          setActiveCard(null);
          setUnusedCardCount(0);
          setTotalCardCount(0);
        } else {
          console.log('Failed to load cards:', err);
          setActiveCard(null);
          setUnusedCardCount(0);
          setTotalCardCount(0);
        }
      }
    } catch (err: any) {
      console.error('Error in useSubscriptionCardStatus:', err);
      setError(err.message || 'Failed to load status');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const combinedStatus = computeCombinedStatus(subscription, activeCard, unusedCardCount, totalCardCount);
  const { message, severity, actionType } = getStatusDetails(combinedStatus, unusedCardCount);

  return {
    subscription,
    subscriptionStatus: subscription?.status || 'NONE',
    subscriptionExpiresAt: subscription?.currentPeriodEnd || null,
    activeCard,
    hasActiveCard: !!activeCard,
    unusedCardCount,
    totalCardCount,
    combinedStatus,
    statusMessage: message,
    statusSeverity: severity,
    actionType,
    loading,
    error,
    refresh,
  };
}

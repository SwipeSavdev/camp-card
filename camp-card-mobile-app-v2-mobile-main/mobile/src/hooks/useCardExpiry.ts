// useCardExpiry Hook
// Fetches card expiry information and provides alert data

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CardExpiryInfo {
  daysUntilExpiry: number;
  expiringCardCount: number;
  totalActiveCards: number;
  earliestExpiry: string | null;
}

interface UseCardExpiryResult {
  expiryInfo: CardExpiryInfo | null;
  loading: boolean;
  error: string | null;
  dismissed: boolean;
  dismissAlert: () => void;
  refresh: () => Promise<void>;
}

const DISMISS_KEY = 'card_expiry_alert_dismissed';
const DISMISS_EXPIRY_HOURS = 24; // Re-show after 24 hours

export function useCardExpiry(): UseCardExpiryResult {
  const [expiryInfo, setExpiryInfo] = useState<CardExpiryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkDismissedStatus = useCallback(async () => {
    try {
      const dismissedAt = await AsyncStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const dismissedTime = new Date(dismissedAt).getTime();
        const now = Date.now();
        const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

        if (hoursSinceDismissed < DISMISS_EXPIRY_HOURS) {
          setDismissed(true);
        } else {
          // Clear old dismissal
          await AsyncStorage.removeItem(DISMISS_KEY);
          setDismissed(false);
        }
      }
    } catch (err) {
      console.error('Error checking dismissed status:', err);
    }
  }, []);

  const fetchExpiryInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/cards/expiry-status');
      const data = response.data;

      setExpiryInfo({
        daysUntilExpiry: data.daysUntilExpiry ?? 365,
        expiringCardCount: data.expiringCardCount ?? 0,
        totalActiveCards: data.totalActiveCards ?? 0,
        earliestExpiry: data.earliestExpiry ?? null,
      });
    } catch (err: any) {
      // Don't treat 404 as error - user may not have cards yet
      if (err.response?.status === 404) {
        setExpiryInfo({
          daysUntilExpiry: 365,
          expiringCardCount: 0,
          totalActiveCards: 0,
          earliestExpiry: null,
        });
      } else {
        console.error('Error fetching expiry info:', err);
        setError(err.message || 'Failed to fetch card expiry info');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissAlert = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DISMISS_KEY, new Date().toISOString());
      setDismissed(true);
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([checkDismissedStatus(), fetchExpiryInfo()]);
  }, [checkDismissedStatus, fetchExpiryInfo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    expiryInfo,
    loading,
    error,
    dismissed,
    dismissAlert,
    refresh,
  };
}

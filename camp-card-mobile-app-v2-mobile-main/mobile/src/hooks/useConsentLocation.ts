import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuthStore, ConsentStatus } from '../store/authStore';
import { useLocation, LocationState, UseLocationOptions } from './useLocation';

/**
 * COPPA-compliant location hook
 *
 * This hook wraps useLocation and enforces parental consent requirements
 * for minors before allowing access to location features.
 *
 * For minors (SCOUT role with consent required):
 * - If consent is GRANTED and locationAllowed is true: normal location access
 * - If consent is PENDING: blocks location, shows waiting message
 * - If consent is DENIED/REVOKED: blocks location, shows restricted message
 * - If locationAllowed is false: blocks location even with consent
 *
 * For adults or UNIT_LEADER role: normal location access
 */

export interface ConsentLocationState extends LocationState {
  consentStatus: ConsentStatus;
  isLocationBlocked: boolean;
  blockReason: 'consent_pending' | 'consent_denied' | 'location_disabled' | null;
}

export interface UseConsentLocationResult extends Omit<ReturnType<typeof useLocation>, 'getCurrentPosition' | 'startWatching'> {
  consentStatus: ConsentStatus;
  isLocationBlocked: boolean;
  blockReason: 'consent_pending' | 'consent_denied' | 'location_disabled' | null;
  getCurrentPosition: () => Promise<void>;
  startWatching: () => Promise<void>;
  showConsentBlockedAlert: () => void;
}

/**
 * Hook for managing location with COPPA consent enforcement
 */
export function useConsentLocation(options: UseLocationOptions = {}): UseConsentLocationResult {
  const user = useAuthStore(state => state.user);
  const location = useLocation(options);

  // Determine if location is blocked based on consent status
  const { isLocationBlocked, blockReason, consentStatus } = useMemo(() => {
    const status = user?.consentStatus || 'NOT_REQUIRED';
    const locationAllowed = user?.locationAllowed ?? true;

    // Adults and users without consent requirements have full access
    if (status === 'NOT_REQUIRED') {
      return {
        isLocationBlocked: false,
        blockReason: null,
        consentStatus: status,
      };
    }

    // UNIT_LEADER role always has location access
    if (user?.role === 'UNIT_LEADER') {
      return {
        isLocationBlocked: false,
        blockReason: null,
        consentStatus: status,
      };
    }

    // Check consent status
    if (status === 'PENDING') {
      return {
        isLocationBlocked: true,
        blockReason: 'consent_pending' as const,
        consentStatus: status,
      };
    }

    if (status === 'DENIED' || status === 'REVOKED') {
      return {
        isLocationBlocked: true,
        blockReason: 'consent_denied' as const,
        consentStatus: status,
      };
    }

    // Consent granted but location specifically disabled by parent
    if (status === 'GRANTED' && !locationAllowed) {
      return {
        isLocationBlocked: true,
        blockReason: 'location_disabled' as const,
        consentStatus: status,
      };
    }

    // Consent granted and location allowed
    return {
      isLocationBlocked: false,
      blockReason: null,
      consentStatus: status,
    };
  }, [user?.consentStatus, user?.locationAllowed, user?.role]);

  // Show alert explaining why location is blocked
  const showConsentBlockedAlert = useCallback(() => {
    switch (blockReason) {
      case 'consent_pending':
        Alert.alert(
          'Waiting for Parent Approval',
          'Your parent or guardian needs to approve your account before you can use location features. We\'ve sent them an email - ask them to check their inbox!',
          [{ text: 'OK', style: 'default' }]
        );
        break;

      case 'consent_denied':
        Alert.alert(
          'Location Access Restricted',
          'Your parent or guardian has not enabled location access for your account. You can still browse all offers without location features.',
          [{ text: 'OK', style: 'default' }]
        );
        break;

      case 'location_disabled':
        Alert.alert(
          'Location Disabled',
          'Your parent or guardian has disabled location access for your account. Ask them to enable it if you\'d like to use location features.',
          [{ text: 'OK', style: 'default' }]
        );
        break;

      default:
        break;
    }
  }, [blockReason]);

  // Wrapped getCurrentPosition that checks consent first
  const getCurrentPosition = useCallback(async () => {
    if (isLocationBlocked) {
      showConsentBlockedAlert();
      return;
    }
    await location.getCurrentPosition();
  }, [isLocationBlocked, showConsentBlockedAlert, location]);

  // Wrapped startWatching that checks consent first
  const startWatching = useCallback(async () => {
    if (isLocationBlocked) {
      showConsentBlockedAlert();
      return;
    }
    await location.startWatching();
  }, [isLocationBlocked, showConsentBlockedAlert, location]);

  return {
    ...location,
    consentStatus,
    isLocationBlocked,
    blockReason,
    getCurrentPosition,
    startWatching,
    showConsentBlockedAlert,
  };
}

/**
 * Hook to check if the current user can access location features
 * Use this for conditional UI rendering
 */
export function useCanAccessLocation(): {
  canAccess: boolean;
  reason: 'allowed' | 'consent_pending' | 'consent_denied' | 'location_disabled';
  consentStatus: ConsentStatus;
} {
  const user = useAuthStore(state => state.user);

  return useMemo(() => {
    const status = user?.consentStatus || 'NOT_REQUIRED';
    const locationAllowed = user?.locationAllowed ?? true;

    // Adults and users without consent requirements
    if (status === 'NOT_REQUIRED' || user?.role === 'UNIT_LEADER') {
      return { canAccess: true, reason: 'allowed', consentStatus: status };
    }

    if (status === 'PENDING') {
      return { canAccess: false, reason: 'consent_pending', consentStatus: status };
    }

    if (status === 'DENIED' || status === 'REVOKED') {
      return { canAccess: false, reason: 'consent_denied', consentStatus: status };
    }

    if (status === 'GRANTED' && !locationAllowed) {
      return { canAccess: false, reason: 'location_disabled', consentStatus: status };
    }

    return { canAccess: true, reason: 'allowed', consentStatus: status };
  }, [user?.consentStatus, user?.locationAllowed, user?.role]);
}

export default useConsentLocation;

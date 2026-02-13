import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from 'expo-tracking-transparency';
import { analyticsService } from '../services/analyticsService';

/**
 * Hook to request ATT (App Tracking Transparency) permission on iOS.
 * Must be called early in the app lifecycle, before any tracking occurs.
 *
 * Returns the current tracking permission status.
 */
export function useTrackingPermission() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'ios') {
        // Android doesn't use ATT — tracking is always allowed
        setStatus(PermissionStatus.GRANTED);
        setIsReady(true);
        return;
      }

      try {
        // Check current status first
        const { status: currentStatus } = await getTrackingPermissionsAsync();

        if (currentStatus === PermissionStatus.UNDETERMINED) {
          // Show the ATT prompt
          const { status: newStatus } = await requestTrackingPermissionsAsync();
          setStatus(newStatus);
          analyticsService.trackAction('att_prompt_response', {
            granted: newStatus === PermissionStatus.GRANTED,
          });
        } else {
          setStatus(currentStatus);
        }
      } catch (error) {
        console.warn('[ATT] Failed to request tracking permission:', error);
        setStatus(PermissionStatus.DENIED);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return {
    status,
    isReady,
    isTrackingAllowed: status === PermissionStatus.GRANTED,
  };
}

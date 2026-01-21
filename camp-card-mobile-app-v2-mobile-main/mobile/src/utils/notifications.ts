import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiClient } from './api';
import { useAuthStore } from '../store/authStore';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type?: string;
  offerId?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Hook to manage push notifications
 * Automatically registers for push notifications when user is authenticated
 */
export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const { isAuthenticated, token } = useAuthStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Only register for notifications if user is authenticated
    if (!isAuthenticated || !token) {
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync().then(pushToken => {
      if (pushToken) {
        setExpoPushToken(pushToken);
        // Register token with backend
        registerTokenWithBackend(pushToken);
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notif => {
      setNotification(notif);
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, token]);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;

    // Handle deep linking based on notification type
    if (data.type === 'NEW_OFFER' && data.offerId) {
      // Navigate to offer details
      console.log('Navigate to offer:', data.offerId);
      // TODO: Use navigation ref to navigate
    } else if (data.type === 'PAYMENT_SUCCESS') {
      console.log('Navigate to subscription details');
    } else if (data.type === 'REFERRAL_REWARD') {
      console.log('Navigate to referral screen');
    } else if (data.url) {
      // Open specific URL
      console.log('Open URL:', data.url);
    }
  };

  return {
    expoPushToken,
    notification,
  };
};

/**
 * Register for push notifications and get the Expo push token
 */
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Camp Card Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#003F87', // BSA Navy
      sound: 'default',
    });

    // Additional channels for different notification types
    await Notifications.setNotificationChannelAsync('offers', {
      name: 'New Offers',
      description: 'Notifications about new merchant offers',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('payments', {
      name: 'Payment Updates',
      description: 'Notifications about payment status',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('referrals', {
      name: 'Referral Rewards',
      description: 'Notifications about referral rewards',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return undefined;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('EAS Project ID not found in app config');
        return undefined;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;

      console.log('Expo push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Push notifications require a physical device');
  }

  return token;
}

/**
 * Register device token with backend for AWS SNS push notifications
 */
async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    await apiClient.post('/api/v1/notifications/register-token', {
      token,
      deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      deviceModel: Device.modelName || 'Unknown',
      osVersion: Device.osVersion || 'Unknown',
      appVersion: Constants.expoConfig?.version || '1.0.0',
    });
    console.log('Device token registered successfully with backend');
  } catch (error: any) {
    console.error('Error registering device token:', error?.response?.data || error.message);
  }
}

/**
 * Unregister device token from backend (call on logout)
 */
export async function unregisterDeviceToken(token: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/notifications/unregister-token/${encodeURIComponent(token)}`);
    console.log('Device token unregistered from backend');
  } catch (error: any) {
    console.error('Error unregistering device token:', error?.response?.data || error.message);
  }
}

/**
 * Send a test notification locally (for development)
 */
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'This is a test notification from Camp Card!',
      data: { type: 'TEST' },
    },
    trigger: null,
  });
}

/**
 * Get unread notification count from backend
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await apiClient.get('/api/v1/notifications/me/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiClient.put('/api/v1/notifications/mark-all-read');
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

/**
 * Get paginated notifications
 */
export async function getNotifications(page: number = 0, size: number = 20) {
  try {
    const response = await apiClient.get('/api/v1/notifications/me', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

/**
 * Set badge count on app icon
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

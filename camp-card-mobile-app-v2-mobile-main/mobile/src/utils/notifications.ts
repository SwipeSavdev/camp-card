import React, { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiClient } from './api';

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

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Register token with backend
        registerTokenWithBackend(token);
      }
    });

    // Listen for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
      setNotification(notification);
    });

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      handleNotificationResponse(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;
    
    // Handle deep linking based on notification type
    if (data.type === 'NEW_OFFER' && data.offerId) {
      // Navigate to offer details
      console.log('Navigate to offer:', data.offerId);
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

async function registerForPushNotificationsAsync() {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const existingStatus = await Notifications.getPermissionsAsync();
    let finalStatus = (existingStatus as any).granted;
    
    if (!(existingStatus as any).granted) {
      const result = await Notifications.requestPermissionsAsync();
      finalStatus = (result as any).granted;
    }
    
    if (!finalStatus) {
      Alert.alert('Permission Required', 'Push notifications permission is required to receive updates about new offers and rewards.');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}

async function registerTokenWithBackend(token: string) {
  try {
    await apiClient.post('/notifications/register-token', {
      token,
      deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      deviceModel: Device.modelName,
      osVersion: Device.osVersion,
      appVersion: Constants.expoConfig?.version || '1.0.0',
    });
    console.log('Device token registered successfully');
  } catch (error) {
    console.error('Error registering device token:', error);
  }
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: 'This is a test notification from Camp Card!',
      data: { type: 'TEST' },
    },
    trigger: null,
  });
}

export async function getUnreadNotifications() {
  try {
    const response = await apiClient.get('/notifications/me/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await apiClient.put('/notifications/mark-all-read');
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

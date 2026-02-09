import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../utils/api';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notifications';
import { useTheme } from '../config/ThemeContext';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  imageUrl?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { colors } = theme;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get('/api/v1/notifications/me', {
        params: { page: 0, size: 50 }
      });
      setNotifications(response.data.content);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }

    // Handle navigation based on notification type
    if (notification.type === 'NEW_OFFER') {
      navigation.navigate('OfferDetails', { offerId: notification.id });
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_OFFER':
        return 'gift';
      case 'PAYMENT_SUCCESS':
        return 'checkmark-circle';
      case 'PAYMENT_FAILED':
        return 'alert-circle';
      case 'SUBSCRIPTION_EXPIRING':
        return 'time';
      case 'REFERRAL_REWARD':
        return 'people';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NEW_OFFER':
        return colors.primary;
      case 'PAYMENT_SUCCESS':
        return colors.success;
      case 'PAYMENT_FAILED':
        return colors.error;
      case 'SUBSCRIPTION_EXPIRING':
        return colors.warning;
      case 'REFERRAL_REWARD':
        return '#9c27b0';
      default:
        return colors.secondary;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.secondary }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            accessibilityLabel="Mark all as read"
            accessibilityRole="button"
          >
            <Text style={[styles.markAllRead, { color: colors.secondary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            You'll receive notifications about new offers, payments, and more
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, { backgroundColor: colors.surface }, !item.read && styles.unreadItem]}
              onPress={() => handleNotificationPress(item)}
              accessibilityLabel={`${item.title} - ${item.read ? 'read' : 'unread'}`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(item.type) + '20' }
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(item.type)}
                  size={24}
                  color={getNotificationColor(item.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003f87',
    flex: 1,
    marginLeft: 15,
  },
  markAllRead: {
    fontSize: 14,
    color: '#003f87',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 1,
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: '#f0f7ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ce1126',
    marginLeft: 8,
    marginTop: 8,
  },
});
